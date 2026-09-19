import fs from 'node:fs';
const runtime=fs.readFileSync(new URL('../src/js/game-runtime.js',import.meta.url),'utf8');
const section=runtime.slice(runtime.indexOf('class CharacterMachine{'),runtime.indexOf('class ObjectQA{'));
function method(name){const start=section.indexOf('\n '+name+'(');if(start<0)throw new Error(name);let end=start+1,depth=0,opened=false;for(;end<section.length;end++){if(section[end]==='{'){depth++;opened=true;}if(section[end]==='}'&&--depth===0&&opened)break;}return section.slice(start,end+1);}
const overlap=runtime.match(/ intersects\(a,b\)\{return ([^\n]+)\}/)[1];
const output=`// Generated from src/js/game-runtime.js by build-runtime-rules.mjs. Do not hand-edit.\n// Production movement and contact rules; no legacy UI or gameplay side effects.\nexport const intersects=(a,b)=>${overlap};\nexport function createMotion(CONFIG,state='run'){\n class Motion {\n constructor(){this.state='run';this.frame=0;this.elapsed=0;this.y=0;this.vy=0;this.hitT=0;this.starT=0;this.starMode='auto';this.slideT=0;this.timedSlide=false;}\n${['setState','triggerJump','triggerSlide','starsVisible','update'].map(method).join('\n')}\n }\n const motion=new Motion();\n if(state==='jump')motion.triggerJump();else if(state==='slide')motion.triggerSlide();else motion.setState(state);\n return motion;\n}\n`;
const target=new URL('./runtime-rules.mjs',import.meta.url);
if(process.argv.includes('--check')){if(fs.readFileSync(target,'utf8')!==output)throw new Error('Design movement rules are stale. Run build-runtime-rules.mjs.');console.log('Design movement/contact rules match production source.');}
else fs.writeFileSync(target,output);
