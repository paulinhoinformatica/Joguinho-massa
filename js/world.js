export const TILE=24,MAP_W=96,MAP_H=72,WORLD_W=TILE*MAP_W,WORLD_H=TILE*MAP_H;
const hash=(x,y)=>{let n=(x*374761393+y*668265263)|0;n=(n^(n>>>13))*1274126177;return((n^(n>>>16))>>>0)/4294967295};
const center=n=>n*TILE+TILE/2;

// A contiguous world: the village is central, with three gated routes to wild regions.
export function zoneAt(x,y){const tx=Math.floor(x/TILE),ty=Math.floor(y/TILE);if(tx>=12&&tx<=47&&ty>=24&&ty<=57)return'Vila de Lume';if(tx>11&&tx<49&&ty<24)return'Floresta';if(tx>47&&ty>=24&&ty<60)return'Lago e Pedras';if(tx<12&&ty>=24&&ty<59)return'Pradaria';return'Pradaria'}

export const BUILDINGS=[
 {id:'researcher-home',name:'Casa da Investigadora',sprite:5,x:23,y:29,w:5,h:5,doorX:25,doorY:33},
 {id:'clinic',name:'Centro de Vínculo',sprite:4,x:32,y:29,w:6,h:6,doorX:35,doorY:34},
 {id:'item-shop',name:'Loja do Tomás',sprite:3,x:41,y:33,w:5,h:5,doorX:43,doorY:37},
 {id:'inn',name:'Estalagem da Lua Baixa',sprite:6,x:17,y:40,w:6,h:6,doorX:20,doorY:45},
 {id:'workshop',name:'Oficina da Bruna',sprite:8,x:14,y:29,w:5,h:5,doorX:16,doorY:33},
 {id:'family-home',name:'Casa dos Vale',sprite:2,x:24,y:47,w:5,h:5,doorX:26,doorY:51},
 {id:'small-home',name:'Casa de Nilo',sprite:0,x:38,y:47,w:4,h:5,doorX:39,doorY:51},
 {id:'warehouse',name:'Armazém da Vila',sprite:7,x:16,y:50,w:5,h:5,doorX:18,doorY:54},
 {id:'old-house',name:'Casa Abandonada',sprite:9,x:42,y:47,w:5,h:5,doorX:44,doorY:51}
];
for(const b of BUILDINGS)b.sortY=(b.y+b.h)*TILE;

export const NPCS=[
 {id:'lira',name:'Investigadora Lira',x:center(25),y:center(32),kind:'lira',color:'#d2a86b'},
 {id:'healer',name:'Guardiã do Centro',x:center(35),y:center(32),kind:'healer',color:'#e8b477'},
 {id:'tomas',name:'Tomás, o boticário',x:center(43),y:center(36),kind:'shop',color:'#b6c58e'},
 {id:'dalia',name:'Dália, estalajadeira',x:center(20),y:center(44),kind:'inn',color:'#d89775'},
 {id:'bruna',name:'Bruna, artesã',x:center(16),y:center(32),kind:'workshop',color:'#9fb8b0'},
 {id:'market',name:'Banca de provisões',x:center(30),y:center(43),kind:'market',color:'#d9bd77'},
 {id:'iara',name:'Guardiã Iara',x:center(32),y:center(20),kind:'trainer',color:'#85bd9c'},
 {id:'west-sign',name:'Saída para a Pradaria',x:center(12),y:center(43),kind:'sign',color:'#d9bb76'},
 {id:'north-sign',name:'Trilho da Floresta',x:center(35),y:center(24),kind:'sign',color:'#d9bb76'},
 {id:'east-sign',name:'Caminho do Lago',x:center(47),y:center(43),kind:'sign',color:'#d9bb76'},
 {id:'mara',name:'Mara do Véu',x:center(61),y:center(53),kind:'antagonist',color:'#a48bc4'}
];
for(const n of NPCS)n.sortY=n.y+12;

