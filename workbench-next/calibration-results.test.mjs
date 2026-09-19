import test from 'node:test';
import assert from 'node:assert/strict';
import {filterResults,resultStatus} from './calibration-results.mjs';
test('large result lists filter by stage, continent and status without losing selected or applied records',()=>{
 const metadata=new Map([['na01',{continent:'North America',label:'Desert'}],['eu01',{continent:'Europe',label:'Rome'}]]);
 const rows=[{id:'a',stage:'na01',name:'Cactus',ready:true},{id:'b',stage:'na01',name:'Bones',ready:false,reviewed:true},{id:'c',stage:'eu01',name:'Barrel',applied:true,ready:false},{id:'d',stage:'eu01',name:'Cart',ready:true,stale:true}];
 const status=r=>resultStatus(r,!r.stale,true),pick=options=>filterResults(rows,{metadata,status,...options}).map(r=>r.id);
 assert.deepEqual(pick({query:'north cactus'}),['a']);assert.deepEqual(pick({query:'EU01'}),['c','d']);assert.deepEqual(pick({continent:'Europe',filter:'attention'}),['c','d']);assert.deepEqual(pick({filter:'ready'}),['a']);assert.deepEqual(pick({filter:'applied'}),['c']);assert.deepEqual(pick({filter:'selected'}),['b']);assert.deepEqual(pick({query:'absent'}),[]);assert.deepEqual(pick({}),['a','b','c','d']);assert.equal(rows[1].reviewed,true);
});
