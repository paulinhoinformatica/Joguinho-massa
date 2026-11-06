# Setor 9 — layout 2

## Estratégia de coordenadas

A expansão é vertical: mantém a extensão horizontal original de 2400 unidades.
O Complexo Industrial continua em x=2400, a Torre em x=4800 e o mundo termina
em x=7200. Não há multiplicação ou deslocamento de coordenadas globais.
`REGIONS` declara a largura de cada região; `SECTOR9_AREAS` e `roomAt` definem
os limites das três áreas sem depender de divisões cegas por 800.

- Ruas dos Sobreviventes: x=0..700. Plataformas de aprendizado, abrigo em 310
  e Yara em 610. Oren continua em x=1000 no nível da rua.
- Telhados e Passarelas: x=700..1400, com superfícies desde y=670 até y=215,
  quatro âncoras no Setor 9 e circuito opcional pelos telhados superiores.
- Bloqueio de Quarentena: x=1400..2400. Abrigo em 1440, entrada em 1510,
  arena até 2360 e gate industrial original em 2400.

Kael mantém gravidade de 1850 e salto inicial de -660: altura contínua teórica
de 117,7 unidades (um pouco menor com integração discreta). As subidas normais
validadas usam diferenças de 75, 90, 95 e 105 unidades e aproximação pela borda.
Não exigem dash nem salto duplo. O gancho inicial continua acessível perto de
Yara. O piso da rua permanece contínuo para retorno seguro e rota principal.

## Plataformas e exploração

As novas passarelas do Setor 9 possuem `oneWay: true`: recebem Kael por cima
e permitem saltos por baixo. Estruturas sólidas e os outros mapas preservam
suas regras. Coberturas em x=950 e 1275 medem 72 unidades de altura, podem ser
saltadas normalmente e bloqueiam tiros no nível da rua.

O terminal `shortcut-sector9`, em (1000,395), estende a ponte de x=1060 a 1130,
na mesma altura dos telhados vizinhos. O evento é salvo pelo fluxo existente,
sem duplicar a ponte ao repetir a interação. `buildMap(events)` a reconstrói.

A passarela instável fica em (1320,470), com largura 90. Listras amarelas
ficam vermelhas após o peso de Kael; ela cai após 0,65 s e reaparece em 4 s.
O estado é transitório, reiniciado no respawn/load. Sua colisão é desativada
junto do desenho sólido. Há telhado e chão seguros abaixo e uma rota alternativa.

O segredo `Peças da vigilância 09`, em (1310,215), usa a coleta existente e dá
20 créditos. A Célula de energia e o terminal `log-1` permanecem acessíveis.
Descer das rotas superiores sempre permite voltar ao percurso de rua.

## Inimigos

Continuam existindo apenas um Implantado e um Servo no primeiro mapa.
Implantado: x=800. Servo: redistribuído de x=1420 para x=1120, entre coberturas;
patrulha limitada a x=1010..1250. Seu ID `0-1420-maintenance` é preservado para
não duplicar recompensas em saves. Outros spawns, vida, dano e classes não mudam.

## Câmara de Contenção 09

Arena x=1510..2360: largura 850 (antes 670). Piso central contínuo em y=790,
plataformas laterais em (1535,710,135) e (2200,710,135), sem obstáculos sólidos
no centro. Matrona inicia em x=2070 e permanece no piso com seus limites atuais
de movimento. A ativação exige entrar na altura da arena; não dispara por
passar muito acima da entrada. As barreiras temporárias usam os clamps físicos
existentes e são desenhadas como portas de contenção energizadas.

O enquadramento padrão de 960×540 contém toda a arena e interpola suavemente
para seu centro. Ao terminar a luta, a câmera volta ao acompanhamento normal.
Em telas mais estreitas, acompanha Kael dentro dos limites da arena.

O Raio mantém alcance máximo de 850, preparação/mira de 0,7 s, trava de 0,4 s,
disparo de 0,3 s e recuperação de 0,6 s. Plataformas finas não bloqueiam a mira.
O Protocolo conserva os tempos e danos. Sua seleção de superfícies agora usa
o ponto central e limita a zona à superfície real, inclusive perto das bordas
das duas plataformas laterais. As zonas desenhadas são as mesmas usadas no dano.
Nenhuma plataforma torna Kael permanentemente imune aos dois ataques.

## Saves e progressão

O formato principal continua na versão 2, com marcador `sector9Layout: 2`.
Saves sem o marcador têm o checkpoint antigo x=1580 mapeado explicitamente
para x=1440, fora da arena. Uma posição antiga na faixa de espera x=1510..1690
também retorna ao abrigo quando Matrona ainda está viva, evitando combate ao
carregar um save anteriormente seguro. Se estiver dentro de uma cobertura
nova, Kael é colocado sobre ela. Inventário, habilidades, créditos, eventos e
bosses derrotados são preservados. A migração antiga da versão 1 continua ativa.
Coordenadas, checkpoints e gates dos mapas 2 e 3 não foram deslocados.

## Validação

`tests/level-design.html` exercita o percurso com a física real em 30/60/120 FPS,
gancho, saltos entre telhados, ponte e persistência, plataforma instável, segredo,
checkpoint, 20 migrações legadas, arena, barreiras, câmera, ataques e vitória.
Também abre `index.html` em iframe, inicia o jogo, interage com Yara/Oren e o
checkpoint, ativa a batalha e testa o respawn com a UI real.

Resultados: `tests/level-design-results.txt`. Regressões: `tests/hook.html`,
`tests/servant.html`, `tests/infected.html`, além das verificações existentes de
dash e combate chamadas pelo teste do gancho. Capturas do Canvas inspecionadas:
`tests/level-arena-preview.png` e `tests/level-roofs-preview.png`.

Pendente: uma partida manual longa para avaliar ritmo de exploração e combate.
As capturas e testes automatizados não substituem essa avaliação de sensação.
