(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ConnectedPublisher = api;
}(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';

  const SHA = /^[0-9a-f]{40}$/i;
  const FAILURE = new Set(['failure', 'cancelled', 'timed_out', 'action_required', 'stale', 'skipped']);

  function requireSha(value, label) {
    if (!SHA.test(value || '')) throw new Error(`${label} must be a Git SHA`);
    return value.toLowerCase();
  }

  function publicCheckpoint(checkpoint) {
    const {version, snapshotTree, phase, initialDevHead, initialMainHead, devCommit, mainCommit, devRunUrl, mainRunUrl, pagesRunUrl} = checkpoint;
    return {version, snapshotTree, phase, initialDevHead, initialMainHead, devCommit, mainCommit, devRunUrl, mainRunUrl, pagesRunUrl};
  }

  function result(status, gate, checkpoint, extra = {}) {
    return {status, gate, artworkApproval: 'separate', checkpoint: publicCheckpoint(checkpoint), ...extra};
  }

  function chooseRun(runs, name, sha, branch, event) {
    const matches = (runs || []).filter(run => run.name === name && String(run.headSha || run.head_sha || '').toLowerCase() === sha && run.event === event && (run.headBranch || run.head_branch) === branch);
    const passed = matches.find(run => run.status === 'completed' && run.conclusion === 'success');
    if (passed) return {kind: 'passed', run: passed};
    const failed = matches.find(run => FAILURE.has(run.conclusion));
    if (failed) return {kind: 'failed', run: failed};
    return {kind: 'pending', run: matches[0]};
  }

  function runUrl(run) { return run && (run.url || run.html_url); }

  function createConnectedPublisher(options) {
    const {adapter, checkpoint, verifiedSnapshot: snapshot} = options || {};
    if (!adapter || !checkpoint || typeof checkpoint.load !== 'function' || typeof checkpoint.save !== 'function') throw new Error('publisher requires adapter and durable checkpoint load/save methods');
    if (!snapshot || !Array.isArray(snapshot.files)) throw new Error('publisher requires a verified snapshot');
    const snapshotTree = requireSha(snapshot.treeSha, 'verified snapshot tree');
    const devRef = options.devRef || 'heads/modular-parity-validation';
    const mainRef = options.mainRef || 'heads/main';
    const branchName = ref => ref.replace(/^refs\//, '').replace(/^heads\//, '');
    const devBranch = branchName(devRef), mainBranch = branchName(mainRef);
    const productionWorkflow = options.productionWorkflow || 'Production CI';
    const pagesWorkflow = options.pagesWorkflow || 'Deploy QA site to GitHub Pages';
    const message = options.message || 'Publish validated asset snapshot';

    async function save(state) { await checkpoint.save(state); return state; }
    async function advance() {
      let state = await checkpoint.load();
      if (!state) state = await save({version: 1, snapshotTree, phase: 'prepare', blobs: {}});
      if (state.version !== 1 || state.snapshotTree !== snapshotTree) throw new Error('checkpoint belongs to a different verified snapshot');
      for (;;) {
        if (state.phase === 'prepare') {
          const [dev, main] = await Promise.all([adapter.fetchRef(devRef), adapter.fetchRef(mainRef)]);
          state.initialDevHead = requireSha(dev.sha, 'development head');
          state.initialDevTree = requireSha(dev.treeSha, 'development tree');
          state.initialMainHead = requireSha(main.sha, 'main head');
          if (requireSha(main.treeSha, 'main tree') !== state.initialDevTree) return result('blocked', 'unreconciled-branch-trees', state, {message:'Development and main differ before publication; reconcile their changes before creating the snapshot.'});
          state.phase = 'blobs';
          state = await save(state);
          continue;
        }
        if (state.phase === 'blobs') {
          for (const file of snapshot.files) {
            if (!file.path || file.path.startsWith('/') || file.path.includes('..')) throw new Error(`unsafe snapshot path ${file.path || ''}`);
            const expected = requireSha(file.blobSha, `${file.path} blob`);
            if (state.blobs[file.path]) {
              if (state.blobs[file.path] !== expected) throw new Error(`${file.path}: checkpoint blob mismatch`);
              continue;
            }
            if (file.content === undefined) {
              if (!file.reuse) throw new Error(`${file.path}: missing byte-safe content or explicit reuse`);
            } else {
              const encoding = file.encoding || 'utf-8';
              if (encoding === 'base64' && file.contentSource !== 'binary-tool') throw new Error(`${file.path}: base64 must come directly from a binary-safe tool route`);
              const actual = requireSha(await adapter.createBlob({path: file.path, content: file.content, encoding}), `${file.path} uploaded blob`);
              if (actual !== expected) throw new Error(`${file.path}: uploaded blob does not match verified local blob`);
            }
            state.blobs[file.path] = expected;
          }
          // Blob creation is content-addressed and safe to repeat. Persist the batch once
          // so a remote checkpoint adapter does not need one durable write per file.
          state.phase = 'tree'; state = await save(state); continue;
        }
        if (state.phase === 'tree') {
          const entries = snapshot.files.map(file => ({path: file.path, mode: file.mode || '100644', type: 'blob', sha: state.blobs[file.path]}));
          state.remoteTree = requireSha(await adapter.createTree({baseTreeSha: state.initialDevTree, entries}), 'created tree');
          if (state.remoteTree !== snapshotTree) throw new Error(`remote tree ${state.remoteTree} does not match verified local tree ${snapshotTree}`);
          state.phase = 'commit'; state = await save(state); continue;
        }
        if (state.phase === 'commit') {
          state.devCommit = requireSha(await adapter.createCommit({message, treeSha: snapshotTree, parents: [state.initialDevHead]}), 'development commit');
          state.phase = 'dev-ref'; state = await save(state); continue;
        }
        if (state.phase === 'dev-ref') {
          const [current, main] = await Promise.all([adapter.fetchRef(devRef), adapter.fetchRef(mainRef)]);
          const head = requireSha(current.sha, 'current development head'), mainHead = requireSha(main.sha, 'current main head');
          if (mainHead !== state.initialMainHead) return result('blocked', 'main-ref-mismatch', state, {expected: state.initialMainHead, actual: mainHead});
          if (head !== state.devCommit) {
            if (head !== state.initialDevHead) return result('blocked', 'development-ref-mismatch', state, {expected: state.initialDevHead, actual: head});
            await adapter.updateRef({ref: devRef, sha: state.devCommit, force: false});
            const written = await adapter.fetchRef(devRef);
            if (requireSha(written.sha, 'written development head') !== state.devCommit) throw new Error('development ref write did not reach the exact commit');
          }
          state.phase = 'dev-ci'; state = await save(state); continue;
        }
        if (state.phase === 'dev-ci') {
          const verdict = chooseRun(await adapter.fetchRuns(state.devCommit), productionWorkflow, state.devCommit, devBranch, 'push');
          if (verdict.kind === 'failed') return result('failed', 'development-ci', state, {runUrl: runUrl(verdict.run), conclusion: verdict.run.conclusion});
          if (verdict.kind === 'pending') return result('pending', 'development-ci', state, {runUrl: runUrl(verdict.run)});
          state.devRunUrl = runUrl(verdict.run); state.phase = 'main-commit'; state = await save(state); continue;
        }
        if (state.phase === 'main-commit') {
          const [dev, main] = await Promise.all([adapter.fetchRef(devRef), adapter.fetchRef(mainRef)]);
          const devHead = requireSha(dev.sha, 'current development head'), mainHead = requireSha(main.sha, 'current main head');
          if (devHead !== state.devCommit) return result('blocked', 'development-ref-mismatch', state, {expected: state.devCommit, actual: devHead});
          if (mainHead !== state.initialMainHead) return result('blocked', 'main-ref-mismatch', state, {expected: state.initialMainHead, actual: mainHead});
          state.mainCommit = requireSha(await adapter.createCommit({message, treeSha: snapshotTree, parents: [mainHead]}), 'main promotion commit');
          state.phase = 'main-ref'; state = await save(state); continue;
        }
        if (state.phase === 'main-ref') {
          const [dev, main] = await Promise.all([adapter.fetchRef(devRef), adapter.fetchRef(mainRef)]);
          const devHead = requireSha(dev.sha, 'current development head'), mainHead = requireSha(main.sha, 'current main head');
          if (devHead !== state.devCommit) return result('blocked', 'development-ref-mismatch', state, {expected: state.devCommit, actual: devHead});
          if (requireSha(dev.treeSha, 'current development tree') !== snapshotTree) return result('blocked', 'development-tree-mismatch', state);
          if (mainHead !== state.mainCommit) {
            if (mainHead !== state.initialMainHead) return result('blocked', 'main-ref-mismatch', state, {expected: state.initialMainHead, actual: mainHead});
            await adapter.updateRef({ref: mainRef, sha: state.mainCommit, force: false});
            const written = await adapter.fetchRef(mainRef);
            if (requireSha(written.sha, 'written main head') !== state.mainCommit || requireSha(written.treeSha, 'written main tree') !== snapshotTree) throw new Error('main ref write did not preserve the exact validated tree');
          }
          state.phase = 'main-ci'; state = await save(state); continue;
        }
        if (state.phase === 'main-ci') {
          const verdict = chooseRun(await adapter.fetchRuns(state.mainCommit), productionWorkflow, state.mainCommit, mainBranch, 'push');
          if (verdict.kind === 'failed') return result('failed', 'main-ci', state, {runUrl: runUrl(verdict.run), conclusion: verdict.run.conclusion});
          if (verdict.kind === 'pending') return result('pending', 'main-ci', state, {runUrl: runUrl(verdict.run)});
          state.mainRunUrl = runUrl(verdict.run); state.phase = 'pages'; state = await save(state); continue;
        }
        if (state.phase === 'pages') {
          const verdict = chooseRun((await adapter.fetchRuns(state.mainCommit)).filter(run => run.conclusion !== 'skipped'), pagesWorkflow, state.mainCommit, mainBranch, 'workflow_run');
          if (verdict.kind === 'failed') return result('failed', 'pages', state, {runUrl: runUrl(verdict.run), conclusion: verdict.run.conclusion});
          if (verdict.kind === 'pending') return result('pending', 'pages', state, {runUrl: runUrl(verdict.run)});
          state.pagesRunUrl = runUrl(verdict.run); state.phase = 'complete'; state = await save(state); continue;
        }
        if (state.phase === 'complete') return result('complete', 'published', state, {sha: state.mainCommit, developmentSha: state.devCommit, treeSha: snapshotTree, pagesUrl: options.pagesUrl});
        throw new Error(`unknown publication phase ${state.phase}`);
      }
    }
    return {advance};
  }

  function createFunctionsExecAdapter(tools, {owner, repo}) {
    function named(suffix) {
      const key = Object.keys(tools).find(name => name === suffix || name.endsWith(`__${suffix}`));
      if (!key) throw new Error(`connected GitHub tool unavailable: ${suffix}`);
      return tools[key];
    }
    const fetch = named('github_fetch'), createBlobTool = named('github_create_blob'), createTreeTool = named('github_create_tree');
    const createCommitTool = named('github_create_commit'), updateRefTool = named('github_update_ref');
    function body(value) {
      if (value && value.structuredContent) {
        const content = value.structuredContent.content;
        if (typeof content === 'string') return JSON.parse(content);
        return value.structuredContent;
      }
      if (value && value.data) return value.data;
      if (value && Array.isArray(value.content)) {
        const text = value.content.find(item => item.type === 'text')?.text;
        if (text) try { return JSON.parse(text); } catch (_) { /* use original */ }
      }
      return value;
    }
    async function fetchJson(url) { return body(await fetch({url})); }
    return {
      async fetchRef(ref) {
        const clean = ref.replace(/^refs\//, '');
        const refData = await fetchJson(`https://api.github.com/repos/${owner}/${repo}/git/ref/${clean}`);
        const sha = refData.object?.sha || refData.sha;
        const commit = await fetchJson(`https://api.github.com/repos/${owner}/${repo}/git/commits/${sha}`);
        return {sha, treeSha: commit.tree?.sha || commit.treeSha};
      },
      async fetchRuns(sha) {
        const data = await fetchJson(`https://api.github.com/repos/${owner}/${repo}/actions/runs?head_sha=${sha}&per_page=20`);
        return (data.workflow_runs || data.runs || []).map(run => ({name: run.name, headSha: run.head_sha, headBranch: run.head_branch, event: run.event, status: run.status, conclusion: run.conclusion, url: run.html_url || run.url}));
      },
      async createBlob({content, encoding}) { const data = body(await createBlobTool({repository_full_name: `${owner}/${repo}`, content, encoding})); return data.sha; },
      async createTree({baseTreeSha, entries}) { const data = body(await createTreeTool({repository_full_name: `${owner}/${repo}`, base_tree_sha: baseTreeSha, tree_elements: entries})); return data.sha; },
      async createCommit({message, treeSha, parents}) { const data = body(await createCommitTool({repository_full_name: `${owner}/${repo}`, parent_sha: parents[0], tree_sha: treeSha, message, ...(parents.length > 1 ? {additional_parent_shas: parents.slice(1)} : {})})); return data.sha; },
      async updateRef({ref, sha, force}) { return updateRefTool({repository_full_name: `${owner}/${repo}`, branch_name: ref.replace(/^refs\//, '').replace(/^heads\//, ''), sha, force}); }
    };
  }

  return {createConnectedPublisher, createFunctionsExecAdapter};
}));
