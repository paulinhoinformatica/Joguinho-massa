import assert from 'node:assert/strict';
import {buildMap,REGIONS,GROUND,factoryX} from '../js/map.js';
import {spawnEnemies,updateEnemies,industrialAttackBox} from '../js/enemies.js';
import {createPlayer,updatePlayer} from '../js/player.js';
import {Engine,newState} from '../js/engine.js';
import {normalizeSave} from '../js/save.js';
import {checkpointFor} from '../js/campaign.js';
import {Camera} from '../js/camera.js';
const map=buildMap(),world={map},pool=map.hazards.find(h=>h.kind==='coolant');
for(const fps of [30,60,120]){
 const dt=1/fps,p=createPlayer(),e=spawnEnemies().find(e=>e.type==='executor');
 p.x=e.x-40;p.y=GROUND-p.h;e.attackCooldown=0;
 updateEnemies([e],p,dt,world);assert.equal(p.health,100);assert.equal(e.pendingAttack,'melee');
 for(let i=0;i<fps*.6;i++)updateEnemies([e],p,dt,world);
 assert.equal(p.health,100-e.damage);assert.equal(p.lastDamage.entity,e.id);assert.equal(p.lastDamage.source,'enemy_melee');
 p.health=100;p.invuln=0;p.y-=150;e.pendingAttack='melee';e.windupTimer=dt/2;updateEnemies([e],p,dt,world);assert.equal(p.health,100);
 p.y=GROUND-p.h;e.pendingAttack=null;e.attackCooldown=10;
 e.projectiles=[{x:p.x,y:p.y,vx:0,life:2,damage:8}];updateEnemies([e],p,dt,world);assert.equal(p.health,92);assert.equal(p.lastDamage.source,'projectile');assert.equal(e.projectiles.length,0);
 e.dead=true;e.respawn=30;e.projectiles=[{life:2}];updateEnemies([e],p,dt,world);assert.equal(e.projectiles.length,0);
 const fake={state:{player:p,abilities:{}},world,hazardTick:0,damagePlayer:Engine.prototype.damagePlayer};
 p.x=pool.x+20;p.y=GROUND-p.h;p.invuln=0;p.health=100;Engine.prototype.updateHazards.call(fake,dt);assert.equal(p.health,88);assert.equal(p.lastDamage.source,'hazard_pool');
 Engine.prototype.updateHazards.call(fake,dt);assert.equal(p.health,88);
 p.invuln=0;p.x=pool.x-p.w-1;fake.hazardTick=0;Engine.prototype.updateHazards.call(fake,dt);assert.equal(p.health,88);
 // Walk the full industrial floor using the actual movement/collision code.
 const q=createPlayer();q.x=2440;q.y=GROUND-q.h;let jumped=0;
 for(let t=0;t<fps*35&&q.x<4480;t++){
  const obstacle=map.platforms.find(s=>s.h>=70&&s.y<GROUND&&s.x>=q.x&&s.x-q.x<85);
  const jump=!!obstacle&&q.grounded;if(jump)jumped++;
  updatePlayer(q,{right:true,jump,platforms:map.platforms},dt,{doubleJump:true,dash:true});
 }
 assert.ok(q.x>=4480,'main route at '+fps+' '+JSON.stringify({x:q.x,y:q.y,jumped}));assert.ok(jumped>=4);
 // Each upper-route jump must land using the real physics, without hook/dash.
 const route=[[2880,790,60],[2960,680,200],[3190,585,170],[3370,490,170],[3540,395,190]];
 for(let i=0;i<route.length-1;i++){
  const [x,y,w]=route[i],[tx,ty,tw]=route[i+1];let reachable=false;
  for(const start of [x+w-65,x+w-35]){
   const a=createPlayer();a.x=start;a.y=y-a.h;a.grounded=true;a.vx=200;
   for(let tick=0;tick<fps*1.5;tick++){updatePlayer(a,{right:a.x<tx+tw-50,jump:tick===0,platforms:map.platforms},dt,{});if(a.grounded&&a.y+a.h===ty&&a.x+a.w>tx&&a.x<tx+tw)reachable=true;}
  }assert.ok(reachable,`upper route ${i} at ${fps}`);
 }
}
for(const x of [2700,3980,4100,4710,4900,6500]){
 const old=newState();delete old.factoryLayout;old.bosses[0].dead=true;old.bosses[1].dead=x>=4800;old.player.x=x;old.player.y=736;old.checkpoint={x:3980,y:733,region:1};old.credits=123;
 const next=normalizeSave(old);assert.equal(next.player.x,factoryX(x));assert.equal(next.checkpoint.x,4380);assert.equal(next.credits,123);assert.equal(normalizeSave(next).player.x,next.player.x);
}
assert.equal(checkpointFor(1,true).x,4380);assert.equal(REGIONS[1].width,2800);
const oldPoolSave=newState();delete oldPoolSave.factoryLayout;oldPoolSave.bosses[0].dead=true;oldPoolSave.player.x=3550;oldPoolSave.player.y=736;
assert.equal(normalizeSave(oldPoolSave).player.x,pool.x-42);
const cam=new Camera();for(let i=0;i<120;i++)cam.update({x:3650,y:340,w:30,h:54},960,540,7600,900,1/60);assert.ok(cam.x>3100&&cam.y<200);
console.log('PASS: factory damage, telegraphs, height, projectile consumption/death cleanup, pool boundaries, full floor route and optional platform jumps at 30/60/120 FPS; saves and camera.');
