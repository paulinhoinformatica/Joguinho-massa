# Campanha de três atos — implementação e validação

## Percurso

O mundo contínuo agora mede 7.200 pixels. São três mapas de 2.400 pixels, divididos em nove áreas do mapa geral. O piso conecta as regiões; os telhados e passarelas oferecem rotas opcionais. Não há troca de projeto nem substituição do motor.

1. **Setor 9:** ruas e telhados reaproveitados. Yara apresenta as infecções e fornece gancho. Oren instala proteção por créditos. Matrona guarda a saída; sua derrota revela a Aurora Dynamics, libera a indústria e concede esquiva e salto duplo.
2. **Complexo Industrial:** passarelas, máquinas, tubulações, prensa e ácido reaproveitados. O cientista desertor explica a distribuição e fornece EMP; Oren mantém as melhorias. Uma ponte de manutenção pode ser aberta. Warden protege a saída; sua derrota concede a credencial da torre e os implantes EMP/sobrecarga.
3. **Torre Aurora:** o ambiente corporativo ocupa a entrada e os laboratórios. O último trecho utiliza a paleta e o registro de recursos do antigo núcleo. A IA corporativa revela a finalidade dos testes. Véspera protege o transmissor; sua derrota abre a cena de encerramento e permite explorar novamente.

Esgotos Tecnológicos, Abismo e suas configurações foram retirados do percurso e do carregamento obrigatório, preservando seus arquivos. O Núcleo do Vírus deixou de ser um quarto/quinto mapa e foi integrado à torre.

## Combate, checkpoints e saves

Os três bosses têm arenas, HUD, sinais de ataque, golpes baixos e projéteis, recuperação vulnerável, segunda fase mais rápida e efeito de derrota. As vidas são 180, 240 e 320. As arenas não contêm inimigos comuns ou perigos do cenário. A física e os ataques terrestres/aéreos de Kael foram preservados; somente o limite horizontal passou a usar a largura real do mundo.

Há dois abrigos por mapa, um deles antes da arena. Interagir com um abrigo cura e salva. Entrar em outro mapa também registra um checkpoint e salva. Morrer restaura os recursos e reinicia apenas os confrontos ainda não vencidos. Vitórias e recompensas são registradas uma vez.

O save versão 2 mantém a chave `nova-aurora-save-v1`. Bosses são reconstruídos com posições atuais e IDs estáveis. Saves antigos dos esgotos vão para um checkpoint industrial válido; saves corporativos/do núcleo são remapeados para a torre quando liberada. Estados além dos portões são redirecionados para uma área acessível. Habilidades, itens, créditos, registros e vitórias são preservados. O primeiro salvamento mantém uma cópia em `nova-aurora-save-v1-legacy-backup`. JSON inválido não impede iniciar e salvar uma nova partida.

## Arquivos desta reformulação

- `js/map.js`, `js/campaign.js`: regiões, geometria reaproveitada, NPCs, terminais, atalhos, objetivos e regras dos atos.
- `js/bosses.js`, `js/enemies.js`: três bosses, arenas, avisos, vulnerabilidade, posições e quantidade de inimigos.
- `js/engine.js`, `js/physics.js`: conexão dos mapas, limites do mundo, portões narrativos, recompensas e retorno após morte.
- `js/dialogue.js`, `js/ui.js`, `js/abilities.js`: história, mapa, diário, HUD e textos dos implantes.
- `js/save.js`: persistência e migração das cinco regiões anteriores.
- `js/main.js`, `index.html`, `css/ui.css`: encerramento, retorno à exploração e opções de personagens no laboratório.
- `js/config/assets.js`, `js/engine/assetManager.js`, `js/engine/assetLab.js`, `js/world.js`: carregamento apenas de recursos instalados, preparação dos PNGs futuros, composição da torre e renderização sem suavização.
- `README.md`, `CAMPANHA.md`: execução, controles, campanha e limites da validação.
- `tests/campaign.mjs`, `tests/browser-campaign.mjs`, `tests/sprites.html`: testes da campanha e atualização das expectativas antigas dos sprites.

As alterações anteriores de `player.js`, `combat.js` e do config de Kael foram mantidas. Esta reformulação não redesenhou nem substituiu suas spritesheets.

## Testes executados

- `node tests/campaign.mjs`: três regiões/nove áreas, portões, arenas, padrões e derrotas dos bosses em 30/60/120 FPS, atalho, limites, checkpoints, 20 combinações de migração antiga, save atual, JSON inválido e retorno de save com jogador morto.
- `node tests/combat.mjs`: 159 verificações de combate terrestre/aéreo, eventos, cooldowns, prioridades e ausência de dano duplicado.
- `node tests/player-animation.mjs`: regressão de caminhada, corrida, aterrissagem e continuidade das animações em 30/60/120 FPS.
- `node tests/browser-combat.mjs`: 182 verificações com PNGs reais no Edge headless.
- `node tests/browser-campaign.mjs`: 52 verificações de integração no navegador; novo jogo, NPCs, três vitórias com eventos reais de ataque, recompensas sem duplicação, progressão, mapa, diário, cena final, checkpoints, save/load, morte, percurso completo de ida e volta e handlers reais de continuar/explorar após o final. Sem exceções JavaScript ou downloads falhos no teste.
- `/tests/sprites.html`: todos os testes passaram, incluindo PNGs atuais, espelhamento, eventos, hitbox ajustada e início do jogo no navegador.
- Verificação de sintaxe dos módulos e `git diff --check`.

Capturas inspecionadas: `tests/campaign-setor9.png`, `tests/campaign-industrial.png`, `tests/campaign-torre.png`, `tests/campaign-ending.png`. Os resultados de integração ficam em `tests/campaign-browser-results.json`.

## Pendências reais

- A duração de **30–45 minutos não foi validada nem garantida**. O percurso é curto e pode ser concluído bem mais rapidamente; partidas de iniciantes devem orientar eventual expansão de conteúdo e ajuste de ritmo.
- Os testes automatizados dos bosses usam invulnerabilidade do jogador para isolar a integração. Não substituem uma partida manual para medir dificuldade, legibilidade e sensação de combate.
- NPCs, inimigos, bosses e cenários aguardam sua arte externa. O projeto mantém visuais provisórios; os PNGs de Kael continuam intactos. Para instalar os futuros sprites, basta configurar a entidade e retirar `procedural:true` no manifesto. Fundos ficam registrados, mas seu carregamento permanece desativado até os arquivos existirem.
- O áudio continua pendente do projeto anterior.
