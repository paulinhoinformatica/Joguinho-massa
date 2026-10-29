# Brumas de Âmbar

RPG de captura para navegador, feito com HTML, CSS, Canvas e JavaScript modular. A vila e as regiões selvagens partilham um mapa contínuo, com perspetiva oblíqua 2D, edifícios voxel em SVG e personagens/ambiente desenhados em Canvas.

## Executar no VS Code

1. Abre esta pasta no VS Code.
2. Na raiz do projeto, inicia um servidor estático local. Com **Live Server**, clica com o botão direito em `index.html` e escolhe **Open with Live Server**.
3. Abre o endereço `http://...` no Chrome, Edge ou Firefox.

O servidor é necessário porque os navegadores bloqueiam módulos JavaScript quando se abre a página diretamente por `file://`. Não há dependências nem compilação.

## Controlos

- **WASD / setas:** mover
- **E / Enter:** falar, examinar ou recolher o achado secreto na Pradaria
- **Tab:** mostrar ou esconder o menu do jogo
- **J:** missões · **M:** mapa · **I:** mochila · **P:** equipa
- **Esc:** fechar um painel ou abrir a pausa

Na vila, usa **E** junto a uma porta (ou atravessa-a) para entrar. Os interiores têm NPCs; procura também os baús nas casas, no armazém e na casa abandonada. Fala com a guardiã do **Centro de Vínculo** para recuperar a equipa. Usa os portões oeste, norte e leste para explorar a Pradaria, a Floresta e o Lago e Pedras. Encontros selvagens só começam quando caminhas pela relva alta dessas regiões.

## Recursos visuais

- As casas, o terreno, árvores, rochas, praça, cercas, portões e móveis exteriores são desenhados no Canvas por `js/world.js`, com contornos e detalhes em blocos de pixels.
- Jogador e habitantes usam sprites 16×22 desenhados em Canvas. Cada monstro tem uma silhueta pixelada de 24×24 com detalhes elementares próprios em `js/monsters.js`; a escala é adaptada à exploração, à equipa e à batalha.
- `assets/sprites/houses/village-houses.svg` permanece como folha original de referência dos modelos arquitetónicos; as casas do mapa são renderizadas em Canvas para manter escala e ordenação com o mundo.

## Sistemas preservados

Captura, batalhas, experiência, evoluções, itens, equipa/caixa, enciclopédia, missões e `localStorage` continuam no motor. O renderizador ordena edifícios, objetos e personagens por profundidade; as colisões usam a planta dos edifícios e as células do mapa, independentemente da imagem do telhado. Cada edifício tem um interior próprio, com saída pela porta e conteúdo pesquisável persistente. Pedras pequenas agora são decorativas e transitáveis; apenas água, árvores, muralhas e edifícios bloqueiam a passagem.

## Trabalho futuro

A vila tem serviços funcionais, mas as casas sem NPC associado ainda são cenários. A história do Círculo do Véu não está completa, e os habitantes não têm rotinas de circulação. A referência visual não estava acessível como ficheiro neste projeto; os sprites foram construídos localmente a partir da descrição visual do pedido.
