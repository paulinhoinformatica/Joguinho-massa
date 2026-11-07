import{hookOrigin,hookInRange}from'./hook.js';
import{drawCombatDebug}from'./combat-debug.js';
// All procedural geometry in this module is PROTOTYPE FALLBACK presentation.
// Registered transparent PNG layers/tiles take precedence where configured.
import{buildMap,REGIONS,ROOM_W,GROUND,WORLD_W,WORLD_H,regionAt,assetRegionAt,MATRONA_ARENA}from'./map.js';import{renderEnemy}from'./enemies.js';import{renderBoss}from'./bosses.js';import{drawKael}from'./character-art.js';
const rand=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)};

export class World{constructor(layerRenderer=null){this.map=buildMap();this.time=0;this.layerRenderer=layerRenderer;this.rain=Array.from({length:120},(_,i)=>({x:rand(i+20)*1800,y:rand(i+70)*1000,speed:450+rand(i+100)*440}))}
 update(dt){this.time+=dt}
 draw(ctx,canvas,camera,state,enemies,rendering={}){const w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);ctx.imageSmoothingEnabled=false;const region=regionAt(state.player.x),offset=camera.x,regionId=assetRegionAt(state.player.x),assets=rendering.assets,layers=assets?.manifest.backgroundLayers[regionId]||[],hasBackground=layers.some(l=>assets.get(l.src));const sky=ctx.createLinearGradient(0,0,0,h);sky.addColorStop(0,region.id==='corporate'?'#12172d':'#101c28');sky.addColorStop(.68,regionId==='virus_core'?'#301928':region.color);sky.addColorStop(1,'#10181f');ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);if(hasBackground)this.layerRenderer?.draw(ctx,layers,camera,{width:w,height:h});else this.drawSkyline(ctx,w,h,offset,region);ctx.save();const wb=state.bosses.find(b=>b.assetId==='warden'&&b.active&&!b.dead),shake=wb?.wardenState==='transition'?3:(wb?.shake||0);const shakeX=Math.sin(this.time*97)*shake,shakeY=Math.cos(this.time*83)*shake*.5;ctx.translate(-camera.x+shakeX,-camera.y+shakeY);if(!hasBackground)this.drawBackStructures(ctx,offset,w,region);this.drawSector9(ctx,state);this.layerRenderer?.drawObjects(ctx,this.map.visuals||[],{x:0,y:0},{x:camera.x,y:camera.y,width:w,height:h});this.layerRenderer?.drawObjects(ctx,assets?.manifest.environmentObjects?.[regionId]||[],{x:0,y:0},{x:camera.x,y:camera.y,width:w,height:h});for(const p of this.map.platforms)this.drawPlatform(ctx,p,assets,regionId);this.drawHazards(ctx,state);this.drawHookPoints(ctx,state);this.drawTerminals(ctx,state);this.drawCheckpoints(ctx,state);this.drawSecrets(ctx,state);this.drawGates(ctx,state);this.drawNPCs(ctx,state,rendering.spriteRenderer,rendering.dt);for(const e of enemies)renderEnemy(ctx,e,{x:0,y:0},rendering.spriteRenderer,rendering.dt);for(const b of state.bosses)renderBoss(ctx,b,{x:0,y:0},rendering.spriteRenderer,rendering.dt);this.drawPlayer(ctx,state.player,rendering.spriteRenderer,rendering.dt);this.drawHookCable(ctx,state.player);rendering.effects?.draw(ctx,rendering.dt);ctx.restore();this.drawRain(ctx,w,h,offset);this.drawVignette(ctx,w,h);if(rendering.debugCombat)drawCombatDebug(ctx,state,enemies,{x:camera.x-shakeX,y:camera.y-shakeY},this.map)}
 drawSkyline(c,w,h,offset,region){c.fillStyle='#111923';for(let layer=0;layer<3;layer++){const parallax=offset*(.08+layer*.11),step=layer===0?200:120;for(let i=-2;i<w/step+3;i++){const wx=Math.floor(parallax/step)+i,x=i*step-(parallax%step),seed=rand(wx+layer*900),bh=layer===0?120+seed*260:90+seed*200,y=h-bh-(layer===0?100:layer===1?60:24);c.fillStyle=layer===0?'#151f2a':layer===1?'#1b2932':'#213039';c.fillRect(x,y,step-8,bh+40);if(layer===0&&region.id==='corporate'){c.strokeStyle='#495477';c.lineWidth=2;c.strokeRect(x+5,y+5,step-18,bh)}for(let wy=y+18;wy<h-25;wy+=15)for(let wx2=x+12;wx2<x+step-12;wx2+=18){const lit=rand(wx2*2+wy+layer)>.63;c.fillStyle=lit?(layer===0?'#74e8ec66':'#ff629955'):'#0c151c';c.fillRect(wx2,wy,5,7)}if(layer===2&&region.id==='slum'){c.fillStyle='#7d4048';c.fillRect(x+8,y-7,step-22,5);c.fillStyle='#42dfd0';c.fillRect(x+step*.55,y-26,3,20)}}}}
 drawBackStructures(c,offset,w,region){const start=Math.max(0,Math.floor(offset/300)-1),end=Math.min(WORLD_W/300,Math.ceil((offset+w)/300)+1);for(let i=start;i<end;i++){const x=i*300+70+rand(i)*70,base=GROUND-95-rand(i+4)*45;if(region.id==='slum'){c.fillStyle='#28363b';c.fillRect(x,base,155,90);c.fillStyle='#a24352';c.fillRect(x-8,base-8,171,10);for(let j=0;j<5;j++){c.fillStyle=j%2?'#7ae2d355':'#ee608044';c.fillRect(x+12+j*27,base+18,12,22)}c.strokeStyle='#111920';c.lineWidth=5;c.beginPath();c.moveTo(x+10,base+60);c.lineTo(x+150,base+60);c.stroke();c.fillStyle='#222e32';c.fillRect(x+25,base+90,4,25);c.fillRect(x+130,base+90,4,25)}else if(region.id==='corporate'&&x<REGIONS[2].x+1500){c.fillStyle='#293448';c.fillRect(x,base-120,175,220);c.fillStyle='#657ca0';c.fillRect(x+12,base-108,151,2);c.fillStyle='#8deafa';for(let j=0;j<7;j++)c.fillRect(x+18+j*19,base-85,9,130)}else if(region.id==='corporate'&&x>=REGIONS[2].x+1500){c.fillStyle='#3b2636';c.fillRect(x,base-60,180,160);for(let j=0;j<6;j++){c.fillStyle=j%2?'#d53570':'#622744';c.fillRect(x+j*30,base-75,12,170)}}else{c.fillStyle=region.id==='factory'?'#333536':'#1f3337';c.fillRect(x,base,170,100);c.fillStyle='#59605e';for(let j=0;j<4;j++)c.fillRect(x+25+j*36,base+15,20,58);c.fillStyle='#c2744e';c.fillRect(x+30,base-22,8,25);c.fillRect(x+135,base-34,8,37)}}}
 drawPlatform(c,p,assets,regionId){if(p.disabled){c.save();c.strokeStyle='#a65c4a66';c.setLineDash([4,5]);c.strokeRect(p.x,p.y,p.w,2);c.restore();return}const tile=assets?.get(assets.manifest.regionTiles?.[regionId]);if(tile){c.save();c.beginPath();c.rect(p.x,p.y,p.w,p.h);c.clip();for(let x=p.x;x<p.x+p.w;x+=tile.naturalWidth)c.drawImage(tile,x,p.y,tile.naturalWidth,p.h);c.restore();return}/* PROTOTYPE FALLBACK: replace with a transparent environment/platform PNG via the manifest. */c.fillStyle='#0d1419';c.fillRect(p.x,p.y,p.w,p.h);const base=p.kind==='ground'?'#38454a':p.kind==='roof'?'#593d39':p.kind==='glass'?'#4b6272':p.kind==='fleshmetal'?'#573445':p.kind==='pipe'?'#45605c':p.kind==='catwalk'?'#536066':p.kind==='walkway'?'#56504a':'#555b5a';c.fillStyle=base;c.fillRect(p.x,p.y,p.w,p.h);c.fillStyle=p.kind==='glass'?'#9adfe4':p.kind==='fleshmetal'?'#cf476f':p.kind==='roof'?'#e05a64':'#97a4a1';c.fillRect(p.x,p.y,p.w,4);if(p.kind==='unstable'){c.fillStyle=p.warning>0?'#ff4d52':'#d59d52';for(let x=p.x+5;x<p.x+p.w;x+=18)c.fillRect(x,p.y+4,8,3)}
c.fillStyle='#1b242a';for(let x=p.x+8;x<p.x+p.w-4;x+=40){c.fillRect(x,p.y+10,18,2);c.fillStyle='#b7c1bd';c.fillRect(x+2,p.y+7,3,3);c.fillStyle='#1b242a'}if(p.kind==='ground'){for(let x=p.x+10;x<p.x+p.w;x+=82){c.fillStyle='#293337';c.fillRect(x,p.y+28,34,10);c.fillStyle='#9c4a51';c.fillRect(x+4,p.y+30,26,3);c.fillStyle='#1c272c';c.fillRect(x+6,p.y+42,3,15)}}}
 drawHazards(c,state){for(const h of this.map.hazards){
 c.save();
 if(h.kind==='coolant'){
  c.fillStyle='#112d3b';c.fillRect(h.x-7,h.y-3,h.w+14,h.h+6);
  c.shadowColor='#28dfff';c.shadowBlur=14;c.fillStyle='#087fba';c.fillRect(h.x,h.y,h.w,h.h);
  c.shadowBlur=0;c.strokeStyle='#73f6ff';c.lineWidth=2;c.strokeRect(h.x,h.y,h.w,h.h);
  c.beginPath();for(let x=0;x<=h.w;x+=4){const y=h.y+6+Math.sin(x*.08+this.time*3)*2;if(x===0)c.moveTo(h.x+x,y);else c.lineTo(h.x+x,y)}c.stroke();
  for(let i=0;i<9;i++){const x=h.x+10+i*22,y=h.y+13-((this.time*9+i*3)%12);c.strokeStyle='#a5faff99';c.beginPath();c.arc(x,y,1.5+(i%2),0,Math.PI*2);c.stroke()}
  for(let x=h.x-6;x<h.x+h.w;x+=24){c.fillStyle='#edc25e';c.fillRect(x,h.y+h.h+4,12,4)}
  c.fillStyle='#324b56';c.fillRect(h.x+h.w-20,h.y-69,12,65);c.fillStyle='#55e7ff';c.fillRect(h.x+h.w-17,h.y-10,6,12);
  c.font='11px monospace';c.textAlign='center';c.fillStyle='#8af6ff';c.fillText('! REFRIGERANTE CONTAMINADO',h.x+h.w/2,h.y-42);c.fillText('CONTATO CAUSA DANO',h.x+h.w/2,h.y-26);
  const d=state.player.lastDamage;if(d?.source==='hazard_pool'&&(state.player.anim||0)-d.at<.4){c.fillStyle='#e1fcff88';c.fillRect(h.x,h.y,h.w,h.h)}
 }else if(h.kind==='press'){
  c.fillStyle='#606e78';c.fillRect(h.x,h.y,h.w,h.h);c.strokeStyle='#ff805d';c.lineWidth=2;c.strokeRect(h.x,h.y,h.w,h.h);
  c.fillStyle='#ffbc5b';for(let x=h.x;x<h.x+h.w-8;x+=16)c.fillRect(x,h.y,8,10);
  c.font='11px monospace';c.textAlign='center';c.fillText('! PRENSA ATIVA',h.x+h.w/2,h.y-12);
 }else{c.fillStyle=h.kind==='laser'?'#f4467e':h.kind==='virus'?'#b7449b':'#48c9a9';c.fillRect(h.x,h.y,h.w,h.h);c.globalAlpha=.27;c.fillRect(h.x,h.y-18,h.w,18)}
 c.restore();
 }}
 drawTerminals(c,state){for(const t of this.map.terminals){c.fillStyle='#131f26';c.fillRect(t.x-16,t.y-44,32,44);c.fillStyle=state.events.includes(t.id)?'#2a5a52':'#42606a';c.fillRect(t.x-12,t.y-39,24,30);c.fillStyle=state.events.includes(t.id)?'#58efc6':'#64ddeb';c.fillRect(t.x-7,t.y-34,14,3);c.fillRect(t.x-7,t.y-27,9,2);c.fillStyle='#d2b972';c.fillRect(t.x-20,t.y-4,40,4);if(Math.abs(state.player.x-t.x)<105&&Math.abs(state.player.y-t.y)<100){c.fillStyle='#d5f6ee';c.font='12px monospace';c.textAlign='center';c.fillText('E · LER',t.x,t.y-52)}}}
 drawCheckpoints(c,state){for(const cp of this.map.checkpoints){c.fillStyle='#17282e';c.fillRect(cp.x-19,GROUND-71,38,71);c.fillStyle=state.checkpoint.x===cp.x?'#65f0d6':'#71838b';c.fillRect(cp.x-13,GROUND-63,26,51);c.fillStyle='#f3bd68';c.fillRect(cp.x-5,GROUND-54,10,3);c.fillRect(cp.x-2,GROUND-39,4,20);if(Math.abs(state.player.x-cp.x)<115){c.fillStyle='#d5f6ee';c.font='12px monospace';c.textAlign='center';c.fillText('E · ABRIGO',cp.x,GROUND-82)}}}
 drawSector9(c,state){
  c.save();
  for(const s of this.map.platforms.filter(s=>s.x<1400&&s.y<700&&s.h<70)){
   c.fillStyle='#172930';c.fillRect(s.x+8,s.y+20,5,Math.min(180,GROUND-s.y-20));
  }
  const a=MATRONA_ARENA,active=state.bosses.some(b=>b.assetId==='matrona'&&b.active&&!b.dead);
  c.fillStyle='#10151e';c.fillRect(a.left-20,420,a.right-a.left+40,370);
  c.fillStyle='#253039';c.fillRect(a.left-20,418,a.right-a.left+40,12);
  for(let x=a.left+45;x<a.right;x+=140){
   c.fillStyle='#202b34';c.fillRect(x,480,80,115);c.fillStyle='#8b3345';c.fillRect(x+8,490,64,3);
   c.fillStyle='#4a5961';c.fillRect(x+12,514,46,2);c.fillRect(x+12,522,30,2);
  }
  for(const x of [a.left-12,a.right+4]){
   c.fillStyle='#4b5058';c.fillRect(x,520,12,270);
   c.fillStyle=active?'#ff354e':'#4ed8c9';c.fillRect(x+3,525,3,255);
   c.fillStyle='#ad4555';c.fillRect(x-5,512,22,5);
  }
  c.textAlign='center';c.font='15px monospace';c.fillStyle='#ac8592';
  c.fillText('CÂMARA DE CONTENÇÃO 09',(a.left+a.right)/2,458);
  c.font='9px monospace';c.fillStyle='#617884';c.fillText('AURORA DYNAMICS · QUARENTENA',(a.left+a.right)/2,476);
  c.textAlign='left';c.fillStyle='#5cbdc6';c.fillText('OFICINA / ABRIGO',1390,705);
  c.fillStyle='#91745e';c.fillText('TELHADOS ↑ · E: CONTROLE DA PONTE',830,365);
  const bridge=this.map.terminals.find(t=>t.id==='shortcut-sector9');
  if(bridge&&!state.events.includes(bridge.id)){c.strokeStyle='#4dc9d477';c.setLineDash([4,5]);c.strokeRect(bridge.shortcut.x,bridge.shortcut.y,bridge.shortcut.w,3)}
  c.restore();
 }
 drawHookPoints(c,state){
  for(const h of this.map.hookPoints){
   const ready=state.abilities.hook&&hookInRange(state.player,h),pulse=.55+.2*Math.sin(this.time*5);
   c.save();
   if(ready){c.shadowColor='#36e9ff';c.shadowBlur=14;c.strokeStyle='rgba(54,233,255,'+pulse+')';c.lineWidth=2;c.beginPath();c.arc(h.x,h.y,14,0,Math.PI*2);c.stroke()}
   c.fillStyle='#151e27';c.fillRect(h.x-10,h.y-5,20,12);
   c.fillStyle=ready?'#36e9ff':'#ba9a54';c.fillRect(h.x-6,h.y-3,12,5);
   c.fillStyle=ready?'#d8fcff':'#e4c47a';c.fillRect(h.x-2,h.y-1,4,2);c.restore();
  }
 }
 drawHookCable(c,p){
  if(p.dead||!p.hookCable||!(p.hookCableTimer>0))return;
  const a=hookOrigin(p),h=p.hookCable;
  c.save();c.globalAlpha=Math.min(1,p.hookCableTimer/.12);c.shadowColor='#36e9ff';c.shadowBlur=10;c.strokeStyle='#36dfff';c.lineWidth=3;
  c.beginPath();c.moveTo(a.x,a.y);c.lineTo(h.x,h.y);c.stroke();
  c.shadowBlur=0;c.strokeStyle='#d9ffff';c.lineWidth=1;c.stroke();c.restore();
 }
 drawNPCs(c,state,spriteRenderer,dt){for(const n of this.map.npcs){const x=Math.round(n.x),y=Math.round(n.y);n.spriteTarget||={x:n.x+14,y:n.y,facing:1};n.spriteTarget.x=n.x+14;n.spriteTarget.y=n.y;n.spriteTarget.facing=n.facing??n.defaultFacing??spriteRenderer?.assets.getConfig(n.assetId||'npc_survivor')?.facing??1;const drawn=spriteRenderer?.available(n.assetId||'npc_survivor','idle')&&spriteRenderer.draw(c,n.assetId||'npc_survivor','idle',n.spriteTarget,dt);if(!drawn){/* PROTOTYPE FALLBACK: replace with NPC PNGs registered in the manifest. */c.fillStyle='#070d12aa';c.fillRect(x-4,y-4,28,5);c.fillStyle='#172129';c.fillRect(x+4,y-43,20,39);c.fillStyle='#a9b4ac';c.fillRect(x+6,y-55,16,17);c.fillStyle=n.name.startsWith('Yara')?'#dc9658':n.name.startsWith('Nix')?'#72d3c6':'#aa83c6';c.fillRect(x+3,y-39,23,25);c.fillStyle='#56eee1';c.fillRect(x+8,y-35,4,4);c.fillRect(x+18,y-35,4,4);c.fillStyle='#28313a';c.fillRect(x+2,y-15,11,14);c.fillRect(x+17,y-15,11,14)}if(Math.hypot(n.x-state.player.x,n.y-state.player.y)<145){c.fillStyle='#dbebed';c.font='11px monospace';c.textAlign='center';c.fillText(n.name,x+15,y-78);c.fillText('E · FALAR',x+15,y-64)}}}
 drawSecrets(c,state){for(const s of this.map.secrets){if(state.items.includes(s.item))continue;c.fillStyle='#172129';c.fillRect(s.x-14,s.y-18,28,20);c.fillStyle='#55eee2';c.fillRect(s.x-10,s.y-14,20,4);c.fillStyle='#d8b85f';c.fillRect(s.x-3,s.y-8,6,7);if(Math.abs(state.player.x-s.x)<70)c.fillText('E',s.x,s.y-23)}}
 drawGates(c,state){
  for(const [i,id] of [[1,'boss-0'],[2,'boss-2']]){
   const open=state.bosses.some(b=>b.id===id&&b.dead),x=REGIONS[i].x-6;
   c.fillStyle=open?'#59f0e144':'#ff4d8d99';c.fillRect(x,GROUND-200,6,200);
   c.font='10px monospace';c.textAlign='right';c.fillStyle=open?'#59f0e1':'#ff9dbd';c.fillText(open?'ACESSO LIBERADO':i===1?'BLOQUEIO DE MATRONA':'CREDENCIAL DE WARDEN',x-10,GROUND-210);
  }
  for(const b of state.bosses)if(b.active&&!b.dead){c.fillStyle='#ff4d8d66';c.fillRect(b.arena.left,b.assetId==='matrona'?220:GROUND-220,4,b.assetId==='matrona'?GROUND-220:220);c.fillRect(b.arena.right,b.assetId==='matrona'?220:GROUND-220,4,b.assetId==='matrona'?GROUND-220:220)}
 }
 drawPlayer(c,p,spriteRenderer,dt){const animation={attack:p.attackAnimation||'melee',dash:'dodge',special:'special',jump:'jump',fall:'fall',landing:'landing',run:'run',walk:'walk',damage:'damage',death:'death'}[p.state]||'idle';p.externalAttackAnimation=p.state==='attack'&&!!spriteRenderer?.available('protagonist',animation);const drawn=spriteRenderer?.draw(c,'protagonist',animation,p,dt,{x:p.x+p.w/2,y:p.y+p.h,onEvent:name=>{p.animationEvent=name}});if(!drawn&&spriteRenderer?.assets.getConfig('protagonist')?.fallback?.procedural===true)drawKael(c,p,this.time)}
 drawRain(c,w,h,offset){c.strokeStyle='#7aafbf38';c.lineWidth=1;c.beginPath();for(const d of this.rain){const x=(d.x-offset*.8+w*4)%(w+30),y=(d.y+this.time*d.speed)%(h+20);c.moveTo(x,y);c.lineTo(x-5,y+13)}c.stroke()}
 drawVignette(c,w,h){const g=c.createRadialGradient(w/2,h/2,h*.2,w/2,h/2,h*.75);g.addColorStop(0,'#0000');g.addColorStop(1,'#050a10bb');c.fillStyle=g;c.fillRect(0,0,w,h)}
}
