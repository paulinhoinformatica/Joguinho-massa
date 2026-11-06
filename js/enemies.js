import{drawServant}from'./servant-shooter.js';
import{updateSector9Enemy}from'./sector9-enemies.js';
import{drawEnemyFallback}from'./enemy-art.js';
import{hurt,intersects}from'./combat.js';
import{REGIONS,GROUND}from'./map.js';
import{moveBody}from'./physics.js';
export const industrialAttackBox=e=>({x:e.meleeFacing>0?e.x+e.w:e.x-58,y:e.y+8,w:58,h:e.h-8});
export const ENEMY_TYPES={servant_shooter:{hp:48,damage:13,speed:48,color:'#ad4b61',kind:'robot'},patrol:{hp:42,damage:12,speed:72,color:'#c14d68',kind:'human'},shooter:{hp:35,damage:9,speed:36,color:'#e8a04a',kind:'human'},executor:{hp:90,damage:22,speed:38,color:'#925a78',kind:'human'},drone:{hp:30,damage:8,speed:92,color:'#57c9d0',kind:'robot'},maintenance:{hp:48,damage:13,speed:84,color:'#81b671',kind:'robot'},sentinel:{hp:62,damage:11,speed:0,color:'#7898ef',kind:'robot'},heavy:{hp:135,damage:24,speed:32,color:'#c66d55',kind:'robot'},infected:{hp:55,damage:16,speed:105,color:'#ae65d1',kind:'virus'}};
export function spawnEnemies(){const list=[];const add=(room,offset,type,idType=type)=>{const spec=ENEMY_TYPES[type];list.push({id:`${room}-${offset}-${idType}`,room,x:REGIONS[room].x+offset,y:730,w:type==='servant_shooter'?24:room===0&&type==='patrol'?28:type==='drone'?38:34,h:type==='servant_shooter'?57:room===0&&type==='patrol'?56:type==='drone'?30:58,health:spec.hp,maxHealth:spec.hp,damage:spec.damage,speed:room===0&&type==='patrol'?54:spec.speed,color:spec.color,kind:spec.kind,type,state:'patrol',facing:-1,homeX:REGIONS[room].x+offset,attackCooldown:1+Math.random(),hurtTimer:0,dead:false,respawn:0,projectiles:[]})};[[0,800,'patrol'],[0,1420,'servant_shooter','maintenance'],[1,600,'maintenance'],[1,1150,'executor'],[1,1480,'drone'],[2,500,'shooter'],[2,1100,'sentinel'],[2,1480,'heavy']].forEach(a=>add(...a));for(const e of list)if(e.room===1){e.x=e.homeX=e.type==='maintenance'?3070:e.type==='executor'?3770:4290;e.y=GROUND-e.h;}const servo=list.find(e=>e.type==='servant_shooter');servo.x=servo.homeX=1120;servo.patrolBounds={left:1010,right:1250};return list}
export function updateEnemies(enemies,player,dt,world){for(const e of enemies){if(e.dead||Math.abs(e.x-player.x)>1100){e.projectiles=[];e.pendingAttack=null;e.windupTimer=0;}if(Math.abs(e.x-player.x)>1100)continue;if(e.dead){e.respawn-=dt;e.deathTimer=Math.max(0,(e.deathTimer||0)-dt);if(e.respawn<=0&&e.type!=='sentinel'){e.dead=false;e.deathTimer=0;e.health=e.maxHealth;e.x=e.homeX;e.state='patrol';if(e.room>=0){e.y=790-e.h;e.vx=e.vy=e.attackTimer=e.windupTimer=e.hurtTimer=e.stunTimer=0;e.meleePending=false;e.attackHit=false;e.dashPhase=null;e.dashTimer=0;e.attackCooldown=1;e.shotTimer=e.recoil=e.lean=e.wheelAngle=0;e.detected=false;e.projectiles=[]}}continue}e.hurtTimer=Math.max(0,e.hurtTimer-dt);e.stunTimer=Math.max(0,(e.stunTimer||0)-dt);if(e.room===0){updateSector9Enemy(e,player,dt,world);continue}if(e.stunTimer>0){e.pendingAttack=null;e.windupTimer=0;continue;}e.attackCooldown-=dt;const previousX=e.x,dx=player.x-e.x,dist=Math.abs(dx);if(dist<390)e.state=dist<60?'attack':'chase';else e.state='patrol';if(e.pendingAttack){e.state='attack';}else if(e.state==='patrol'){e.x+=e.facing*e.speed*dt;if(Math.abs(e.x-e.homeX)>120)e.facing*=-1}else if(e.state==='chase'){e.facing=Math.sign(dx)||e.facing;e.x+=e.facing*e.speed*dt}
  if(e.room===1){
   e.meleeFacing??=e.facing;
   if(e.pendingAttack){e.windupTimer-=dt;if(e.windupTimer<=0){if(e.pendingAttack==='shot')e.projectiles.push({x:e.x+e.w/2,y:e.y+16,vx:e.meleeFacing*280,life:2,damage:e.damage,color:'#ffbd66'});else if(intersects(player,industrialAttackBox(e)))hurt(player,e.damage,e.x,{source:'enemy_melee',entity:e.id,x:e.x,y:e.y});e.pendingAttack=null;}}
   else if(e.attackCooldown<=0&&dist<(e.type==='drone'?360:95)&&Math.abs(player.y-e.y)<90){e.meleeFacing=Math.sign(dx)||e.facing;e.pendingAttack=e.type==='drone'?'shot':'melee';e.windupTimer=.5;e.attackCooldown=1.8;}
  }else if(e.attackCooldown<=0&&dist<420){e.attackCooldown=e.type==='executor'||e.type==='heavy'?2.1:1.25;if(e.type==='shooter'||e.type==='sentinel'||e.type==='drone'){e.projectiles.push({x:e.x+e.w/2,y:e.y+24,vx:Math.sign(dx||1)*330,life:2,damage:e.damage,color:e.color})}else if(dist<90)hurt(player,e.damage,e.x+e.w/2)}
  for(const b of e.projectiles){b.x+=b.vx*dt;b.life-=dt;if(b.life>0&&player.x<b.x+12&&player.x+player.w>b.x&&player.y<b.y+12&&player.y+player.h>b.y){hurt(player,b.damage,b.x,{source:'projectile',entity:e.id,x:b.x,y:b.y});b.life=0;}}e.projectiles=e.projectiles.filter(b=>b.life>0)
  if(e.room===1&&e.type!=='drone'){e.vx=(e.x-previousX)/dt;e.x=previousX;e.vy=e.vy||0;moveBody(e,dt,world.map.platforms)}e.x=Math.max(REGIONS[e.room].x+40,Math.min(REGIONS[e.room].x+REGIONS[e.room].width-80,e.x));if(e.room!==1&&e.y+e.h<790&&e.type!=='drone')e.y=Math.min(790-e.h,e.y+900*dt)
 }}
