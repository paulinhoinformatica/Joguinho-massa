# Matrona — combate e animações

Os sprites originais `idle.png` e `idle (1).png` (130 × 254) foram preservados.
Os ataques reais têm 1524 × 254, seis quadros horizontais de 254 × 254,
com transparência real confirmada no Canvas do navegador.

| Animação | Quadros usados | FPS | Origem | Escala |
| --- | --- | --- | --- | --- |
| idle | 0 | 1 | 65, 254 | 130 / 254 |
| walk | 0–7 | 8 | 127, 254 | 130 / 254 |
| attack_beam | 0–5 | 10 | 127, 254 | 130 / 254 |
| attack_quarantine | 0–4 | 10 | 127, 254 | 130 / 254 |

Todas usam orientação nativa -1, base alinhada ao chão e altura visual de
130 pixels. A colisão existente de 74 × 132 foi preservada. Não há interpolação.
O último quadro da quarentena foi excluído por apresentar artefatos nos braços.
Na recuperação, a pose se dissolve para o idle em 0,22 segundo.

## Raio de Contenção

Valores centralizados em `MATRONA_TIMING`: acompanhamento de 0,7 s,
aviso com mira travada de 0,4 s, disparo de 0,3 s e recuperação de 0,6 s.
A segunda fase preserva integralmente essas janelas de reação. Quadros 0–2
preparam o braço; o quadro 2 é mantido durante a mira final e o disparo;
quadros 3–5 completam a recuperação. `holdFrame`, `hands` e `hand` no config
registram a posição da mão na imagem original. O cálculo usa a mesma escala,
origem, arredondamento e espelhamento do SpriteRenderer.

A mira acompanha o centro da hitbox de Kael durante o acompanhamento. O segmento
é travado ao entrar em `beam_lock` e permanece idêntico durante o disparo.
O aviso ganha intensidade, contorno escuro e núcleo claro; na trava, pisca.
O alcance é limitado a 850 unidades, às bordas da arena e aos sólidos altos,
incluindo o chão. Passarelas de uma direção não bloqueiam o raio. A colisão usa
o segmento contra a caixa de Kael com raio de 5 unidades; o núcleo visual tem
10 unidades de espessura. A aura exterior é decorativa. O mesmo objeto guarda
a trajetória do aviso e do disparo. Cada ataque pode causar dano uma vez,
usando `hurt` e a invulnerabilidade já existente, inclusive a do dash.

## Protocolo de Quarentena

Ativação de 0,45 s, aviso de 0,85 s, descarga de 0,3 s e recuperação de 0,55 s.
São marcadas duas regiões (até três na fase 2) de 86 × 38 unidades sobre
superfícies reais do mapa. Não há dano no aviso. As caixas sinalizadas são
mantidas durante a descarga, espaçadas e limitadas à arena, deixando área
segura. Saltar acima das caixas, correr ou usar dash permite escapar.

## IA e ciclo de vida

`walk.png` tem 2032 × 254 pixels com oito quadros e loop. O SpriteRenderer e o
AnimationManager existentes controlam a caminhada, incluindo espelhamento.
A origem mantém os pés na mesma base do idle, sem redesenhar os quadros.
Durante `reposition`, Matrona alterna movimentos de 0,4–0,8 s e pausas de
0,25–0,65 s. Aproxima-se além de 285 unidades, ocasionalmente recua abaixo de
125 e faz ajustes laterais na distância intermediária. `MATRONA_MOVEMENT`
centraliza esses parâmetros. A velocidade é de 24 unidades/s a 8 FPS, com
cadência proporcional ao FPS. Há margem nas bordas e distância mínima de Kael,
sem atravessá-lo. O sprite olha na direção efetiva do passo, inclusive no recuo;
a orientação de combate continua voltada a Kael. Sem deslocamento, usa idle.
Ataques e recuperação têm prioridade sobre walk; depois, pode voltar a caminhar.
Se o PNG estiver indisponível, o fallback para idle permanece ativo.

`js/matrona.js` separa atualização, geometria e efeitos Canvas.
A escolha pondera distância e permanência do jogador, com limite
de duas repetições consecutivas. Abaixo de 40% de vida, a quarentena e o intervalo
são ligeiramente mais rápidos; o raio mantém os novos tempos completos.

A recuperação permite os contra-ataques do sistema existente. Dano não cancela
as poses de ataque. Morte e respawn removem raio, zonas e estados pendentes.
Recompensas e progressão usam o fluxo existente de `finishBoss`.

As definições antigas desativadas de attack/damage/death foram preservadas.
Se um ataque não estiver disponível, renderização e origem da mão usam idle.
Não foram criadas imagens provisórias. Se substituir as sheets no futuro,
recalibre origem e mãos conforme a nova arte.

## Verificação

- `node tests/matrona.mjs`: geometria, mira travada, dano, invulnerabilidade,
  recuperação, superfícies, espaço seguro, movimento e limpeza a 30/60/120 FPS.
- `node tests/browser-matrona.mjs`: exige servidor HTTP em 8765 e navegador
  com depuração remota em 9222. Confirma carregamento dos PNGs, transparência,
  escala, espelhamento, combate, progressão e ausência de erros HTTP/console.
- Capturas: `tests/matrona-beam-preview.png`,
  `tests/matrona-quarantine-preview.png`, `tests/matrona-warning-preview.png`.

Nenhum PNG de ataque está ausente. O equilíbrio final de dificuldade pode ser
refinado com partidas manuais; não exige configuração adicional para jogar.
