import {hurt, intersects} from './combat.js';
import {GROUND} from './map.js';
export const MATRONA_TIMING=Object.freeze({beamTrack:.7,beamLock:.4,beamFire:.3,beamRecovery:.6});
export const MATRONA_MOVEMENT=Object.freeze({speed:24,near:125,far:285,clearance:20,moveMin:.4,moveMax:.8,pauseMin:.25,pauseMax:.65});
const between=(a,z)=>a+Math.random()*(z-a);

export function resetMatrona(b) {
 b.matronaState='idle'; b.stateTime=0; b.timer=.9; b.beam=null; b.zones=[];
 b.warning=0; b.attackType='recovery'; b.lastAttack=null; b.repeat=0;
 b.campTime=0; b.campX=null; b.attackSerial=0; b.hitCooldown=0;
 b.moveTimer=0;b.moveStep=0;b.movePause=false;b.walkFacing=null;
}
export function clearMatrona(b) { b.beam=null; b.zones=[]; b.warning=0; b.projectiles=[]; b.matronaState='death'; }
function enter(b,state,time) { b.matronaState=state; b.stateTime=0; b.timer=time; b.warning=0; b.walkFacing=null;b.attackType=state.includes('recovery')||['idle','reposition'].includes(state)?'recovery':'windup'; }
export function matronaAnimation(b) {
 if(b.matronaState?.startsWith('beam_'))return 'attack_beam';
 if(b.matronaState?.startsWith('quarantine_'))return 'attack_quarantine';
 if(b.hitCooldown>0)return 'damage';
 return b.matronaState==='reposition'?'walk':'idle';
}
export function matronaFrame(b,def) {
 if(!def)return null;
 const index=Math.floor((b.stateTime||0)*(def.fps||10)),last=(def.count||1)-1;
 if(b.matronaState==='beam_telegraph')return Math.min(def.holdFrame??2,index);
 if(b.matronaState==='beam_lock'||b.matronaState==='beam_fire')return def.holdFrame??2;
 if(b.matronaState==='beam_recovery')return Math.min(last,(def.holdFrame??2)+1+index);
 if(b.matronaState==='quarantine_cast')return Math.min(last,index);
 if(b.matronaState?.startsWith('quarantine_'))return last;
 return null;
}
// Same rounded destination rectangle and mirror convention as SpriteRenderer.
export function handPosition(b,cfg) {
 const key=matronaAnimation(b),def=cfg?.animations?.[key];
 const a=def?.enabled!==false&&!def?.invalid&&def?.ready?def:cfg?.animations?.idle;
 const scale=a?.scale??cfg?.scale??130/254,fw=a?.frameWidth??130;
 const origin=a?.origin??cfg?.origin??{x:65,y:254};
 const frame=matronaFrame(b,a);
 const hand=a?.hands?.[frame]??a?.hand??{x:60,y:130};
 const dx=Math.round(b.x+b.w/2-origin.x*scale+((cfg?.visual?.offsetX||0)+(a?.offsetX||0))*scale);
 const dy=Math.round(b.y+b.h-origin.y*scale+((cfg?.visual?.offsetY||0)+(a?.offsetY||0))*scale);
 const mirror=(b.facing||-1)*(a?.nativeFacing??cfg?.nativeFacing??-1)<0;
 return {x:dx+(mirror?Math.round(fw*scale)-hand.x*scale:hand.x*scale),y:dy+hand.y*scale};
}
// Slab test against the segment, with rounded caps for the actual beam radius.
export function segmentHitsBox(a,z,box,radius=0) {
 const distance=(p,q)=>Math.hypot(p.x-q.x,p.y-q.y);
 const pointSegment=(p,u,v)=>{const dx=v.x-u.x,dy=v.y-u.y,t=Math.max(0,Math.min(1,((p.x-u.x)*dx+(p.y-u.y)*dy)/(dx*dx+dy*dy||1)));return distance(p,{x:u.x+t*dx,y:u.y+t*dy})};
 let lo=0,hi=1;
 for(const [start,delta,min,max] of [[a.x,z.x-a.x,box.x,box.x+box.w],[a.y,z.y-a.y,box.y,box.y+box.h]]) {
  if(Math.abs(delta)<1e-9){if(start<min||start>max){lo=2;break}}else {let t=(min-start)/delta,u=(max-start)/delta;if(t>u)[t,u]=[u,t];lo=Math.max(lo,t);hi=Math.min(hi,u)}
 }
 if(lo<=hi)return true;
 const corners=[{x:box.x,y:box.y},{x:box.x+box.w,y:box.y},{x:box.x+box.w,y:box.y+box.h},{x:box.x,y:box.y+box.h}];
 const pointBox=p=>Math.hypot(Math.max(box.x-p.x,0,p.x-box.x-box.w),Math.max(box.y-p.y,0,p.y-box.y-box.h));
 return Math.min(pointBox(a),pointBox(z),...corners.map(p=>pointSegment(p,a,z)))<=radius;
}
function aim(b,p,cfg,platforms) {
 const a=handPosition(b,cfg),dx=p.x+p.w/2-a.x,dy=p.y+p.h*.55-a.y,length=Math.hypot(dx,dy)||1;
 const ux=dx/length,uy=dy/length;let reach=850;
 if(ux>0)reach=Math.min(reach,(b.arena.right-a.x)/ux);else if(ux<0)reach=Math.min(reach,(b.arena.left-a.x)/ux);
 // Catwalks are one-way in the physics; only tall solid structures block beams.
 for(const s of platforms.filter(s=>s.h>=70)) {
  let near=0,far=reach;
  for(const [start,d,min,max] of [[a.x,ux,s.x,s.x+s.w],[a.y,uy,s.y,s.y+s.h]]) {
   if(Math.abs(d)<1e-9){if(start<min||start>max)far=-1}else{let t=(min-start)/d,u=(max-start)/d;if(t>u)[t,u]=[u,t];near=Math.max(near,t);far=Math.min(far,u)}
  }
  if(near<=far&&near>=0)reach=Math.min(reach,near);
 }
 return {a,z:{x:a.x+ux*Math.max(0,reach),y:a.y+uy*Math.max(0,reach)},radius:5,hit:false};
}
function markZones(b,p,platforms) {
 const zones=[],width=86,centers=[p.x+p.w/2,b.arena.left+105,b.arena.right-105];
 for(const center of centers) {
  const anchor=Math.max(b.arena.left+12,Math.min(b.arena.right-12,center));
  const surfaces=platforms.filter(s=>!s.disabled&&s.x<=anchor&&s.x+s.w>=anchor&&s.w>=width&&s.y>=p.y+p.h-8).sort((a,z)=>a.y-z.y);
  const floor=surfaces[0];if(!floor)continue;
  const x=Math.max(b.arena.left+12,floor.x,Math.min(b.arena.right-width-12,floor.x+floor.w-width,anchor-width/2));
  if(zones.some(z=>Math.abs(z.x-x)<width+55))continue;
  zones.push({x,y:floor.y-38,w:width,h:38,hit:false});
  if(zones.length===(b.phase===2?3:2))break;
 }
 return zones;
}
export function updateMatrona(b,p,dt,{config=null,platforms=[{x:b.arena.left,y:GROUND,w:b.arena.right-b.arena.left,h:110}]}={}) {
 if(!b.matronaState)resetMatrona(b);
 if(b.dead||b.health<=0){clearMatrona(b);return}
 if(p.dead){b.beam=null;b.zones=[];return}
 b.phase=b.health<=b.maxHealth*.4?2:1;
 b.hitCooldown=Math.max(0,b.hitCooldown-dt); b.stateTime+=dt; b.timer-=dt;
 const speed=b.phase===2?1.1:1;
 if(b.campX===null||Math.abs(p.x-b.campX)>80){b.campX=p.x;b.campTime=0}else b.campTime+=dt;
 const state=b.matronaState;
 if(state==='idle'||state==='reposition') {
  b.facing=p.x+p.w/2>b.x+b.w/2?1:-1;
  const distance=Math.abs((p.x+p.w/2)-(b.x+b.w/2)),m=MATRONA_MOVEMENT;
  b.moveTimer-=dt;
  if(b.moveTimer<=0){
   if(b.movePause){b.moveStep=0;b.moveTimer=between(m.pauseMin,m.pauseMax);b.movePause=false}
   else {b.moveStep=distance>m.far?b.facing:distance<m.near?(Math.random()<.7?-b.facing:0):(Math.random()<.75?(Math.random()<.5?-1:1):0);b.moveTimer=between(m.moveMin,m.moveMax);b.movePause=true}
  }
  const step=b.timer>0?b.moveStep:0,previousX=b.x;
  const walkSpeed=m.speed*(config?.animations?.walk?.fps||8)/8;
  let next=Math.max(b.arena.left+16,Math.min(b.arena.right-b.w-16,b.x+step*walkSpeed*dt));
  // Keep the boss on her current side of Kael, including during lateral steps.
  if(b.x+b.w<=p.x)next=Math.min(next,Math.max(b.x,p.x-b.w-m.clearance));
  else if(b.x>=p.x+p.w)next=Math.max(next,Math.min(b.x,p.x+p.w+m.clearance));
  else if((b.x+b.w/2-p.x-p.w/2)*(next+b.w/2-p.x-p.w/2)<=0)next=b.x;
  if((next-b.x)*step<0)next=b.x;
  b.x=next;
  b.matronaState=b.x!==previousX?'reposition':'idle';
  b.walkFacing=b.matronaState==='reposition'?Math.sign(b.x-previousX):null;
  if(b.timer<=0) {
   let type=Math.random()<(distance>210?.75:.4)-Math.min(.3,b.campTime*.055)?'beam':'quarantine';
   if(b.lastAttack===type&&b.repeat>=2)type=type==='beam'?'quarantine':'beam';
   b.repeat=b.lastAttack===type?b.repeat+1:1;b.lastAttack=type;b.attackSerial++;
   if(type==='beam'){enter(b,'beam_telegraph',MATRONA_TIMING.beamTrack);b.beam=aim(b,p,config,platforms)}
   else enter(b,'quarantine_cast',.45/speed);
  }
 }else if(state==='beam_telegraph') {
  b.beam=aim(b,p,config,platforms);b.warning=Math.max(0,b.timer);
  if(b.timer<=0)enter(b,'beam_lock',MATRONA_TIMING.beamLock);
 }else if(state==='beam_lock') {
  b.warning=Math.max(0,b.timer);
  if(b.timer<=0)enter(b,'beam_fire',MATRONA_TIMING.beamFire);
 }else if(state==='beam_fire') {
  if(b.beam&&!b.beam.hit&&segmentHitsBox(b.beam.a,b.beam.z,p,b.beam.radius)&&hurt(p,12,b.x))b.beam.hit=true;
  if(b.timer<=0)enter(b,'beam_recovery',MATRONA_TIMING.beamRecovery);
 }else if(state==='beam_recovery') {
  if(b.timer<=0){b.beam=null;enter(b,'idle',.65/speed);b.moveTimer=0;b.movePause=false}
 }else if(state==='quarantine_cast') {
  if(b.timer<=0){b.zones=markZones(b,p,platforms);enter(b,'quarantine_warning',.85/speed)}
 }else if(state==='quarantine_warning') {
  b.warning=Math.max(0,b.timer);if(b.timer<=0)enter(b,'quarantine_strike',.3);
 }else if(state==='quarantine_strike') {
  for(const z of b.zones)if(!z.hit&&intersects(p,z)&&hurt(p,11,b.x)){for(const q of b.zones)q.hit=true;break}
  if(b.timer<=0)enter(b,'quarantine_recovery',.55);
 }else if(state==='quarantine_recovery'&&b.timer<=0){b.zones=[];enter(b,'idle',.65/speed);b.moveTimer=0;b.movePause=false}
}

