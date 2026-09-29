// Event-only DOM harness. Deliberately makes no browser/layout claims.
export class Node{
 constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.attributes={};this.dataset={};this.style={setProperty(k,v){this[k]=v;}};this.hidden=false;this.disabled=false;this.value='';this.className='';this.text='';this.classList={toggle:(c,on)=>{let a=this.className.split(' ').filter(Boolean);const yes=on??!a.includes(c);a=a.filter(x=>x!==c);if(yes)a.push(c);this.className=a.join(' ');},add:c=>this.classList.toggle(c,true)};}
 set textContent(v){this.text=String(v);this.children=[];}get textContent(){return this.text+this.children.map(x=>typeof x==='string'?x:x.textContent).join('');}
 addEventListener(type,listener){(this.listeners??={})[type]=listener;}
 setAttribute(k,v){this.attributes[k]=String(v);}getAttribute(k){return this.attributes[k];}removeAttribute(k){delete this.attributes[k];}
 append(...nodes){for(const n of nodes){this.children.push(n);if(typeof n!=='string')n.parentElement=this;}}
 prepend(...nodes){this.children.unshift(...nodes);for(const n of nodes)n.parentElement=this;}
 after(n){this.parentElement?.append(n);}remove(){if(this.parentElement)this.parentElement.children=this.parentElement.children.filter(n=>n!==this);}
 replaceChildren(...nodes){this.children=[];this.text='';this.append(...nodes);}focus(){}
 querySelectorAll(q){return this.children.flatMap(n=>typeof n==='string'?[]:[...(q[0]==='.'?n.className.split(' ').includes(q.slice(1)):q[0]==='#'?n.id===q.slice(1):n.tagName===q.toUpperCase())?[n]:[],...n.querySelectorAll(q)]);}
 querySelector(q){return this.querySelectorAll(q)[0]||null;}
 click(){if(!this.disabled)return this.onclick?.({detail:0,preventDefault(){}});}
}
export const findButton=(root,text)=>{const b=root.querySelectorAll('button').find(b=>b.textContent===text);if(!b)throw Error('Missing button '+text);return b;};
