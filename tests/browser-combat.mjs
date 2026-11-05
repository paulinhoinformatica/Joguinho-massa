import {writeFileSync} from 'node:fs';
const tabs=await (await fetch('http://127.0.0.1:9222/json/list')).json();
const ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
await new Promise(resolve=>ws.addEventListener('open',resolve,{once:true}));
let serial=0;const pending=new Map();
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const done=pending.get(m.id);pending.delete(m.id);m.error?done.reject(Error(JSON.stringify(m.error))):done.resolve(m.result);}});
function call(method,params={}){return new Promise((resolve,reject)=>{const id=++serial;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});}
try{
 await call('Network.enable');
 await call('Network.setCacheDisabled',{cacheDisabled:true});
 await call('Page.navigate',{url:'http://127.0.0.1:8765/index.html?combat-test='+Date.now()});
 await new Promise(resolve=>setTimeout(resolve,1000));
 const result=await call('Runtime.evaluate',{awaitPromise:true,returnByValue:true,expression:`(async()=>{
  const {Engine,newState}=await import('/js/engine.js');
  const {createPlayer}=await import('/js/player.js');
  const {runCombatTests}=await import('/tests/combat-cases.js');
  const e=new Engine(document.querySelector('#game'),newState(),{update(){},toast(){}});
  await e.assets.loadRegion('slums');
  const cfg=e.assets.getConfig('protagonist');const results=runCombatTests(cfg);
  const check=(name,ok)=>{if(!ok)throw Error(name);results.push(name);};
  check('real melee PNG loaded',e.spriteRenderer.available('protagonist','melee'));
  const enemyTemplate={...e.enemies[0]};e.state.bosses=[];e.world.map.hazards=[];
  e.world.map.platforms=[{x:0,y:790,w:2000,h:100}];
  document.querySelector('#title-screen').classList.add('hidden');
  const sheet=document.createElement('canvas');sheet.width=1000;sheet.height=600;
  const ctx=sheet.getContext('2d');ctx.fillStyle='#14212b';ctx.fillRect(0,0,1000,600);
  let row=0;
  for(const fps of [30,60,120])for(const air of [false,true]){
   const dt=1/fps,p={...createPlayer(),x:300,y:air?300:736,grounded:!air,vx:250,vy:air?-200:0};
   e.state.player=p;e.enemies=[];e.keys.clear();e.keys.add('d');e.pressed.add('j');e.update(dt);
   check('fallback melee '+fps+'/'+air,p.attackAnimation==='melee'&&p.state==='attack');
   const serial=p.attackSerial;let events=0;
   for(let i=0;i<Math.ceil(8/18*fps)-1;i++){
    if(p.animationEvent==='hit')events++;
    if(i%Math.max(1,Math.floor(fps*.08))===0){
     const col=Math.floor(i/Math.max(1,Math.floor(fps*.08)));
     e.spriteRenderer.draw(ctx,'protagonist',p.attackAnimation,p,0,{x:100+col*145,y:85+row*95});
    }
    e.update(dt);
   }
   check('one real hit event '+fps+'/'+air,events===1);
   check('same swing until end '+fps+'/'+air,p.attackSerial===serial);
   ctx.fillStyle='#ffffff';ctx.font='12px monospace';ctx.fillText(fps+' FPS '+(air?'air':'ground'),8,15+row*95);row++;
  }
  // Full Engine event consumption and damage against an airborne target.
  const p={...createPlayer(),x:300,y:300,grounded:false,vy:0};e.state.player=p;
  const enemy={...enemyTemplate,x:340,y:330,w:30,h:150,health:100,maxHealth:100,stunTimer:10,projectiles:[]};
  e.enemies=[enemy];e.keys.clear();e.pressed.add('j');
  for(let i=0;i<24;i++)e.update(1/60);
  check('engine airborne hit once',enemy.health===78&&p.attackTimer>0);
  // Optional animation uses a loaded asset and remains selected after landing.
  cfg.animations.air_melee={...cfg.animations.melee,fps:16};
  e.state.player={...createPlayer(),x:300,y:735.5,vy:100,grounded:false};e.enemies=[];e.pressed.add('j');e.update(1/60);
  const airborne=e.state.player,instance=e.animations.instances.get(airborne);
  check('optional air_melee selected',airborne.attackAnimation==='air_melee'&&airborne.grounded&&instance.key==='air_melee');
  e.update(1/60);
  check('landing does not reset optional animation',e.animations.instances.get(airborne)===instance);
  check('optional animation duration',Math.abs(airborne.attackTimer-(8/16-1/60))<1e-8);
  delete cfg.animations.air_melee;
  document.body.replaceChildren(sheet);
  return {checks:results.length,contactSheet:sheet.toDataURL('image/png')};
 })()`});
 if(result.exceptionDetails)throw Error(JSON.stringify(result.exceptionDetails));
 const {checks,contactSheet}=result.result.value;
 writeFileSync(new URL('./combat-preview.png',import.meta.url),Buffer.from(contactSheet.split(',')[1],'base64'));
 console.log(`PASS: ${checks} browser checks with real PNGs; tests/combat-preview.png saved.`);
}finally{ws.close();}
