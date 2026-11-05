import{hurt,intersects}from'./combat.js';
import{ROOM_W,GROUND}from'./map.js';
import{updateMatrona,clearMatrona,matronaAnimation,matronaFrame,renderMatronaEffects}from'./matrona.js';
export const BOSS_DATA=[
 {id:'boss-0',assetId:'matrona',room:0,name:'MATRONA Â· VIGILÃ‚NCIA DO SETOR 9',title:'Matrona',ability:'dash',hp:180,color:'#e26b68',intro:'Unidade Matrona: o Setor 9 estÃ¡ isolado. Nenhum registro da Aurora Dynamics deixarÃ¡ esta regiÃ£o.'},
 {id:'boss-2',assetId:'warden',room:1,name:'WARDEN Â· SEGURANÃ‡A INDUSTRIAL',title:'Warden',ability:'emp',hp:240,color:'#9984ff',intro:'Warden: os dispositivos continuarÃ£o saindo. Sua investigaÃ§Ã£o termina antes da Torre Aurora.'},
 {id:'boss-3',assetId:'vespera',room:2,name:'VÃ‰SPERA Â· DIRETORA DO PROJETO',title:'VÃ©spera',ability:null,hp:320,color:'#ff4f93',intro:'VÃ©spera: a cidade chama caos de liberdade. Minha rede acabarÃ¡ com seus conflitos. A epidemia foi apenas o primeiro teste.'}
];
export function createBosses(){return BOSS_DATA.map(d=>({...d,x:d.room*ROOM_W+2070,y:GROUND-132,w:74,h:132,health:d.hp,maxHealth:d.hp,arena:{left:d.room*ROOM_W+1690,right:d.room*ROOM_W+2360},active:false,dead:false,phase:1,timer:.8,warning:0,attackType:'recovery',hitCooldown:0,projectiles:[]}))}
export function updateBoss(b,p,dt,context={}){
 if(b.dead)return null;
 const inside=p.x+p.w>b.arena.left&&p.x<b.arena.right;
 if(!b.active&&inside){b.active=true;b.timer=1;b.attackType='recovery';return{kind:'intro',boss:b}}
 if(!b.active)return null;
 if(b.assetId==='matrona'){updateMatrona(b,p,dt,context);return null}
 if(b.attackType!=='windup')b.facing=p.x>b.x?1:-1;
 b.hitCooldown=Math.max(0,b.hitCooldown-dt);b.timer-=dt;
 b.phase=b.health<b.maxHealth*.5?2:1;
 if(b.attackType==='windup'){
  b.warning=Math.max(0,b.warning-dt);
  if(b.warning<=0){
   if(b.pattern==='sweep'){
    const box={x:b.facing>0?b.x+b.w:b.x-150,y:GROUND-65,w:150,h:65};
    if(intersects(p,box))hurt(p,12+b.room*3,b.x+b.w/2);
   }else{
    const count=b.room===2?3:1;
    for(let i=0;i<count;i++)b.projectiles.push({x:b.x+b.w/2,y:GROUND-45-i*30,vx:b.facing*(210+b.room*25),vy:0,life:2.5,damage:10+b.room*2,color:b.color});
   }
   b.attackType='recovery';b.timer=b.phase===1?1.35:1.05;b.warning=0;
  }
 }else if(b.timer<=0){
  b.turn=(b.turn||0)+1;
  b.pattern=b.room===0?(b.turn%3===0?'burst':'sweep'):(b.turn%2?'burst':'sweep');
  b.attackType='windup';b.warning=.8-b.room*.08;b.timer=b.warning;
 }
 for(const bolt of b.projectiles){bolt.x+=bolt.vx*dt;bolt.y+=bolt.vy*dt;bolt.life-=dt;if(bolt.life>0&&intersects(p,{x:bolt.x,y:bolt.y,w:17,h:12})){hurt(p,bolt.damage,b.x);bolt.life=0}}
 b.projectiles=b.projectiles.filter(x=>x.life>0);
 return null;
}
export function damageBoss(b,player){if(!b?.active||b.dead||player.attackTimer<=0||player.state!=='attack'||player.attackHitConsumed||b.attackType==='windup'||b.hitCooldown>0||(player.externalAttackAnimation&&!player.attackFrameReady))return false;if(!intersects(player.attackBox,b))return false;b.health=Math.max(0,b.health-(player.overloadTimer>0?38:20+player.combo*3));b.hitCooldown=.16;player.attackHitConsumed=true;if(!b.health){b.dead=true;b.deathTimer=.9;b.projectiles=[];if(b.assetId==='matrona')clearMatrona(b);return true}return false}
export function renderBoss(c,b,camera,spriteRenderer,dt=0){
 if(!b.active||(b.dead&&!(b.deathTimer>0)))return;
 const x=Math.round(b.x-camera.x),y=Math.round(b.y-camera.y),id=b.assetId||'matrona';
 const anim=b.dead?'death':id==='matrona'?matronaAnimation(b):b.warning>0?'attack':b.hitCooldown>0?'damage':'idle';
 const fallback=spriteRenderer?.assets?.getConfig(id)?.fallbackAnimation;
 const useFallback=!spriteRenderer?.available(id,anim)&&fallback&&spriteRenderer.available(id,fallback);
 const chosen=useFallback?fallback:anim;
 // Keep the existing defeat fade while a static sprite stands in for death.
 if(useFallback&&b.dead){c.save();c.globalAlpha*=Math.max(0,Math.min(1,b.deathTimer/.9))}
 if(id==='matrona'&&b.renderAttackSerial!==b.attackSerial){spriteRenderer?.animations?.reset(b);b.renderAttackSerial=b.attackSerial}
 const animationDt=id==='matrona'&&['beam_lock','beam_fire','quarantine_warning','quarantine_strike'].includes(b.matronaState)?0:dt;
 const blend=id==='matrona'&&b.matronaState?.endsWith('recovery')?Math.min(1,Math.max(0,(b.stateTime-.28)/.22)):0;
 if(blend){c.save();c.globalAlpha*=1-blend}
 const drawn=spriteRenderer?.available(id,chosen)&&spriteRenderer.draw(c,id,chosen,b,animationDt,{x:b.x+b.w/2,y:b.y+b.h,facing:id==='matrona'&&chosen==='walk'?(b.walkFacing??b.facing):b.facing,frameOverride:id==='matrona'&&chosen===anim?matronaFrame(b,spriteRenderer?.assets?.getConfig(id)?.animations?.[chosen]):null});
 if(blend){c.restore();c.save();c.globalAlpha*=blend;b.idleBlendTarget??={};b.idleBlendTarget.facing=b.facing;spriteRenderer?.draw(c,id,'idle',b.idleBlendTarget,0,{x:b.x+b.w/2,y:b.y+b.h});c.restore()}
 if(useFallback&&b.dead)c.restore();
 if(!drawn){
  c.save();if(b.dead)c.globalAlpha=b.deathTimer/.9;
  c.fillStyle='#100d17';c.fillRect(x+8,y+13,b.w-16,b.h-13);
  c.fillStyle=b.color;c.fillRect(x+4,y+34,b.w-8,b.h-43);
  c.fillStyle='#26333d';c.fillRect(x+12,y+8,b.w-24,38);
  c.fillStyle=b.warning>0?'#fff1c4':'#ff547e';c.fillRect(x+25,y+23,25,8);
  c.fillStyle='#4e5b66';c.fillRect(x-5,y+65,18,10);c.fillRect(x+b.w-13,y+65,18,10);c.fillRect(x+10,y+b.h-15,18,15);c.fillRect(x+b.w-28,y+b.h-15,18,15);
  c.font='9px monospace';c.textAlign='center';c.fillStyle='#b4c6cd';c.fillText('VISUAL PROVISÃ“RIO',x+b.w/2,y-18);c.restore();
 }
 if(id==='matrona')renderMatronaEffects(c,b,camera);
 if(id!=='matrona'&&!b.dead&&b.warning>0){
  c.fillStyle='#ff819855';
  if(b.pattern==='sweep')c.fillRect(b.facing>0?x+b.w:x-150,GROUND-65-camera.y,150,65);
  else c.fillRect(b.arena.left-camera.x,GROUND-50-camera.y,b.arena.right-b.arena.left,5);
  c.fillStyle='#ffe0c0';c.font='11px monospace';c.textAlign='center';c.fillText(b.pattern==='sweep'?'GOLPE BAIXO Â· PULE':'DISPARO Â· ESQUIVE',x+b.w/2,y-32);
 }
 for(const q of b.projectiles){c.fillStyle=q.color;c.fillRect(q.x-camera.x,q.y-camera.y,17,12)}
}
