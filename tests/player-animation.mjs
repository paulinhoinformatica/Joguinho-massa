import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createPlayer, updatePlayer} from '../js/player.js';
import {AnimationManager} from '../js/engine/animationManager.js';
import {SpriteRenderer} from '../js/engine/spriteRenderer.js';

const cfg=JSON.parse(readFileSync(new URL('../assets/characters/protagonist/config.json',import.meta.url)));
const platforms=[{x:0,y:790,w:2000,h:100}];
const input={left:false,right:false,jump:false,platforms};
function step(p,keys={},dt=1/60){return updatePlayer(p,{...input,...keys},dt,{dash:true});}
function falling(vx=0){return {...createPlayer(),y:735.5,vy:100,vx,grounded:false,state:'fall'};}

for(const fps of [30,60,120]){
 const dt=1/fps;
 for(const [vx,state] of [[60,'walk'],[250,'run'],[-60,'walk'],[-250,'run']]){
  const p=falling(vx);
  step(p,{right:vx>0,left:vx<0},dt);
  assert.equal(p.grounded,true);
  assert.equal(p.state,state,`immediate ${state} at ${fps} fps`);
  assert.equal(p.landingTimer,0);
 }
 const p=falling();step(p,{},dt);
 assert.equal(p.state,'landing');assert.equal(p.landingTimer,.25);
 let elapsed=0;
 while(p.state==='landing'&&elapsed<.4){step(p,{},dt);elapsed+=dt;}
 assert.equal(p.state,'idle');assert.ok(elapsed>=.25-1e-9&&elapsed<=.25+dt+1e-9);
 const moving=falling();step(moving,{},dt);
 do{step(moving,{right:true},dt);}while(Math.abs(moving.vx)<=25);
 assert.equal(moving.state,'walk');assert.equal(moving.landingTimer,0);

 // Full jump with movement released in the air must settle into idle.
 const jumping={...createPlayer(),y:736,grounded:true,vx:250};
 step(jumping,{jump:true,right:true},dt);assert.equal(jumping.state,'jump');
 let sawFall=false,sawGround=false;
 for(let i=0;i<fps*2;i++){
  step(jumping,{},dt);sawFall ||= jumping.state==='fall';sawGround ||= jumping.grounded;
  if(jumping.grounded&&Math.abs(jumping.vx)>25)assert.ok(['walk','run'].includes(jumping.state));
 }
 assert.ok(sawFall&&sawGround);assert.equal(jumping.state,'idle');
 const still={...createPlayer(),y:736,grounded:true};
 step(still,{jump:true},dt);let sawLanding=false;
 for(let i=0;i<fps*2;i++){step(still,{},dt);sawLanding ||= still.state==='landing';}
 assert.ok(sawLanding);assert.equal(still.state,'idle');
}

// Collision resolution must not leave a locomotion pose against a solid wall.
const wall=falling(250);wall.x=100;wall.y=736;wall.grounded=true;
step(wall,{right:true,platforms:[...platforms,{x:131,y:650,w:100,h:140}]});
assert.equal(wall.vx,0);assert.equal(wall.state,'idle');
for(const [timer,state] of [['attackTimer','attack'],['damageTimer','damage'],['specialAnimTimer','special'],['dashTimer','dash']]){
 const p=falling();p[timer]=.2;step(p);assert.equal(p.state,state);
}

// Exercise the real renderer/manager together with the current definitions.
const manager=new AnimationManager();
const assets={getConfig:()=>cfg,get:()=>({naturalWidth:1160,naturalHeight:114})};
const renderer=new SpriteRenderer(assets,manager);
const ctx={save(){},restore(){},translate(){},scale(){},drawImage(){}};
const p=falling(60);step(p,{right:true});
renderer.draw(ctx,'protagonist',p.state,p,0);
const instance=manager.instances.get(p);
for(let i=0;i<7;i++)renderer.draw(ctx,'protagonist','walk',p,1/60);
assert.equal(manager.instances.get(p),instance);
assert.equal(instance.index,1);assert.ok(instance.time>0);
renderer.draw(ctx,'protagonist','run',p,.15);
assert.equal(manager.instances.get(p).index,2);
const events=[];const attackTarget={};
for(let i=0;i<40;i++)manager.play(attackTarget,'melee',cfg.animations.melee,1/60,name=>events.push(name));
assert.deepEqual(events,['hit']);
console.log('PASS: landing, walk/run, jump/fall/idle, collisions, priorities, animation continuity and hit event (30/60/120 fps).');
