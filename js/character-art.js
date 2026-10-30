// PROTOTYPE FALLBACK ONLY. Replaced automatically by the configured PNG animation
// after it loads. Do not treat this procedural drawing as final character art.
export function drawKael(ctx,p,time){
 const bob=p.state==='run'?Math.sin(p.anim*13)*2.2:p.state==='idle'?Math.sin(time*2.4)*.8:0;
 ctx.save();ctx.translate(p.x+p.w/2,p.y+p.h+bob);ctx.scale((p.facing<0?-1:1)*.62,.62);
 const path=(d,fill,stroke='#10151d',line=2)=>{ctx.beginPath();new Path2D(d);ctx.fillStyle=fill;ctx.fill(new Path2D(d));if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=line;ctx.lineJoin='round';ctx.lineCap='round';ctx.stroke(new Path2D(d))}};
 const coat=ctx.createLinearGradient(-18,-65,18,-8);coat.addColorStop(0,'#45525a');coat.addColorStop(.5,'#202c36');coat.addColorStop(1,'#111b25');
 ctx.fillStyle='#03070a88';ctx.beginPath();ctx.ellipse(0,-1,19,3,0,0,Math.PI*2);ctx.fill();
 // Back coat and raised collar
 path('M-13 -58 Q-22 -51 -19 -30 L-15 -13 Q-8 -7 12 -10 L18 -34 Q20 -53 10 -60Z',coat);
 path('M-13 -57 Q-24 -63 -21 -76 Q-18 -87 -5 -88 Q10 -86 15 -70 L10 -57 L2 -63Z','#17212b','#090f16',2.3);
 // Face, hair and luminous implant eye
 path('M-8 -78 Q-7 -87 4 -84 Q13 -81 11 -69 L6 -60 Q-1 -58 -7 -65Z','#ba9279','#17151a',1.6);
 path('M-9 -76 Q-8 -89 5 -88 Q13 -87 16 -77 L10 -78 L5 -81 L0 -75Z','#141b23','#080c12',2);
 ctx.fillStyle='#eef1d0';ctx.fillRect(4,-74,3,1.6);ctx.fillStyle='#ff557c';ctx.shadowColor='#ff456e';ctx.shadowBlur=7;ctx.fillRect(7,-74,2,2);ctx.shadowBlur=0;
 // Armored shoulder and jacket panels
 path('M-15 -54 Q-23 -49 -20 -37 L-16 -31 L-10 -37 L-8 -53Z','#7e514e');
 path('M-9 -57 L9 -57 L13 -39 L7 -23 L-7 -24 L-14 -40Z',coat);
 path('M-10 -52 L-2 -48 L-5 -25 L-12 -29Z','#8e3d4d','#261b22',1.4);
 path('M1 -53 L8 -49 L6 -28 L0 -27Z','#344954','#101920',1.3);
 // Chest power cell and seams
 path('M-1 -48 L5 -46 L4 -37 L-2 -36Z','#66ebdc','#c6fff1',1);ctx.shadowColor='#52f5df';ctx.shadowBlur=8;ctx.fillStyle='#8ffff0';ctx.fillRect(0,-45,2,5);ctx.shadowBlur=0;
 ctx.strokeStyle='#adbac0';ctx.globalAlpha=.7;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-8,-40);ctx.lineTo(-3,-36);ctx.lineTo(-5,-31);ctx.stroke();ctx.globalAlpha=1;
 // Mechanical right arm, segmented fingers
 path('M9 -53 Q17 -58 19 -49 L18 -35 L22 -28 L17 -24 L10 -32 L9 -42Z','#73848a','#131d24',1.7);
 ctx.strokeStyle='#aebbc0';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(13,-49);ctx.lineTo(17,-46);ctx.lineTo(15,-37);ctx.moveTo(17,-34);ctx.lineTo(21,-29);ctx.stroke();
 ctx.fillStyle='#58efe1';ctx.shadowColor='#58efe1';ctx.shadowBlur=7;ctx.beginPath();ctx.arc(16,-46,2,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
 // Legs animate independently during the run cycle
 const stride=p.state==='run'?Math.sin(p.anim*13)*4:0;
 path(`M-10 -26 L-1 -26 L-2 ${-12+stride} L-5 ${-5+stride} L-13 ${-5+stride} L-13 ${-11+stride}Z`,'#26313a');
 path(`M2 -27 L11 -28 L13 ${-12-stride} L9 ${-5-stride} L2 ${-5-stride}Z`,'#313b43');
 path(`M-14 ${-8+stride} Q-9 ${-11+stride} -4 ${-7+stride} L-2 ${-3+stride} L-17 ${-3+stride}Z`,'#a45a50','#1b171a',1.5);
 path(`M2 ${-8-stride} L10 ${-10-stride} Q17 ${-8-stride} 17 ${-4-stride} L2 ${-3-stride}Z`,'#a45a50','#1b171a',1.5);
 // Blade sweeps out during a melee animation.
 if(p.attackTimer>0){ctx.save();ctx.translate(18,-43);ctx.rotate(-.48+Math.sin((.18-p.attackTimer)*10)*.18);path('M-1 -2 Q2 -7 5 -8 L31 -26 Q34 -27 32 -23 L8 -2 Q4 2 0 2Z','#bafcf1','#4ce6dc',1);ctx.shadowColor='#50fff0';ctx.shadowBlur=12;ctx.strokeStyle='#e7fffb';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(7,-4);ctx.lineTo(30,-24);ctx.stroke();ctx.shadowBlur=0;ctx.restore()}
 if(p.state==='dash'){ctx.globalAlpha=.3;path('M-20 -58 Q-37 -40 -27 -12 L-17 -9 L-13 -46Z','#50e8e0',null);ctx.globalAlpha=1}
 if(p.invuln>0&&Math.floor(time*20)%2===0){ctx.globalCompositeOperation='screen';ctx.fillStyle='#ff557a66';ctx.fillRect(-19,-90,42,90)}
 ctx.restore();
}
