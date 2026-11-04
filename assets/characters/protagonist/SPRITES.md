# Sprites externos — Nova Aurora

O sistema existente (AssetManager → AnimationManager → SpriteRenderer) foi adaptado; não há um segundo motor de sprites.

## Caminhada do Kael

Coloque o PNG exportado em `assets/characters/protagonist/the_hooded_animation_sheet.png`.
Nenhum arquivo de imagem foi criado. A folha de oito quadros não estava presente.
Os PNGs existentes em `kael/spritesheets` medem 256×64, com quatro quadros de 64×64; não foram classificados como a nova caminhada.

Configuração já preparada para uma faixa horizontal:

```json
{
  "sheet": "assets/characters/protagonist/the_hooded_animation_sheet.png",
  "columns": 8,
  "rows": 1,
  "count": 8,
  "fps": 10,
  "loop": true,
  "displayHeight": 64,
  "fallback": ["idle"]
}
```

Com frameWidth/frameHeight omitidos, o carregador lê naturalWidth/naturalHeight do PNG e divide por columns/rows. Uma folha W×H terá quadros W/8×H. Dimensões fracionárias, grades fora da imagem e contagem excessiva são rejeitadas com console.warn. Para duas linhas de quatro quadros, use columns:4, rows:2. A ordem é esquerda para direita, de cima para baixo. A grade deve ser regular, sem margens ou espaçamento; exporte assim ou use frames individuais.

displayHeight representa a altura visual da célula inteira, não a altura da figura opaca. O valor inicial 64 acompanha o idle provisório existente; não presume a resolução do PNG. Se exports tiverem quantidades diferentes de transparência, calibre scale e origin por animação usando a mesma altura corporal como referência. O alinhamento visual definitivo só pode ser confirmado com as imagens finais.

## Origem, escala e hitbox

A ordem de prioridade é origin da animação, originRelative da animação/personagem, origin do personagem, centro inferior. originRelative usa frações da célula; Kael usa {x:0.5,y:1}. Para pés acima da borda transparente, informe a coordenada real dos pés por animação. visual.offsetX/offsetY também podem ser definidos por animação, em pixels de origem, antes da escala. O espelhamento ocorre ao redor da âncora corporal, inclusive para origens assimétricas.

scale da animação substitui scale do personagem. Em folhas, displayHeight calcula scale no carregamento; em quadros individuais calcula pela altura do PNG. Evite misturar scale e displayHeight. Quadros individuais devem compartilhar escala e âncora consistentes. Não há recorte adicional ao retângulo do quadro: cajado/capa precisam estar inteiros dentro de cada célula na exportação.

collision continua independente. A caixa corporal de Kael é 30×54. A hitbox existente do cajado (alcance 70, altura 40, offset vertical 7) foi preservada.

Exemplo de animação com coordenadas explícitas (valores apenas ilustrativos, substitua pelas medidas do seu export):

```json
{
  "sheet": "assets/characters/protagonist/attack_melee.png",
  "frameWidth": 200,
  "frameHeight": 100,
  "columns": 6,
  "rows": 1,
  "count": 6,
  "fps": 15,
  "loop": false,
  "freezeLast": true,
  "origin": {"x": 80, "y": 94},
  "scale": 0.64,
  "visual": {"offsetX": 0, "offsetY": 0},
  "events": [{"frame": 2, "name": "hit"}],
  "fallback": ["idle"]
}
```

Para quadros individuais, substitua sheet/columns/rows/count por `"frames": ["caminho/01.png", "caminho/02.png"]`. Cada imagem é desenhada inteira. fps, loop, origem, escala e eventos continuam válidos. Caminhos seguem o padrão atual: relativos à raiz HTTP do jogo, não ao diretório do JSON.

## Estados, fallback e combate

animationMap no personagem mapeia attack para melee e dash para dodge. Estados restantes mantêm seus nomes.
fallback em cada animação aceita um nome ou lista; fallback.animations no personagem define alternativas gerais. Cadeias cíclicas são interrompidas. Kael usa run → walk → idle, walk → idle e idle como alternativa geral.

Se as alternativas não carregarem, `"fallback": {"animations": [], "static": {"animation": "idle", "frame": 0}, "procedural": false}` permite usar um quadro estático da animação indicada. Esse PNG precisa existir. Se nenhum PNG carregar, o personagem não é desenhado e os avisos permanecem visíveis no console; não inventamos outra aparência. Somente fallback.procedural:true habilita drawKael temporariamente.

Eventos usam índices a partir de zero e são emitidos ao entrar no quadro, inclusive quadro zero e reinício de loops. Nomes repetidos em quadros diferentes são permitidos. Fallbacks visuais não emitem eventos do estado substituído. O ataque com melee disponível usa sua duração configurada, reinicia a instância por golpe e aguarda hit. Sem melee, mantém o combate temporizado existente. combat.js e bosses.js mantêm consumo do golpe após acertar; não houve alteração em danos, combos ou na hitbox. Cooldowns existentes foram preservados.

## Outros personagens e desempenho

Mantenha configs independentes nas pastas existentes de NPCs, inimigos e bosses e registre novas entidades em js/config/assets.js. Cada config suporta as mesmas opções, inclusive animações exclusivas, tamanhos e colisões próprios. As regiões do manifesto continuam controlando o carregamento; PNGs e requisições concorrentes de config são reutilizados. O renderer desativa suavização e o CSS usa image-rendering:pixelated. O laboratório G respeita a escala da animação.

Não foram alteradas as artes existentes nem desenhados novos sprites. O renderer preserva os pixels recebidos; aparência de capuz, cabelo, braço, capa e cajado depende dos PNGs exportados.

## Pendências de imagens

Kael: walk, run, jump_01, jump_02, fall, landing, attack_melee, attack_ranged, dodge, special, damage e death nos caminhos do config. Idle ainda usa idle_provisorio.png. As outras folhas de quatro quadros permanecem intactas, sem assumir que sejam animações definitivas. NPCs, inimigos e bosses possuem configs, mas os respectivos PNGs ainda não existem neste checkout.

## Verificação

Sirva a raiz via HTTP e abra /tests/sprites.html. A suíte usa módulos reais, Canvas e PNG idle existente, e registra PASS/FAIL. Grades artificiais de 2400×300 e 400×160 exercitam o cálculo sem criar PNGs fictícios.

Executado em Chrome headless via HTTP local: renderização/fallback de todos os estados em duas direções, aliases, eventos no quadro zero/loop/fim, impacto único, dimensões calculadas, grade inválida, cache, hitbox simétrica, dano de combo e prevenção de dano repetido, espelhamento na âncora, repouso→caminhada→corrida, salto→queda→pouso, esquiva e inicialização/atualização do jogo real em iframe. Resultado: ALL PASS. O relatório capturado está em tests/RESULTS.txt.

A renderização dos estados ausentes foi testada com fallback idle, não com animações finais inexistentes. Não foi possível validar visualmente a caminhada de oito quadros, uniformidade de silhueta/escala, pés, capa ou cajado entre imagens finais, nem as sequências finais de dano e morte. Essa revisão permanece pendente da entrega dos PNGs.
