import {updateServant} from './servant-shooter.js';
import {hurt,intersects} from './combat.js';
import {moveBody} from './physics.js';

export const SECTOR9_MELEE=Object.freeze({reach:52,windup:.22,active:.14});
export function enemyMeleeBox(e) {
 const facing=e.meleeFacing??e.facing,reach=SECTOR9_MELEE.reach;
 return {x:facing>0?e.x+e.w-4:e.x-reach,y:e.y+16,w:reach+4,h:Math.min(28,e.h-20)};
}
export function enemyAttackBox(e) {
 if(e.type==='servant_shooter')return null;
 if(e.room===0&&e.type==='patrol')return !e.dead&&!(e.hurtTimer>0)&&!(e.stunTimer>0)&&e.dashPhase==='dash'?{x:e.dashFacing>0?e.x+e.w-4:e.x-12,y:e.y+8,w:16,h:e.h-12}:null;
 return !e.dead&&!(e.hurtTimer>0)&&!(e.stunTimer>0)&&e.attackTimer>0?enemyMeleeBox(e):null;
}
export function updateSector9Enemy(e,p,dt,world) {
 if(e.type==='servant_shooter'){updateServant(e,p,dt,world);return}
 if(e.type==='patrol'){updateImplanted(e,p,dt,world);return}
 e.vx??=0;e.vy??=0;e.attackTimer=Math.max(0,(e.attackTimer||0)-dt);
 e.windupTimer=Math.max(0,(e.windupTimer||0)-dt);
 e.attackCooldown-=dt;e.animTime=(e.animTime||0)+dt;
 const dx=p.x+p.w/2-e.x-e.w/2,dist=Math.abs(dx);
 if(e.hurtTimer>0||e.stunTimer>0){
  e.windupTimer=0;e.attackTimer=0;e.meleePending=false;
  e.vx*=Math.pow(.015,dt);
 }else if(e.meleePending||e.attackTimer>0){
  e.vx=0;e.state='attack';
  if(e.meleePending&&e.windupTimer<=0){e.meleePending=false;e.attackTimer=SECTOR9_MELEE.active;e.attackHit=false}
 }else {
  if(dist<390){e.facing=Math.sign(dx)||e.facing;e.state=dist<60?'attack':'chase'}else e.state='patrol';
  if(e.state==='patrol'&&Math.abs(e.x-e.homeX)>120)e.facing=e.x>e.homeX?-1:1;
  e.vx=e.state==='attack'?0:e.facing*e.speed;
  if(e.attackCooldown<=0&&dist<110){
   e.meleeFacing=e.facing;
   if(intersects(p,enemyMeleeBox(e))){e.attackCooldown=1.25;e.windupTimer=SECTOR9_MELEE.windup;e.meleePending=true;e.vx=0;e.state='attack'}
  }
 }
 moveBody(e,dt,world.map.platforms);
 e.x=Math.max(e.room*2400+40,Math.min((e.room+1)*2400-80,e.x));
 const box=enemyAttackBox(e);
 if(box&&!e.attackHit&&intersects(p,box)&&hurt(p,e.damage,e.x+e.w/2))e.attackHit=true;
}

export const INFECTED_DASH=Object.freeze({windup:.4,active:.2,recovery:.7,cooldown:2,speed:440});
function updateImplanted(e,p,dt,world){
 if(e.dead)return;
 const platforms=world.map.platforms;
 e.vx??=0;e.vy??=0;e.attackCooldown=Math.max(0,e.attackCooldown-dt);
 e.animTime=(e.animTime||0)+dt;
 const dx=p.x+p.w/2-e.x-e.w/2;
 const supported=dir=>platforms.some(q=>!q.disabled&&e.x+e.w/2+dir*(e.w/2+8)>=q.x&&e.x+e.w/2+dir*(e.w/2+8)<=q.x+q.w&&Math.abs(q.y-e.y-e.h)<8);
 if(e.hurtTimer>0||e.stunTimer>0){e.dashPhase=null;e.dashTimer=0;e.vx*=Math.pow(.015,dt);e.state='hurt';e.attackCooldown=Math.max(e.attackCooldown,.7)}
 else if(e.dashPhase){
  // Track Kael during preparation; lock only when the dash begins.
  if(e.dashPhase==='windup')e.facing=Math.sign(dx)||e.facing;
  e.dashTimer-=dt;
  if(e.dashTimer<=0){
   if(e.dashPhase==='windup'){e.dashFacing=e.facing;e.dashPhase='dash';e.dashTimer=INFECTED_DASH.active;e.attackHit=false}
   else if(e.dashPhase==='dash'){e.dashPhase='recovery';e.dashTimer=INFECTED_DASH.recovery}
   else e.dashPhase=null;
  }
  e.state='attack';if(e.dashPhase!=='windup')e.facing=e.dashFacing;e.vx=e.dashPhase==='dash'?e.dashFacing*INFECTED_DASH.speed:0;
 }else{
  const detected=!p.dead&&Math.abs(dx)<390&&Math.abs(p.y+p.h-e.y-e.h)<70;
  if(detected)e.facing=Math.sign(dx)||e.facing;
  else if(Math.abs(e.x-e.homeX)>=120)e.facing=e.x>e.homeX?-1:1;
  e.state=detected?'chase':'patrol';e.vx=e.facing*e.speed;
  if(detected&&Math.abs(dx)<150&&e.grounded&&e.attackCooldown<=0){e.dashPhase='windup';e.dashTimer=INFECTED_DASH.windup;e.dashFacing=e.facing;e.attackCooldown=INFECTED_DASH.cooldown;e.state='attack';e.vx=0}
 }
 let blocked=false;
 if(e.grounded&&e.vx&&!supported(Math.sign(e.vx))){e.vx=0;blocked=true;if(!e.dashPhase)e.facing*=-1}
 const oldX=e.x;
 moveBody(e,dt,platforms);
 e.x=Math.max(e.room*2400+40,Math.min((e.room+1)*2400-80,e.x));
 if(!blocked&&e.x===oldX&&e.vx===0&&!e.dashPhase&&e.state!=='hurt')e.facing*=-1;
 const box=enemyAttackBox(e);
 if(box&&!e.attackHit&&intersects(p,box)){e.attackHit=true;hurt(p,e.damage,e.x+e.w/2)}
}
