import {enemyMeleeBox} from './sector9-enemies.js';
// Canvas silhouettes use world-sized bodies, matching the physical/hurt boxes.
export function drawEnemyFallback(c,e,x,y) {
 c.save();c.translate(x,y);
 if(e.facing<0){c.translate(e.w,0);c.scale(-1,1)}
 c.scale(e.w/38,e.h/60);c.imageSmoothingEnabled=false;
 const rect=(color,x,y,w,h)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h)};
 const poly=(color,points)=>{c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill()};
 const moving=['patrol','chase'].includes(e.state),stride=moving?Math.round(Math.sin((e.animTime||0)*9)*3):0;
 if(e.type==='servant_shooter') {
  // Single-wheel fallback if the original PNG cannot load.
  poly('#17212c',[[11,10],[24,10],[29,36],[25,47],[11,47],[7,35]]);
  rect('#58616b',12,3,13,10);rect('#ff365c',21,7,5,2);
  rect('#303c49',25,23,7,6);rect('#8a929a',29,24,8,3);
  c.fillStyle='#10151e';c.beginPath();c.arc(19,52,8,0,Math.PI*2);c.fill();
  c.strokeStyle='#77717b';c.lineWidth=2;c.beginPath();c.arc(19,52,5,0,Math.PI*2);c.stroke();
 }else if(e.type==='drone') {
  poly('#172b38',[[3,15],[11,5],[28,5],[35,15],[28,43],[10,43]]);
  rect('#566d7d',0,17,9,19);rect('#566d7d',29,17,9,19);
  rect('#b0c9cf',2,12,6,3);rect('#b0c9cf',30,12,6,3);
  poly(e.color,[[10,14],[27,14],[31,28],[23,39],[14,39],[7,28]]);
  rect('#ff3f72',22,20,9,6);rect('#ddfff3',26,21,3,2);
  rect('#1e2636',13,43,13,8);rect('#ffb66b',16,51,6,5);
 }else if(e.kind==='human') {
  rect('#111824',8,39,9,18+stride);rect('#111824',23,39,8,18-stride);
  rect('#708493',7,48+stride,10,5);rect('#708493',23,48-stride,8,5);
  rect('#253947',5,Math.min(55,55+stride),13,5);rect('#253947',22,Math.min(55,55-stride),14,5);
  poly('#263342',[[8,18],[29,17],[35,29],[29,43],[10,43],[3,27]]);
  poly(e.color,[[11,19],[28,20],[30,34],[23,39],[10,33]]);
  rect('#627b88',3,21,8,10);rect('#8399a1',26,20,9,9);
  rect('#172331',11,3,18,15);rect('#8196a0',12,1,14,6);
  rect('#ff426f',22,9,10,3);rect('#f7b789',25,13,5,4);
  rect('#1a242c',15,34,20,6);rect('#b6c3b7',29,27,6,10);
  rect('#afcad0',14,22,3,4);rect('#fc4671',19,27,3,3);
  if(e.type==='shooter'||e.type==='executor'){rect('#131b28',27,29,11,8);rect('#aab1a7',33,31,5,2)}
 }else {
  const bulky=e.type==='heavy',sentinel=e.type==='sentinel';
  poly('#182b32',[[6,18],[29,17],[37,27],[30,44],[8,44],[1,29]]);
  poly(e.color,[[9,18],[27,18],[31,29],[25,40],[10,37],[5,27]]);
  rect('#8aa49d',11,3,15,13);rect('#364c53',8,8,6,12);
  rect('#ff3a68',23,8,8,5);rect('#ffe1b0',25,9,3,2);
  rect('#20323e',7,40,9,17+stride);rect('#20323e',23,40,8,17-stride);
  rect('#b1b999',8,46+stride,6,6);rect('#b1b999',24,46-stride,5,6);
  rect('#556f76',3,Math.min(55,55+stride),14,5);rect('#556f76',22,Math.min(55,55-stride),14,5);
  rect('#a9b9a3',2,22,7,14);rect('#5c7979',29,22,7,16);
  rect('#102935',13,24,12,11);rect('#fc526c',17,27,5,5);
  rect('#ffbd71',11,37,17,3);
  if(bulky){rect('#6b5053',0,18,10,10);rect('#6b5053',28,17,10,12)}
  if(sentinel){rect('#b2c8cd',26,25,12,7);rect('#2c4855',7,53,25,7)}
  if(e.kind==='virus'){poly('#c3429c',[[7,21],[12,27],[9,37],[14,40],[7,44],[4,31]]);rect('#f193c8',26,16,3,15)}
 }
 // Infection traces and small joint highlights preserve legible silhouettes.
 rect('#ff3866',10,29,2,8);rect('#ffd7b6',11,29,1,2);
 if(e.meleePending){rect('#ff5264',29,20,5,5);rect('#fff0cf',30,21,2,2)}
 c.restore();
 // The extended baton/tool is drawn in exactly the active offensive region.
 if(!e.dead&&e.attackTimer>0){
  const facing=e.meleeFacing??e.facing,box=enemyMeleeBox(e),start=x+(facing>0?e.w-4:0),end=x+box.x-e.x+(facing>0?box.w:0);
  c.fillStyle='#ff526420';c.fillRect(x+box.x-e.x,y+box.y-e.y,box.w,box.h);
  c.strokeStyle='#1b2834';c.lineWidth=7;c.beginPath();c.moveTo(start,y+28);c.lineTo(end,y+28);c.stroke();
  c.strokeStyle=e.kind==='human'?'#f193b3':'#ffb675';c.lineWidth=3;c.stroke();
 }
}
