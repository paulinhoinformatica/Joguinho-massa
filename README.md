# Nova Aurora — Sinal Morto

Metroidvania cyberpunk original para navegador, construído com HTML, CSS, JavaScript modular e Canvas. O mundo é uma cidade contínua com cinco distritos e quinze áreas de mapa conectadas. Sprites, plataformas, cenário, efeitos e personagens são desenhados por código; não são carregadas imagens externas.

## Executar

Abre a pasta no VS Code e inicia `index.html` com a extensão **Live Server**. O jogo usa módulos JavaScript e `localStorage`; por isso, deve ser aberto num endereço HTTP local, não diretamente por `file://`. Não requer instalação de dependências.

## Controlos

- **A/D** ou **←/→**: mover
- **Espaço**: saltar; volta a pressionar no ar depois de obter Salto duplo
- **J** ou **clique**: atacar
- **K**: usar o implante contextual
- **Shift**: Impulso cibernético, depois de desbloqueado
- **E**: falar, ler terminais, ativar abrigos ou recolher itens
- **M**: abrir o mapa; **Esc**: pausa

## O que está implementado

- Movimento com aceleração, gravidade, tolerância de salto, buffer, salto duplo, plataformas e colisões com superfícies.
- Combate em tempo real, combos, recuo, invulnerabilidade, energia, projéteis e inimigos com patrulha, perseguição, ataque e recuperação.
- Cinco regiões interligadas, quinze áreas reveláveis, portões por habilidade, plataformas, perigos, terminais, itens secretos e abrigos.
- Quatro chefes com avisos de ataque, duas fases e recompensas de progressão.
- Impulso, salto duplo, gancho, pulso EMP, sobrecarga e filtro de contaminação com aplicações no mundo.
- NPCs, uma melhoria de equipamento comprável, registos narrativos e missão de recolha.
- Guardar em pontos de controlo e no menu, continuar, reaparecer e persistência de chefes, habilidades, itens, salas, missão e recursos.

## Limites atuais

Os recursos visuais são pixel art gerada em Canvas e ainda são blocos procedurais, não folhas PNG desenhadas à mão. As cinco regiões e o percurso principal são jogáveis; diálogos ramificados, áudio, animações quadro a quadro completas, inventário de armas e uma segunda escolha final ainda não foram desenvolvidos. O comportamento dos chefes está implementado, mas precisa de ajuste fino de dificuldade após teste visual em navegador.