export function renderEnemy(c,e,camera,spriteRenderer,dt=0){
 const implanted=e.room===0&&e.type==='patrol';
 const servant=e.type==='servant_shooter';
 const id=servant?'servant_shooter':implanted?'implanted_infected':e.type==='drone'?'infected_drone':e.kind==='human'?'cyborg_soldier':'infected_robot';
 if(e.dead&&!(e.deathTimer>0&&spriteRenderer?.available(id,'death')))return;
 const x=Math.round(e.x-camera.x),y=Math.round(e.y-camera.y);
 const anim=implanted?(e.dead?'death':!e.dashPhase&&Math.abs(e.vx||0)>1?'walk':'idle'):e.dead?'death':e.hurtTimer>0?'damage':e.state==='attack'?'attack':e.state==='chase'||e.state==='patrol'?'run':'idle';
 const chosen=spriteRenderer?.available(id,anim)?anim:implanted&&spriteRenderer?.available(id,'walk')?'walk':'idle';
 const drawn=servant?drawServant(c,e,camera,spriteRenderer,dt):spriteRenderer?.available(id,chosen)&&spriteRenderer.draw(c,id,chosen,e,dt,{x:e.x+e.w/2,y:e.y+e.h,frameOverride:implanted&&chosen==='walk'&&anim!=='walk'?0:null});
 if(!drawn&&!e.dead)drawEnemyFallback(c,e,x,y);
 if(e.dead)return;
 if(implanted&&e.dashPhase==='windup'){c.fillStyle='#ff234b88';c.fillRect(x-3,y-4,e.w+6,4)}
 if(implanted&&e.dashPhase==='dash'){c.fillStyle='#ff234b66';c.fillRect(e.facing>0?x-32:x+e.w,y+10,32,e.h-14)}
 if(e.hurtTimer>0&&(!drawn||implanted||servant)){c.save();c.globalAlpha=.2;c.fillStyle='#fff2d7';c.fillRect(x,y,e.w,e.h);c.restore()}
 c.fillStyle='#111820';c.fillRect(x,y-7,e.w,3);c.fillStyle='#ed5670';c.fillRect(x,y-7,e.w*e.health/e.maxHealth,3);
 if(e.room===1&&e.pendingAttack){c.save();c.fillStyle='#ff5a6666';if(e.pendingAttack==='melee'){const b=industrialAttackBox(e);c.fillRect(b.x-camera.x,b.y-camera.y,b.w,b.h)}c.fillStyle='#ffe6a0';c.font='11px monospace';c.fillText(e.pendingAttack==='shot'?'! DISPARO':'! GOLPE',x-10,y-18);c.restore()}
 for(const b of e.projectiles){c.save();c.shadowColor=b.color;c.shadowBlur=9;c.fillStyle=b.color;c.fillRect(Math.round(b.x-camera.x),Math.round(b.y-camera.y),12,12);c.fillStyle='#fff5d8';c.fillRect(b.x-camera.x+3,b.y-camera.y+3,6,6);c.restore()}
}
