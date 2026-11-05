import assert from 'node:assert/strict';
import {REGIONS,MAP_ROOMS,ROOM_W,WORLD_W,GROUND,buildMap,assetRegionAt} from '../js/map.js';
import {Engine,newState} from '../js/engine.js';
import {createBosses,updateBoss,damageBoss} from '../js/bosses.js';
import {spawnEnemies} from '../js/enemies.js';
import {normalizeSave,saveGame,loadGame} from '../js/save.js';
import {syncProgress,checkpointFor,unlockedAct} from '../js/campaign.js';
import {moveBody} from '../js/physics.js';

const map=buildMap();
assert.deepEqual(REGIONS.map(r=>r.id),['slum','factory','corporate']);
assert.equal(WORLD_W,7200);assert.equal(MAP_ROOMS.length,9);
assert.deepEqual(createBosses().map(b=>b.assetId),['matrona','warden','vespera']);
assert.ok(spawnEnemies().every(e=>e.x>=0&&e.x<WORLD_W&&e.x%ROOM_W<1690));
assert.ok(map.npcs.every(n=>n.x>=0&&n.x<WORLD_W));
assert.ok(map.terminals.every(t=>t.x>=0&&t.x<WORLD_W));
assert.ok(map.hazards.every(h=>h.x%ROOM_W<1690));
for(let i=0;i<3;i++)assert.ok(map.checkpoints.some(cp=>cp.x===checkpointFor(i).x));
assert.equal(assetRegionAt(4900),'corporate');assert.equal(assetRegionAt(6500),'virus_core');
assert.ok(!JSON.stringify(map).match(/sewers|abismo|Esgotos/));
assert.equal(buildMap(['shortcut-maintenance']).platforms.length,map.platforms.length+1);

const state=newState(),fake={state,ui:{toast(){}},gateToast:-1};
state.player.x=2500;Engine.prototype.checkGates.call(fake);assert.equal(state.player.x,ROOM_W-state.player.w);
state.bosses[0].dead=true;syncProgress(state);assert.equal(unlockedAct(state),1);assert.ok(state.abilities.dash&&state.abilities.doubleJump);
state.player.x=4900;Engine.prototype.checkGates.call(fake);assert.equal(state.player.x,ROOM_W*2-state.player.w);
state.bosses[1].dead=true;syncProgress(state);assert.equal(unlockedAct(state),2);assert.ok(state.items.includes('Credencial de Warden'));
state.player.x=4900;Engine.prototype.checkGates.call(fake);assert.equal(state.player.x,4900);
state.player.x=100;Engine.prototype.checkGates.call(fake);assert.equal(state.player.x,100);

for(const fps of [30,60,120])for(const boss of createBosses()){
 const p={x:boss.x-45,y:GROUND-54,w:30,h:54,health:100,invuln:0,attackTimer:1,state:'attack',attackFrameReady:true,externalAttackAnimation:true,combo:1,facing:1};
 assert.equal(updateBoss(boss,p,1/fps).kind,'intro');
 let sawWindup=false,sawRecovery=false,sawProjectile=false;
 for(let i=0;i<fps*10;i++){
  p.invuln=10;updateBoss(boss,p,1/fps);
  if(boss.attackType==='windup'){
   sawWindup=true;p.attackBox={...boss};const before=boss.health;
   damageBoss(boss,p);assert.equal(boss.health,before);
  }else sawRecovery=true;
  sawProjectile ||= boss.projectiles.length>0;
 }
 assert.ok(sawWindup&&sawRecovery);if(boss.assetId==='matrona')assert.equal(boss.projectiles.length,0);else assert.ok(sawProjectile);
 boss.attackType='recovery';boss.hitCooldown=0;p.attackBox={...boss};
 let strikes=0;
 while(!boss.dead){p.attackHitConsumed=false;boss.hitCooldown=0;damageBoss(boss,p);strikes++;assert.ok(strikes<20);}
 assert.ok(boss.dead&&boss.deathTimer>0&&boss.projectiles.length===0);
}

for(let oldRegion=0;oldRegion<5;oldRegion++)for(const progress of [0,1,2,3]){
 const old=newState();old.version=1;old.player.x=oldRegion*2400+200;old.player.y=736;
 old.bosses=[{id:'boss-0',dead:progress>=1},{id:'boss-1',dead:true},{id:'boss-2',dead:progress>=2},{id:'boss-3',dead:progress>=3}];
 old.checkpoint={x:oldRegion*2400+180,region:oldRegion};old.credits=123;old.items=['peça antiga'];old.abilities.hook=true;
 const next=normalizeSave(old);
 assert.equal(next.version,2);assert.equal(next.bosses.length,3);assert.equal(next.credits,123);assert.ok(next.abilities.hook&&next.items.includes('peça antiga'));
 assert.ok(next.player.x>=0&&next.player.x+next.player.w<=WORLD_W);
 assert.ok(Math.floor(next.player.x/ROOM_W)<=unlockedAct(next));
 assert.ok(map.checkpoints.some(cp=>cp.x===next.checkpoint.x));
 assert.equal(next.bosses.filter(b=>b.dead).length,progress);
 if(oldRegion===2)assert.equal(next.player.x,next.checkpoint.x);
}
const current=newState();current.events.push('shortcut-maintenance','npc-yara');current.player.x=1300;current.player.y=520;
const copy=normalizeSave(JSON.parse(JSON.stringify(current)));
assert.equal(copy.player.x,1300);assert.ok(copy.events.includes('shortcut-maintenance'));assert.equal(copy.checkpoint.x,310);
assert.equal(normalizeSave(null),null);assert.equal(normalizeSave({version:99}),null);
const memory=new Map();globalThis.localStorage={getItem:key=>memory.get(key)||null,setItem:(key,value)=>memory.set(key,value)};
memory.set('nova-aurora-save-v1',JSON.stringify({...current,version:1}));
assert.ok(saveGame(current));assert.ok(memory.has('nova-aurora-save-v1-legacy-backup'));assert.equal(loadGame().version,2);
memory.set('nova-aurora-save-v1','invalid JSON');assert.equal(loadGame(),null);assert.ok(saveGame(current));assert.ok(loadGame());
const dead={...current,player:{...current.player,dead:true,health:0}};
assert.equal(normalizeSave(dead).player.x,310);assert.equal(normalizeSave(dead).player.health,100);
const body={x:WORLD_W-20,y:736,w:30,h:54,vx:250,vy:0};moveBody(body,.03,map.platforms);assert.equal(body.x,WORLD_W-body.w);
console.log('PASS: three-map campaign, gates, arenas, three bosses at 30/60/120 FPS, shortcuts, dimensions, 20 legacy-save migrations, persistence and checkpoints.');
