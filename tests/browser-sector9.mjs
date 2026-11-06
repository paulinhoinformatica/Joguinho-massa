import {writeFileSync} from 'node:fs';
const tabs=await(await fetch('http://127.0.0.1:9222/json/list')).json();
const ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
await new Promise(resolve=>ws.addEventListener('open',resolve,{once:true}));
let serial=0;const pending=new Map(),errors=[],badResponses=[];
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text);if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')errors.push(JSON.stringify(m.params.args));if(m.method==='Network.responseReceived'&&m.params.response.status>=400)badResponses.push(m.params.response.url);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}});
const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++serial;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
async function evaluate(expression){const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;}
async function screenshot(name){const r=await call('Page.captureScreenshot',{format:'png'});writeFileSync(new URL('./'+name+'.png',import.meta.url),Buffer.from(r.data,'base64'));}
try{
 await call('Runtime.enable');await call('Page.enable');await call('Network.enable');await call('Network.setCacheDisabled',{cacheDisabled:true});
 await call('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});
 const loaded=new Promise(resolve=>{const listener=e=>{if(JSON.parse(e.data).method==='Page.loadEventFired'){ws.removeEventListener('message',listener);resolve()}};ws.addEventListener('message',listener)});
 await call('Page.navigate',{url:'http://127.0.0.1:8765/index.html?sector9='+Date.now()});await loaded;
 await evaluate(`(async()=>{
  while(!document.querySelector('#new-game'))await new Promise(r=>setTimeout(r,30));
  const {Engine}=await import('/js/engine.js');
  const toggle=Engine.prototype.toggleCombatDebug;
  Engine.prototype.toggleCombatDebug=function(){window.sector9Preview=this;return toggle.call(this)};
  document.querySelector('#new-game').click();
 })()`);
 const f3=async()=>{await call('Input.dispatchKeyEvent',{type:'keyDown',key:'F3',code:'F3',windowsVirtualKeyCode:114});await call('Input.dispatchKeyEvent',{type:'keyUp',key:'F3',code:'F3',windowsVirtualKeyCode:114})};
 await f3();
 const report=await evaluate(`(async()=>{
  const e=sector9Preview;if(!e.debugCombat)throw Error('F3 did not enable debug');
  e.paused=true;await e.assets.loadRegion('slums');e.applyAssetCollisionConfigs();
  e.enemies=e.enemies.filter(e=>e.room===0);
  const [patrol,robot]=e.enemies;patrol.x=800;robot.x=1050;
  for(const actor of e.enemies){actor.y=790-actor.h;actor.state='attack';actor.attackTimer=.1;actor.meleeFacing=actor.facing=actor.type==='patrol'?1:-1}
  e.state.player.x=930;e.state.player.y=736;e.camera.x=600;e.camera.y=360;e.render(false);
  if(e.assets.status().failed)throw Error('missing asset requests');
  if(patrol.w!==28||patrol.h!==56||robot.w!==24||robot.h!==57)throw Error('collision config regression');
  const blue=()=>{const pixels=e.ctx.getImageData(0,0,e.canvas.width,e.canvas.height).data;let n=0;for(let i=0;i<pixels.length;i+=4)if(pixels[i]<130&&pixels[i+1]>100&&pixels[i+1]<190&&pixels[i+2]>220)n++;return n};
  window.debugBlue=blue;window.debugOnPixels=blue();
  return {enemyTypes:e.enemies.map(e=>e.type),debugEnabled:e.debugCombat,bluePixels:debugOnPixels};
 })()`);
 await screenshot('sector9-debug-preview');
 await f3();
 await evaluate(`(()=>{const e=sector9Preview;if(e.debugCombat)throw Error('F3 did not disable debug');if(debugBlue()>=debugOnPixels)throw Error('debug overlay persisted');})()`);
 await screenshot('sector9-enemies-preview');
 const beams=await evaluate(`(async()=>{
  const {resetMatrona,MATRONA_TIMING}=await import('/js/matrona.js');const {updateBoss}=await import('/js/bosses.js');
  const e=sector9Preview,b=e.state.bosses[0],p=e.state.player;e.enemies=[];resetMatrona(b);b.active=true;b.facing=-1;
  p.x=b.x-270;p.y=736;b.matronaState='beam_telegraph';b.timer=MATRONA_TIMING.beamTrack;
  const ctx={config:e.assets.getConfig('matrona'),platforms:e.world.map.platforms};
  while(b.matronaState==='beam_telegraph')updateBoss(b,p,1/60,ctx);
  if(b.matronaState!=='beam_lock')throw Error('no locked warning');
  const locked=JSON.stringify(b.beam);p.x-=80;
  for(let i=0;i<12;i++)updateBoss(b,p,1/60,ctx);
  if(JSON.stringify(b.beam)!==locked)throw Error('locked warning followed player');
  e.camera.x=1650;e.camera.y=360;e.render(false);
  return MATRONA_TIMING;
 })()`);
 await screenshot('matrona-locked-warning-preview');
 if(errors.length||badResponses.length)throw Error(JSON.stringify({errors,badResponses}));
 console.log('PASS: real F3 keyboard toggles, physical dimensions, Canvas silhouettes, camera-aligned debug overlay, locked laser warning; no console/HTTP errors. '+JSON.stringify({...report,beams}));
}finally{ws.close()}
