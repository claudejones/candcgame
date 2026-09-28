import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.resolve(process.argv[2]||'mobile-game');
const report=JSON.parse(fs.readFileSync(path.join(root,'build-report.json')));
for(const file of report.files){
 const p=path.resolve(root,file.path);
 if(!p.startsWith(root+path.sep))throw Error('Invalid asset path');
 const bytes=fs.readFileSync(p);
 if(bytes.length!==file.bytes||crypto.createHash('sha256').update(bytes).digest('hex')!==file.sha256)throw Error('Asset mismatch: '+file.path);
}
const release=JSON.parse(fs.readFileSync(path.join(root,'play/release.json')));
if(release.inputHash!==report.inputHash)throw Error('Configuration mismatch');
for(const stage of ['na','sa','eu','af','as','oc','an'])for(let n=1;n<=3;n++)for(const profile of ['easy','standard','hard']){
 const id=stage+'0'+n,plan=JSON.parse(fs.readFileSync(path.join(root,'play/plans',id+'-'+profile+'.json')));
 if(!plan.verified||plan.stage!==id||plan.profile!==profile)throw Error('Invalid plan: '+id+' '+profile);
}
for(const name of fs.readdirSync(path.join(root,'play')).filter(n=>n.endsWith('.mjs'))){
 const code=fs.readFileSync(path.join(root,'play',name),'utf8');
 for(const m of code.matchAll(/(?:from\s*|import\s*\()\s*['"]\.\/([^'"]+)['"]/g))if(!fs.existsSync(path.join(root,'play',m[1])))throw Error('Missing module: '+m[1]);
}
for(const name of ['BRAND_GAME_LOGO.png','BRAND_FAVICON_16.png','BRAND_FAVICON_32.png','BRAND_APPLE_TOUCH_ICON.png'])if(!fs.existsSync(path.join(root,'assets/global-ui',name)))throw Error('Missing brand asset: '+name);
console.log(`Mobile package complete: ${report.files.length} original assets, 63 checked plans, independent modules and brand icons.`);
