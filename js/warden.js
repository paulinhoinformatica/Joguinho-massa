import {hurt,intersects} from './combat.js';
import {GROUND} from './map.js';
import {moveBody} from './physics.js';

export function resetWarden(b){Object.assign(b,{phase:1,transformed:false,wardenState:'idle',stateTime:0,timer:.9,warning:0,attackType:'recovery',waves:[],offense:[],projectiles:[],attackSerial:0,hitCooldown:0,vx:0,vy:0,walkTime:0});}
export function clearWarden(b){b.waves=[];b.offense=[];b.projectiles=[];b.warning=0;b.vx=0;b.wardenState='death';b.stateTime=0;}
function enter(b,state,time){b.wardenState=state;b.stateTime=0;b.timer=time;b.warning=0;b.offense=[];b.vx=0;b.attackType=['windup','transition'].includes(state)?'windup':'recovery';}
export function transitionWarden(b){if(b.transformed||b.health<=0)return; b.transformed=true;b.waves=[];b.projectiles=[];enter(b,'transition',1.65);}
export function wardenHurtbox(b){return {x:b.x+5,y:b.y+5,w:b.w-10,h:b.h-5};}
export function wardenCore(b,config){
 const key=wardenAnimation(b),a=config?.animations?.[key],frame=wardenFrame(b);
 const scale=a?.scale??.47,origin=a?.origin??{x:128,y:251};
 const point=key.endsWith('slam')&&frame>=3?{x:128,y:96}:{x:145,y:65};
 const dx=Math.round(b.x+b.w/2+b.facing*19.74-origin.x*scale),dy=Math.round(b.y+b.h-origin.y*scale);
 const result={x:dx+(b.facing>0?Math.round(256*scale)-point.x*scale:point.x*scale),y:dy+point.y*scale};
 if(b.pattern==='charge'&&['windup','charge'].includes(b.wardenState)){const angle=b.facing*(b.wardenState==='charge'?.12:Math.min(.1,b.stateTime*.12)),cx=b.x+b.w/2,feet=b.y+b.h,x=result.x-cx,y=result.y-feet;return {x:cx+x*Math.cos(angle)-y*Math.sin(angle),y:feet+x*Math.sin(angle)+y*Math.cos(angle)};}
 return result;
}
function front(b,reach,height,source){return {x:b.facing>0?b.x+b.w:b.x-reach,y:GROUND-height,w:reach,h:height,source,hit:false};}
function clip(b,box,platforms){let left=Math.max(box.x,b.arena.left),right=Math.min(box.x+box.w,b.arena.right);for(const s of platforms){if(s.disabled||s.h<70||s.y>=GROUND||s.y+s.h<=box.y)continue;if(b.facing>0&&s.x>=b.x+b.w)right=Math.min(right,s.x);if(b.facing<0&&s.x+s.w<=b.x)left=Math.max(left,s.x+s.w);}return {...box,x:left,w:Math.max(0,right-left)};}
function strike(b,p,box,damage){if(!box.hit&&intersects(p,box)&&hurt(p,damage,b.x+b.w/2,{source:box.source,entity:b.id,x:box.x,y:box.y}))box.hit=true;}
export function wardenAnimation(b){const phase=b.phase===2?2:1;return `phase${phase}_${b.pattern==='slam'&&['windup','slam','recovery'].includes(b.wardenState)?'slam':['approach','reposition'].includes(b.wardenState)&&b.moving?'walk':'idle'}`;}
export function wardenFrame(b){if(wardenAnimation(b).endsWith('walk'))return Math.floor(b.walkTime*8)%8;if(!wardenAnimation(b).endsWith('slam'))return 0;if(b.wardenState==='windup')return Math.min(2,Math.floor(b.stateTime*3));if(b.wardenState==='slam')return b.stateTime>.3?5:b.phase===2?4:3;return 5;}
export function updateWarden(b,p,dt,{platforms=[{x:b.arena.left,y:GROUND,w:b.arena.right-b.arena.left,h:110}]}={}){
 if(!b.wardenState){const health=b.health;resetWarden(b);b.health=health;}
 if(b.dead||b.health<=0){clearWarden(b);return;}
 if(p.dead){b.offense=[];b.waves=[];b.vx=0;return;}
 if(b.health<=b.maxHealth*.5&&!b.transformed)transitionWarden(b);
 b.hitCooldown=Math.max(0,b.hitCooldown-dt);b.stateTime+=dt;b.timer-=dt;b.moving=false;
 const state=b.wardenState,red=b.phase===2;
 if(state==='transition'){if(b.stateTime>=.85)b.phase=2;if(b.timer<=0)enter(b,'reposition',.75);return;}
 for(const q of b.waves){const old=q.x;q.x+=q.vx*dt;q.distance+=Math.abs(q.x-old);if(q.x<b.arena.left||q.x+q.w>b.arena.right||platforms.some(s=>!s.disabled&&s.h>=70&&s.y<GROUND&&intersects(q,s)))q.life=0;else strike(b,p,q,16);if(q.distance>q.range)q.life=0;}
 if(b.waves.some(q=>q.hit)){for(const q of b.waves)q.hit=true;for(const box of b.offense)if(box.source==='warden_hammer')box.hit=true;}
 b.waves=b.waves.filter(q=>q.life>0);
 if(['idle','approach','reposition'].includes(state)){
  b.facing=p.x+p.w/2>b.x+b.w/2?1:-1;
  const distance=Math.abs(p.x+p.w/2-b.x-b.w/2),step=distance>165?b.facing:distance<105?-b.facing:0;
  const old=b.x;b.vx=step*38;moveBody(b,dt,platforms);b.x=Math.max(b.arena.left+12,Math.min(b.arena.right-b.w-12,b.x));b.moving=Math.abs(b.x-old)>.01;if(b.moving)b.walkTime+=dt;b.wardenState=step===b.facing?'approach':'reposition';
  if(b.timer<=0){b.attackSerial++;b.pattern=distance>285?'charge':['slam','discharge','charge'][(b.attackSerial-1)%3];enter(b,'windup',b.pattern==='slam'?.95:b.pattern==='charge'?.85:1);}
 }else if(state==='windup'){
  b.warning=Math.max(0,b.timer);
  if(b.timer<=0){if(b.pattern==='charge'){enter(b,'charge',.68);b.chargeHit=false;}
   if(b.pattern==='slam'){enter(b,'slam',red?1.6:1.25);const box=clip(b,front(b,red?85:65,red?45:34,'warden_hammer'),platforms);b.offense=[box];const point=box.x+box.w/2;for(const direction of [-1,1])b.waves.push({x:point-12,y:GROUND-(red?40:22),w:24,h:red?40:22,vx:direction*(red?255:215),range:red?360:230,distance:0,life:1,source:'warden_shockwave',hit:false});b.shake=red?9:5;}
   if(b.pattern==='discharge'){enter(b,'discharge',.28);b.offense=[clip(b,front(b,red?245:165,red?98:65,'warden_discharge'),platforms)];}
  }
 }else if(state==='charge'){
  const old=b.x;b.vx=b.facing*(red?510:455);moveBody(b,dt,platforms);b.x=Math.max(b.arena.left+12,Math.min(b.arena.right-b.w-12,b.x));
  const box={x:Math.min(old,b.x)-(red?7:0),y:GROUND-(red?65:55),w:b.w+Math.abs(b.x-old)+(red?14:0),h:red?65:55,source:'warden_charge',hit:b.chargeHit};strike(b,p,box,18);b.chargeHit=box.hit;b.offense=[box];
  const wall=Math.abs(b.x-old)<Math.abs(b.vx*dt)*.5||b.vx===0;if(wall||b.timer<=0)enter(b,'recovery',wall?1.35:.9);
 }else if(state==='slam'||state==='discharge'){
  if(state==='slam'&&b.stateTime>.16)b.offense=[];
  for(const box of b.offense)strike(b,p,box,state==='slam'?23:17);
  if(state==='slam'&&b.offense.some(q=>q.hit))for(const q of b.waves)q.hit=true;
  if(b.timer<=0)enter(b,'recovery',state==='slam'?.85:.9);
 }else if(state==='recovery'&&b.timer<=0)enter(b,'reposition',.7);
 // Waves expire before recovery ends, leaving a clean counterattack window.
 b.shake=Math.max(0,(b.shake||0)-dt*25);
}

