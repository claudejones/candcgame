import {MAX_IMPORT_BYTES,RECOVERY_KEY,UNREADABLE_KEY} from './project.mjs';
const $=id=>document.getElementById(id);
function download(text,name) {
  const url=URL.createObjectURL(new Blob([text],{type:'application/json'})),a=document.createElement('a');
  a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
const projectDownload=payload=>download(JSON.stringify(payload,null,2),'cc-workbench-project.json');
const dateLabel=value=>new Date(value).toLocaleString([], {dateStyle:'short',timeStyle:'short'});
const fields={x:'X',y:'Y',w:'Width',h:'Height',l:'Left',r:'Right',t:'Top',b:'Bottom',scale:'Scale',parallax:'Parallax'};

export function setupProjectWorkflow({draft,beforeAction,changed,message}) {
  const dialog=$('project-dialog');let review=null,recovery=null,unreadable=null,reading=false;
  function refresh() {
    $('save-status').textContent=draft.dirty?'Unsaved changes · all stages & characters':draft.savedAt?`Saved in this browser · ${dateLabel(draft.savedAt)}`:'Baseline loaded · no browser save yet';
    $('change-count').textContent=`${draft.changedFrames} frames · ${draft.changedLayers} layers changed from GitHub baseline`;
    $('save').disabled=reading || (!draft.dirty && Boolean(draft.savedAt));
    for(const id of ['import','export','changes'])$(id).disabled=reading;
    $('undo').disabled=!draft.past.length;$('redo').disabled=!draft.future.length;
  }
  function inspectRecovery() {
    recovery=null;unreadable=draft.failedSave||null;
    try {
      const raw=localStorage.getItem(RECOVERY_KEY);
      if(raw){recovery=JSON.parse(raw);draft.decode(recovery.project);}
      unreadable ||= localStorage.getItem(UNREADABLE_KEY);
      $('recovery-status').textContent=recovery?`Working project before the last import · ${dateLabel(recovery.createdAt)}`:'A recovery copy is created when you apply an import.';
    }catch(error){recovery=null;$('recovery-status').textContent=`Recovery unavailable: ${error.message}`;}
    $('review-recovery').disabled=!recovery;$('export-recovery').disabled=!recovery;$('export-unreadable').hidden=!unreadable;
  }
  function showRows(rows) {
    $('project-changes').replaceChildren(...rows.map(row=>{
      const tr=document.createElement('tr');
      for(const value of [row.scope,`${row.element} · ${fields[row.field]||row.field}`,row.before,row.after]){
        const td=document.createElement('td');td.textContent=String(value);tr.append(td);
      }
      return tr;
    }));
    document.querySelector('.change-table-wrap').hidden=!rows.length;
  }
  function open(nextReview,name='') {
    beforeAction();review=nextReview;
    const rows=review?review.rows:draft.changedRows();
    $('project-dialog-title').textContent=review?'Review project import':'All project changes';
    $('project-dialog-description').textContent=review?`${name} replaces all editable settings, including stages and characters you have not opened. Review the changes below.`:'Compare the whole working project with the GitHub baseline. Save all writes to this browser; Export all downloads a portable copy. Neither action commits to GitHub.';
    $('project-provenance').textContent=`GitHub source: ${draft.provenance.repository} · ${draft.provenance.branch} · baseline ${draft.provenance.baseline.slice(0,7)}`;
    $('before-heading').textContent=review?'Working draft':'Baseline';
    $('import-notes').replaceChildren(...(review?.notes||[]).map(text=>{const p=document.createElement('p');p.textContent=text;return p;}));
    $('project-summary').textContent=rows.length?`${rows.length} field changes across ${new Set(rows.map(row=>row.scope)).size} assets. ${review?'A pre-import recovery copy is required before applying. Import stays unsaved until you choose Save all.':''}`:review?'This file matches your working project. No changes to apply.':'All editable settings match the baseline.';
    showRows(rows);$('project-dialog-error').textContent='';$('apply-import').hidden=!review;$('apply-import').disabled=!rows.length;
    $('cancel-import').textContent=review?'Cancel':'Close';$('recovery-panel').hidden=Boolean(review);
    if(!review)inspectRecovery();
    if(!dialog.open)dialog.showModal();
  }
  function report(error){
    message(error.message,true);
    if(!dialog.open)open(null);
    $('project-dialog-error').textContent=error.message;
    $('project-dialog-error').scrollIntoView({block:'nearest'});
  }
  $('changes').onclick=()=>open(null);
  $('save').onclick=()=>{
    beforeAction();
    try{draft.save(localStorage);message('All editable settings saved in this browser. Export all creates a portable backup; GitHub is unchanged.');}
    catch(error){report(new Error(`Save failed: ${error.message} Export all to keep your work.`));}refresh();
  };
  $('export').onclick=()=>{beforeAction();projectDownload(draft.export());message('Exported all editable settings, including unsaved changes. Your browser save is unchanged.');};
  $('import').onclick=()=>{beforeAction();$('import-file').value='';$('import-file').click();};
  $('import-file').onchange=async()=>{
    const file=$('import-file').files?.[0];if(!file)return;
    reading=true;refresh();
    try {
      if(file.size>MAX_IMPORT_BYTES)throw new Error('Configuration is too large. Choose a Workbench project JSON file under 2 MB.');
      const text=await file.text();let payload;
      try{payload=JSON.parse(text);}catch{throw new Error('This file is not valid JSON. Your project has not changed.');}
      open(draft.prepareImport(payload),file.name);
    }catch(error){report(error);}finally{reading=false;refresh();}
  };
  $('apply-import').onclick=()=>{
    if(!review)return;
    try{draft.applyImport(review,localStorage);dialog.close();changed();message('Imported the whole project. Undo reverses it in one step; Save all keeps it in this browser. A pre-import copy is available under Changes & recovery.');}
    catch(error){report(error);}
  };
  $('review-recovery').onclick=()=>{try{open(draft.prepareImport(recovery.project),'Pre-import recovery copy');}catch(error){report(error);}};
  $('export-recovery').onclick=()=>projectDownload(recovery.project);
  $('export-unreadable').onclick=()=>download(unreadable,'cc-workbench-unreadable-save.json');
  $('cancel-import').onclick=$('close-project-dialog').onclick=()=>dialog.close();
  dialog.addEventListener('close',()=>{review=null;});
  refresh();return {refresh};
}
