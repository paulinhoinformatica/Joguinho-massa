import {writeFileSync} from 'node:fs';
const tabs=await(await fetch('http://127.0.0.1:9222/json/list')).json();
const ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
await new Promise(resolve=>ws.addEventListener('open',resolve,{once:true}));
let serial=0;const pending=new Map(),errors=[];
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text);if(m.method==='Network.loadingFailed')errors.push(m.params.errorText);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}});
const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++serial;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
async function evaluate(expression){const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;}
async function screenshot(name){const r=await call('Page.captureScreenshot',{format:'png'});writeFileSync(new URL('./campaign-'+name+'.png',import.meta.url),Buffer.from(r.data,'base64'));}
try{
 await call('Runtime.enable');await call('Network.enable');await call('Network.setCacheDisabled',{cacheDisabled:true});
 await call('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});
 await call('Page.navigate',{url:'http://127.0.0.1:8765/index.html?campaign='+Date.now()});
 await new Promise(resolve=>setTimeout(resolve,700));errors.length=0;
 await evaluate(`document.querySelector('#new-game').click()`);
 await new Promise(resolve=>setTimeout(resolve,500));
 await evaluate(`document.querySelector('#pause-open').click();document.querySelector('#pause-screen').classList.add('hidden')`);
 await evaluate(`(async()=>{
  const {Engine,newState}=await import('/js/engine.js'),{UI}=await import('/js/ui.js');
  const {buildMap}=await import('/js/map.js');const {saveGame,loadGame,normalizeSave}=await import('/js/save.js');
  window.campaignResults=[];
  window.checkCampaign=(name,ok)=>{if(!ok)throw Error(name);campaignResults.push(name)};
  window.campaignEngine=new Engine(document.querySelector('#game'),newState(),new UI());
  const e=campaignEngine;await e.assets.loadRegion('slums');
  window.resumeCampaign=()=>{document.querySelector('#dialog-screen').classList.add('hidden');e.paused=false;e.keys.clear();e.pressed.clear()};
  checkCampaign('new game has exactly three bosses',e.state.bosses.length===3);
  checkCampaign('Kael PNG and scale preserved',e.spriteRenderer.available('protagonist','melee')&&e.assets.getConfig('protagonist').scale===.75);
  checkCampaign('no missing asset downloads',e.assets.status().failed===0);
  e.state.player.x=2500;e.checkGates();checkCampaign('industrial initially blocked',e.state.player.x<2400);
  e.state.player.x=310;e.state.player.y=736;e.interact();checkCampaign('checkpoint activated',e.state.checkpoint.x===310);
  for(const npc of e.world.map.npcs.filter(n=>n.x<2400)){
   e.state.player.x=npc.x;e.state.player.y=736;e.interact();
   checkCampaign('dialog '+npc.id,!document.querySelector('#dialog-screen').classList.contains('hidden'));resumeCampaign();
  }
  checkCampaign('Yara grants hook',e.state.abilities.hook);
  // Buying now requires a deliberate request and confirmation, not merely talking.
  const oren=e.world.map.npcs.find(n=>n.id==='oren-slum');e.state.player.x=oren.x;e.state.player.y=736;e.interact();
  while(e.ui.dialogueLines)e.advanceDialog();e.requestOrenUpgrade();
  while(e.ui.dialogueLines)e.advanceDialog();e.confirmOrenUpgrade();e.closeDialog();
  checkCampaign('Oren upgrade',e.state.player.maxHealth===115&&e.state.credits===20);
  const t=e.world.map.terminals.find(t=>t.id==='log-1');e.state.player.x=t.x;e.state.player.y=t.y-e.state.player.h;e.interact();
  checkCampaign('investigation dialog',e.state.events.includes('log-1')&&document.querySelector('#dialog-text').textContent.includes('Aurora Dynamics'));resumeCampaign();
  e.state.player.x=1450;e.state.player.y=736;e.camera.x=1050;e.camera.y=360;e.render();
 })()`);
 await screenshot('setor9');
 for(let index=0;index<3;index++){
  const report=await evaluate(`(async()=>{
   const e=campaignEngine,b=e.state.bosses[${index}],p=e.state.player;
   resumeCampaign();e.enemies=[];p.x=b.x-p.w-12;p.y=736;p.vx=p.vy=0;p.invuln=1000;p.grounded=true;e.camera.x=b.arena.left-100;e.camera.y=360;
   await e.assets.loadRegion(${index}===0?'slums':${index}===1?'industrial':'virus_core');
   e.update(1/60);checkCampaign('boss intro '+b.title,e.paused&&b.active);resumeCampaign();
   const serial=p.attackSerial||0;let frames=0;
   while(!b.dead&&frames<3600){
    // Keep the progression probe in melee range of the mobile first boss.
    if(b.assetId==='matrona'){p.x=b.x-p.w-12;p.vx=0}
    if(p.attackTimer<=0&&p.attackCooldown<=1/60)e.pressed.add('j');
    e.update(1/60);frames++;
   }
   checkCampaign('boss defeated with real hit events '+b.title,b.dead&&frames<3600&&p.attackSerial>serial);
   checkCampaign('boss narrative saved '+b.title,e.state.events.includes('act-'+(${index}+1)));
   checkCampaign('boss reward once '+b.title,e.state.credits>=50);
   const rewardCredits=e.state.credits;e.finishBoss(b);
   checkCampaign('duplicate victory ignored '+b.title,e.state.credits===rewardCredits);
   if(${index}<2){
    checkCampaign('victory dialog '+b.title,!document.querySelector('#dialog-screen').classList.contains('hidden'));resumeCampaign();
    p.x=(${index}+1)*2400+40;p.y=736;p.vx=0;e.update(1/60);
    checkCampaign('map transition '+b.title,e.state.currentMap===${index}+1&&e.state.checkpoint.region===${index}+1);
    for(const npc of e.world.map.npcs.filter(n=>Math.floor(n.x/2400)===${index}+1)){
     p.x=npc.x;p.y=736;e.interact();checkCampaign('dialog '+npc.id,e.state.events.includes('npc-'+npc.id));resumeCampaign();
    }
    const terminal=e.world.map.terminals.find(t=>t.id==='log-'+(${index}+2));p.x=terminal.x;p.y=terminal.y-p.h;e.interact();resumeCampaign();
    if(!e.state.events.includes(terminal.id)){e.interact();resumeCampaign();}
    checkCampaign('record recovered '+terminal.id,e.state.events.includes(terminal.id));
    e.ui.panel(e.state,'map');checkCampaign('map has nine rooms',document.querySelectorAll('.map-node').length===9);
    e.ui.panel(e.state,'journal');checkCampaign('journal tracks act',document.querySelector('#panel-content').textContent.includes('Ato 1'));
   }else{
    checkCampaign('ending scene',!document.querySelector('#ending-screen').classList.contains('hidden')&&e.state.events.includes('ending'));
    checkCampaign('all three acts complete',e.state.quests.filter(q=>q.id.startsWith('act-')).every(q=>q.complete));
   }
   if(${index}<2){e.camera.x=Math.max(0,e.state.player.x-440);e.camera.y=360;document.querySelector('#boss-warning').classList.add('hidden');e.render();}
   return {boss:b.title,simulatedSeconds:frames/60};
  })()`);
  console.log(JSON.stringify(report));
  if(index<2)await screenshot(index===0?'industrial':'torre');
 }
 await new Promise(resolve=>setTimeout(resolve,6500));await screenshot('ending');
 const report=await evaluate(`(async()=>{
  const {saveGame,loadGame,normalizeSave}=await import('/js/save.js');const {buildMap}=await import('/js/map.js');
  const e=campaignEngine,p=e.state.player;
  checkCampaign('save ending',saveGame(e.state));let loaded=loadGame();
  checkCampaign('load ending and bosses',loaded.bosses.every(b=>b.dead)&&loaded.events.includes('ending')&&loaded.abilities.doubleJump);
  e.state.events.push('shortcut-maintenance');e.world.map=buildMap(e.state.events);saveGame(e.state);loaded=loadGame();
  checkCampaign('shortcut persists',buildMap(loaded.events).platforms.length===buildMap().platforms.length+1);
  document.querySelector('#ending-screen').classList.add('hidden');resumeCampaign();p.x=120;p.y=736;e.update(1/60);
  checkCampaign('revisit Setor 9',e.state.currentMap===0);
  const cp=e.world.map.checkpoints.find(cp=>cp.x===1580);p.x=cp.x;p.y=736;e.interact();
  p.health=0;p.dead=true;p.attackTimer=.3;p.dashTimer=.1;e.respawn();
  checkCampaign('respawn at valid checkpoint',p.x===1580&&p.health===p.maxHealth&&!p.dead&&p.attackTimer===0&&p.dashTimer===0);
  checkCampaign('victories survive death',e.state.bosses.every(b=>b.dead));
  // Exercise the connected ground route in both directions without teleporting between regions.
  p.x=100;p.y=736;p.vx=0;p.invuln=1000;e.keys.add('d');
  for(let i=0;i<1800;i++)e.update(1/60);
  checkCampaign('walk through all three maps',p.x>7000&&p.x+p.w<=7200);
  e.keys.clear();e.keys.add('a');
  for(let i=0;i<1800;i++)e.update(1/60);
  checkCampaign('walk back to Setor 9',p.x<200);e.keys.clear();
  const old={...e.state,version:1,player:{...p,x:5000},checkpoint:{x:4980,region:2}};
  checkCampaign('removed region migrates to valid checkpoint',normalizeSave(old).player.x===2570);
  checkCampaign('all asset loads valid',e.assets.status().failed===0);
  return {checks:campaignResults.length,results:campaignResults};
 })()`);
 if(errors.length)throw Error('Browser errors: '+errors.join(', '));
 // Exercise the real main.js handlers when continuing a completed save.
 await call('Page.navigate',{url:'http://127.0.0.1:8765/index.html?continue-test='+Date.now()});
 await new Promise(resolve=>setTimeout(resolve,700));
 const continued=await evaluate(`document.querySelector('#continue-game').click();!document.querySelector('#ending-screen').classList.contains('hidden')`);
 if(!continued)throw Error('Completed save did not reopen ending');
 await evaluate(`document.querySelector('#ending-continue').click()`);
 await new Promise(resolve=>setTimeout(resolve,200));
 const explored=await evaluate(`document.querySelector('#ending-screen').classList.contains('hidden')&&document.querySelector('#objective').textContent.includes('Transmissão interrompida')`);
 if(!explored)throw Error('Post-ending exploration failed');
 report.checks+=2;report.results.push('main.js continues completed save','main.js returns to exploration');
 if(errors.length)throw Error('Browser errors: '+errors.join(', '));
 console.log(`PASS: ${report.checks} browser campaign checks; no JavaScript exceptions or failed downloads. Four screenshots saved.`);
 writeFileSync(new URL('./campaign-browser-results.json',import.meta.url),JSON.stringify(report,null,2));
}finally{ws.close();}