export function renderWarden(c,b,camera,renderer){
 const t=b.stateTime||0,state=b.wardenState,red=b.phase===2,color=red?'#ff394d':'#ffba45',cx=b.x+b.w/2,feet=b.y+b.h;
 c.save();c.translate(-camera.x,-camera.y);
 const collapse=b.dead?Math.max(0,1-(b.deathTimer||0)/.9):0;
 c.globalAlpha=1-collapse;c.save();
 if(b.dead){c.translate(cx,feet);c.rotate(-b.facing*collapse*.65);c.translate(-cx,-feet);}
 if(b.pattern==='charge'&&['windup','charge'].includes(state)){c.translate(cx,feet);c.rotate(b.facing*(state==='charge'?.12:Math.min(.1,t*.12)));c.translate(-cx,-feet);}
 if(state==='transition'&&t<.85)c.translate(Math.sin(t*100)*3,0);
 // Each sheet is centered on its frame; compensate for the native body's
 // position inside the transparent margin, with the same mirror convention.
 renderer?.draw(c,'warden',wardenAnimation(b),b,0,{x:cx+b.facing*(red?19.74:17.6),y:feet,facing:b.facing,frameOverride:wardenFrame(b)});c.restore();c.globalAlpha=1;
 const core=red?wardenCore(b,renderer?.assets?.getConfig('warden')):{x:cx-b.facing*26,y:feet-65};
 if(red&&!b.dead){c.fillStyle=`rgba(255,35,60,${(state==='windup'?.2:.08)+Math.sin(t*8)*.035})`;c.beginPath();c.arc(core.x,core.y,state==='windup'?13:8,0,Math.PI*2);c.fill();}
 for(const q of b.waves||[]){c.fillStyle=color+'44';c.fillRect(q.x,q.y,q.w,q.h);c.strokeStyle=color;c.lineWidth=3;c.beginPath();c.moveTo(q.x,GROUND);c.lineTo(q.x+q.w/2,q.y);c.lineTo(q.x+q.w,GROUND);c.stroke();}
 if(state==='windup'){
  const reach=b.pattern==='discharge'?(red?245:165):b.pattern==='slam'?(red?85:65):140;
  c.fillStyle=(b.pattern==='discharge'?(red?'#ff394d':'#55cfff'):color)+'35';c.fillRect(b.facing>0?b.x+b.w:b.x-reach,GROUND-8,reach,8);
  c.font='11px monospace';c.textAlign='center';c.fillStyle='#fff1ce';c.fillText({charge:'INVESTIDA · PULE / DASH',slam:'IMPACTO · AFASTE-SE',discharge:'DESCARGA · RECUAR / FLANQUEAR'}[b.pattern],cx,b.y-18);
  if(b.pattern==='discharge'){c.strokeStyle=red?'#ff5264':'#65dfff';c.lineWidth=2;for(let i=0;i<6;i++){const a=i*Math.PI/3+t*9,r=8+Math.sin(t*22+i)*3;c.beginPath();c.moveTo(core.x+Math.cos(a)*4,core.y+Math.sin(a)*4);c.lineTo(core.x+Math.cos(a)*r,core.y+Math.sin(a)*r);c.stroke();}}
 }
 if(state==='discharge'){for(const q of b.offense){c.fillStyle=(red?'#ff394d':'#55cfff')+'38';c.fillRect(q.x,q.y,q.w,q.h);c.strokeStyle=red?'#ff6a78':'#9feaff';c.lineWidth=2;for(let j=0;j<5;j++){c.beginPath();for(let i=0;i<=12;i++){const x=q.x+q.w*i/12,y=q.y+q.h*(j+.5)/5+Math.sin(i*9+t*70+j)*5;i?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();}}}
 if(state==='slam'){for(const q of b.offense){c.fillStyle=color+'55';c.fillRect(q.x,q.y,q.w,q.h);c.strokeStyle=color;c.lineWidth=3;c.beginPath();c.ellipse(q.x+q.w/2,GROUND-5,q.w/2,7,0,0,Math.PI*2);c.stroke();for(let i=0;i<10;i++){c.fillStyle=i%2?color:'#fff1cf';c.fillRect(q.x+q.w*i/10,GROUND-5-(i*13+t*120)%q.h,3,3);}}}
 if(state==='charge'){for(const q of b.offense){c.fillStyle=color+'33';c.fillRect(q.x,q.y,q.w,q.h);}}
 if(state==='charge'&&red){c.fillStyle='#ff394d55';for(let i=1;i<7;i++)c.fillRect(cx-b.facing*(30+i*10),feet-48+i*4,8,3);}
 if(state==='transition'||b.dead){const burst=b.dead?collapse:Math.max(0,t-.65);const sx=cx-b.facing*26,sy=feet-65;
  if(!b.dead&&t<.85){c.strokeStyle='#ff5264';c.lineWidth=2;c.beginPath();c.moveTo(sx-9,sy-12);c.lineTo(sx+3,sy-3);c.lineTo(sx-5,sy+6);c.lineTo(sx+11,sy+17);c.stroke();}
  c.strokeStyle='#ff394d';c.lineWidth=3;c.beginPath();c.arc(sx,sy,8+burst*90,0,Math.PI*2);c.stroke();
  for(let i=0;i<22;i++){const a=i*2.4,r=burst*(35+i*5);c.fillStyle=i%3?'#777c85':'#ff5264';c.fillRect(sx+Math.cos(a)*r,sy+Math.sin(a)*r+burst*burst*70,3+i%5,3+i%4);}
  if(!b.dead&&t>.65&&t<1.05){c.fillStyle='#ff516488';c.fillRect(cx-65,feet-145,130,145);}
 }
 if(state==='windup'||state==='slam'||state==='transition'||b.dead){for(let i=0;i<9;i++){const a=i*2.4+t*6,r=8+(t*35+i*7)%33;c.fillStyle=red?'#ff5264':color;c.fillRect(core.x+Math.cos(a)*r,core.y+Math.sin(a)*r,2,2);}}
 c.restore();
}
