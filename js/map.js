export const ROOM_W=2400,WORLD_H=900,GROUND=790;
export const FACTORY_LAYOUT=2;
export const factoryX=x=>x>=4000?x+400:x;
export const SECTOR9_LAYOUT=2;
export const MATRONA_ARENA=Object.freeze({left:1510,right:2360,floor:GROUND,spawnX:2070});
export const SECTOR9_AREAS=[{id:0,name:'Ruas dos Sobreviventes',left:0,right:700},{id:1,name:'Telhados e Passarelas',left:700,right:1400},{id:2,name:'Bloqueio de Quarentena',left:1400,right:2400}];
export const REGIONS=[
 {id:'slum',name:'Setor 9',subtitle:'ATO I · O CERCO',color:'#182b35',x:0},
 {id:'factory',name:'Complexo Industrial',subtitle:'ATO II · A DISTRIBUIÇÃO',color:'#302a2b',x:ROOM_W},
 {id:'corporate',name:'Torre Aurora',subtitle:'ATO III · A REDE DE CONTROLE',color:'#1c2037',x:ROOM_W*2+400}
];
for(const r of REGIONS)r.width=r.id==='factory'?2800:ROOM_W;
export const WORLD_W=REGIONS.at(-1).x+REGIONS.at(-1).width;
export function regionAt(x){return REGIONS.find(r=>x>=r.x&&x<r.x+r.width)||(x<0?REGIONS[0]:REGIONS.at(-1))}
export function assetRegionAt(x){const r=regionAt(x);return r.id==='slum'?'slums':r.id==='factory'?'industrial':x>=r.x+1500?'virus_core':'corporate'}
const ROOM_NAMES=[['Ruas do Setor 9','Telhados e oficina','Bloqueio de Matrona'],['Recepção de carga','Linha de distribuição','Segurança Warden'],['Átrio corporativo','Laboratórios secretos','Núcleo de Véspera']];
export const MAP_ROOMS=REGIONS.flatMap((r,i)=>ROOM_NAMES[i].map((name,j)=>({id:i*3+j,name:i===0?SECTOR9_AREAS[j].name:name,region:i,x:i===0?SECTOR9_AREAS[j].left:r.x+j*800})));
export function roomAt(x){return [...MAP_ROOMS].reverse().find(r=>x>=r.x)?.id??0}
const platform=(x,y,w,h,kind='metal')=>({x,y,w,h,kind});
export function buildMap(events=[]){
 const platforms=[],hazards=[],checkpoints=[],terminals=[],secrets=[],npcs=[],hookPoints=[];
 for(const r of REGIONS){
  const x=r.x;
  platforms.push(platform(x,GROUND,r.width,110,'ground'));
  // Original roof/catwalk layouts, with a clear floor inside arenas.
  const layouts=r.id==='slum'?[[180,690,260,'scrap'],[520,580,230,'walkway'],[820,670,220,'roof'],[1120,570,270,'walkway'],[1470,630,200,'roof']]:r.id==='factory'?[[150,690,330,'catwalk'],[560,590,250,'catwalk'],[900,650,260,'catwalk'],[1240,550,270,'catwalk'],[1520,650,150,'catwalk']]:[[160,690,280,'glass'],[500,590,270,'glass'],[850,650,300,'glass'],[1220,550,250,'glass'],[1500,650,170,'fleshmetal']];
  if(r.id!=='slum')for(const [px,y,w,kind] of layouts)platforms.push(platform(x+px,y,w,24,kind));
  else {
   // Several useful tiers inside the original regional footprint. Safe floor
   // remains below every exploration route and the collapsing catwalk.
   const roofs=[[180,690,260,'scrap'],[430,615,100,'walkway'],[520,580,230,'walkway'],[820,670,220,'roof'],[1050,670,210,'roof'],[1120,570,270,'walkway'],[690,485,170,'walkway'],[880,395,180,'roof'],[1130,395,190,'walkway'],[1030,290,160,'roof'],[1220,215,150,'walkway']];
   for(const [px,y,w,kind] of roofs)platforms.push({...platform(px,y,w,20,kind),oneWay:true});
   platforms.push({...platform(1320,470,90,18,'unstable'),oneWay:true,id:'s9-unstable',warning:0,disabled:false,restoreTimer:0});
   platforms.push({...platform(1535,710,135,18,'arena'),oneWay:true,id:'arena-left'}, {...platform(2200,710,135,18,'arena'),oneWay:true,id:'arena-right'});
   // Low cover breaks the ground-level shooter's line of fire without blocking
   // the high route; both blocks can be cleared with the normal jump.
   platforms.push(platform(950,718,42,72,'cover'),platform(1275,718,42,72,'cover'));
  }
  checkpoints.push({x:x+(r.id==='slum'?310:r.id==='factory'?170:190),name:r.id==='slum'?'Abrigo da Chuva':r.id==='factory'?'Gerador auxiliar':'Elevador de serviço'});
  checkpoints.push({x:x+(r.id==='slum'?1440:1580),name:r.id==='slum'?'Oficina do bloqueio':r.id==='factory'?'Manutenção de segurança':'Abrigo do núcleo'});
  hookPoints.push({x:x+550,y:420},{x:x+1250,y:390});
 }
 hookPoints.push({x:930,y:275},{x:1280,y:110});
 hazards.push({x:2900,y:GROUND-18,w:180,h:18,kind:'acid'},{x:3500,y:GROUND-18,w:150,h:18,kind:'press'},{x:5560,y:GROUND-18,w:150,h:18,kind:'laser'},{x:6290,y:GROUND-18,w:160,h:18,kind:'virus'});
 terminals.push(
  {x:1300,y:570,id:'log-1',name:'Terminal do isolamento'},
  {x:2310,y:GROUND,id:'gate-industrial',name:'Porta de carga'},
  {x:3100,y:590,id:'log-2',name:'Registro de distribuição'},
  {x:3800,y:550,id:'implant-double',name:'Estabilizador de manutenção',text:'Salto duplo integrado. Explore as passarelas superiores.'},
  {x:4710,y:GROUND,id:'gate-tower',name:'Elevador da Torre'},
  {x:5850,y:650,id:'log-3',name:'Arquivo da Aurora Dynamics'},
  {x:6230,y:550,id:'implant-overload',name:'Matriz de sobrecarga',text:'Sobrecarga integrada: fortalece o próximo golpe.'},
  {x:3350,y:650,id:'shortcut-maintenance',name:'Ponte de manutenção',text:'Ponte de manutenção estendida. A passagem superior evita a prensa.',shortcut:platform(3970,620,170,24,'catwalk')},
  {x:1000,y:395,id:'shortcut-sector9',name:'Controle da passarela 09',text:'Passarela estendida. O atalho superior conecta os telhados à oficina.',shortcut:{...platform(1060,395,70,18,'bridge'),oneWay:true,id:'s9-bridge'}}
 );
 for(const t of terminals)if(t.shortcut&&events.includes(t.id))platforms.push({...t.shortcut});
 secrets.push({x:920,y:620,item:'Célula de energia'},{x:3100,y:550,item:'Dados de distribuição'},{x:5400,y:550,item:'Registros de experiências'},{x:6300,y:760,item:'Filtro anticontaminação'});
 secrets.push({x:1310,y:215,item:'Peças da vigilância 09'});
 npcs.push(
  {id:'yara',x:610,y:GROUND,name:'Yara · Hacker',assetId:'yara',defaultFacing:-1,facePlayerOnDialog:true,ability:'hook',text:'Robôs e cidadãos com implantes estão perdendo o controle. Os terminais dos telhados registraram as primeiras infecções. Matrona isolou o Setor 9 para impedir que as provas saiam daqui. Use este gancho nos pontos amarelos.'},
  {id:'oren-slum',x:1000,y:GROUND,name:'Oren · Mecânico',assetId:'oren',defaultFacing:-1,facePlayerOnDialog:true,shop:true,text:'Posso reforçar sua proteção por 20 créditos. Procure dados e peças nos telhados; cada segredo financia a próxima melhoria.'},
  {id:'oren-factory',x:2700,y:GROUND,name:'Oren · Mecânico',assetId:'oren',defaultFacing:-1,facePlayerOnDialog:true,shop:true,text:'Segui a linha de carga até aqui. Continuo oferecendo reforços por 20 créditos. Warden guarda a credencial da Torre Aurora.'},
  {id:'scientist',x:3400,y:GROUND,name:'Cientista desertor',assetId:'npc_survivor',ability:'emp',text:'Eu trabalhava para a Aurora Dynamics. Distribuímos o vírus em dispositivos novos e atualizações de implantes. Ele não foi feito para destruir: altera decisões de humanos e máquinas conectados. Warden protege a operação. Leve meu pulso eletromagnético.'},
  {id:'corporate-ai',x:5800,y:GROUND,name:'IA corporativa · arquivo interno',assetId:'npc_survivor',text:'Autorização experimental Kael reconhecida. Véspera dirige o projeto de controle populacional. A epidemia foi um teste em humanos. Ela acredita que só uma rede central pode garantir estabilidade. O transmissor está no núcleo desta torre.'}
 );
 // Insert a maintenance sector before the existing security arena.
 for(const list of [platforms,hazards,checkpoints,terminals,secrets,npcs,hookPoints])for(const e of list){
  // Tower entries are already based on the shifted regional origin.
  if(e.x>=4000&&e.x<4800)e.x+=400;
  else if(e.x>=4800&&!platforms.includes(e)&&!checkpoints.includes(e)&&!hookPoints.includes(e))e.x+=400;
  if(e.shortcut)e.shortcut.x=factoryX(e.shortcut.x);
 }
 checkpoints.find(cp=>cp.x===3980).x=4380;
 platforms.push(platform(2780,710,60,80,'cover'),platform(3260,700,80,90,'cover'),platform(3860,700,70,90,'cover'),platform(4160,700,95,90,'cover'));
 for(const [x,y,w] of [[2960,680,200],[3190,585,170],[3370,490,170],[3540,395,190],[3780,490,150],[3980,590,150],[4220,590,150]])platforms.push({...platform(x,y,w,18,'catwalk'),oneWay:true});
 secrets.push({x:3650,y:395,item:'Esquema do circuito refrigerante'});
 hookPoints.push({x:3650,y:285},{x:4140,y:410});
 for(const p of platforms)if(p.x>=2400&&p.x<5200&&p.h<70)p.oneWay=true;
 const pool=hazards.find(h=>h.kind==='acid');Object.assign(pool,{id:'coolant-pool',x:3500,y:GROUND-18,w:210,h:18,kind:'coolant'});
 const press=hazards.find(h=>h.kind==='press');Object.assign(press,{id:'industrial-press',x:4010,y:GROUND-100,w:70,h:100});
 return{platforms,hazards,checkpoints,terminals,secrets,npcs,hookPoints,visuals:[]};
}
