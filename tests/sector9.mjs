import assert from 'node:assert/strict';
import {spawnEnemies,updateEnemies} from '../js/enemies.js';
import {enemyAttackBox,enemyMeleeBox,SECTOR9_MELEE} from '../js/sector9-enemies.js';
import {createPlayer,updatePlayer} from '../js/player.js';
import {createBosses,updateBoss} from '../js/bosses.js';
import {resetMatrona,MATRONA_TIMING} from '../js/matrona.js';
import {playerDamage} from '../js/combat.js';
import {buildMap,GROUND} from '../js/map.js';
import {readFileSync} from 'node:fs';
const world={map:buildMap()},config=JSON.parse(readFileSync(new URL('../assets/bosses/matrona/config.json',import.meta.url)));
const originalRandom=Math.random;let seed=1729;
Math.random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296};
for(const a of Object.values(config.animations))if(a.enabled!==false)a.ready=true;
assert.deepEqual(spawnEnemies().filter(e=>e.room===0).map(e=>e.type),['patrol','servant_shooter']);
assert.equal(Object.values(MATRONA_TIMING).reduce((a,b)=>a+b,0),2);
for(const fps of [30,60,120]){
 const dt=1/fps;
 for(const type of ['maintenance'])for(const facing of [-1,1]){
  const e=spawnEnemies().find(e=>e.type===type);e.room=0;e.x=1000;e.y=GROUND-e.h;e.facing=facing;e.attackCooldown=0;
  const p=createPlayer();p.x=facing>0?e.x+e.w+12:e.x-p.w-12;p.y=GROUND-p.h;
  const hp=p.health;
  updateEnemies([e],p,dt,world);assert.ok(e.meleePending);assert.equal(enemyAttackBox(e),null);assert.equal(p.health,hp);
  for(let i=0;i<fps*.55;i++){p.invuln=0;updateEnemies([e],p,dt,world)}
  assert.equal(p.health,hp-e.damage);assert.equal(enemyAttackBox(e),null);
  const front=enemyMeleeBox(e);assert.ok(facing>0?front.x>=e.x:front.x<e.x);
  // Vertical overlap is necessary, but low aerial targets still take damage.
  for(const [offset,hit] of [[-90,false],[-15,true]]){
   e.meleeFacing=facing;e.attackTimer=.1;e.attackHit=false;e.hurtTimer=0;e.meleePending=false;
   p.health=100;p.invuln=0;p.y=e.y+offset;
   updateEnemies([e],p,dt,world);assert.equal(p.health,hit?100-e.damage:100);
  }
  // A locked strike cannot hit behind the attacking enemy.
  e.meleeFacing=-facing;e.attackTimer=.1;e.attackHit=false;p.y=GROUND-p.h;p.health=100;p.invuln=0;
  updateEnemies([e],p,dt,world);assert.equal(p.health,100);
  e.meleeFacing=facing;e.attackTimer=.1;e.attackHit=false;p.invuln=.2;
  updateEnemies([e],p,dt,world);assert.equal(p.health,100);
  // Knockback from the unchanged staff attack now moves this enemy.
  p.invuln=0;p.attackTimer=1;p.state='attack';p.attackHitConsumed=false;p.attackBox={...e};p.facing=facing;p.combo=0;
  const before=e.health;assert.ok(playerDamage(p,e));assert.ok(e.health<before);assert.ok(!playerDamage(p,e));
  const old=e.x;updateEnemies([e],p,dt,world);assert.ok((e.x-old)*facing>0);assert.equal(enemyAttackBox(e),null);
  assert.equal(e.y+e.h,GROUND);
  // Shared platform physics supports landing on an actual roof.
  const roof=world.map.platforms.find(s=>s.x===820);e.x=850;e.y=roof.y-e.h-6;e.vy=100;e.hurtTimer=1;e.vx=0;
  p.x=e.x+20;for(let i=0;i<fps/5;i++)updateEnemies([e],p,dt,world);
  assert.equal(e.y+e.h,roof.y);
 }
 // Escape the locked beam using the real player physics and dash rules.
 for(const escape of ['run','jump','dash']){
  const b=createBosses()[0],p=createPlayer();resetMatrona(b);b.active=true;b.facing=-1;
  p.x=b.x-(escape==='run'?180:270);p.y=GROUND-p.h;p.grounded=true;p.facing=-1;
  b.matronaState='beam_telegraph';b.timer=MATRONA_TIMING.beamTrack;
  const ctx={config,platforms:world.map.platforms};
  while(b.matronaState==='beam_telegraph')updateBoss(b,p,dt,ctx);
  const locked=JSON.stringify([b.beam.a,b.beam.z]);let first=true,jumped=false,elapsed=0;
  while(['beam_lock','beam_fire'].includes(b.matronaState)){
   const jump=escape==='jump'&&!jumped&&elapsed>=.16;
   updatePlayer(p,{left:escape!=='jump',jump,dash:first&&escape==='dash',platforms:world.map.platforms},dt,{dash:true});
   jumped ||= jump;
   p.x=Math.max(b.arena.left,p.x);updateBoss(b,p,dt,ctx);first=false;elapsed+=dt;
   assert.equal(JSON.stringify([b.beam.a,b.beam.z]),locked);
  }
  assert.equal(p.health,100,`${escape} at ${fps} FPS`);assert.ok(elapsed>=MATRONA_TIMING.beamLock+MATRONA_TIMING.beamFire-1e-8);
  while(b.matronaState==='beam_recovery')updateBoss(b,p,dt,ctx);
  assert.equal(b.matronaState,'idle');assert.equal(b.beam,null);
 }
 // Close/middle range includes measured movement and pauses, without crossing.
 for(const gap of [50,190,400]){
  const b=createBosses()[0],p=createPlayer();resetMatrona(b);b.active=true;b.timer=100;
  p.x=b.x-gap-p.w;p.y=GROUND-p.h;let moved=0,paused=0;
  for(let i=0;i<fps*8;i++){
   const prev=b.x;updateBoss(b,p,dt,{config,platforms:world.map.platforms});
   if(prev===b.x)paused++;else moved++;
   assert.ok(b.x>=b.arena.left+16&&b.x+b.w<=b.arena.right-16);assert.ok(b.x>=p.x+p.w);
  }
  assert.ok(moved>0&&paused>0,`positioning ${gap}`);
 }
}
Math.random=originalRandom;
console.log('PASS: Setor 9 at 30/60/120 FPS: left/right melee, height, airborne damage, invulnerability, knockback, roofs, beam run/jump/dash escapes, close/mid/far movement and pauses.');
