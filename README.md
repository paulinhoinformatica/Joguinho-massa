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

Na vila, entra pela porta do edifício com a cruz e fala com a guardiã do **Centro de Vínculo** para recuperar a equipa. Usa os portões oeste, norte e leste para explorar a Pradaria, a Floresta e o Lago e Pedras. Os encontros selvagens só começam na relva alta dessas regiões.

## Recursos visuais

- `assets/sprites/houses/village-houses.svg` é uma folha de sprites transparente com dez construções de madeira, pedra, vigas, telhados, janelas, portas, lanternas e variações de uso.
- O terreno, as árvores, as rochas, a praça, as cercas, os portões, as lanternas e os móveis exteriores são desenhados e cacheados por `js/world.js`.
- Jogador e habitantes são sprites voxel desenhados em Canvas; os monstros continuam a ser sprites procedurais próprios em `js/monsters.js`.

## Sistemas preservados

Captura, batalhas, experiência, evoluções, itens, equipa/caixa, enciclopédia, missões e `localStorage` continuam no motor. O renderizador ordena edifícios, objetos e personagens por profundidade; as colisões usam a planta dos edifícios e as células do mapa, independentemente da imagem do telhado.

## Trabalho futuro

A vila tem serviços funcionais, mas as casas sem NPC associado ainda são cenários. A história do Círculo do Véu não está completa, e os habitantes não têm rotinas de circulação. A referência visual não estava acessível como ficheiro neste projeto; os sprites foram construídos localmente a partir da descrição visual do pedido.
