import {createPlayer,updatePlayer,attackBox} from '../js/player.js';
import {playerDamage} from '../js/combat.js';
import {damageBoss} from '../js/bosses.js';
import {AnimationManager} from '../js/engine/animationManager.js';
import {SpriteRenderer} from '../js/engine/spriteRenderer.js';

export function runCombatTests(cfg){
 const results=[];
 const check=(name,ok)=>{if(!ok)throw Error(name);results.push(name);};
 const floor=[{x:0,y:790,w:2000,h:100}];
 const duration=cfg.animations.melee.count/cfg.animations.melee.fps;
 const make=(extra={})=>({...createPlayer(),y:736,grounded:true,attackUsesAsset:true,attackAnimationDuration:duration,...extra});
 for(const fps of [30,60,120]){
  const dt=1/fps;
  const step=(p,keys={})=>updatePlayer(p,{platforms:floor,...keys},dt,{dash:true,doubleJump:true});
  for(const facing of [-1,1])for(const speed of [0,60,250]){
   const p=make({vx:speed*facing,facing});const start=p.x;
   const keys={right:facing>0,left:facing<0};
   step(p,{...keys,attack:true});
   check(`ground attack ${fps}/${facing}/${speed}`,p.state==='attack');
   for(let i=1;i<Math.round(.2*fps);i++)step(p,keys);
   check('exponential braking',Math.abs(p.vx-speed*facing*Math.exp(-22*.2))<1e-8);
   check('limited travel',Math.abs(p.x-start)<12);
   while(p.attackTimer>0)step(p,keys);
   check('immediate control recovery',p.state!=='attack'&&Math.abs(p.vx)>=1700*dt);
   step(p,keys);
   check('walk recovery',['walk','run'].includes(p.state));
  }
  for(const vy of [-300,200]){
   const p=make({grounded:false,y:200,vy,vx:180}),control={...p};
   step(p,{attack:true,right:true});step(control,{right:true});
   check('air attack priority',p.state==='attack');
   check('vertical and horizontal trajectory',p.y===control.y&&p.vy===control.vy&&p.x===control.x&&p.vx===control.vx);
   while(p.attackTimer>0)step(p);
   check('return to airborne movement',['jump','fall'].includes(p.state));
  }
  const dbl=make({y:400,grounded:false,vy:200});
  step(dbl,{jump:true,attack:true});
  check('double jump and attack',dbl.doubleJumpUsed&&dbl.vy<0&&dbl.state==='attack');
  for(const [timer,state] of [['dashTimer','dash'],['damageTimer','damage'],['specialAnimTimer','special']]){
   const p=make({attackTimer:.3,[timer]:.2});step(p);
   p.attackBox=attackBox(p);p.attackFrameReady=true;
   check('priority '+state,p.state===state&&!playerDamage(p,{...p.attackBox,health:100}));
  }
  const landing=make({y:735.5,grounded:false,vy:100});
  landing.nextAttackAnimation='air_melee';step(landing,{attack:true});
  const serial=landing.attackSerial;step(landing,{attack:true});
  check('landing retains swing',landing.grounded&&landing.state==='attack'&&landing.attackSerial===serial&&landing.attackAnimation==='air_melee');
  while(landing.attackTimer>0)step(landing,{attack:true});
  check('cooldown survives completion',landing.attackSerial===serial);
  while(landing.attackCooldown>dt)step(landing);
  step(landing,{attack:true});step(landing,{attack:true});
  check('next combo after cooldown',landing.attackSerial===serial+1&&landing.combo===2);

  for(const facing of [-1,1]){
   const p=make({y:400,grounded:false,vy:-200,facing});step(p,{attack:true});
   const manager=new AnimationManager();
   const renderer=new SpriteRenderer({getConfig:()=>cfg,get:()=>({naturalWidth:1360,naturalHeight:120})},manager);
   const ctx={save(){},restore(){},translate(){},scale(){},drawImage(){}};
   const enemy={x:0,y:0,w:15,h:20,health:100};
   p.externalAttackAnimation=true;let hits=0,events=0;
   for(let i=0;i<Math.ceil(duration*fps)-1;i++){
    p.attackBox=attackBox(p);enemy.x=facing>0?p.x+p.w+5:p.x-20;enemy.y=p.attackBox.y;
    p.attackFrameReady=false;
    renderer.draw(ctx,'protagonist','melee',p,dt,{onEvent:name=>{if(name==='hit'){events++;p.attackFrameReady=true;}}});
    if(playerDamage(p,enemy))hits++;
    playerDamage(p,enemy);
    step(p);
   }
   check('one hit event and no duplicate damage',events===1&&hits===1&&enemy.health===78);
   check('hit does not terminate animation',p.attackTimer>0);
   p.attackHitConsumed=false;p.attackFrameReady=true;p.attackBox=attackBox(p);
   check('no backward hit',!playerDamage(p,{x:facing>0?p.x-30:p.x+p.w+20,y:p.attackBox.y,w:10,h:20,health:100}));
   check('no distant hit',!playerDamage(p,{x:p.x+facing*300,y:p.attackBox.y,w:10,h:20,health:100}));
   const boss={...p.attackBox,health:100,active:true,hitCooldown:0};
   damageBoss(boss,p);boss.hitCooldown=0;damageBoss(boss,p);
   check('boss does not duplicate or interrupt swing',boss.health===77&&p.attackTimer>0);
  }
 }
 return results;
}
