import {enemyAttackBox} from './sector9-enemies.js';

export function drawCombatDebug(c,state,enemies,camera) {
 c.save();c.translate(-camera.x,-camera.y);c.font='9px monospace';c.lineWidth=1;
 const box=(b,color,dashed=false)=>{if(!b)return;c.strokeStyle=color;c.setLineDash(dashed?[3,3]:[]);c.strokeRect(b.x,b.y,b.w,b.h);c.setLineDash([])};
 const arrow=(entity,facing)=>{const x=entity.x+entity.w/2,y=entity.y+entity.h/2,z=x+(facing||1)*25;c.strokeStyle='#ff5264';c.beginPath();c.moveTo(x,y);c.lineTo(z,y);c.lineTo(z-(facing||1)*5,y-4);c.moveTo(z,y);c.lineTo(z-(facing||1)*5,y+4);c.stroke()};
 const body=e=>{c.lineWidth=3;box(e,'#3c8fff');c.lineWidth=1;box(e,'#60ff8d',true)};
 const p=state.player;if(!p.dead){body(p);arrow(p,p.facing);if(p.state==='attack'&&p.attackTimer>0&&(!p.externalAttackAnimation||p.attackFrameReady))box(p.attackBox,'#ff355b')}
 for(const e of enemies){if(e.dead)continue;body(e);arrow(e,e.meleePending||e.attackTimer>0?e.meleeFacing:e.facing);box(enemyAttackBox(e),'#ff355b');for(const q of e.projectiles||[])box({x:q.x,y:q.y,w:12,h:12},'#ff355b')}
 for(const b of state.bosses){if(!b.active||b.dead)continue;body(b);arrow(b,b.walkFacing??b.facing);
  if(b.matronaState==='beam_fire'&&b.beam){const {a,z,radius}=b.beam;c.save();c.globalAlpha=.4;c.lineCap='round';c.lineWidth=radius*2;c.strokeStyle='#ff355b';c.beginPath();c.moveTo(a.x,a.y);c.lineTo(z.x,z.y);c.stroke();c.restore()}
  if(b.matronaState==='quarantine_strike')for(const z of b.zones||[])box(z,'#ff355b');
  for(const q of b.projectiles||[])box({x:q.x,y:q.y,w:17,h:12},'#ff355b');
 }
 c.restore();c.save();c.font='11px monospace';c.fillStyle='#08111fe8';c.fillRect(12,96,445,24);
 for(const [text,x,color] of [['F3 COLISOR',20,'#74aaff'],['HURTBOX',132,'#60ff8d'],['ATAQUE / DIRECAO',228,'#ff607e']]){c.fillStyle=color;c.fillText(text,x,112)}
 c.restore();
}
