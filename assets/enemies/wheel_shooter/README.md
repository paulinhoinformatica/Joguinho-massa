# wheel_shooter

Pasta reservada para o futuro robô. Ainda não há sprites, configuração ou
registro no manifesto; nenhum arquivo desta pasta é solicitado pelo jogo.

Coloque os futuros PNGs e `config.json` aqui. Use caminhos a partir da raiz,
como `assets/enemies/wheel_shooter/idle.png`, e registre a configuração em
`js/config/assets.js` somente quando os recursos estiverem disponíveis.
Reutilize AssetManager, AnimationManager e SpriteRenderer, configurando a
grade real, a origem dos pés, escala, `nativeFacing` e colisões do robô.
