# Inimigos

Todos os recursos de inimigos comuns ficam em `assets/enemies/<inimigo>/`.
Configurações são registradas em `js/config/assets.js` e carregadas pelo
AssetManager. AnimationManager e SpriteRenderer são compartilhados pelo jogo.

## Recursos atuais

- `infected/`: Implantado Infectado, ID `implanted_infected`. Contém
  `config.json`, `idle.png` (128 × 128) e `walk.png` (512 × 128).
  Substitui apenas o humanoide `patrol` do Setor 9.
- `cyborg_soldier/config.json`: humanoides dos demais setores.
- `infected_drone/config.json`: drones.
- `infected_robot/config.json`: robôs, incluindo manutenção.
- `servant_shooter/`: Servo Atirador, com o PNG original e animações em código.
  Substitui o robô de manutenção do Setor 9 com o ID do spawn original e posição atual x=1120, mantendo
  48 HP, 13 de dano e o ID de recompensa. A manutenção dos outros mapas permanece.
- `wheel_shooter/`: pasta reservada com instruções; ainda sem recursos ou
  registro no manifesto.

Cyborg, drone e robô ainda usam as silhuetas de `js/enemy-art.js`.
Seus PNGs previstos não estão instalados e as animações permanecem com
`enabled: false`, evitando pedidos de arquivos inexistentes. Ao instalar
sprites, ajuste grade, FPS, origem, escala e orientação nativa antes de
habilitar cada animação.

## Implantado Infectado

Preserva 42 HP e 12 de dano. Walk tem quatro quadros de 128 × 128, 6 FPS e loop.
Idle e walk usam escala 0,5, origem (64, 120) e `nativeFacing: -1`.
O sprite original olha para a esquerda; o renderizador espelha para a direita.
O colisor físico mede 28 × 56; a hurtbox mede 32 × 54.

Patrulha e perseguição usam a física existente, respeitando paredes e bordas.
A investida prepara por 0,4 s, trava a direção no final da preparação,
avança por 0,2 s e recupera por 0,7 s, com cooldown de 2 s.
Apenas o avanço possui hitbox ofensiva, com um acerto por execução.
Dano ou stun cancelam a investida. Cajado e invulnerabilidade de Kael
continuam usando suas regras existentes.

O Servo Atirador usa colisor/hurtbox de 24 × 57 e tiros direcionais. O robô
de manutenção dos outros mapas preserva suas regras. Consulte
`servant_shooter/README.md` para animações procedurais e parâmetros de tiro.

## Depuração e testes

F3 mostra colisor físico em azul, hurtbox em verde tracejado e hitbox
ofensiva ativa em vermelho, além da direção.

`tests/infected.html` verifica carregamento dos inimigos, renderização,
animações, orientação e combate do Implantado no navegador.
`tests/infected-results.txt` contém o resultado da última execução.
