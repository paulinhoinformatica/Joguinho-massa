# Warden

Combate exclusivo em `js/warden.js`, integrado pelo despachante de bosses.
Matrona e Véspera conservam suas rotinas. Nenhuma imagem foi redesenhada.

## Arte e sincronização

| Fase | Quadros | Idle | Walk | Slam | Escala uniforme | Pés |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 128 × 128 | 1 | 8 | 6 | 1,1 | y=116 |
| 2 | 256 × 256 | 1 | 8 | 6 | 0,47 | y=251 |

Walk roda a 8 FPS enquanto há deslocamento real. O corpo visível mede
aproximadamente 115 pixels nas duas fases; Kael mede 57 pixels na escala atual.
O colisor mede 64 × 112 e a hurtbox possui um recuo de 5 pixels.
O espelhamento compensa as margens transparentes. O brilho do núcleo acompanha
o peito abaixado e a inclinação procedural da investida.

Slam usa os quadros 0–2 na preparação, 3 no impacto da fase 1, 4 no impacto da
fase 2 e 5 na recuperação. O quadro 3 deformado da fase 2 é omitido. O relógio
de simulação determina tanto o quadro quanto a ativação do dano.

## Combate

Estados: idle, approach, reposition, windup, charge, slam, discharge,
recovery, transition e death. O movimento usa `moveBody`, com 38 pixels/s.
As preparações duram 0,85 s para investida, 0,95 s para impacto e 1 s para
descarga. A direção fica travada após o aviso.

- Investida: 455/510 pixels/s; dano 18; altura ofensiva 55/65 pixels. Pulo
  e invulnerabilidade do dash evitam o golpe. Colidir com parede abre 1,35 s
  de recuperação.
- Impacto: dano 23, área frontal 65 × 34 / 85 × 45. Duas ondas de altura
  22/40 e alcance 230/360 pixels; dano 16. Um mesmo impacto e suas ondas
  consomem uma única oportunidade de dano. O martelo fica ativo por 0,16 s;
  o estado de impacto aguarda as ondas terminarem antes da recuperação limpa.
- Descarga: dano 17, área frontal 165 × 65 / 245 × 98, ativa por 0,28 s.
  Estruturas sólidas e limites da arena bloqueiam a descarga.

Todos os danos passam por `hurt`, preservando invulnerabilidade, dash,
knockback e identificação de fonte. F3 mostra colisor, hurtbox e áreas
ofensivas com o nome da fonte. O tremor visual também desloca a depuração.

A transição dura 1,65 s e ocorre uma vez em vida <=50%. Cancela todos os
ataques, mostra falha, rachadura, fragmentos e explosão sem dano. A troca
para os sprites sem braço ocorre aos 0,85 s, sob o clarão vermelho.
O renderizador nunca volta à fase 1 depois disso, até um novo encontro.

## Arena e ciclo de vida

Os limites derivam da largura atual da região industrial (hoje 4490–5160).
O piso existente é preservado. A câmera enquadra a arena, e inimigos comuns
industriais e seus projéteis ficam suspensos apenas durante esse encontro.
Respawn restaura posição, vida, fase e ataques. Saves antigos continuam
usando a normalização existente, que recria encontros não concluídos.

Morte limpa dano e ondas, aplica colapso e falha elétrica procedurais e usa
o fluxo existente de vitória, créditos, credencial, checkpoint e save.

## Validação

`tests/warden.mjs`: grades reais dos seis PNGs, estados, dano e esquivas,
paredes, recuperação, núcleo espelhado, duas fases, saves e limpeza em
30/60/120 FPS. `tests/browser-warden.mjs`: carregamento e transparência reais,
renderização, capturas, respawn e combate completo até vitória persistida.
Os testes usam o runtime Node; neste ambiente ele está disponível pelo
Electron do VS Code com `ELECTRON_RUN_AS_NODE=1`.

Resultados consolidados em `tests/warden-validation.txt` e
`tests/warden-browser-results.json`. Capturas `tests/warden-*.png` mostram
as duas fases, impactos, transformação e descarga.

Pendência de avaliação humana: ajustar dificuldade após jogar com os
controles reais; o combate automatizado usa invulnerabilidade para verificar
a progressão completa, e os testes de esquiva verificam o dano separadamente.
