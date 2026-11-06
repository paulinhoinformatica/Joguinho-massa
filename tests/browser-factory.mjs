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
 await call('Runtime.enable');await call('Page.enable');await call('Network.enable');
 await call('Page.navigate',{url:'http://127.0.0.1:8765/index.html?factory='+Date.now()});
 await evaluate(`(async()=>{while(!document.querySelector('#new-game'))await new Promise(r=>setTimeout(r,30));const {Engine,newState}=await import('/js/engine.js');const {UI}=await import('/js/ui.js');window.FactoryEngine=Engine;const toggle=Engine.prototype.toggleCombatDebug;Engine.prototype.toggleCombatDebug=function(){window.factoryPreview=this;return toggle.call(this)};document.querySelector('#new-game').click()})()`);
 const f3=async()=>{await call('Input.dispatchKeyEvent',{type:'keyDown',key:'F3',code:'F3',windowsVirtualKeyCode:114});await call('Input.dispatchKeyEvent',{type:'keyUp',key:'F3',code:'F3',windowsVirtualKeyCode:114})};
 await f3();
 const report=await evaluate(`(async()=>{
  const e=factoryPreview;e.paused=true;e.state.bosses[0].dead=true;await e.assets.loadRegion('industrial');e.applyAssetCollisionConfigs();
  const p=e.state.player;p.x=3550;p.y=790-p.h;p.invuln=0;e.hazardTick=0;e.updateHazards(1/60);
  if(p.lastDamage.source!=='hazard_pool')throw Error('pool source');
  e.camera.x=3100;e.camera.y=360;e.render(false);
  if(!e.debugCombat)throw Error('F3');if(e.assets.status().failed)throw Error('asset failure');
  return {source:p.lastDamage,debug:e.debugCombat,regionWidth:e.world.map.platforms.find(p=>p.x===2400&&p.kind==='ground').w};
 })()`);
 await screenshot('factory-damage-debug-preview');
 await f3();await evaluate(`(()=>{const e=factoryPreview;if(e.debugCombat)throw Error('debug persisted');e.state.player.x=3300;e.state.player.y=736;e.camera.x=3000;e.render(false)})()`);await screenshot('factory-coolant-preview');
 await evaluate(`(()=>{const e=factoryPreview;e.state.player.x=4160;e.camera.x=3950;e.render(false)})()`);await screenshot('factory-security-preview');
 await evaluate(`(()=>{const e=factoryPreview;e.state.player.x=3620;e.state.player.y=341;e.camera.x=3100;e.camera.y=120;e.render(false);e.interact();if(!e.state.items.includes('Esquema do circuito refrigerante'))throw Error('optional reward')})()`);await screenshot('factory-upper-route-preview');
 await evaluate(`(async()=>{
  const e=factoryPreview,p=e.state.player;const {syncProgress}=await import('/js/campaign.js');
  p.x=2570;p.y=790-p.h;e.interact();if(e.state.checkpoint.x!==2570)throw Error('entry checkpoint');
  p.x=4380;p.y=790-p.h;e.interact();if(e.state.checkpoint.x!==4380)throw Error('preboss checkpoint');
  p.health=1;e.enemies[0].projectiles=[{life:1}];e.respawn();e.paused=true;if(p.x!==4380||p.health!==p.maxHealth||e.enemies.some(e=>e.projectiles.length))throw Error('respawn');
  const b=e.state.bosses.find(b=>b.assetId==='warden');p.x=b.arena.left+10;p.y=790-p.h;e.paused=false;e.update(1/60);e.paused=true;if(!b.active)throw Error('boss trigger');
  e.finishBoss(b);e.closeDialog();e.paused=true;p.x=5230;e.checkGates();syncProgress(e.state);if(e.state.region!=='corporate')throw Error('tower exit');
  e.render(false);
 })()`);
 const assetFailures=badResponses.filter(url=>!url.endsWith('/favicon.ico'));
 if(errors.length||assetFailures.length)throw Error(JSON.stringify({errors,assetFailures}));
 writeFileSync(new URL('./factory-browser-results.json',import.meta.url),JSON.stringify({report,errors,badResponses},null,2));console.log('PASS: browser render, industrial assets, F3 on/off, damage source, optional reward and screenshots; no console/network errors.');
}finally{ws.close()}
