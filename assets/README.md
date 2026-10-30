# Guia de assets de Nova Aurora

Os recursos finais são PNG RGBA, desenhados externamente (por exemplo, no Krita). Não sobrescrevas configurações para substituir arte: mantém o caminho registado e troca o PNG. O `AssetManager` mantém uma única instância por caminho, reporta falhas e só entrega imagens em estado `ready` ao renderer. Até os PNGs serem adicionados, os desenhos geométricos existentes são **fallbacks provisórios**, assinalados nos renderizadores.

## Pastas

```text
assets/
  characters/protagonist/       Kael e config.json
  characters/npcs/              NPCs
  enemies/                      cyborg_soldier, infected_drone, infected_robot
  bosses/                       uma pasta por chefe
  environments/                 slums, industrial, sewers, corporate, virus_core
  backgrounds/                  fundos parallax por região
  weapons/                      sprites de armas
  effects/                      efeitos animados (por exemplo, EMP)
  interface/                    ícones e elementos HUD
  audio/                        áudio, reservado para integração futura
```

Os diretórios sem ficheiros de arte continuam vazios até receberem os PNGs. Não foram criados sprites fictícios.

## Exportar do Krita

- Usa **PNG**, RGBA/8-bit, fundo transparente, sem matte de cor.
- Mantém a mesma caixa de quadro e linha de chão em todos os quadros da animação.
- Exporta uma spritesheet horizontal ou vertical, sem espaçamento entre quadros; ou uma sequência `nome_01.png`, `nome_02.png`…
- A origem (`origin`) é medida a partir do canto superior esquerdo do quadro. Para personagens em pé, configura-a no centro dos pés. O ponto `target.y` do renderer recebe a linha dos pés no mundo.
- Não é obrigatório usar quadros 128×128. A largura, altura, colunas e quantidade são definidas individualmente por animação no JSON.
- Faz o fundo da região no tamanho lógico de 960×540 (ou configura `width`/`height` no manifesto). Os fundos repetíveis devem ser contínuos nas extremidades.

## Adicionar personagem, inimigo ou chefe

1. Cria a pasta em `assets/` e copia os PNGs para ela.
2. Cria `config.json` no formato de `characters/protagonist/config.json`. Cada entrada de `animations` aceita `sheet` mais `frameWidth`, `frameHeight`, `columns`, `rows`/`count`, ou `frames` com caminhos individuais.
3. Define `fps`, `loop`; para animações únicas usa `loop:false` e opcionalmente `freezeLast:true`. `events` associa um `name` a um índice de quadro (base zero). Eventos disponíveis podem sincronizar golpes, disparos e poderes.
4. Define `origin`, `scale`, `visual.offsetX/Y` e `collision.width/height/offsetX/offsetY`. A caixa de colisão é aplicada ao corpo da entidade e não depende do recorte visual.
5. Regista uma chave e as regiões em `js/config/assets.js` (`ASSET_MANIFEST.entities`). O carregamento por região inclui entidades, fundos, tiles e objetos registados. Não alteres os módulos de carregamento ou o loop do jogo.

## Fundos e cenário

Regista cada PNG em `ASSET_MANIFEST.regions[região]` e declara ordem, `depth`, `parallax`, dimensões e repetição em `backgroundLayers`. Fator `0` fica preso à câmara; `1` acompanha o mundo. Usa `environmentObjects[região]` para objetos decorativos `{src,x,y,width,height,depth}`. O renderer ordena por profundidade e ignora objetos fora da câmara. Para a superfície das plataformas, o manifesto aceita um `regionTiles[região]`. Os dados de colisão continuam em `js/map.js`; uma imagem nunca define colisões.

## Efeitos, armas e interface

O `EffectsManager.add({entityId,animation,x,y,scale,depth})` anima e remove efeitos de reprodução única. Configura-os como entidades no manifesto. O renderer de sprites pode também desenhar sprites de armas e objetos com a mesma origem e espelhamento. `assets/weapons/ion_pistol/config.json` serve como configuração de integração; o disparo de arma ainda não existe no combate atual. Áudio também está reservado, sem sons incluídos.

## Testar

Inicia o projeto por HTTP local (por exemplo, Live Server), começa ou continua uma jornada e abre o **Laboratório de assets** pelo botão no rodapé ou pela tecla **G**. Escolhe uma entidade e animação, altera escala e espelhamento e compara a linha dos pés com a caixa de colisão vermelha. O painel mostra o progresso do carregamento, imagens ausentes, transparência detetada, paralaxe e eventuais erros de configuração. Antes de exportares PNGs, os itens de imagem/paralaxe mostram “aguarda PNG”; isso é esperado.

O laboratório é uma bancada visual para verificação manual. O indicador “Batch draw” mede o tempo de desenho em Canvas de todos os PNGs carregados numa superfície de teste; também mostra a quantidade de imagens. Isso não mede composição/GPU nem substitui o profiler do navegador ou uma medição de FPS com o conjunto final.
