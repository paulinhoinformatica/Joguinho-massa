export const LOGS={
 'log-1':'REGISTO 09 — o vírus foi carregado no núcleo antes do primeiro caso de corrupção. Assinatura de origem: VÉSPERA.',
 'log-2':'PROTOCOLO VÉSPERA — usar trabalhadores como hospedeiros para testar o enxame. Estado: autorizado pela direção.',
 'log-3':'ARQUIVO AURORA — a diretoria libertou o vírus. Alvo inicial do teste: implante experimental KAEL-0.',
 mechanic:'Mecânica Yara: «Esse implante devia estar num laboratório. Se a Aurora te encontrar, não vão fazer perguntas.»',
 'gate-industrial':'A porta de carga está sem energia, mas o fecho cede à força. Segue para o Complexo Industrial.',
 'gate-sewers':'A comporta vibra. O Impulso cibernético pode atravessar o arco de segurança azul.'
};
export function terminalText(t){return LOGS[t.id]||t.text||'O terminal perdeu os dados.'}
