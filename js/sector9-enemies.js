import {hurt,intersects} from './combat.js';
import {moveBody} from './physics.js';

export const SECTOR9_MELEE=Object.freeze({reach:52,windup:.22,active:.14});
export function enemyMeleeBox(e) {
 const facing=e.meleeFacing??e.facing,reach=SECTOR9_MELEE.reach;
 return {x:facing>0?e.x+e.w-4:e.x-reach,y:e.y+16,w:reach+4,h:Math.min(28,e.h-20)};
}
export function enemyAttackBox(e) {
 return !e.dead&&!(e.hurtTimer>0)&&!(e.stunTimer>0)&&e.attackTimer>0?enemyMeleeBox(e):null;
}
export function updateSector9Enemy(e,p,dt,world) {
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
