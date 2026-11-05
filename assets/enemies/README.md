# Inimigos

Configurações separadas por inimigo e animações PNG; consulta `assets/README.md`.

O Setor 9 possui patrulheiro (`patrol`, 42 HP / 12 de dano) e robô de manutenção
(`maintenance`, 48 HP / 13 de dano). Estatísticas e colisores foram preservados:
patrulheiro 34 × 58; manutenção 38 × 60 após aplicar seu config.

Os dois usam `moveBody` para chão, plataformas e knockback. A própria caixa do
corpo é também a hurtbox: não há escala adicional nem um colisor invisível
separado. O cajado continua usando sua hitbox existente e o consumo por golpe.
O knockback de 190 unidades/s já calculado ao receber dano agora é aplicado.
Não foi adicionada invulnerabilidade extra aos inimigos.

`js/sector9-enemies.js` define golpes direcionais com alcance frontal de 52
unidades, altura de até 28, preparação de 0,22 s e fase ativa de 0,14 s.
O intervalo de 1,25 s e o dano original foram mantidos. A direção é travada na
preparação; dano exige sobreposição horizontal e vertical e acontece no máximo
uma vez por execução, respeitando a invulnerabilidade de Kael e seu dash.
Receber dano ou stun cancela o golpe pendente. Alvos no ar só são atingidos
quando realmente cruzam a área do golpe.

`js/enemy-art.js` desenha as silhuetas Canvas: capacete, placas, articulações,
ferramentas e sinais de infecção, diferenciando humanoides, robôs e drones.
O golpe ativo usa a mesma geometria da área ofensiva para seu rastro visual.

## Sprites PNG futuros

Nenhum PNG de inimigo está instalado. As animações previstas permanecem em
seus configs, com `enabled: false`; o manifest agora permite seu carregamento.
Para instalar uma animação real, coloque o PNG no caminho definido, ajuste
grade, FPS, origem, escala e `nativeFacing`, e habilite somente aquela animação.
O AssetManager a carregará na região correspondente. Enquanto isso, o fallback
Canvas continua funcionando sem solicitar arquivos inexistentes. A IA dos
inimigos de outros mapas não foi alterada.

## Depuração

F3 alterna o overlay durante o jogo, inclusive pausado: azul para o colisor
físico, verde tracejado para a hurtbox e vermelho para áreas ofensivas ativas e
setas de direção. Azul e verde coincidem quando a própria caixa física recebe
o dano. A transformação da câmera é aplicada uma vez, após os efeitos de chuva.

Verificação: `node tests/sector9.mjs` (30/60/120 FPS) e
`node tests/browser-sector9.mjs` (HTTP local em 8765 e Edge/CDP em 9222).