const palette={grass:['#547447','#5c7d4d','#607e50','#4e7046'],flowers:['#5b7d4c','#63834e'],tallgrass:['#507346','#5b7b49'],stonepath:['#a99a78','#b3a17b'],dirtpath:['#9a805d','#a68b64'],sand:['#bdad7a','#c9b987'],water:['#377d85','#438c92'],rock:['#777764','#8b846a'],mountain:['#58625a','#667067']};
const gateAt=(x,y)=>((x===12&&y>=42&&y<=44)||(x===47&&y>=42&&y<=44)||(y===24&&x>=34&&x<=36)||(y===57&&x>=30&&x<=32));
function isFenceAt(x,y){if((x===12||x===47)&&y>=25&&y<57&&!gateAt(x,y))return true;if(y===24&&x>=13&&x<47&&!gateAt(x,y))return true;if(y===57&&x>=13&&x<47&&!gateAt(x,y))return true;return false}
function buildingAt(x,y){for(const b of BUILDINGS){if(x<b.x||x>=b.x+b.w||y<b.y||y>=b.y+b.h)continue;if(x===b.doorX&&y===b.doorY)return null;const edge=x===b.x||x===b.x+b.w-1||y===b.y||y===b.y+b.h-1;return edge?b:null}return null}

export function terrainAt(tx,ty){if(tx<0||ty<0||tx>=MAP_W||ty>=MAP_H)return'mountain';const region=zoneAt(tx*TILE+12,ty*TILE+12),r=hash(tx,ty);if(tx===0||ty===0||tx===MAP_W-1||ty===MAP_H-1)return'mountain';
 if(region==='Vila de Lume'){
   const lane=Math.abs(tx-(31+Math.round(Math.sin(ty*.32)*2)))<=0;
   if((lane&&ty>=23&&ty<58)||(tx>=12&&tx<=24&&ty===43)||(tx>=30&&tx<=47&&ty===43)||(tx===25&&ty>=33&&ty<=43)||(tx===35&&ty>=34&&ty<=43)||(tx===43&&ty>=37&&ty<=43)||(tx>=28&&tx<=38&&ty>=39&&ty<=46))return'stonepath';
   if(tx>=30&&tx<=32&&ty>=54&&ty<=57)return'dirtpath';
   if((tx===12&&ty>=39&&ty<=48)||(tx===47&&ty>=39&&ty<=48)||(ty>=22&&ty<=26&&tx>=32&&tx<=38))return'dirtpath';
   if(BUILDINGS.some(b=>tx>b.x&&tx<b.x+b.w-1&&ty>b.y&&ty<b.y+b.h-1)||BUILDINGS.some(b=>tx===b.doorX&&ty===b.doorY))return'stonepath';
   if(r<.12)return'flowers';return'grass'
 }
 if(region==='Pradaria'){if(ty===43&&tx<15)return'dirtpath';if(r<.12)return'flowers';if(r<.29)return'tallgrass';if(r<.33)return'rock';return'grass'}
 if(region==='Floresta'){const trail=34+Math.round(Math.sin(ty*.29)*5);if((ty===23&&tx>=34&&tx<=36)||(ty>1&&ty<27&&Math.abs(tx-trail)<=1))return'dirtpath';if(r<.32)return'tree';if(r<.39)return'flowers';if(r<.45)return'tallgrass';return'grass'}
 if(region==='Lago e Pedras'){if(ty===43&&tx>=48&&tx<=51)return'dirtpath';const dx=(tx-59)/11,dy=(ty-42)/8,d=dx*dx+dy*dy;if(d<.47)return'water';if(d<.68)return'sand';if(r<.18)return'rock';if(r<.24)return'tree';if(r<.31)return'tallgrass';return'grass'}
 return'grass'
}

export function isSolid(tx,ty){if(tx<1||ty<1||tx>=MAP_W-1||ty>=MAP_H-1)return true;if(['mountain','rock','water','tree'].includes(terrainAt(tx,ty)))return true;if(isFenceAt(tx,ty))return true;return !!buildingAt(tx,ty)}

