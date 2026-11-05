const tabs=await(await fetch('http://127.0.0.1:9222/json/list')).json();
const ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
await new Promise(resolve=>ws.addEventListener('open',resolve,{once:true}));
let serial=0;const pending=new Map(),errors=[];
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}});
const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++serial;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
try{
 await call('Runtime.enable');await call('Network.enable');await call('Network.setCacheDisabled',{cacheDisabled:true});
 await call('Page.navigate',{url:'http://127.0.0.1:8765/index.html?dash-test='+Date.now()});
 await new Promise(resolve=>setTimeout(resolve,700));
 const result=await call('Runtime.evaluate',{awaitPromise:true,returnByValue:true,expression:`(async()=>{
  const {runDashTests}=await import('/tests/dash-cases.js');const checks=runDashTests();
  const {Engine,newState}=await import('/js/engine.js');const {UI}=await import('/js/ui.js');
  const e=new Engine(document.querySelector('#game'),newState(),new UI());await e.assets.loadRegion('slums');
  const p=e.state.player,b=e.state.bosses[0];e.enemies=[];
  p.x=b.x-p.w-12;p.y=736;p.grounded=true;p.invuln=1000;
  e.update(1/60);e.paused=false;document.querySelector('#dialog-screen').classList.add('hidden');
  let frames=0;
  while(!b.dead&&frames<3600){if(p.attackTimer<=0&&p.attackCooldown<=1/60)e.pressed.add('j');e.update(1/60);frames++;}
  if(!b.dead||!e.state.abilities.dash)throw Error('Matrona victory failed');
  e.paused=false;document.querySelector('#dialog-screen').classList.add('hidden');
  while(p.attackTimer>0)e.update(1/60);
  e.keys.add('shift');e.update(1/60);
  if(p.vx!==760||p.dashTimer<=0)throw Error('Dash after Matrona did not start');
  e.keys.clear();for(let i=0;i<90;i++)e.update(1/60);
  if(p.dashTimer!==0||Math.abs(p.vx)>=1||p.state!=='idle')throw Error('Sliding after Matrona dash');
  p.dashTimer=-.02;p.vx=250;e.update(1/60);
  if(p.dashTimer!==0||p.vx>=250)throw Error('Live affected state did not recover');
  return {checks,matronaDefeated:b.dead,dashTimer:p.dashTimer,recoveredVelocity:p.vx};
 })()`});
 if(result.exceptionDetails)throw Error(JSON.stringify(result.exceptionDetails));
 if(errors.length)throw Error(errors.join('\n'));
 console.log('PASS: browser dash regression and real Matrona victory, dash release and affected-state recovery. '+JSON.stringify(result.result.value));
}finally{ws.close();}
