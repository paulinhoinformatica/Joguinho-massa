# Complexo Industrial — revisão do segundo mapa

## Inspeção e geometria

`js/map.js` define plataformas, hazards, checkpoints, terminais, segredos,
NPCs e ancoragens. O mapa industrial ocupa agora x=2400–5200 (antes 4800).
O Setor 9 conserva seus limites. A Torre começa em 5200; sua geometria relativa
e seus inimigos foram preservados. `factoryLayout=2` identifica os saves novos.

- Entrada e adaptação: abrigo 2570, Oren 2700, cobertura 2780.
- Distribuição: robô 3070, registro 3100, cobertura 3260, cientista 3400.
- Refrigeração: poça 3500–3710; escada opcional de passarelas até y=395,
  esquema recuperável em 3650 (+20 créditos pelo sistema existente).
- Manutenção: executor 3770, cobertura 3860, prensa 4010–4080,
  cobertura 4160, drone 4290, abrigo anterior ao boss 4380.
- Arena Warden: 4490–5160; elevador 5110; Torre 5200.

Não foram adicionados tipos de inimigo. IDs dos inimigos, bosses, terminais,
itens anteriores e eventos continuam estáveis. As habilidades e os valores de
movimento/ataque de Kael não foram alterados.

## Diagnóstico de dano

`enemies.js`: os inimigos fora do Setor 9 aplicavam melee por distância X,
sem verificar altura, direção ou mostrar preparação. No mapa industrial há agora
preparação de 0,5 s, direção travada, área desenhada e colisão retangular real.
Os robôs terrestres usam a física das plataformas em vez de atravessar coberturas.

Projéteis inimigos tinham colisão 12×12, mas desenho 10×7; não desapareciam
ao atingir Kael, e projéteis de inimigos mortos podiam ficar armazenados.
Agora o desenho mede 12×12, tem núcleo luminoso e o projétil é consumido no
contato. Morte, desativação por distância e respawn limpam os projéteis.
A invulnerabilidade compartilhada de 0,7 s continua impedindo dano acumulado.

`engine.js`: hazards são retângulos estáticos, não existe dano geral ao tocar
plataformas comuns. A antiga prensa desenhava x+60, largura 180 e altura 150,
enquanto o dano usava x, largura 150 e altura 18. Agora imagem e dano usam o
mesmo retângulo, com borda e sinalização. A poça é refrigerante contaminado,
dano 12, com área 210×18 visível, borda ciano, ondulação, bolhas, tubo e aviso.
O brilho e o tubo não causam dano. O contato destaca a superfície por 0,4 s.

`bosses.js`: Warden mantém ataques, avisos, projéteis e arena com a mesma largura.
`combat.js` centraliza invulnerabilidade e registra dano aceito. Não foi encontrado
um sistema adicional de dano persistente no cenário industrial.

## Debug e integração

F3 alterna sem pausar ou modificar colisões: vermelho para ataques/projéteis,
verde para hurtboxes, laranja para hazards, azul para colisores. Mostra a última
categoria de dano; por dois segundos também entidade, tipo e posição da fonte.

`save.js` migra uma cópia do save v2 antigo: +400 a partir da inserção em 4000,
checkpoint 3980→4380; saves já migrados não recebem deslocamento novamente.
Coordenadas antigas sobre o refrigerante ou a prensa são retiradas do hazard
antes de retomar a partida.
Vitórias, habilidades, créditos e inventário continuam preservados. Migração v1
continua coberta pelos testes existentes. Saves dentro de novas coberturas são
ajustados para o topo usando a rotina existente.

`campaign.js`, gates e câmera usam os limites reais das regiões. Checkpoints
continuam no chão seguro e fora dos hazards. Passarelas industriais são de mão
única para não prender saltos sob estruturas. Câmera mantém os limites do mundo
e o acompanhamento vertical existentes; nenhum sistema foi reescrito.

## Validação

`node tests/factory.mjs`: dano melee e aviso, alturas, projétil, limpeza após
morte, limites da poça, invulnerabilidade, percurso horizontal com obstáculos,
saltos reais da rota opcional a 30/60/120 FPS, câmera e saves sem dupla migração.

`node tests/browser-factory.mjs`: abre o jogo no Edge via CDP, carrega assets
industriais, verifica F3 ligado/desligado e fonte da poça, coleta recompensa
opcional e captura quatro imagens. Também valida os dois checkpoints industriais,
respawn, limpeza dos projéteis, trigger de Warden e saída para a Torre após vitória.
Não equivale a uma partida manual completa.
Registra erros de console e rede; o favicon ausente é registrado, mas não conta
como falha de asset do jogo.

Regressões: campaign, sector9, combat, dash e matrona. A campanha verifica
gates, checkpoints, transições, vitórias e ataques dos três bosses, além dos
saves legados. As dimensões esperadas foram atualizadas para a expansão.

Pendente: avaliação humana de ritmo, dificuldade e leitura durante uma partida
completa; o percurso automatizado isola física e os testes de dano isolam combate.
