import{wardenHurtbox}from'./warden.js';
import {industrialAttackBox} from './enemies.js';
import {enemyHurtbox} from './combat.js';
import {enemyAttackBox} from './sector9-enemies.js';

export function drawCombatDebug(c,state,enemies,camera,map) {
 c.save();c.translate(-camera.x,-camera.y);c.font='9px monospace';c.lineWidth=1;
 const box=(b,color,dashed=false)=>{if(!b)return;c.strokeStyle=color;c.setLineDash(dashed?[3,3]:[]);c.strokeRect(b.x,b.y,b.w,b.h);c.setLineDash([])};
 const arrow=(entity,facing)=>{const x=entity.x+entity.w/2,y=entity.y+entity.h/2,z=x+(facing||1)*25;c.strokeStyle='#ff5264';c.beginPath();c.moveTo(x,y);c.lineTo(z,y);c.lineTo(z-(facing||1)*5,y-4);c.moveTo(z,y);c.lineTo(z-(facing||1)*5,y+4);c.stroke()};
 const body=e=>{c.lineWidth=3;box(e,'#3c8fff');c.lineWidth=1;box(enemyHurtbox(e),'#60ff8d',true)};
 for(const h of map?.hazards||[])box(h,'#ffad42');
 const p=state.player;if(!p.dead){body(p);arrow(p,p.facing);if(p.state==='attack'&&p.attackTimer>0&&(!p.externalAttackAnimation||p.attackFrameReady))box(p.attackBox,'#ff355b')}
 for(const e of enemies){if(e.dead)continue;body(e);arrow(e,e.meleePending||e.attackTimer>0?e.meleeFacing:e.facing);box(e.room===1&&e.pendingAttack==='melee'?industrialAttackBox(e):enemyAttackBox(e),'#ff355b');for(const q of e.projectiles||[])box({x:q.x,y:q.y,w:12,h:12},'#ff355b')}
 for(const b of state.bosses){if(!b.active||b.dead)continue;if(b.assetId==='warden'){c.lineWidth=3;box(b,'#3c8fff');c.lineWidth=1;}else body(b);arrow(b,b.walkFacing??b.facing);
  if(b.assetId==='warden'){box(wardenHurtbox(b),'#60ff8d',true);for(const q of [...(b.offense||[]),...(b.waves||[])]){box(q,'#ff355b');c.fillStyle='#ffe8b7';c.fillText(q.source,q.x,q.y-4);}}
  if(b.matronaState==='beam_fire'&&b.beam){const {a,z,radius}=b.beam;c.save();c.globalAlpha=.4;c.lineCap='round';c.lineWidth=radius*2;c.strokeStyle='#ff355b';c.beginPath();c.moveTo(a.x,a.y);c.lineTo(z.x,z.y);c.stroke();c.restore()}
  if(b.matronaState==='quarantine_strike')for(const z of b.zones||[])box(z,'#ff355b');
  for(const q of b.projectiles||[])box({x:q.x,y:q.y,w:17,h:12},'#ff355b');
 }
 c.restore();c.save();c.font='11px monospace';c.fillStyle='#08111fe8';c.fillRect(12,96,445,24);
 for(const [text,x,color] of [['F3 COLISOR',20,'#74aaff'],['HURTBOX',132,'#60ff8d'],['ATAQUE / DIRECAO',228,'#ff607e']]){c.fillStyle=color;c.fillText(text,x,112)}
 const d=p.lastDamage;
 if(d){c.fillStyle='#07111fee';c.fillRect(12,124,650,44);c.fillStyle='#ffe8b7';c.fillText('damage source: '+d.source,20,140);if((p.anim||0)-d.at<2){c.fillText(d.entity+' / '+d.type+' @ '+Math.round(d.x)+','+Math.round(d.y),20,157);c.strokeStyle='#ff6d52';c.strokeRect(d.x-camera.x-5,d.y-camera.y-5,10,10)}}
 c.fillStyle='#ffad42';c.fillText('HAZARDS: LARANJA',470,112);
 c.restore();
}
