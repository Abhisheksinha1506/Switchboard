const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const elements=new Map();function el(){return {hidden:false,textContent:'',disabled:false,style:{},className:'',dataset:{},append(){},replaceChildren(){},focus(){},addEventListener(){},getContext(){return {}},getBoundingClientRect(){return {left:0,top:0,width:840,height:500}},lastChild:{textContent:''}}}
const get=id=>{if(!elements.has(id))elements.set(id,el());return elements.get(id)};
const context={console,crypto:require('node:crypto').webcrypto,Date,Math,JSON,Set,Blob,URL,setTimeout,performance:{now:()=>0},requestAnimationFrame(){},localStorage:{getItem:()=>null,setItem(){}},sessionStorage:{getItem:()=>null,setItem(){}},window:{scrollTo(){},addEventListener(){}},document:{getElementById:get,querySelector:()=>el(),querySelectorAll:()=>[],addEventListener(){},createElement:el}};
vm.createContext(context);vm.runInContext(fs.readFileSync(__dirname+'/dist/app.js','utf8'),context);
vm.runInContext(`
// Bypass rendering only; exercise actual gameplay and record transitions.
drawIdle=()=>{};game='bloom';start(false);
if(record.status!=='started')throw Error('start not recorded');
pointer={x:420,y:250};beginGrow();updateBloom(.2);if(!state.active||state.active.r<=2)throw Error('ball does not grow');settle();if(state.balls.length!==1||coverage()<=0)throw Error('settling does not claim area');
beginGrow();if(state.active)throw Error('overlap allowed');
state.t=12;finish('abandoned');if(record.status!=='abandoned'||record.activeSeconds!==12)throw Error('abandon record');
start(false);state.t=20;finish('time');if(record.status!=='completed')throw Error('completion record');start(false);if(!record.voluntaryReplay)throw Error('replay entry not detected');
state.balls=[{x:420,y:250,r:240}];updateBloom(0);if(running||record.reason!=='win')throw Error('area win not detected');
game='pulse';start(false);updatePulse(.1);if(state.task!==0)throw Error('initial rule');state.t=6.1;updatePulse(.1);if(state.task!==1)throw Error('rule switch');
state.flash=0;state.lives=1;hurt();if(running||record.reason!=='mistakes')throw Error('mistake end');
start(false);pause();if(!paused)throw Error('pause');pause();if(paused)throw Error('resume');
// Move/Stop: a rule-following player with a human reaction delay keeps every chance; ignoring the light still costs one.
const moveStop=(reaction,obey)=>{start(false);state.t=18;let lost=0;const h=hurt;hurt=()=>{const l=state.lives;h();if(state.lives<l)lost++};while(running&&state.t<24){const green=Math.floor(Math.max(0,state.taskTime-reaction)/1.3)%2===0;keys.right=obey?green&&state.taskTime>reaction:true;state.t+=1/60;state.flash=Math.max(0,state.flash-1/60);updatePulse(1/60)}hurt=h;keys.right=false;return lost};
if(moveStop(.35,true)!==0)throw Error('Move/Stop punishes reaction time');if(moveStop(0,false)<1)throw Error('Move/Stop ignores red-light movement');
start(false);state.t=19;updatePulse(.1);pause();pause();if(!(state.judgeFrom>=state.taskTime+.4))throw Error('no reaction window after resume');
// A frame timestamp earlier than the last frame must not run time backwards.
draw=()=>{};start(false);state.t=5;lastFrame=1000;frame(990);if(state.t<5)throw Error('negative frame step');
// An enemy pushed off a settled circle that touches a wall stays inside the board.
game='bloom';start(false);state.balls=[{x:W-60,y:250,r:60}];state.enemies=[{x:W-6,y:200,vx:50,vy:0,r:11}];updateBloom(.016);const e=state.enemies[0];if(e.x>W-e.r||e.x<e.r||e.y<e.r||e.y>H-e.r)throw Error('enemy left the board');
`,context);
// Malformed saved data must not stop the page from starting, and the unreadable record is kept aside.
const saved={};const bad=JSON.stringify({rounds:[],visits:[],votes:[]});
const context2={...context,localStorage:{getItem:k=>k==='arcade-lab-v1'?bad:null,setItem:(k,v)=>{saved[k]=v}}};
vm.createContext(context2);vm.runInContext(fs.readFileSync(__dirname+'/dist/app.js','utf8'),context2);
vm.runInContext(`if(!Array.isArray(db.order)||db.order.length!==2||typeof db.participant!=='string')throw Error('malformed storage not replaced')`,context2);
assert.equal(saved['arcade-lab-v1-unreadable'],bad);
assert.ok(true);console.log('Passed: growth, settling, overlap prevention, abandonment, completion, replay tracking, area win, rule switching, mistake end, pause/resume, Move/Stop reaction window, frame clamp, enemy containment, malformed storage.');
