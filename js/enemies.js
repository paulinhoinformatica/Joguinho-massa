import{updateSector9Enemy}from'./sector9-enemies.js';
import{drawEnemyFallback}from'./enemy-art.js';
import{hurt}from'./combat.js';
export const ENEMY_TYPES={patrol:{hp:42,damage:12,speed:72,color:'#c14d68',kind:'human'},shooter:{hp:35,damage:9,speed:36,color:'#e8a04a',kind:'human'},executor:{hp:90,damage:22,speed:38,color:'#925a78',kind:'human'},drone:{hp:30,damage:8,speed:92,color:'#57c9d0',kind:'robot'},maintenance:{hp:48,damage:13,speed:84,color:'#81b671',kind:'robot'},sentinel:{hp:62,damage:11,speed:0,color:'#7898ef',kind:'robot'},heavy:{hp:135,damage:24,speed:32,color:'#c66d55',kind:'robot'},infected:{hp:55,damage:16,speed:105,color:'#ae65d1',kind:'virus'}};
export function spawnEnemies(){const list=[];const add=(room,offset,type)=>{const spec=ENEMY_TYPES[type];list.push({id:`${room}-${offset}-${type}`,room,x:room*2400+offset,y:730,w:room===0&&type==='patrol'?28:type==='drone'?38:34,h:room===0&&type==='patrol'?56:type==='drone'?30:58,health:spec.hp,maxHealth:spec.hp,damage:spec.damage,speed:room===0&&type==='patrol'?54:spec.speed,color:spec.color,kind:spec.kind,type,state:'patrol',facing:-1,homeX:room*2400+offset,attackCooldown:1+Math.random(),hurtTimer:0,dead:false,respawn:0,projectiles:[]})};[[0,800,'patrol'],[0,1420,'maintenance'],[1,600,'maintenance'],[1,1150,'executor'],[1,1480,'drone'],[2,500,'shooter'],[2,1100,'sentinel'],[2,1480,'heavy']].forEach(a=>add(...a));return list}
export function updateEnemies(enemies,player,dt,world){for(const e of enemies){if(Math.abs(e.x-player.x)>1100)continue;if(e.dead){e.respawn-=dt;e.deathTimer=Math.max(0,(e.deathTimer||0)-dt);if(e.respawn<=0&&e.type!=='sentinel'){e.dead=false;e.deathTimer=0;e.health=e.maxHealth;e.x=e.homeX;e.state='patrol';if(e.room===0){e.y=790-e.h;e.vx=e.vy=e.attackTimer=e.windupTimer=e.hurtTimer=e.stunTimer=0;e.meleePending=false;e.attackHit=false;e.dashPhase=null;e.dashTimer=0;e.attackCooldown=1;e.projectiles=[]}}continue}e.hurtTimer=Math.max(0,e.hurtTimer-dt);e.stunTimer=Math.max(0,(e.stunTimer||0)-dt);if(e.room===0){updateSector9Enemy(e,player,dt,world);continue}if(e.stunTimer>0)continue;e.attackCooldown-=dt;const dx=player.x-e.x,dist=Math.abs(dx);if(dist<390)e.state=dist<60?'attack':'chase';else e.state='patrol';if(e.state==='patrol'){e.x+=e.facing*e.speed*dt;if(Math.abs(e.x-e.homeX)>120)e.facing*=-1}else if(e.state==='chase'){e.facing=Math.sign(dx)||e.facing;e.x+=e.facing*e.speed*dt}
  if(e.attackCooldown<=0&&dist<420){e.attackCooldown=e.type==='executor'||e.type==='heavy'?2.1:1.25;if(e.type==='shooter'||e.type==='sentinel'||e.type==='drone'){e.projectiles.push({x:e.x+e.w/2,y:e.y+24,vx:Math.sign(dx||1)*330,life:2,damage:e.damage,color:e.color})}else if(dist<90)hurt(player,e.damage,e.x+e.w/2)}
  for(const b of e.projectiles){b.x+=b.vx*dt;b.life-=dt;if(b.life>0&&player.x<b.x+12&&player.x+player.w>b.x&&player.y<b.y+12&&player.y+player.h>b.y)hurt(player,b.damage,e.x)}e.projectiles=e.projectiles.filter(b=>b.life>0)
  e.x=Math.max(e.room*2400+40,Math.min((e.room+1)*2400-80,e.x));if(e.y+e.h<790&&e.type!=='drone')e.y=Math.min(790-e.h,e.y+900*dt)
 }}
export function renderEnemy(c,e,camera,spriteRenderer,dt=0){
 const implanted=e.room===0&&e.type==='patrol';
 const id=implanted?'implanted_infected':e.type==='drone'?'infected_drone':e.kind==='human'?'cyborg_soldier':'infected_robot';
 if(e.dead&&!(e.deathTimer>0&&spriteRenderer?.available(id,'death')))return;
 const x=Math.round(e.x-camera.x),y=Math.round(e.y-camera.y);
 const anim=implanted?(e.dead?'death':!e.dashPhase&&Math.abs(e.vx||0)>1?'walk':'idle'):e.dead?'death':e.hurtTimer>0?'damage':e.state==='attack'?'attack':e.state==='chase'||e.state==='patrol'?'run':'idle';
 const chosen=spriteRenderer?.available(id,anim)?anim:implanted&&spriteRenderer?.available(id,'walk')?'walk':'idle';
 const drawn=spriteRenderer?.available(id,chosen)&&spriteRenderer.draw(c,id,chosen,e,dt,{x:e.x+e.w/2,y:e.y+e.h,frameOverride:implanted&&chosen==='walk'&&anim!=='walk'?0:null});
 if(!drawn&&!e.dead)drawEnemyFallback(c,e,x,y);
 if(e.dead)return;
 if(implanted&&e.dashPhase==='windup'){c.fillStyle='#ff234b88';c.fillRect(x-3,y-4,e.w+6,4)}
 if(implanted&&e.dashPhase==='dash'){c.fillStyle='#ff234b66';c.fillRect(e.facing>0?x-32:x+e.w,y+10,32,e.h-14)}
 if(e.hurtTimer>0&&(!drawn||implanted)){c.save();c.globalAlpha=.2;c.fillStyle='#fff2d7';c.fillRect(x,y,e.w,e.h);c.restore()}
 c.fillStyle='#111820';c.fillRect(x,y-7,e.w,3);c.fillStyle='#ed5670';c.fillRect(x,y-7,e.w*e.health/e.maxHealth,3);
 for(const b of e.projectiles){c.fillStyle=b.color;c.fillRect(Math.round(b.x-camera.x),Math.round(b.y-camera.y),10,7)}
}