export function renderMatronaEffects(c,b,camera) {
 if(b.dead||!b.active)return;
 const state=b.matronaState,t=b.stateTime||0;
 c.save();c.translate(-camera.x,-camera.y);c.lineCap='round';
 const line=(a,z,width,color)=>{c.lineWidth=width;c.strokeStyle=color;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(z.x,z.y);c.stroke()};
 if(b.beam&&['beam_telegraph','beam_lock','beam_fire','beam_recovery'].includes(state)) {
  const {a,z,radius}=b.beam;
  if(state==='beam_telegraph'){c.globalAlpha=.45+.55*Math.min(1,t/MATRONA_TIMING.beamTrack);line(a,z,4,'#100b18');line(a,z,2,'#ff566b');line(a,z,1,'#ffd0c5')}
  if(state==='beam_lock'){c.globalAlpha=.75+.25*Math.abs(Math.sin(t*28));line(a,z,5,'#100b18');line(a,z,3,'#ff3659');line(a,z,1,'#fff0d2')}
  if(state==='beam_fire'){line(a,z,radius*2+4,'#ff254025');line(a,z,radius*2,'#ef2548');line(a,z,4,'#ff8190');line(a,z,2,'#fff1df')}
  c.globalAlpha=state==='beam_recovery'?Math.max(0,1-t/MATRONA_TIMING.beamRecovery):state==='beam_telegraph'?.4+.6*Math.min(1,t/MATRONA_TIMING.beamTrack):1;
  for(const point of ['beam_telegraph','beam_lock'].includes(state)?[a]:[a,z]){
   c.fillStyle='#ff304c44';c.fillRect(Math.round(point.x)-7,Math.round(point.y)-7,14,14);
   c.fillStyle='#ffe0d7';c.fillRect(Math.round(point.x)-2,Math.round(point.y)-2,4,4);
   for(let i=0;i<4;i++){const angle=i*Math.PI/2+t*12,r=4+(t*27+i*3)%13;c.fillStyle='#ff5264';c.fillRect(Math.round(point.x+Math.cos(angle)*r),Math.round(point.y+Math.sin(angle)*r),2,2)}
  }
 }
 if(state?.startsWith('quarantine_')&&!state.endsWith('recovery')) {
  c.fillStyle=b.phase===2?'#ff5264':'#ff526499';
  c.fillRect(Math.round(b.x+b.w/2)-2,Math.round(b.y+46),4,6);
 }
 for(const z of b.zones||[]) {
  if(state==='quarantine_warning') {c.globalAlpha=.7+.3*Math.abs(Math.sin(t*16));c.fillStyle='#ed254466';c.fillRect(z.x,z.y,z.w,z.h);c.fillStyle='#ff5264';c.fillRect(z.x,z.y+z.h-3,z.w,3)}
  if(state==='quarantine_strike') {
   c.globalAlpha=1;c.fillStyle='#f3234944';c.fillRect(z.x,z.y,z.w,z.h);
   for(let i=6;i<z.w;i+=14){const x=z.x+i;line({x,y:z.y+z.h},{x:x+4*Math.sin(t*60+i),y:z.y+18},3,'#ff354e');line({x:x+4*Math.sin(t*60+i),y:z.y+18},{x,y:z.y},2,'#ffdedb')}
  }
 }
 c.restore();
}
