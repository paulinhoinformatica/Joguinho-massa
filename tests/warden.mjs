import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createBosses,updateBoss,damageBoss} from '../js/bosses.js';
import {resetWarden,clearWarden,wardenAnimation,wardenFrame,wardenHurtbox,wardenCore} from '../js/warden.js';
import {buildMap,GROUND,REGIONS} from '../js/map.js';
import {normalizeSave} from '../js/save.js';
import {newState,Engine} from '../js/engine.js';
import {Camera} from '../js/camera.js';
const platforms=buildMap().platforms,context={platforms};
const config=JSON.parse(readFileSync(new URL('../assets/bosses/warden/config.json',import.meta.url)));
for(const [key,a] of Object.entries(config.animations)){
 const png=readFileSync(new URL('../'+a.sheet,import.meta.url));
 assert.equal(png.readUInt32BE(16),a.frameWidth*a.columns,key);assert.equal(png.readUInt32BE(20),a.frameHeight,key);
 assert.equal(a.count,key.endsWith('walk')?8:key.endsWith('slam')?6:1);
}
for(const fps of [30,60,120]){
 const dt=1/fps,b=createBosses()[1],p={x:b.x-200,y:GROUND-54,w:30,h:54,health:100,invuln:0};
 assert.equal(b.arena.right,REGIONS[1].x+REGIONS[1].width-40);
 assert.equal(updateBoss(b,p,dt,context).kind,'intro');updateBoss(b,p,dt,context);
 assert.ok(b.x<b.arena.spawnX);assert.equal(wardenAnimation(b),'phase1_walk');
 for(const phase of [1,2])for(const attack of ['charge','slam','discharge']){
  resetWarden(b);b.active=true;b.phase=phase;b.transformed=phase===2;b.x=b.arena.spawnX;b.facing=-1;
  Object.assign(b,{wardenState:'windup',pattern:attack,timer:.8,stateTime:0,attackType:'windup'});
  p.health=100;p.invuln=0;p.dead=false;p.x=b.x-45;p.y=GROUND-54;
  for(let i=0;i<Math.floor(.6*fps);i++)updateBoss(b,p,dt,context);
  assert.equal(p.health,100,attack+' telegraph');const old=b.x;
  while(b.wardenState==='windup')updateBoss(b,p,dt,context);
  if(attack==='slam'){assert.equal(b.waves.length,2);assert.equal(b.waves[0].h,phase===2?40:22);assert.equal(wardenFrame(b),phase===2?4:3);}
  for(let i=0;i<Math.ceil(.4*fps);i++)updateBoss(b,p,dt,context);
  assert.ok(p.health<100,attack+' damage');const hp=p.health;p.invuln=0;
  for(let i=0;i<Math.ceil(.1*fps);i++)updateBoss(b,p,dt,context);
  assert.equal(p.health,hp,attack+' no repeated hit');
  if(attack!=='charge')assert.equal(b.x,old,'stationary attack');
  for(let i=0;i<fps*3;i++){p.invuln=99;updateBoss(b,p,dt,context);}
  assert.ok(b.x>=b.arena.left&&b.x+b.w<=b.arena.right);
 }
 // Jump and dash invulnerability avoid all low charge/hammer/wave areas.
 for(const dodge of ['jump','dash']){
  resetWarden(b);b.x=b.arena.spawnX;b.facing=-1;b.wardenState='charge';b.timer=.6;
  Object.assign(p,{x:b.x-50,y:GROUND-54-(dodge==='jump'?100:0),health:100,invuln:dodge==='dash'?1:0});
  for(let i=0;i<fps*.4;i++)updateBoss(b,p,dt,context);assert.equal(p.health,100,dodge);
 }
 resetWarden(b);b.health=120;b.waves=[{life:1}];b.offense=[{}];updateBoss(b,p,dt,context);
 assert.equal(b.wardenState,'transition');assert.equal(b.waves.length,0);assert.equal(b.offense.length,0);
 for(let i=0;i<fps*2;i++)updateBoss(b,p,dt,context);
 assert.equal(b.phase,2);assert.equal(b.transformed,true);assert.ok(wardenAnimation(b).startsWith('phase2_'));
 b.health=110;updateBoss(b,p,dt,context);assert.notEqual(b.wardenState,'transition');
 b.wardenState='recovery';b.timer=1;b.hitCooldown=0;b.health=20;
 Object.assign(p,{attackTimer:1,state:'attack',attackHitConsumed:false,combo:1,attackBox:wardenHurtbox(b)});
 assert.equal(damageBoss(b,p),true);assert.equal(b.dead,true);assert.equal(b.waves.length,0);assert.equal(b.offense.length,0);
 clearWarden(b);assert.equal(b.wardenState,'death');
 // A wall collision gives a long punish window and clears the charge box.
 const wall=createBosses()[1];wall.active=true;resetWarden(wall);wall.x=wall.arena.left+13;wall.facing=-1;wall.wardenState='charge';wall.timer=.6;
 updateBoss(wall,p,dt,context);assert.equal(wall.wardenState,'recovery');assert.ok(wall.timer>=1.3);assert.equal(wall.offense.length,0);
 const solid={x:wall.x-90,y:GROUND-100,w:40,h:100};
 wall.wardenState='windup';wall.attackType='windup';wall.pattern='discharge';wall.timer=0;
 updateBoss(wall,p,dt,{platforms:[...platforms,solid]});assert.ok(wall.offense[0].x>=solid.x+solid.w);
 // In recovery there are no active damage sources; the slam waits for waves.
 resetWarden(wall);wall.wardenState='windup';wall.pattern='slam';wall.timer=0;wall.facing=1;wall.x=wall.arena.left+100;
 while(wall.wardenState!=='recovery')updateBoss(wall,p,dt,context);
 assert.equal(wall.waves.length,0);assert.equal(wall.offense.length,0);
 wall.phase=2;wall.wardenState='idle';wall.pattern=null;wall.facing=-1;const left=wardenCore(wall,config);wall.facing=1;const right=wardenCore(wall,config);
 assert.ok(Math.abs(left.x+right.x-2*(wall.x+wall.w/2))<1);assert.equal(left.y,right.y);
 wall.pattern='slam';wall.wardenState='slam';wall.stateTime=0;assert.ok(wardenCore(wall,config).y>right.y+10);
}
const old=newState();old.factoryLayout=1;old.bosses[1].phase=2;old.bosses[1].transformed=true;
const restored=normalizeSave(old);assert.equal(restored.bosses[1].phase,1);assert.equal(restored.bosses[1].arena.right,5160);
const won=newState();won.bosses[1].dead=true;assert.equal(normalizeSave(won).bosses[1].dead,true);
const camera=new Camera();camera.arena=createBosses()[1].arena;camera.update({x:5000,y:736,w:30,h:54},960,540,7600,900,1);assert.ok(camera.x<camera.arena.left);
console.log('PASS: Warden six PNG grids; movement, all attacks and both phases at 30/60/120 FPS; damage, telegraphs, jump/dash, unique transition, death cleanup, old saves, victory persistence, arena camera.');
