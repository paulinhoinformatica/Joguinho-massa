import{REGIONS,ROOM_W,GROUND,regionAt,roomAt}from'./map.js';
import{awardAbility}from'./abilities.js';

export const ACTS=[
 {id:'act-1',boss:'boss-0',name:'Ato 1 · Investigar as infecções e derrotar Matrona',revelation:'Os registros de Matrona confirmam: a Aurora Dynamics produziu as infecções. Dispositivos contaminados saem do Complexo Industrial. O bloqueio foi removido.',abilities:['dash','doubleJump']},
 {id:'act-2',boss:'boss-2',name:'Ato 2 · Descobrir a distribuição e derrotar Warden',revelation:'Warden guardava a autorização de Véspera. O vírus interfere nas decisões de todos os conectados. Kael recuperou a credencial de segurança da Torre Aurora.',abilities:['emp','overload']},
 {id:'act-3',boss:'boss-3',name:'Ato 3 · Enfrentar Véspera e interromper o vírus',revelation:'O transmissor foi desligado. Nenhum cidadão ou máquina receberá novos comandos da rede de controle.',abilities:[]}
];
export function defeated(state,id){return state.bosses.some(b=>b.id===id&&b.dead)}
export function unlockedAct(state){return defeated(state,'boss-0')?(defeated(state,'boss-2')?2:1):0}
export function checkpointFor(region=0,beforeBoss=false){const i=Math.max(0,Math.min(2,region));return{x:i*ROOM_W+(beforeBoss?(i===0?1440:1580):i===0?310:i===1?170:190),y:GROUND-57,region:i,name:beforeBoss?['Oficina do bloqueio','Manutenção de segurança','Abrigo do núcleo'][i]:['Abrigo da Chuva','Gerador auxiliar','Elevador de serviço'][i]}}
export function syncProgress(state){
 state.quests=ACTS.map(a=>({id:a.id,name:a.name,goal:1,progress:defeated(state,a.boss)?1:0,complete:defeated(state,a.boss)}));
 state.quests.push({id:'records',name:'Opcional · Recuperar os três registros da Aurora',goal:3,progress:['log-1','log-2','log-3'].filter(id=>state.events.includes(id)).length,complete:['log-1','log-2','log-3'].every(id=>state.events.includes(id))});
 for(const act of ACTS)if(defeated(state,act.boss)){
  if(!state.events.includes(act.id))state.events.push(act.id);
  for(const ability of act.abilities)awardAbility(state,ability);
 }
 if(defeated(state,'boss-2')&&!state.items.includes('Credencial de Warden'))state.items.push('Credencial de Warden');
 if(defeated(state,'boss-3')&&!state.events.includes('ending'))state.events.push('ending');
 state.region=regionAt(state.player.x).id;
 state.currentMap=REGIONS.indexOf(regionAt(state.player.x));
 state.currentRoom=roomAt(state.player.x);
}
export function objective(state){
 if(state.events.includes('ending'))return 'Transmissão interrompida · Nova Aurora começa a se recuperar';
 const index=unlockedAct(state),region=REGIONS.indexOf(regionAt(state.player.x));
 if(region<index)return `Passagem liberada · Siga para ${REGIONS[index].name}`;
 if(index===0&&state.events.includes('log-1')&&state.events.includes('yara-reunion')&&!state.events.includes('yara-terminal'))return 'Ato 1 · Volte a Yara e compartilhe os registros do terminal';
 if(!state.events.includes(`log-${index+1}`))return ['Ato 1 · Fale com Yara e investigue o terminal dos telhados','Ato 2 · Encontre o cientista e o registro de distribuição','Ato 3 · Consulte a IA e os registros dos laboratórios'][index];
 return ['Ato 1 · Derrote Matrona e libere o Complexo Industrial','Ato 2 · Derrote Warden e recupere a credencial da Torre','Ato 3 · Derrote Véspera no núcleo e desligue o transmissor'][index];
}
