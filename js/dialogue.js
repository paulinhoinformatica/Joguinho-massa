export const LOGS={
 'log-1':'REGISTRO 09 — Robôs e implantes humanos receberam a mesma atualização antes dos surtos. Matrona recebeu ordens de isolar o Setor 9 e recolher os registros. Remetente: Aurora Dynamics.',
 'log-2':'DISTRIBUIÇÃO — Dispositivos contaminados deixam o Complexo Industrial como produtos novos. O protocolo não destrói o hospedeiro: interfere em suas escolhas. Warden protege os carregamentos e o elevador corporativo.',
 'log-3':'PROJETO VÉSPERA — A epidemia foi um teste de controle populacional em humanos e máquinas. A diretora Véspera autorizou a transmissão centralizada. O núcleo está integrado à Torre Aurora.',
 'gate-industrial':'Derrote Matrona para abrir a porta de carga. A passagem permanece livre para revisitar o Setor 9.',
 'gate-tower':'A credencial recuperada de Warden libera o elevador da Torre Aurora. Você poderá retornar ao complexo.'
};
export function terminalText(t){return LOGS[t.id]||t.text||'O terminal perdeu os dados.'}

const yara=text=>({speaker:'Yara · Hacker',text});
const kael=text=>({speaker:'Kael',text});
export const YARA_DIALOGUES={
 reunion:{event:'yara-reunion',lines:[
  yara('Olha só quem resolveu aparecer. Achei que tivesse esquecido o caminho de casa.'),
  kael('Difícil esquecer um lugar que continua caindo aos pedaços.'),
  yara('Você continua com esse humor horrível. Algumas coisas nunca mudam.'),
  kael('Crescemos juntos no Setor 9. Você teve tempo de se acostumar.'),
  yara('E de aprender quando você está prestes a fazer alguma besteira.'),
  kael('E outras mudaram demais. O que está acontecendo com os infectados?'),
  yara('Andei interceptando algumas transmissões. Tem algo estranho nos sinais.'),
  kael('Conseguiu descobrir de onde vêm?'),
  yara('Ainda não. Mas tem um terminal nos telhados conectado à rede antiga. Vá até lá. Vou tentar abrir o acesso.'),
  kael('Sabia que podia contar com você.'),
  yara('Não se acostume. E tenta não morrer antes de voltar.')
 ]},
 terminal:{event:'yara-terminal',lines:[
  yara('Você encontrou alguma coisa?'),
  kael('Os registros foram alterados. Alguém está tentando esconder a origem das transmissões.'),
  yara('Eu sabia! Esses pacotes de dados não são comuns. Parece que alguém está controlando as infecções.'),
  kael('Então vou encontrar quem está por trás disso.'),
  yara('Continua tão teimoso quanto antes. Só toma cuidado, Kael.')
 ]},
 matrona:{event:'yara-matrona',lines:[
  yara('Você derrotou a Matrona? Sozinho?'),
  kael('Ela não estava muito interessada em conversar.'),
  yara('Você sempre teve um talento especial para criar problemas.'),
  kael('Encontrei registros da Aurora Dynamics. Parece que o vírus vem de um complexo industrial.'),
  yara('Aurora Dynamics... Isso é pior do que eu imaginava.'),
  kael('Preciso ir até lá.'),
  yara('Então vai. Mas não desaparece de novo sem me avisar.')
 ]},
 repeat:{event:null,lines:[
  yara('Ainda está inteiro? Impressionante.'),
  kael('Também é bom te ver, Yara.'),
  yara('Vai logo. Eu fico de olho nas transmissões.')
 ]}
};
export function yaraConversation(state){
 // New saves and old visits share the same campaign events; completed conversations never mutate quests.
 const seen=event=>state.events.includes(event);
 if(!seen('yara-reunion'))return YARA_DIALOGUES.reunion;
 if(seen('log-1')&&!seen('yara-terminal')&&!seen('yara-matrona'))return YARA_DIALOGUES.terminal;
 if(state.bosses.some(b=>b.id==='boss-0'&&b.dead)&&!seen('yara-matrona'))return YARA_DIALOGUES.matrona;
 return YARA_DIALOGUES.repeat;
}

const oren=text=>({speaker:'Oren · Mecânico',text});
export const OREN_DIALOGUES={
 reunion:{event:'oren-reunion',lines:[
  oren('Ora, ora... Se não é o garoto que costumava desmontar meus equipamentos.'),
  kael('Tecnicamente, eu conseguia montar quase tudo de volta.'),
  oren('Quase. Essa palavra me custou três semanas de trabalho.'),
  kael('Ainda guarda rancor?'),
  oren('Só quando olho para minhas ferramentas.'),
  oren('Deixa eu ver esse braço. Você está forçando os estabilizadores de novo.'),
  kael('Ele funciona.'),
  oren('Por enquanto. E com esse vírus circulando pela cidade, eu não confiaria em nenhum implante sem uma revisão.'),
  kael('A Yara também acha que eu preciso tomar cuidado.'),
  oren('Conheço vocês dois desde crianças. Ela invade uma rede proibida, você desmonta uma máquina... e sobra serviço para mim. Tentem voltar inteiros.')
 ]},
 upgrade:{event:null,lines:[
  oren('Trouxe créditos ou veio me dar mais trabalho de graça?'),
  kael('Depende. Vai fazer um preço de amigo?'),
  oren('Fiz isso quando você tinha doze anos. Nunca mais.')
 ]},
 matrona:{event:'oren-matrona',lines:[
  oren('Ouvi dizer que derrubou a Matrona. Está tentando me deixar sem clientes?'),
  kael('Precisava acessar os registros dela.'),
  oren('Então a situação está pior do que pensei. Se for enfrentar a corporação, mantenha esse braço funcionando.')
 ]},
 repeat:{event:null,lines:[
  oren('Nada de usar esse implante como martelo, ouviu?'),
  kael('Sem promessas.')
 ]}
};
export function orenConversation(state){
 if(!state.events.includes('oren-reunion'))return OREN_DIALOGUES.reunion;
 if(state.bosses.some(b=>b.id==='boss-0'&&b.dead)&&!state.events.includes('oren-matrona'))return OREN_DIALOGUES.matrona;
 return OREN_DIALOGUES.repeat;
}
