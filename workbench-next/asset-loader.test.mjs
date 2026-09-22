import test from 'node:test';
import assert from 'node:assert/strict';
import {AssetLoader} from './asset-loader.mjs';
const flush=()=>new Promise(resolve=>setImmediate(resolve));
function fixture() {
  const images=[];
  const loader=new AssetLoader(()=>{
    const image={decode(){return new Promise(resolve=>{this.finishDecode=resolve;});}};
    images.push(image);return image;
  });
  return {loader,images};
}

test('selected scene readiness waits for every decode; cache avoids repeat image requests',async()=>{
  const {loader,images}=fixture(),progress=[];let result;
  const request=loader.select([['far','far.png'],['mid','mid.png'],['ground','ground.png']],{
    progress:(n,total)=>progress.push([n,total]),ready:value=>{result=value;},failed:assert.fail});
  for(const image of images)image.onload();
  images[0].finishDecode();images[1].finishDecode();await flush();
  assert.equal(result,undefined);assert.deepEqual(progress.at(-1),[2,3]);
  images[2].finishDecode();await request;assert.equal(Object.keys(result).length,3);
  await loader.select([['far','far.png']],{progress(){},ready(){},failed:assert.fail});
  assert.equal(images.length,3);
});

test('rapid stage/character switching cannot deliver stale readiness or progress',async()=>{
  const {loader,images}=fixture();const ready=[],progress=[];
  const events=name=>({progress:n=>progress.push([name,n]),ready:()=>ready.push(name),failed:assert.fail});
  const old=loader.select([['far','old.png']],events('old'));
  const current=loader.select([['sprite','character.png']],events('current'));
  images[1].onload();images[1].finishDecode();await current;
  const before=progress.length;
  images[0].onload();images[0].finishDecode();await old;
  assert.deepEqual(ready,['current']);assert.equal(progress.length,before);
});

test('a failed asset reports failure and can be retried without refetching successful layers',async()=>{
  const {loader,images}=fixture();let failure,ready=0;
  const callbacks={progress(){},ready(){ready++;},failed:error=>{failure=error;}};
  const first=loader.select([['far','far.png'],['mid','mid.png']],callbacks);
  images[0].onload();images[0].finishDecode();images[1].onerror();await first;
  assert.match(failure.message,/loaded/);assert.equal(ready,0);
  const retry=loader.select([['far','far.png'],['mid','mid.png']],callbacks);
  assert.equal(images.length,3);images[2].onload();images[2].finishDecode();await retry;
  assert.equal(ready,1);
});
