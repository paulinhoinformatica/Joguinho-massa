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
 {id:'market',name:'Banca de provisões',x:center(30),y:center(43),kind:'market',color:'#d9bd77'},
 {id:'iara',name:'Guardiã Iara',x:center(32),y:center(20),kind:'trainer',color:'#85bd9c'},
 {id:'west-sign',name:'Saída para a Pradaria',x:center(12),y:center(43),kind:'sign',color:'#d9bb76'},
 {id:'north-sign',name:'Trilho da Floresta',x:center(35),y:center(24),kind:'sign',color:'#d9bb76'},
 {id:'east-sign',name:'Caminho do Lago',x:center(47),y:center(43),kind:'sign',color:'#d9bb76'},
 {id:'mara',name:'Mara do Véu',x:center(61),y:center(53),kind:'antagonist',color:'#a48bc4'}
];
for(const n of NPCS)n.sortY=n.y+12;

const palette={grass:['#547447','#5c7d4d','#607e50','#4e7046'],forest:['#405c40','#496444','#455b3b','#506748'],pebble:['#777969','#898775','#706f62'],flowers:['#5b7d4c','#63834e'],tallgrass:['#507346','#5b7b49'],stonepath:['#a99a78','#b3a17b'],dirtpath:['#9a805d','#a68b64'],sand:['#bdad7a','#c9b987'],water:['#377d85','#438c92'],rock:['#777764','#8b846a'],mountain:['#58625a','#667067']};
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
 if(region==='Pradaria'){if(ty===43&&tx<15)return'dirtpath';if(r<.12)return'flowers';if(r<.30)return'tallgrass';if(r<.315)return'rock';return'grass'}
 if(region==='Floresta'){const trail=34+Math.round(Math.sin(ty*.29)*5);if((ty===23&&tx>=34&&tx<=36)||(ty>1&&ty<27&&Math.abs(tx-trail)<=1))return'dirtpath';if(r<.28)return'tree';if(r<.34)return'flowers';if(r<.43)return'tallgrass';return'forest'}
 if(region==='Lago e Pedras'){if(ty===43&&tx>=48&&tx<=51)return'dirtpath';const dx=(tx-59)/11,dy=(ty-42)/8,d=dx*dx+dy*dy;if(d<.47)return'water';if(d<.68)return'sand';if(r<.055)return'rock';if(r<.12)return'tree';if(r<.22)return'tallgrass';return r<.36?'pebble':'grass'}
 return'grass'
}

export function isSolid(tx,ty){if(tx<1||ty<1||tx>=MAP_W-1||ty>=MAP_H-1)return true;if(['mountain','water','tree'].includes(terrainAt(tx,ty)))return true;if(isFenceAt(tx,ty))return true;return !!buildingAt(tx,ty)}

export const INTERIORS={
 'researcher-home':{name:'Casa da Investigadora',npc:{name:'Investigadora Lira',kind:'lira',color:'#d2a86b',x:8,y:4},furniture:['desk','shelf','plant']},
 clinic:{name:'Centro de Vínculo',npc:{name:'Guardiã do Centro',kind:'healer',color:'#e8b477',x:8,y:4},furniture:['counter','healing']},
 'item-shop':{name:'Loja do Tomás',npc:{name:'Tomás, o boticário',kind:'shop',color:'#b6c58e',x:8,y:4},furniture:['counter','shelf']},
 inn:{name:'Estalagem da Lua Baixa',npc:{name:'Dália, estalajadeira',kind:'inn',color:'#d89775',x:8,y:4},furniture:['counter','bed','table']},
 workshop:{name:'Oficina da Bruna',npc:{name:'Bruna, artesã',kind:'workshop',color:'#9fb8b0',x:8,y:4},furniture:['counter','anvil']},
 'family-home':{name:'Casa dos Vale',npc:{name:'Nilo',kind:'villager',color:'#a5ae78',x:8,y:4},furniture:['bed','table'],cache:{x:12,y:7,item:'Elixir de Orvalho'}},
 'small-home':{name:'Casa de Nilo',npc:{name:'Mira',kind:'villager',color:'#d7a182',x:8,y:4},furniture:['bed','plant']},
 warehouse:{name:'Armazém da Vila',npc:{name:'Armazém vazio',kind:'villager',color:'#a98963',x:8,y:4},furniture:['shelf','barrel'],cache:{x:12,y:7,item:'Cápsula de Bruma'}},
 'old-house':{name:'Casa Abandonada',npc:{name:'',kind:'none',x:8,y:4},furniture:['broken','shelf'],cache:{x:12,y:7,item:'Cápsula Lunar'}}
};

