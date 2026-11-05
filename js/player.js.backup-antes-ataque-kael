import{moveBody}from'./physics.js';
export function createPlayer(name='Kael'){return{name,x:120,y:GROUND_Y-58,w:30,h:54,vx:0,vy:0,facing:1,grounded:false,coyote:0,jumpBuffer:0,health:100,maxHealth:100,energy:100,maxEnergy:100,invuln:0,attackTimer:0,attackCooldown:0,combo:0,dashTimer:0,dashCooldown:0,doubleJumpUsed:false,anim:0,state:'idle',checkpoint:{x:120,y:GROUND_Y-58,region:0},dead:false}}
const GROUND_Y=790;
export function updatePlayer(p,input,dt,abilities){p.anim+=dt;p.invuln=Math.max(0,p.invuln-dt);p.attackTimer=Math.max(0,p.attackTimer-dt);p.attackCooldown=Math.max(0,p.attackCooldown-dt);p.dashCooldown=Math.max(0,p.dashCooldown-dt);p.landingTimer=Math.max(0,(p.landingTimer||0)-dt);p.damageTimer=Math.max(0,(p.damageTimer||0)-dt);p.specialAnimTimer=Math.max(0,(p.specialAnimTimer||0)-dt);p.coyote=p.grounded ? .12 : Math.max(0,p.coyote-dt);p.jumpBuffer=input.jump?0.13:Math.max(0,p.jumpBuffer-dt);p.energy=Math.min(p.maxEnergy,p.energy+8*dt);
 const dir=(input.right?1:0)-(input.left?1:0);if(dir)p.facing=dir;const accel=p.grounded?1700:1100,max=250;p.vx+=dir*accel*dt;if(!dir&&!p.dashTimer)p.vx*=Math.pow(p.grounded ? .0008 : .08,dt);p.vx=Math.max(-max,Math.min(max,p.vx));
 if(input.dash&&abilities.dash&&p.dashCooldown<=0&&p.energy>=18){p.dashTimer=.18;p.dashCooldown=.72;p.energy-=18;p.invuln=Math.max(p.invuln,.2);p.vx=p.facing*760;p.vy=0}
 if(p.dashTimer>0){p.dashTimer-=dt;p.vx=p.facing*760}else if(p.jumpBuffer>0&&(p.coyote>0||(abilities.doubleJump&&!p.doubleJumpUsed))){const double=p.coyote<=0;p.vy=double?-590:-660;p.grounded=false;p.coyote=0;p.jumpBuffer=0;if(double){p.doubleJumpUsed=true;p.energy=Math.max(0,p.energy-5)}}
 if(p.attackTimer===0&&input.attack&&p.attackCooldown<=0){p.attackSerial=(p.attackSerial||0)+1;p.animationEvent=null;p.attackTimer=p.attackUsesAsset?(p.attackAnimationDuration||0.4):0.18;p.attackCooldown=p.attackUsesAsset?0.48:0.28;p.combo=(p.combo+1)%3;p.state='attack'}
 p.specialPulse=false;
 const wasGrounded=p.grounded,moveState=Math.abs(p.vx)>25?(Math.abs(p.vx)<130?'walk':'run'):'idle';if(p.dashTimer>0)p.state='dash';else if(p.damageTimer>0)p.state='damage';else if(p.specialAnimTimer>0)p.state='special';else if(!p.grounded)p.state=p.vy<0?'jump':'fall';else if(p.attackTimer>0)p.state='attack';else if(p.landingTimer>0)p.state='landing';else p.state=moveState;
 moveBody(p,dt,input.platforms);if(p.grounded){p.doubleJumpUsed=false;if(!wasGrounded){p.landingTimer=.3;p.state='landing'}else if(p.state==='fall'||p.state==='jump')p.state=moveState}return p}
export const MELEE_HITBOX=Object.freeze({reach:70,height:40,offsetY:7});
// Anchor at the body's front edge so the same reach applies in both directions.
export const attackBox=p=>({
 x:p.facing>0?p.x+p.w:p.x-MELEE_HITBOX.reach,
 y:p.y+MELEE_HITBOX.offsetY,
 w:MELEE_HITBOX.reach,
 h:MELEE_HITBOX.height
});
