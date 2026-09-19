import test from 'node:test';
import assert from 'node:assert/strict';
import {LandscapePlayback} from './landscape-playback.mjs';

function harness() {
  const queued=new Map();let nextId=0,position=0,available=true;
  const playback=new LandscapePlayback({speed:120,end:4800,
    read:()=>position,write:value=>{position=value;},available:()=>available,
    request:callback=>{queued.set(++nextId,callback);return nextId;},cancel:id=>queued.delete(id)});
  return {playback,queued,get position(){return position;},set available(value){available=value;},
    tick(now){assert.equal(queued.size,1);const [id,callback]=queued.entries().next().value;queued.delete(id);callback(now);}};
}

test('landscape playback uses elapsed time, without duplicate loops or paused-time jumps',()=>{
  const h=harness();h.playback.play();h.playback.play();
  h.tick(100);h.tick(350);assert.equal(h.position,30);
  h.tick(1100);assert.equal(h.position,120);
  h.playback.pause();assert.equal(h.queued.size,0);assert.equal(h.position,120);
  h.playback.play();h.tick(9000);assert.equal(h.position,120);
  h.tick(9500);assert.equal(h.position,180);
});

test('end stops at exactly 4800 px, Replay and Restart each begin at zero',()=>{
  const h=harness();h.playback.seek(4790);h.playback.play();h.tick(0);h.tick(1000);
  assert.equal(h.position,4800);assert.equal(h.playback.running,false);assert.equal(h.queued.size,0);
  h.playback.play();assert.equal(h.position,0);h.tick(5000);h.tick(6000);assert.equal(h.position,120);
  h.playback.play(true);assert.equal(h.position,0);h.tick(7000);h.tick(7250);assert.equal(h.position,30);
});

test('scrubbing pauses and bounds the preview; obsolete callbacks cannot move a new selection',()=>{
  const h=harness();h.playback.play();h.tick(0);
  const obsolete=h.queued.values().next().value;
  h.playback.seek(2400);assert.equal(h.position,2400);assert.equal(h.queued.size,0);
  obsolete(9000);assert.equal(h.position,2400);
  h.playback.play();obsolete(10000);assert.equal(h.position,2400);assert.equal(h.queued.size,1);
  h.tick(12000);h.tick(12500);assert.equal(h.position,2460);
  h.playback.seek(-10);assert.equal(h.position,0);
  h.playback.seek(5000);assert.equal(h.position,4800);
  h.playback.seek(NaN);assert.equal(h.position,4800);assert.equal(h.queued.size,0);
});

test('unavailable previews cannot start and stop an existing playback without advancing',()=>{
  const h=harness();h.available=false;h.playback.play();assert.equal(h.queued.size,0);
  h.available=true;h.playback.play();h.tick(0);h.tick(1000);assert.equal(h.position,120);
  h.available=false;h.tick(2000);assert.equal(h.position,120);assert.equal(h.playback.running,false);
  assert.equal(h.queued.size,0);
});

test('a context change during painting cannot reschedule an old playback',()=>{
  let position=0,paintCount=0;const queued=new Map();let nextId=0;
  const playback=new LandscapePlayback({speed:120,end:4800,read:()=>position,
    write:value=>{position=value;if(++paintCount===2)playback.pause();},available:()=>true,
    request:callback=>{queued.set(++nextId,callback);return nextId;},cancel:id=>queued.delete(id)});
  playback.play();
  for(const now of [0,1000]){const [id,callback]=queued.entries().next().value;queued.delete(id);callback(now);}
  assert.equal(position,120);assert.equal(queued.size,0);assert.equal(playback.running,false);
});
