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
 await call('Runtime.enable');await call('Network.enable');await call('Network.setCacheDisabled',{cacheDisabled:true});
 await call('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});
 await call('Page.navigate',{url:'http://127.0.0.1:8765/index.html?matrona='+Date.now()});
 await new Promise(resolve=>setTimeout(resolve,700));errors.length=0;badResponses.length=0;
 const report=await evaluate(`(async()=>{
  const {Engine,newState}=await import('/js/engine.js');const {UI}=await import('/js/ui.js');const {renderBoss}=await import('/js/bosses.js');
  let checks=0;const check=(name,ok)=>{checks++;if(!ok)throw Error(name)};
  const e=new Engine(document.querySelector('#game'),newState(),new UI());await e.assets.loadRegion('slums');window.matronaPreview=e;
  const b=e.state.bosses[0],p=e.state.player,cfg=e.assets.getConfig('matrona'),def=cfg.animations.idle,img=e.assets.get(def.sheet);
  check('real static PNG',img.naturalWidth===130&&img.naturalHeight===254&&def.count===1&&def.columns===1&&!def.invalid);
  check('130 pixel height',Math.abs(def.frameHeight*cfg.scale-130)<1e-8);
  check('collision preserved',b.w===74&&b.h===132&&cfg.collision.width===74&&cfg.collision.height===132);
  check('silhouette fits body',Math.abs(def.frameWidth*cfg.scale-b.w)<8&&Math.abs(def.frameHeight*cfg.scale-b.h)===2);
  check('future definitions retained',cfg.animations.attack.count===7&&cfg.animations.damage.count===3&&cfg.animations.death.count===7&&cfg.animations.attack.events[0].name==='strike');
  check('future PNGs not requested',!e.assets.records.has(cfg.animations.attack.sheet)&&!e.assets.records.has(cfg.animations.damage.sheet)&&!e.assets.records.has(cfg.animations.death.sheet));
  check('no failed assets',e.assets.status().failed===0);
  const probe=document.createElement('canvas');probe.width=130;probe.height=254;const pc=probe.getContext('2d');pc.drawImage(img,0,0);
  check('transparent PNG',pc.getImageData(0,0,130,254).data.some((value,index)=>index%4===3&&value===0));
  for(const key of ['attack_beam','attack_quarantine']){
   const a=cfg.animations[key],image=e.assets.get(a.sheet);
   check(key+' real loaded sheet',e.spriteRenderer.available('matrona',key)&&image.naturalWidth===1524&&image.naturalHeight===254&&!a.invalid);
   probe.width=image.naturalWidth;probe.height=image.naturalHeight;pc.drawImage(image,0,0);
   const pixels=pc.getImageData(0,0,probe.width,probe.height).data;
   check(key+' real transparency',pixels.some((v,i)=>i%4===3&&v===0)&&pixels.some((v,i)=>i%4===3&&v>0));
   check(key+' non looping',a.loop===false&&a.fps===10);
  }

  p.x=b.x-p.w-15;p.y=736;p.grounded=true;p.invuln=1000;e.enemies=[];
  e.update(1/60);check('initial left-facing native PNG',cfg.facing===-1&&def.nativeFacing===-1);
  e.closeDialog();e.camera.x=1650;e.camera.y=360;e.render(false);e.paused=true;
  document.querySelector('#title-screen').classList.add('hidden');
  const calls=[],fake={globalAlpha:1,save(){},restore(){},translate(){},scale(...v){calls.push(['scale',...v])},drawImage(...v){calls.push(['draw',...v.slice(1)])}};
  b.facing=-1;e.spriteRenderer.draw(fake,'matrona','idle',b,0,{x:b.x+b.w/2,y:b.y+b.h});
  check('left-facing PNG not inverted',!calls.some(c=>c[0]==='scale'));
  const left=calls.find(c=>c[0]==='draw');calls.length=0;b.facing=1;
  e.spriteRenderer.draw(fake,'matrona','idle',b,0,{x:b.x+b.w/2,y:b.y+b.h});
  check('right direction mirrors native art',calls.some(c=>c[0]==='scale'&&c[1]===-1));
  const right=calls.find(c=>c[0]==='draw');
  check('ground alignment stable both directions',left.slice(5).join()===right.slice(5).join()&&left[6]+left[8]===790&&left[8]===130);
  check('sprite centered on collision',Math.abs(left[5]+left[7]/2-(b.x+b.w/2))<=.5);
  check('pixel smoothing disabled',fake.imageSmoothingEnabled===false);
  const draws=[],renderer={assets:e.assets,available:(...args)=>e.spriteRenderer.available(...args),draw:(ctx,id,key,target)=>{draws.push({key,alpha:ctx.globalAlpha});return true}};
  for(const state of ['attack','damage','death']){
   b.warning=state==='attack'?.5:0;b.pattern='sweep';b.hitCooldown=state==='damage'?.1:0;b.dead=state==='death';b.deathTimer=.45;b.facing=-1;
   renderBoss(e.ctx,b,{x:0,y:0},renderer,0);check('static fallback '+state,draws.at(-1).key==='idle');
   if(b.dead)check('defeat fade preserved',Math.abs(draws.at(-1).alpha-.5)<1e-8);
  }
  b.dead=false;b.health=b.maxHealth;b.deathTimer=0;b.hitCooldown=0;b.warning=0;b.attackType='recovery';b.timer=1;b.facing=-1;
  for(const key of ['attack_beam','attack_quarantine']){
   b.matronaState=key==='attack_beam'?'beam_telegraph':'quarantine_cast';
   const attack=cfg.animations[key],saved=attack.enabled;attack.enabled=false;
   renderBoss(e.ctx,b,{x:0,y:0},renderer,0);check(key+' missing fallback',draws.at(-1).key==='idle');attack.enabled=saved;
  }
  const walk=cfg.animations.walk,walkImage=e.assets.get(walk.sheet);
  check('walk real dimensions',walkImage.naturalWidth===2032&&walkImage.naturalHeight===254&&!walk.invalid);
  check('walk configuration',walk.count===8&&walk.columns===8&&walk.fps===8&&walk.loop===true);
  probe.width=2032;probe.height=254;pc.drawImage(walkImage,0,0);
  const walkPixels=pc.getImageData(0,0,2032,254).data;
  check('walk real transparency',walkPixels.some((v,i)=>i%4===3&&v===0)&&walkPixels.some((v,i)=>i%4===3&&v>0));
  b.matronaState='reposition';renderBoss(e.ctx,b,{x:0,y:0},renderer,0);
  check('reposition selects walk',draws.at(-1).key==='walk');
  walk.enabled=false;renderBoss(e.ctx,b,{x:0,y:0},renderer,0);
  check('missing walk fallback',draws.at(-1).key==='idle');walk.enabled=true;
  for(const facing of [-1,1]){
   b.facing=facing;calls.length=0;e.animations.reset(b);
   e.spriteRenderer.draw(fake,'matrona','walk',b,0,{x:b.x+b.w/2,y:b.y+b.h});
   const frame=calls.find(c=>c[0]==='draw');
   check('walk feet align '+facing,frame[6]+frame[8]===790&&frame[8]===130);
   check('walk mirror '+facing,calls.some(c=>c[0]==='scale'&&c[1]===-1)===(facing===1));
   for(let i=1;i<=8;i++){
    calls.length=0;e.spriteRenderer.draw(fake,'matrona','walk',b,1/8,{x:b.x+b.w/2,y:b.y+b.h});
    check('walk frame '+facing+' '+i,calls.find(c=>c[0]==='draw')[1]===(i%8)*254);
   }
  }
  b.matronaState='idle';b.facing=-1;
  e.render(false);return {checks,height:130,width:def.frameWidth*cfg.scale};
 })()`);
 await screenshot('matrona-preview');
 await evaluate(`matronaPreview.state.bosses[0].matronaState='beam_telegraph';matronaPreview.state.bosses[0].timer=.6;matronaPreview.paused=false;matronaPreview.update(1/60);matronaPreview.paused=true;matronaPreview.render(false)`);
 await screenshot('matrona-warning-preview');
 const attacks=await evaluate(`(async()=>{
  const {updateBoss}=await import('/js/bosses.js');
  const {resetMatrona,handPosition}=await import('/js/matrona.js');
  const e=matronaPreview,b=e.state.bosses[0],p=e.state.player;
  const context={config:e.assets.getConfig('matrona'),platforms:e.world.map.platforms};
  const check=(ok,label)=>{if(!ok)throw Error(label)};
  p.x=b.x-270;p.y=736;p.invuln=100;resetMatrona(b);b.facing=-1;
  b.matronaState='beam_telegraph';b.timer=.7;
  while(['beam_telegraph','beam_lock'].includes(b.matronaState))updateBoss(b,p,1/60,context);
  check(b.matronaState==='beam_fire','beam enters active phase');
  check(b.beam.a.x===handPosition(b,context.config).x,'hand origin');
  const segment=JSON.stringify([b.beam.a,b.beam.z]);
  p.x+=100;p.y-=140;updateBoss(b,p,1/60,context);
  check(segment===JSON.stringify([b.beam.a,b.beam.z]),'locked trajectory');
  e.render(false);
  return {beam:JSON.parse(segment),missingAttacks:['attack_quarantine','attack_beam'].filter(k=>!e.spriteRenderer.available('matrona',k))};
 })()`);
 await screenshot('matrona-beam-preview');
 await evaluate(`(async()=>{
  const {updateBoss}=await import('/js/bosses.js');const e=matronaPreview,b=e.state.bosses[0],p=e.state.player;
  p.y=736;b.beam=null;b.matronaState='quarantine_cast';b.timer=.001;
  updateBoss(b,p,1/60,{config:e.assets.getConfig('matrona'),platforms:e.world.map.platforms});
  if(b.zones.length<2)throw Error('quarantine real floor marks');e.render(false);
 })()`);
 await screenshot('matrona-quarantine-preview');

 const fight=await evaluate(`(()=>{
  const e=matronaPreview,b=e.state.bosses[0],p=e.state.player;b.warning=0;b.attackType='recovery';b.timer=1;e.paused=false;let frames=0;
  while(!b.dead&&frames<3600){p.x=b.x-p.w-8;p.y=736;if(p.attackTimer<=0&&p.attackCooldown<=1/60)e.pressed.add('j');e.update(1/60);frames++;}
  if(!b.dead||!e.state.events.includes('act-1')||!e.state.abilities.dash)throw Error('Matrona combat/progression regression');
  return {defeated:b.dead,frames};
 })()`);
 if(errors.length||badResponses.length)throw Error('Browser errors: '+errors.join(', ')+'; failed responses: '+badResponses.join(', '));
 console.log('PASS: Matrona PNG, scale, alignment, native direction, static attack/damage/death fallback, defeat fade and real combat; no console errors or HTTP failures. '+JSON.stringify({...report,...attacks,...fight}));
}finally{ws.close();}
