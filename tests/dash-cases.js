import {createPlayer,updatePlayer,attackBox} from '../js/player.js';
import {newState} from '../js/engine.js';
import {syncProgress} from '../js/campaign.js';
import {normalizeSave} from '../js/save.js';

export function runDashTests(){
 let checks=0;
 const check=(name,value)=>{checks++;if(!value)throw Error(name);};
 for(const fps of [30,60,120]){
  const dt=1/fps,abilities={dash:true,doubleJump:true};
  const make=(extra={})=>({...createPlayer(),x:1000,y:736,grounded:true,...extra});
  const step=(p,keys={})=>{updatePlayer(p,{platforms:[{x:0,y:790,w:7200,h:110}],...keys},dt,abilities);check('nonnegative timer at '+fps,p.dashTimer>=0);};
  const idleFor=(p,seconds)=>{for(let i=0;i<Math.ceil(seconds*fps);i++)step(p);};
  for(const speed of [60,250]){
   const p=make({vx:speed});step(p);
   check('unchanged ground friction',Math.abs(p.vx-speed*Math.pow(.0008,dt))<1e-9);
   idleFor(p,1);check('walk/run stop',Math.abs(p.vx)<1&&p.state==='idle');
  }
  const normal=make();step(normal,{right:true});check('normal acceleration',normal.vx===1700*dt);
  for(let i=0;i<fps;i++)step(normal,{right:true});check('normal speed limit',normal.vx===250);
  const p=make();step(p,{dash:true});check('dash starts',p.dashTimer>0&&p.vx===760);
  let elapsed=dt;while(p.dashTimer>0){step(p);elapsed+=dt;}
  check('dash duration',elapsed>=.18&&elapsed<=.18+dt+1e-9);
  check('dash ends at zero',p.dashTimer===0);
  idleFor(p,1);check('dash then release stops',Math.abs(p.vx)<1&&p.state==='idle');
  for(let repeat=0;repeat<5;repeat++){
   p.energy=p.maxEnergy;idleFor(p,.8);step(p,{dash:true});
   check('repeated dash starts',p.dashTimer>0);
   while(p.dashTimer>0)step(p);
   idleFor(p,1);check('repeated dash stops',Math.abs(p.vx)<1);
  }
  const reverse=make();step(reverse,{dash:true});while(reverse.dashTimer>0)step(reverse);
  let reversalTime=0;while(reverse.vx>=0&&reversalTime<.3){step(reverse,{left:true});reversalTime+=dt;}
  check('responsive reversal after dash',reverse.vx<0&&reversalTime<=.2);
  const activeReverse=make();step(activeReverse,{dash:true});step(activeReverse,{left:true});
  check('active dash reversal preserved',activeReverse.vx===-760);
  const jump=make();step(jump,{dash:true});while(jump.dashTimer>0)step(jump);
  step(jump,{jump:true});check('jump after dash',jump.vy<0&&!jump.grounded&&jump.state==='jump');
  step(jump,{jump:true,attack:true});check('double jump and air attack',jump.doubleJumpUsed&&jump.vy<0&&jump.state==='attack');
  const attack=make();step(attack,{dash:true});while(attack.dashTimer>0)step(attack);
  step(attack,{attack:true});check('ground attack after dash',attack.state==='attack');
  check('hitbox unchanged',attackBox(attack).w===57&&attackBox(attack).h===30);
  for(const timer of [-.001,-.18,-100,undefined,NaN]){
   const old=make({dashTimer:timer,vx:250});step(old);
   check('affected live state recovers',old.dashTimer===0&&old.vx<250);
   idleFor(old,1);check('affected live state stops',old.state==='idle'&&old.vx<1);
  }
  const air=make({y:200,grounded:false,vx:100,dashTimer:-.01});step(air);
  check('air friction recovers',Math.abs(air.vx-100*Math.pow(.08,dt))<1e-9);
  const state=newState();state.player=make({vx:123,vy:-50});
  state.bosses[0].dead=true;syncProgress(state);
  check('Matrona grants dash without changing velocity',state.abilities.dash&&state.player.vx===123&&state.player.vy===-50);
  state.player.y=736;state.player.vy=0;step(state.player,{dash:true});while(state.player.dashTimer>0)step(state.player);
  idleFor(state.player,1);check('stop after Matrona dash',state.player.vx<1&&state.player.state==='idle');
  for(const version of [1,2]){
   state.version=version;state.player.dashTimer=-.02;state.player.vx=250;
   const loaded=normalizeSave(JSON.parse(JSON.stringify(state)));
   check('old and current saves recover',loaded.player.dashTimer===0&&loaded.player.vx===0&&loaded.abilities.dash);
   step(loaded.player);check('loaded state stays stopped',loaded.player.vx===0);
  }
 }
 return checks;
}
