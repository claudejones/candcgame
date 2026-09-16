import { Renderer } from './renderer.js';
import { HUD } from './hud.js';
import { Controls } from './controls.js';
import { Game } from './game.js';
import { QAHarness } from './qa-harness.js';

const canvas=document.querySelector('#game');
// Asset externalization is the next extraction gate. Empty asset registry is intentional: no embedded LAB25Q base64 is reintroduced.
const assets={worlds:{}};
const renderer=new Renderer(canvas,assets,{mode:'legacy'});
const hud=new HUD(document.querySelector('#hud'));
let game;
const controls=new Controls(document.querySelector('#controls'),{
  slide:()=>game.slide(), pause:()=>game.togglePause(), jump:()=>game.jump()
});
game=new Game({renderer,hud,controls,stage:'sa01',character:'claude'});
new QAHarness(document.querySelector('#qa'),{renderer,game});
game.start();
