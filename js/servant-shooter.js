import {hurt,intersects} from './combat.js';
import {moveBody} from './physics.js';

export const SERVANT_SHOT=Object.freeze({range:390,windup:.35,cooldown:1.8,speed:330});
export function servantMuzzle(e){return {x:e.x+e.w/2+e.facing*18,y:e.y+e.h-38.5}}

export function updateServant(e,p,dt,world){
 if(e.dead){e.projectiles=[];return}
 const platforms=world.map.platforms;
 e.vx??=0;e.vy??=0;e.animTime=(e.animTime||0)+dt;
 e.attackCooldown=Math.max(0,e.attackCooldown-dt);
 e.recoil=Math.max(0,(e.recoil||0)-dt);
 const dx=p.x+p.w/2-e.x-e.w/2;
 const muzzle=servantMuzzle(e),left=Math.min(muzzle.x,p.x+p.w/2),right=Math.max(muzzle.x,p.x+p.w/2);
 const occluded=platforms.some(q=>q.h>=70&&q.x<right&&q.x+q.w>left&&muzzle.y>q.y&&muzzle.y<q.y+q.h);
 e.detected=!p.dead&&Math.abs(dx)<SERVANT_SHOT.range&&Math.abs(p.y+p.h/2-muzzle.y)<60&&!occluded;
 const previousSpeed=e.vx;
 if(e.hurtTimer>0||e.stunTimer>0){e.shotTimer=0;e.state='hurt';e.vx*=Math.exp(-12*dt);e.attackCooldown=Math.max(e.attackCooldown,.6)}
 else if(e.shotTimer>0){
  e.state='attack';e.vx=0;e.shotTimer=Math.max(0,e.shotTimer-dt);
  if(e.shotTimer===0){
   if(e.detected){const m=servantMuzzle(e);e.projectiles.push({...m,vx:e.facing*SERVANT_SHOT.speed,life:2,damage:e.damage,color:'#ff5264'});e.recoil=.12}
   e.attackCooldown=SERVANT_SHOT.cooldown;
  }
 }else{
  if(e.detected)e.facing=Math.sign(dx)||e.facing;
  else if(Math.abs(e.x-e.homeX)>=120)e.facing=e.x>e.homeX?-1:1;
  e.state=e.detected?(Math.abs(dx)>270?'chase':'idle'):'patrol';
  e.vx=e.state==='idle'?0:e.facing*e.speed;
  if(e.detected&&e.attackCooldown<=0){e.state='attack';e.shotTimer=SERVANT_SHOT.windup;e.vx=0}
 }
 const support=dir=>platforms.some(q=>!q.disabled&&e.x+e.w/2+dir*(e.w/2+6)>=q.x&&e.x+e.w/2+dir*(e.w/2+6)<=q.x+q.w&&Math.abs(q.y-e.y-e.h)<8);
 if(e.grounded&&e.vx&&!support(Math.sign(e.vx))){e.vx=0;if(!e.detected)e.facing*=-1}
 const oldX=e.x,attempt=e.vx;
 moveBody(e,dt,platforms);
 e.x=Math.max(e.patrolBounds?.left??40,Math.min(e.patrolBounds?.right??(2400-40-e.w),e.x));
 if(attempt&&e.x===oldX&&!e.detected)e.facing*=-1;
 const travel=e.x-oldX;
 e.wheelAngle=(e.wheelAngle||0)+travel/6;
 const targetLean=Math.max(-.035,Math.min(.035,(e.vx-previousSpeed)*.0005));
 e.lean=(e.lean||0)+(targetLean-(e.lean||0))*(1-Math.exp(-10*dt));
 // Same projectile records and damage rules as existing shooters. Small steps
 // prevent fast bullets from skipping Kael or solid walls at low frame rates.
 for(const b of e.projectiles){
  b.life-=dt;const steps=Math.max(1,Math.ceil(Math.abs(b.vx*dt)/6));
  for(let i=0;i<steps&&b.life>0;i++){
   b.x+=b.vx*dt/steps;
   const box={x:b.x,y:b.y,w:12,h:12};
   if(platforms.some(q=>q.h>=70&&intersects(box,q)))b.life=0;
   else if(intersects(box,p)){hurt(p,b.damage,e.x+e.w/2);b.life=0}
  }
 }
 e.projectiles=e.projectiles.filter(b=>b.life>0);
}

// Decorates the existing SpriteRenderer; the original PNG stays intact.
export function drawServant(c,e,camera,renderer,dt){
 if(!renderer?.available('servant_shooter','idle'))return false;
 const cfg=renderer.assets.getConfig('servant_shooter'),fx=cfg.procedural;
 const t=e.animTime||0,moving=Math.abs(e.vx||0)>1;
 const bob=Math.round(Math.sin(t*5)*.3*2)/2;
 c.save();c.translate(Math.round(e.x+e.w/2-camera.x),Math.round(e.y+e.h-camera.y));
 c.rotate(e.lean||0);
 const recoil=(e.recoil||0)/.12;
 renderer.draw(c,'servant_shooter','idle',e,dt,{x:-e.facing*recoil,y:bob});
 c.save();c.scale(e.facing,1);c.translate(-recoil,bob);c.scale(cfg.scale,cfg.scale);c.translate(-cfg.origin.x,-cfg.origin.y);
 const pulse=.3+.15*Math.sin(t*2.5)+(e.detected?.35:0);
 c.fillStyle='rgba(255,35,65,'+pulse+')';c.fillRect(fx.eye.x-2,fx.eye.y-1,4,2);
 if(moving){
  c.save();c.translate(fx.wheel.x,fx.wheel.y);c.rotate((e.wheelAngle||0)*e.facing);
  c.strokeStyle='#7e555b';c.globalAlpha=.55;c.lineWidth=1;
  for(let i=0;i<3;i++){c.rotate(Math.PI*2/3);c.beginPath();c.moveTo(2,0);c.lineTo(fx.wheel.radius,0);c.stroke()}
  c.restore();
 }
 if(Math.floor(t*5)%29===0){c.fillStyle='#ba3c53';c.fillRect(54,62,1,2)}
 if(e.shotTimer>0){c.fillStyle='#ff365c';c.fillRect(fx.muzzle.x-2,fx.muzzle.y,2,2)}
 if(e.recoil>0){c.fillStyle='#ffd0a3';c.fillRect(fx.muzzle.x,fx.muzzle.y-1,5,3)}
 c.restore();c.restore();return true;
}
