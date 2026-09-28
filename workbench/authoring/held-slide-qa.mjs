import assert from 'node:assert/strict';
export function checkHeldSlide(make){
 const land=r=>{for(let i=0;i<180&&r.motion.state==='jump';i++)r.tick();};
 let r=make();r.start();r.action('jump');r.holdSlide(true);land(r);
 assert.equal(r.motion.state,'slide','held Slide must begin on landing');
 r.advance(r.config.actions.slideDuration+.1);assert.equal(r.motion.state,'slide','keep sliding while held');
 r.holdSlide(false);r.advance(.1);assert.equal(r.motion.state,'run','release ends an expired hold');
 r=make();r.start();r.action('jump');r.holdSlide(true);r.holdSlide(false);land(r);
 assert.equal(r.motion.state,'run','release before landing must cancel pending Slide');
 r=make();r.start();r.holdSlide(true);r.pause();r.start();r.advance(.1);
 assert.equal(r.slideRequested,false,'pause clears held intent');assert.equal(r.motion.slideHeld,false);
 r=make();r.start();r.recovery=r.config.hitRecovery.recoveryDuration;r.motion.setState('hit');r.holdSlide(true);
 for(let i=0;i<300&&r.motion.state!=='slide';i++)r.tick();
 assert.equal(r.motion.state,'slide','held Slide begins after recovery, not during it');
}