const decor=[];
for(const [type,x,y] of [['fountain',32,42],['bench',29,44],['bench',36,44],['lamp',27,40],['lamp',38,40],['lamp',27,46],['lamp',39,46],['barrel',45,38],['barrel',46,38],['sign',12,43],['gate-west',12,43],['gate-east',47,43],['gate-north',35,24],['gate-south',31,57],['well',22,43],['training-dummy',35,20],['market-stall',30,41],['market-stall',32,41],['garden',25,44],['garden',40,44],['bridge',48,43],['cache',7,45]])decor.push({type,x,y,sortY:(y+0.5)*TILE});
for(let y=25;y<57;y++){if(y<42||y>44)decor.push({type:'fence',x:12,y,sortY:(y+1)*TILE});if(y<42||y>44)decor.push({type:'fence',x:47,y,sortY:(y+1)*TILE})}
for(let x=13;x<47;x++)if(x<34||x>36)decor.push({type:'fence',x,y:24,sortY:25*TILE});
for(let x=13;x<47;x++)if(x<30||x>32)decor.push({type:'fence',x,y:57,sortY:58*TILE});

export class World{
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.camera={x:0,y:0};this.time=0;this.queue=[];this.playerActor={kind:'player',sortY:0};this.treeCache=[];this.buildTreeCache()}
 buildTreeCache(){for(let y=1;y<MAP_H-1;y++)for(let x=1;x<MAP_W-1;x++){const t=terrainAt(x,y);if(zoneAt(x*TILE+12,y*TILE+12)!=='Vila de Lume'&&(t==='tree'||t==='rock'))this.treeCache.push({kind:t,x:x*TILE+12,y:y*TILE+12,sortY:(y+1)*TILE,seed:hash(x,y)})}}
 resize(){const dpr=Math.min(devicePixelRatio||1,2),r=this.canvas.getBoundingClientRect();if(!r.width||!r.height)return;const w=Math.round(r.width*dpr),h=Math.round(r.height*dpr);if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h}}
 draw(state,dt){this.resize();const c=this.ctx,scale=this.canvas.width/this.canvas.clientWidth||1,vw=this.canvas.clientWidth,vh=this.canvas.clientHeight;this.time+=dt;c.setTransform(scale,0,0,scale,0,0);if(state.interior){this.drawInterior(state,vw,vh);return}this.camera.x=Math.max(0,Math.min(WORLD_W-vw,state.player.x-vw/2));this.camera.y=Math.max(0,Math.min(WORLD_H-vh,state.player.y-vh/2));c.clearRect(0,0,vw,vh);
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
 drawGround(c,tx,ty,x,y){const t=terrainAt(tx,ty),region=zoneAt(tx*TILE+12,ty*TILE+12),ground=t==='tree'||t==='rock'?(region==='Floresta'?'forest':'grass'):t,r=hash(tx,ty);c.fillStyle=palette[ground][Math.floor(r*palette[ground].length)];c.fillRect(x,y,TILE+1,TILE+1);c.fillStyle='#18251a22';c.fillRect(x,y+TILE-2,TILE,2);
   if(t==='grass'&&r>.43){c.fillStyle='#91a96a';c.fillRect(x+4+(r*13|0),y+7,2,4);c.fillRect(x+16,y+15+(r*3|0),2,3)}
   if(t==='flowers'){c.fillStyle='#e3cd7c';c.fillRect(x+5,y+8,3,3);c.fillStyle='#d88b8c';c.fillRect(x+16,y+14,3,3);c.fillStyle='#f3e8b3';c.fillRect(x+10,y+19,2,2)}
   if(t==='tallgrass'){c.fillStyle='#345d37';c.fillRect(x+1,y+16,TILE-2,7);c.fillStyle='#9ebd64';for(let i=0;i<5;i++){const px=x+2+((r*97+i*31)%19);c.beginPath();c.moveTo(px,y+23);c.lineTo(px+2,y+7+(i%3)*3);c.lineTo(px+5,y+23);c.fill()}c.fillStyle='#c7d982';c.fillRect(x+6,y+12,2,3);c.fillRect(x+17,y+9,2,3)}
   if(t==='stonepath'||t==='dirtpath'){c.fillStyle=t==='stonepath'?'#d0bd92':'#c2a477';for(let i=0;i<3;i++)c.fillRect(x+3+((i*7+(r*5|0))%16),y+4+i*6,4,2)}
   if(t==='sand'){c.fillStyle='#e4d39d';c.fillRect(x+4,y+7,5,2);c.fillRect(x+15,y+17,4,2)}
   if(t==='water'){c.fillStyle='#8fc6b1aa';c.fillRect(x+4+(r*8|0),y+6,7,1);c.fillRect(x+13,y+17,5,1)}
 }
 drawEntity(c,o,state){let sx,sy;if(o.sprite!==undefined){sx=(o.x+o.w/2)*TILE-this.camera.x;sy=(o.y+o.h)*TILE-this.camera.y}else if(o.kind){sx=o.x-this.camera.x;sy=o.y-this.camera.y}else{sx=(o.x+.5)*TILE-this.camera.x;sy=(o.y+.5)*TILE-this.camera.y}
   if(o.kind==='tree'){this.drawTree(c,sx,sy,o.seed);return}if(o.kind==='rock'){this.drawRock(c,sx,sy,o.seed);return}
   if(o.sprite!==undefined){const inside=state.player.x>=o.x*TILE&&state.player.x<(o.x+o.w)*TILE&&state.player.y>=o.y*TILE&&state.player.y<(o.y+o.h)*TILE;c.save();if(inside)c.globalAlpha=.38;this.drawBuilding(c,o,sx,sy);c.restore();const dx=(o.doorX+.5)*TILE-this.camera.x,dy=(o.doorY+1)*TILE-this.camera.y;if(Math.hypot(dx-(state.player.x-this.camera.x),dy-(state.player.y-this.camera.y))<52){c.fillStyle='#fff1d1';c.font='bold 10px sans-serif';c.textAlign='center';c.fillText('E · ENTRAR',dx,dy-12)}return}
   if(o.kind==='sign'){this.drawProp(c,'sign',sx,sy,o);if(Math.hypot(o.x-state.player.x,o.y-state.player.y)<72){c.fillStyle='#fff2d9';c.font='10px sans-serif';c.textAlign='center';c.fillText(o.name,sx,sy-25)}return}
   if(o.kind==='player'||o.kind==='lira'||o.kind==='healer'||o.kind==='shop'||o.kind==='inn'||o.kind==='workshop'||o.kind==='market'||o.kind==='trainer'||o.kind==='antagonist'){this.drawCharacter(c,sx,sy,o);if(o.kind!=='player'&&Math.hypot(o.x-state.player.x,o.y-state.player.y)<72){c.fillStyle='#fff2d9';c.font='10px sans-serif';c.textAlign='center';c.fillText(o.name,sx,sy-23)}return}
   this.drawProp(c,o.type,sx,sy,o);
 }
 drawBuilding(c,b,sx,sy){const x=sx-64,y=sy-128,roof=['#59402d','#604735','#704b34','#8c4938','#4b5142'][b.sprite%5],side=['#392d24','#413127','#493328','#5d3027','#303b32'][b.sprite%5],wall=b.sprite===9?'#746859':b.sprite===7?'#8a7655':'#c2a57c',dark='#33271f',wood='#533a27',light='#e4bc69';const poly=(pts,color,stroke=dark,width=2)=>{c.fillStyle=color;c.strokeStyle=stroke;c.lineWidth=width;c.beginPath();c.moveTo(x+pts[0][0],y+pts[0][1]);for(let i=1;i<pts.length;i++)c.lineTo(x+pts[i][0],y+pts[i][1]);c.closePath();c.fill();c.stroke()};
   c.fillStyle='#17251b66';c.beginPath();c.ellipse(sx,y+123,54,10,0,0,Math.PI*2);c.fill();
   // Two visible wall planes and a raised stone foundation anchor the house to the map.
   poly([[18,91],[71,111],[71,119],[18,99]],'#706655');poly([[71,111],[116,88],[116,97],[71,119]],'#514b40');
   poly([[20,56],[71,76],[71,112],[20,92]],wall);poly([[71,76],[114,56],[114,92],[71,112]],b.sprite===9?'#665b4d':'#927c5e');
   // Timber framing, stone courses and board seams make the walls read as built surfaces.
   for(let i=0;i<4;i++){c.strokeStyle='#dfc99c55';c.lineWidth=1;c.beginPath();c.moveTo(x+24,y+64+i*7);c.lineTo(x+68,y+81+i*7);c.stroke();c.beginPath();c.moveTo(x+76,y+82+i*7);c.lineTo(x+108,y+67+i*7);c.stroke()}
   c.strokeStyle=wood;c.lineWidth=5;c.beginPath();c.moveTo(x+21,y+57);c.lineTo(x+21,y+93);c.moveTo(x+69,y+76);c.lineTo(x+69,y+112);c.moveTo(x+112,y+56);c.lineTo(x+112,y+92);c.moveTo(x+20,y+58);c.lineTo(x+71,y+78);c.lineTo(x+113,y+58);c.stroke();
   for(let row=0;row<3;row++){c.fillStyle='#a99a7b';c.fillRect(x+22,y+96+row*5,45,2);c.fillStyle='#827c69';c.fillRect(x+74,y+95+row*5,37,2)}
   // Deep, two-sided roof with visible block courses, heavy fascia and a chimney.
   poly([[13,57],[63,13],[72,19],[29,64],[72,81],[71,89]],roof);poly([[63,13],[125,50],[117,61],[73,35],[72,81],[71,78]],side);
   c.strokeStyle='#a77a4c';c.lineWidth=2;for(let i=0;i<5;i++){c.beginPath();c.moveTo(x+21+i*9,y+51-i*7.5);c.lineTo(x+65+i*1.5,y+20+i*7.5);c.stroke();c.beginPath();c.moveTo(x+70+i*10,y+22+i*6);c.lineTo(x+115+i*.5,y+50+i*1.7);c.stroke()}
   c.strokeStyle='#30241c';c.lineWidth=5;c.beginPath();c.moveTo(x+13,y+57);c.lineTo(x+71,y+84);c.lineTo(x+125,y+51);c.stroke();
   poly([[91,30],[101,26],[101,48],[91,53]],'#72533a');c.fillStyle='#9b7450';c.fillRect(x+90,y+27,13,4);
   // Recessed door, framed windows and warm lanterns.
   poly([[38,76],[51,81],[51,102],[38,97]],'#38291f','#211a16',2);poly([[41,79],[48,82],[48,96],[41,93]],'#795333','#b18a56',1);
   c.fillStyle=light;c.fillRect(x+45,y+88,2,2);poly([[83,72],[98,65],[98,79],[83,86]],dark);poly([[86,73],[95,69],[95,77],[86,81]],b.sprite%2?'#eac978':'#607f85','#d2b783',1);c.fillStyle=wood;c.fillRect(x+89,y+68,2,16);c.fillRect(x+84,y+76,12,2);
   c.fillStyle='#4a3524';c.fillRect(x+56,y+79,7,12);c.fillStyle='#ffe19a';c.fillRect(x+58,y+81,3,6);c.fillStyle='#b5813d';c.fillRect(x+54,y+78,11,3);
   c.fillStyle='#442f22';c.fillRect(x+102,y+63,7,11);c.fillStyle='#f3d17d';c.fillRect(x+104,y+65,3,6);c.fillStyle='#bc8b48';c.fillRect(x+100,y+61,11,3);
   if(b.sprite===4){c.fillStyle='#f2e7ce';c.fillRect(x+77,y+52,18,18);c.fillStyle='#b64f46';c.fillRect(x+84,y+54,5,14);c.fillRect(x+80,y+58,13,5)}
   if(b.sprite===3){c.fillStyle='#a34f3e';c.fillRect(x+79,y+86,30,5);c.fillStyle='#e0bc78';for(let i=0;i<3;i++)c.fillRect(x+81+i*10,y+85,5,7)}
   if(b.sprite===6){c.fillStyle='#785235';c.fillRect(x+32,y+99,43,5);c.fillRect(x+35,y+104,4,11);c.fillRect(x+68,y+104,4,11)}
 }
 drawBuildingFallback(c,b,x,y,w,h){c.fillStyle='#17261b66';c.beginPath();c.ellipse(x+w/2,y+h-4,w*.46,12,0,0,Math.PI*2);c.fill();c.fillStyle='#766b56';c.fillRect(x+25,y+73,w-48,54);c.fillStyle='#cfb58b';c.fillRect(x+30,y+56,w-52,61);c.fillStyle='#443528';c.beginPath();c.moveTo(x+16,y+65);c.lineTo(x+w/2,y+20);c.lineTo(x+w-12,y+59);c.lineTo(x+w-22,y+75);c.lineTo(x+w/2,y+43);c.lineTo(x+26,y+79);c.closePath();c.fill();c.fillStyle='#4b3527';c.fillRect(x+w/2-10,y+87,20,40)}
 drawTree(c,x,y,seed){const scale=seed>.78?1.2:seed<.22?.78:1;c.fillStyle='#17271d77';c.beginPath();c.ellipse(x,y+2,14*scale,6*scale,0,0,Math.PI*2);c.fill();c.fillStyle='#493b2c';c.fillRect(x-4*scale,y-22*scale,8*scale,25*scale);c.fillStyle=seed>.5?'#345b39':'#3f6940';c.fillRect(x-16*scale,y-45*scale,32*scale,27*scale);c.fillStyle='#527a45';c.fillRect(x-11*scale,y-53*scale,25*scale,20*scale);c.fillStyle='#759255';c.fillRect(x-7*scale,y-49*scale,8*scale,5*scale);c.fillStyle='#263f2d';c.fillRect(x+8*scale,y-37*scale,7*scale,14*scale)}
 drawRock(c,x,y,seed){const w=10+(seed*10|0),h=8+(seed*8|0);c.fillStyle='#17251b77';c.beginPath();c.ellipse(x,y+3,w+2,5,0,0,Math.PI*2);c.fill();c.fillStyle='#777563';c.beginPath();c.moveTo(x-w,y);c.lineTo(x-w*.6,y-h);c.lineTo(x+w*.15,y-h*1.2);c.lineTo(x+w,y-h*.35);c.lineTo(x+w*.8,y+2);c.closePath();c.fill();c.fillStyle='#aaa087';c.beginPath();c.moveTo(x-w*.6,y-h);c.lineTo(x+w*.15,y-h*1.2);c.lineTo(x+w*.1,y-h*.35);c.lineTo(x-w*.48,y-h*.25);c.closePath();c.fill()}
 drawCharacter(c,x,y,o){const bob=Math.sin(this.time*4+(o.x||0)*.01)*.65,px=1.5,left=Math.round(x-8*px),top=Math.round(y-21*px+bob),coat=o.kind==='player'?'#41689a':o.color||'#78906c',skin='#e1bd94',trim='#d6b578',dir=o.direction||'down';const r=(a,b,w,h,color)=>{c.fillStyle=color;c.fillRect(left+Math.round(a*px),top+Math.round(b*px),Math.max(1,Math.round(w*px)),Math.max(1,Math.round(h*px)))};c.fillStyle='#15221a66';c.beginPath();c.ellipse(x,y+3,10,4,0,0,Math.PI*2);c.fill();
   // A 16×22 sprite sheet drawn as crisp clusters: boots, tunic, belt, sleeves, face, hair and travel gear.
   r(3,17,4,4,'#342c26');r(9,17,4,4,'#342c26');r(2,20,6,2,'#b99a69');r(8,20,6,2,'#b99a69');r(3,14,9,5,'#39424b');r(2,7,12,9,coat);r(1,8,3,7,'#302a25');r(12,8,3,7,'#302a25');r(3,7,9,2,trim);r(4,11,7,1,'#e2d1aa');r(7,9,2,6,'#334657');r(0,10,2,4,'#654a32');r(1,9,2,2,'#bb9561');
   r(4,1,8,8,'#45372c');r(5,2,6,7,skin);r(4,0,8,3,o.kind==='player'?'#6e5035':'#493a2e');r(3,2,3,3,o.kind==='player'?'#8e6740':'#594334');r(10,2,3,2,'#332920');
   if(dir!=='up'){r(dir==='left'?5:7,5,1,1,'#302a25');r(dir==='left'?8:10,5,1,1,'#302a25');r(7,7,2,1,'#a36f62')}else{r(4,3,8,2,'#493a2e')}
   if(o.kind==='healer'){r(6,8,4,6,'#f3ead5');r(4,10,8,2,'#f3ead5');r(7,9,2,4,'#bd5d50');r(6,10,4,2,'#bd5d50')}
   if(o.kind==='player'){r(12,8,3,6,'#745135');r(13,9,2,3,'#d0ae71')}
 } drawProp(c,type,x,y,o){c.fillStyle='#18251c66';c.beginPath();c.ellipse(x,y+3,10,4,0,0,Math.PI*2);c.fill();if(type==='lamp'||type.startsWith('gate')){const glow=c.createRadialGradient(x,y-18,1,x,y-18,23);glow.addColorStop(0,'#f2c96b55');glow.addColorStop(1,'#f2c96b00');c.fillStyle=glow;c.fillRect(x-23,y-41,46,46);c.fillStyle='#513b29';c.fillRect(x-3,y-26,6,29);c.fillRect(x-8,y-25,16,3);c.fillStyle='#e8b85e';c.fillRect(x-4,y-22,8,9);c.fillStyle='#fff0a0';c.fillRect(x-2,y-20,4,5);if(type.startsWith('gate')){c.fillStyle='#553b27';c.fillRect(x-20,y-42,5,42);c.fillRect(x+15,y-42,5,42);c.fillRect(x-20,y-42,40,5);c.fillRect(x-15,y-36,4,33);c.fillRect(x+11,y-36,4,33)}return}
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
 nearestNpc(x,y,state){if(state?.interior){const room=INTERIORS[state.interior];if(!room)return null;const n=room.npc;if(n.kind!=='none'){const npc={...n,x:(n.x+.5)*TILE,y:(n.y+.5)*TILE};if(Math.hypot(npc.x-x,npc.y-y)<40)return npc}if(room.cache&&!state.events.includes(`room-cache-${state.interior}`)){const item={id:`cache-${state.interior}`,name:'Baú',kind:'cache',x:(room.cache.x+.5)*TILE,y:(room.cache.y+.5)*TILE};if(Math.hypot(item.x-x,item.y-y)<34)return item}if(y>10*TILE)return{name:'Saída',kind:'exit',x:8*TILE,y:11*TILE};return null}return NPCS.map(n=>({n,d:Math.hypot(n.x-x,n.y-y)})).filter(a=>a.d<40).sort((a,b)=>a.d-b.d)[0]?.n||null}
 drawInterior(state,vw,vh){const c=this.ctx,room=INTERIORS[state.interior],ox=Math.floor((vw-16*TILE)/2),oy=Math.floor((vh-12*TILE)/2);c.clearRect(0,0,vw,vh);c.fillStyle='#111a18';c.fillRect(0,0,vw,vh);c.save();c.translate(ox,oy);for(let y=0;y<12;y++)for(let x=0;x<16;x++){const wall=x===0||x===15||y===0||y===11;c.fillStyle=wall?(y===0||x===0||x===15?'#4b392a':'#68472d'):((x+y)%2?'#aa8353':'#b38c5b');c.fillRect(x*TILE,y*TILE,TILE,TILE);if(!wall){c.fillStyle='#704c30';c.fillRect(x*TILE,y*TILE+TILE-2,TILE,2)}}
   // Furniture anchors leave a clear central aisle and never cover the entrance.
   const furniture=room.furniture;for(let i=0;i<furniture.length;i++){const type=furniture[i],x=[3,12,4,11,6][i%5],y=i<2?2:7,px=x*TILE,py=y*TILE;c.fillStyle='#392a20';c.fillRect(px-2,py+12,28,7);if(type==='bed'){c.fillStyle='#68472f';c.fillRect(px,py,24,17);c.fillStyle='#d6c8a5';c.fillRect(px+2,py+2,20,6);c.fillStyle='#8b5a50';c.fillRect(px+2,py+9,20,6)}else if(type==='plant'){c.fillStyle='#805c3a';c.fillRect(px+5,py+7,14,13);c.fillStyle='#547d48';c.fillRect(px+7,py-5,10,13)}else if(type==='healing'){c.fillStyle='#d4c8aa';c.fillRect(px-4,py-3,32,18);c.fillStyle='#e8bb66';c.fillRect(px+9,py,6,13);c.fillRect(px+5,py+4,14,5)}else if(type==='anvil'){c.fillStyle='#69736c';c.fillRect(px+3,py+4,19,9);c.fillRect(px+9,py+13,8,6)}else if(type==='barrel'){c.fillStyle='#785334';c.fillRect(px+3,py+1,18,19);c.fillStyle='#b38b56';c.fillRect(px+2,py+4,20,3);c.fillRect(px+2,py+14,20,3)}else{c.fillStyle=type==='broken'?'#4c392a':'#765335';c.fillRect(px,py,24,13);c.fillStyle='#bb9762';c.fillRect(px+2,py+2,20,2);if(type==='healing')c.fillStyle='#e6c36c'}}
   const n=room.npc;if(n.kind!=='none'){const nx=(n.x+.5)*TILE,ny=(n.y+.5)*TILE;this.drawCharacter(c,nx,ny,{...n,x:nx,y:ny});c.fillStyle='#fff1d2';c.font='11px sans-serif';c.textAlign='center';c.fillText(n.name,nx,ny-36)}
   if(room.cache&&!state.events.includes(`room-cache-${state.interior}`)){const x=(room.cache.x+.5)*TILE,y=(room.cache.y+.5)*TILE;this.drawProp(c,'cache',x,y,{})}
   const px=state.player.x,py=state.player.y;this.drawCharacter(c,px,py,{kind:'player',x:px,y:py});c.fillStyle='#f0dfb6';c.font='11px sans-serif';c.textAlign='center';c.fillText('SAÍDA',8*TILE,11*TILE+18);c.restore();c.fillStyle='#f1dfbc';c.font='bold 16px sans-serif';c.textAlign='left';c.fillText(room.name,Math.max(18,ox+10),Math.max(24,oy-12));}
}