const decor=[];
for(const [type,x,y] of [['fountain',32,42],['bench',29,44],['bench',36,44],['lamp',27,40],['lamp',38,40],['lamp',27,46],['lamp',39,46],['barrel',45,38],['barrel',46,38],['sign',12,43],['gate-west',12,43],['gate-east',47,43],['gate-north',35,24],['gate-south',31,57],['well',22,43],['training-dummy',35,20],['market-stall',30,41],['market-stall',32,41],['garden',25,44],['garden',40,44],['bridge',48,43],['cache',7,45]])decor.push({type,x,y,sortY:(y+0.5)*TILE});
for(let y=25;y<57;y++){if(y<42||y>44)decor.push({type:'fence',x:12,y,sortY:(y+1)*TILE});if(y<42||y>44)decor.push({type:'fence',x:47,y,sortY:(y+1)*TILE})}
for(let x=13;x<47;x++)if(x<34||x>36)decor.push({type:'fence',x,y:24,sortY:25*TILE});
for(let x=13;x<47;x++)if(x<30||x>32)decor.push({type:'fence',x,y:57,sortY:58*TILE});

export class World{
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.camera={x:0,y:0};this.time=0;this.houseAtlas=null;this.queue=[];this.playerActor={kind:'player',sortY:0};this.treeCache=[];this.loadAssets();this.buildTreeCache()}
 loadAssets(){if(typeof Image==='undefined')return;const img=new Image();img.onload=()=>{this.houseAtlas=img};img.src=new URL('../assets/sprites/houses/village-houses.svg',import.meta.url).href}
 buildTreeCache(){for(let y=1;y<MAP_H-1;y++)for(let x=1;x<MAP_W-1;x++){const t=terrainAt(x,y);if(zoneAt(x*TILE+12,y*TILE+12)!=='Vila de Lume'&&(t==='tree'||t==='rock'))this.treeCache.push({kind:t,x:x*TILE+12,y:y*TILE+12,sortY:(y+1)*TILE,seed:hash(x,y)})}}
 resize(){const dpr=Math.min(devicePixelRatio||1,2),r=this.canvas.getBoundingClientRect();if(!r.width||!r.height)return;const w=Math.round(r.width*dpr),h=Math.round(r.height*dpr);if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h}}
 draw(state,dt){this.resize();const c=this.ctx,scale=this.canvas.width/this.canvas.clientWidth||1,vw=this.canvas.clientWidth,vh=this.canvas.clientHeight;this.time+=dt;c.setTransform(scale,0,0,scale,0,0);this.camera.x=Math.max(0,Math.min(WORLD_W-vw,state.player.x-vw/2));this.camera.y=Math.max(0,Math.min(WORLD_H-vh,state.player.y-vh/2));c.clearRect(0,0,vw,vh);
   const x0=Math.max(0,Math.floor(this.camera.x/TILE)-1),y0=Math.max(0,Math.floor(this.camera.y/TILE)-1),x1=Math.min(MAP_W-1,Math.ceil((this.camera.x+vw)/TILE)+1),y1=Math.min(MAP_H-1,Math.ceil((this.camera.y+vh)/TILE)+1);
   for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++)this.drawGround(c,tx,ty,tx*TILE-this.camera.x,ty*TILE-this.camera.y);
   this.queue.length=0;const left=this.camera.x-180,right=this.camera.x+vw+180,top=this.camera.y-180,bottom=this.camera.y+vh+180;
   for(const b of BUILDINGS)if((b.x+b.w)*TILE>left&&b.x*TILE<right&&(b.y+b.h)*TILE>top&&b.y*TILE<bottom)this.queue.push(b);
   for(const n of NPCS)if(n.x>left&&n.x<right&&n.y>top&&n.y<bottom)this.queue.push(n);
   for(const d of decor)if(d.x*TILE>left&&d.x*TILE<right&&d.y*TILE>top&&d.y*TILE<bottom)this.queue.push(d);
   for(const tree of this.treeCache)if(tree.x>left&&tree.x<right&&tree.y>top&&tree.y<bottom)this.queue.push(tree);
   this.playerActor.x=state.player.x;this.playerActor.y=state.player.y;this.playerActor.sortY=state.player.y+8;this.playerActor.direction=state.player.direction||'down';this.queue.push(this.playerActor);this.queue.sort((a,b)=>a.sortY-b.sortY);
   for(const item of this.queue)this.drawEntity(c,item,state);
 }
 drawGround(c,tx,ty,x,y){const t=terrainAt(tx,ty),ground=(t==='tree'||t==='rock')?'grass':t,r=hash(tx,ty);c.fillStyle=palette[ground][Math.floor(r*palette[ground].length)];c.fillRect(x,y,TILE+1,TILE+1);c.fillStyle='#18251a22';c.fillRect(x,y+TILE-2,TILE,2);
   if(t==='grass'&&r>.43){c.fillStyle='#91a96a';c.fillRect(x+4+(r*13|0),y+7,2,4);c.fillRect(x+16,y+15+(r*3|0),2,3)}
   if(t==='flowers'){c.fillStyle='#e3cd7c';c.fillRect(x+5,y+8,3,3);c.fillStyle='#d88b8c';c.fillRect(x+16,y+14,3,3);c.fillStyle='#f3e8b3';c.fillRect(x+10,y+19,2,2)}
   if(t==='tallgrass'){c.fillStyle='#8eaa5e';for(let i=0;i<4;i++){const px=x+3+((r*97+i*31)%18);c.beginPath();c.moveTo(px,y+22);c.lineTo(px+2,y+10+(i%2)*3);c.lineTo(px+4,y+22);c.fill()}}
   if(t==='stonepath'||t==='dirtpath'){c.fillStyle=t==='stonepath'?'#d0bd92':'#c2a477';for(let i=0;i<3;i++)c.fillRect(x+3+((i*7+(r*5|0))%16),y+4+i*6,4,2)}
   if(t==='sand'){c.fillStyle='#e4d39d';c.fillRect(x+4,y+7,5,2);c.fillRect(x+15,y+17,4,2)}
   if(t==='water'){c.fillStyle='#8fc6b1aa';c.fillRect(x+4+(r*8|0),y+6,7,1);c.fillRect(x+13,y+17,5,1)}
 }
 drawEntity(c,o,state){let sx,sy;if(o.sprite!==undefined){sx=(o.x+o.w/2)*TILE-this.camera.x;sy=(o.y+o.h)*TILE-this.camera.y}else if(o.kind){sx=o.x-this.camera.x;sy=o.y-this.camera.y}else{sx=(o.x+.5)*TILE-this.camera.x;sy=(o.y+.5)*TILE-this.camera.y}
   if(o.kind==='tree'){this.drawTree(c,sx,sy,o.seed);return}if(o.kind==='rock'){this.drawRock(c,sx,sy,o.seed);return}
   if(o.sprite!==undefined){const inside=state.player.x>=o.x*TILE&&state.player.x<(o.x+o.w)*TILE&&state.player.y>=o.y*TILE&&state.player.y<(o.y+o.h)*TILE;c.save();if(inside)c.globalAlpha=.38;this.drawBuilding(c,o,sx,sy);c.restore();return}
   if(o.kind==='sign'){this.drawProp(c,'sign',sx,sy,o);if(Math.hypot(o.x-state.player.x,o.y-state.player.y)<72){c.fillStyle='#fff2d9';c.font='10px sans-serif';c.textAlign='center';c.fillText(o.name,sx,sy-25)}return}
   if(o.kind==='player'||o.kind==='lira'||o.kind==='healer'||o.kind==='shop'||o.kind==='inn'||o.kind==='workshop'||o.kind==='market'||o.kind==='trainer'||o.kind==='antagonist'){this.drawCharacter(c,sx,sy,o);if(o.kind!=='player'&&Math.hypot(o.x-state.player.x,o.y-state.player.y)<72){c.fillStyle='#fff2d9';c.font='10px sans-serif';c.textAlign='center';c.fillText(o.name,sx,sy-23)}return}
   this.drawProp(c,o.type,sx,sy,o);
 }
 drawBuilding(c,b,sx,sy){const w=140,h=150,left=sx-w/2,top=sy-h+10;if(this.houseAtlas){const col=b.sprite%5,row=Math.floor(b.sprite/5);c.drawImage(this.houseAtlas,col*160,row*160,160,160,left,top,w,h)}else this.drawBuildingFallback(c,b,left,top,w,h)}
 drawBuildingFallback(c,b,x,y,w,h){c.fillStyle='#17261b66';c.beginPath();c.ellipse(x+w/2,y+h-4,w*.46,12,0,0,Math.PI*2);c.fill();c.fillStyle='#766b56';c.fillRect(x+25,y+73,w-48,54);c.fillStyle='#cfb58b';c.fillRect(x+30,y+56,w-52,61);c.fillStyle='#443528';c.beginPath();c.moveTo(x+16,y+65);c.lineTo(x+w/2,y+20);c.lineTo(x+w-12,y+59);c.lineTo(x+w-22,y+75);c.lineTo(x+w/2,y+43);c.lineTo(x+26,y+79);c.closePath();c.fill();c.fillStyle='#4b3527';c.fillRect(x+w/2-10,y+87,20,40)}
 drawTree(c,x,y,seed){const scale=seed>.78?1.2:seed<.22?.78:1;c.fillStyle='#17271d77';c.beginPath();c.ellipse(x,y+2,14*scale,6*scale,0,0,Math.PI*2);c.fill();c.fillStyle='#493b2c';c.fillRect(x-4*scale,y-22*scale,8*scale,25*scale);c.fillStyle=seed>.5?'#345b39':'#3f6940';c.fillRect(x-16*scale,y-45*scale,32*scale,27*scale);c.fillStyle='#527a45';c.fillRect(x-11*scale,y-53*scale,25*scale,20*scale);c.fillStyle='#759255';c.fillRect(x-7*scale,y-49*scale,8*scale,5*scale);c.fillStyle='#263f2d';c.fillRect(x+8*scale,y-37*scale,7*scale,14*scale)}
 drawRock(c,x,y,seed){const w=10+(seed*10|0),h=8+(seed*8|0);c.fillStyle='#17251b77';c.beginPath();c.ellipse(x,y+3,w+2,5,0,0,Math.PI*2);c.fill();c.fillStyle='#777563';c.beginPath();c.moveTo(x-w,y);c.lineTo(x-w*.6,y-h);c.lineTo(x+w*.15,y-h*1.2);c.lineTo(x+w,y-h*.35);c.lineTo(x+w*.8,y+2);c.closePath();c.fill();c.fillStyle='#aaa087';c.beginPath();c.moveTo(x-w*.6,y-h);c.lineTo(x+w*.15,y-h*1.2);c.lineTo(x+w*.1,y-h*.35);c.lineTo(x-w*.48,y-h*.25);c.closePath();c.fill()}
 drawCharacter(c,x,y,o){y-=Math.sin(this.time*4+(o.x||0)*.01)*.8;c.fillStyle='#15221a66';c.beginPath();c.ellipse(x,y+4,9,4,0,0,Math.PI*2);c.fill();const coat=o.kind==='player'?'#345174':o.color||'#78906c';c.fillStyle='#302a25';c.fillRect(x-5,y-19,10,21);c.fillStyle=coat;c.fillRect(x-7,y-16,14,15);c.fillStyle='#d7b78d';c.fillRect(x-5,y-27,10,10);c.fillStyle=o.kind==='player'?'#6d5134':'#493a2e';c.fillRect(x-6,y-30,12,5);c.fillStyle='#342c25';c.fillRect(x-3,y-23,2,2);c.fillRect(x+2,y-23,2,2);c.fillStyle='#c9b47e';c.fillRect(x-6,y-3,4,4);c.fillRect(x+2,y-3,4,4);if(o.kind==='healer'){c.fillStyle='#f2e5c9';c.fillRect(x-2,y-14,4,10);c.fillRect(x-5,y-11,10,4)}}
 drawProp(c,type,x,y,o){c.fillStyle='#18251c66';c.beginPath();c.ellipse(x,y+3,10,4,0,0,Math.PI*2);c.fill();if(type==='lamp'||type.startsWith('gate')){const glow=c.createRadialGradient(x,y-18,1,x,y-18,23);glow.addColorStop(0,'#f2c96b55');glow.addColorStop(1,'#f2c96b00');c.fillStyle=glow;c.fillRect(x-23,y-41,46,46);c.fillStyle='#513b29';c.fillRect(x-3,y-26,6,29);c.fillRect(x-8,y-25,16,3);c.fillStyle='#e8b85e';c.fillRect(x-4,y-22,8,9);c.fillStyle='#fff0a0';c.fillRect(x-2,y-20,4,5);if(type.startsWith('gate')){c.fillStyle='#553b27';c.fillRect(x-20,y-42,5,42);c.fillRect(x+15,y-42,5,42);c.fillRect(x-20,y-42,40,5);c.fillRect(x-15,y-36,4,33);c.fillRect(x+11,y-36,4,33)}return}
   if(type==='bench'){c.fillStyle='#765334';c.fillRect(x-12,y-7,24,5);c.fillRect(x-10,y-2,3,7);c.fillRect(x+7,y-2,3,7);c.fillStyle='#493522';c.fillRect(x-12,y-12,24,3);return}
   if(type==='barrel'){c.fillStyle='#744b2e';c.fillRect(x-7,y-13,14,15);c.fillStyle='#b28753';c.fillRect(x-8,y-12,16,3);c.fillRect(x-8,y-2,16,3);c.fillStyle='#4a3423';c.fillRect(x-1,y-10,2,9);return}
   if(type==='fountain'||type==='well'){c.fillStyle='#746e5e';c.fillRect(x-12,y-8,24,10);c.fillStyle='#55939a';c.fillRect(x-8,y-7,16,5);c.fillStyle='#c2b38d';c.fillRect(x-13,y-11,26,4);if(type==='fountain'){c.fillRect(x-3,y-18,6,8);c.fillStyle='#91c2ad';c.fillRect(x-2,y-23,4,5)}return}
   if(type==='fence'){c.fillStyle='#60452d';c.fillRect(x-2,y-13,4,16);c.fillRect(x-10,y-10,20,3);c.fillRect(x-10,y-4,20,3);return}
   if(type==='market-stall'){c.fillStyle='#765536';c.fillRect(x-13,y-12,26,14);c.fillStyle='#9c5344';c.beginPath();c.moveTo(x-16,y-12);c.lineTo(x,y-25);c.lineTo(x+16,y-12);c.closePath();c.fill();c.fillStyle='#dfbd76';c.fillRect(x-10,y-10,20,3);return}
   if(type==='garden'){c.fillStyle='#407344';c.fillRect(x-11,y-8,22,8);c.fillStyle='#e2ca75';c.fillRect(x-7,y-11,3,3);c.fillStyle='#e3a0a0';c.fillRect(x+3,y-12,3,3);return}
   if(type==='training-dummy'){c.fillStyle='#6e4c30';c.fillRect(x-2,y-23,4,25);c.fillRect(x-10,y-19,20,4);c.fillStyle='#b5935c';c.fillRect(x-6,y-17,12,10);return}
   if(type==='bridge'){c.fillStyle='#785432';c.fillRect(x-13,y-5,26,9);for(let i=-9;i<12;i+=6)c.fillRect(x+i,y-5,2,9);return}
   if(type==='sign'){c.fillStyle='#553c28';c.fillRect(x-2,y-16,4,19);c.fillStyle='#bd9662';c.fillRect(x-11,y-22,22,9);c.fillStyle='#483523';c.fillRect(x-7,y-19,14,2);return}
   if(type==='cache'){c.fillStyle='#6e4a2c';c.fillRect(x-8,y-9,16,11);c.fillStyle='#d1aa65';c.fillRect(x-9,y-12,18,4);c.fillStyle='#f3d88b';c.fillRect(x-2,y-8,4,4);return}
 }
 nearestNpc(x,y){return NPCS.map(n=>({n,d:Math.hypot(n.x-x,n.y-y)})).filter(a=>a.d<40).sort((a,b)=>a.d-b.d)[0]?.n||null}
}
