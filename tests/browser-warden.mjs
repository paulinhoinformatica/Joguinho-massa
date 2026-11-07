import {writeFileSync} from 'node:fs';
const tabs=await(await fetch('http://127.0.0.1:9222/json/list')).json();
const ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let serial=0;const pending=new Map(),errors=[];
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}});
const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++serial;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
async function evaluate(expression){const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;}
async function shot(name){const r=await call('Page.captureScreenshot',{format:'png'});writeFileSync(new URL('./'+name+'.png',import.meta.url),Buffer.from(r.data,'base64'));}
try{
 await call('Runtime.enable');await call('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});
 await call('Page.navigate',{url:'http://127.0.0.1:8765/index.html?warden='+Date.now()});await new Promise(r=>setTimeout(r,600));
 const report=await evaluate(`(async()=>{
 const {Engine,newState}=await import('/js/engine.js'),{UI}=await import('/js/ui.js'),{resetWarden,updateWarden,wardenAnimation,wardenFrame}=await import('/js/warden.js');
 const state=newState();state.bosses[0].dead=true;state.player.x=4700;state.player.y=736;
 const e=new Engine(document.querySelector('#game'),state,new UI());await e.assets.loadRegion('industrial');e.applyAssetCollisionConfigs();window.wardenPreview=e;
 const b=state.bosses[1],p=state.player,cfg=e.assets.getConfig('warden');let checks=0;const check=(name,ok)=>{checks++;if(!ok)throw Error(name)};
 const probe=document.createElement('canvas'),pc=probe.getContext('2d');
 for(const [name,a] of Object.entries(cfg.animations)){const img=e.assets.get(a.sheet);check(name+' load',img&&!a.invalid&&a.ready);check(name+' grid',img.naturalWidth===a.frameWidth*a.count&&img.naturalHeight===a.frameHeight);probe.width=img.naturalWidth;probe.height=img.naturalHeight;pc.drawImage(img,0,0);const pixels=pc.getImageData(0,0,probe.width,probe.height).data;check(name+' transparency',pixels.some((v,i)=>i%4===3&&v===0)&&pixels.some((v,i)=>i%4===3&&v>0));}
 check('no failed assets',e.assets.status().failed===0);check('body separate from margins',b.w===64&&b.h===112);
 resetWarden(b);b.active=true;b.facing=-1;p.x=b.x-180;p.invuln=100;
 const x=b.x;updateWarden(b,p,.1,{platforms:e.world.map.platforms});check('phase1 walk',b.x<x&&wardenAnimation(b)==='phase1_walk');
 b.health=120;updateWarden(b,p,.01,{platforms:e.world.map.platforms});check('transition entered',b.wardenState==='transition'&&b.offense.length===0&&b.waves.length===0);
 for(let i=0;i<110;i++)updateWarden(b,p,1/60,{platforms:e.world.map.platforms});check('phase2 unique',b.phase===2&&b.transformed);check('phase2 assets only',wardenAnimation(b).startsWith('phase2_'));
 const records=[],ctx={save(){},restore(){},translate(){},scale(){},drawImage(...args){records.push(args)},imageSmoothingEnabled:true};
 for(const facing of [-1,1]){e.spriteRenderer.draw(ctx,'warden','phase2_idle',b,0,{x:b.x+b.w/2+facing*19.74,y:790,facing,frameOverride:0});check('nearest pixel',ctx.imageSmoothingEnabled===false);check('uniform scale',Math.abs(records.at(-1)[7]-records.at(-1)[8])<1);}
 document.querySelector('#title-screen').classList.add('hidden');document.querySelector('#dialog-screen').classList.add('hidden');e.camera.x=4350;e.camera.y=330;e.paused=true;
 check('all loaded',Object.keys(cfg.animations).length===6);
 return {checks,assets:e.assets.status()};})()`);
 for(const [name,phase,state,pattern,time] of [['warden-phase1',1,'approach',null,.3],['warden-impact1',1,'slam','slam',.08],['warden-transition',1,'transition',null,.76],['warden-phase2',2,'approach',null,.3],['warden-impact2',2,'slam','slam',.08],['warden-discharge2',2,'discharge','discharge',.12]]){
  await evaluate(`(async()=>{const e=window.wardenPreview,b=e.state.bosses[1];const {resetWarden,updateWarden}=await import('/js/warden.js');resetWarden(b);b.active=true;b.phase=${phase};b.transformed=${phase===2};b.facing=-1;b.x=b.arena.spawnX;b.wardenState=${JSON.stringify(state)};b.pattern=${JSON.stringify(pattern)};b.stateTime=${time};b.timer=2;b.moving=true;b.walkTime=.3;if(['slam','discharge'].includes(b.wardenState)){b.wardenState='windup';b.timer=0;updateWarden(b,e.state.player,.01,{platforms:e.world.map.platforms});}e.debugCombat=true;e.render(false);})()`);await shot(name);
 }
 const lifecycle=await evaluate(`(()=>{const e=window.wardenPreview,b=e.state.bosses[1];b.dead=false;b.health=80;b.phase=2;b.transformed=true;b.waves=[{}];b.offense=[{}];e.respawn();if(b.phase!==1||b.transformed||b.waves.length||b.offense.length||b.x!==b.arena.spawnX)throw Error('respawn');b.active=true;const before=e.state.credits;e.paused=false;let frames=0,phase2=false;while(!b.dead&&frames<3600){const p=e.state.player;p.invuln=100;p.x=b.x-p.w-8;p.y=736;p.facing=1;if(p.attackTimer<=0&&p.attackCooldown<=1/60)e.pressed.add('j');e.update(1/60);phase2 ||= b.phase===2;frames++;}if(!b.dead||!phase2)throw Error('actual fight '+frames+' hp '+b.health);const credits=e.state.credits;e.finishBoss(b);if(credits!==before+50||e.state.credits!==credits||!e.state.events.includes('victory-boss-2')||!b.dead||b.offense.length)throw Error('victory');const save=JSON.parse(localStorage.getItem('nova-aurora-save-v1'));if(!save.bosses[1].dead)throw Error('saved victory');return 'respawn, complete two-phase fight, rewards once, victory event, save';})()`);
 if(errors.length)throw Error(JSON.stringify(errors));
 writeFileSync(new URL('./warden-browser-results.json',import.meta.url),JSON.stringify({report,lifecycle,errors},null,2));console.log('PASS browser Warden: '+report.checks+' checks; '+lifecycle+'; six screenshots.');
}finally{ws.close();}
