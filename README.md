# Nova Aurora — Sinal Morto

Metroidvania cyberpunk para navegador, com HTML, CSS, JavaScript modular e Canvas. A campanha tem **três mapas conectados, nove áreas de exploração e três bosses**.

Kael investiga um vírus que infecta robôs e implantes humanos. A Aurora Dynamics distribui a infecção para testar uma rede de controle populacional.

## Executar

Abra a pasta com Live Server ou execute `python -m http.server 8765 --bind 127.0.0.1` e acesse `http://127.0.0.1:8765/`. O jogo exige HTTP para seus módulos; não abra por `file://`. Não há dependências para instalar.

## Campanha

| Ato | Mapa | Boss | Vitória |
|---|---|---|---|
| I | Setor 9 | Matrona | Revelação da Aurora Dynamics; passagem industrial, esquiva e salto duplo |
| II | Complexo Industrial | Warden | Credencial da Torre Aurora; EMP e sobrecarga |
| III | Torre Aurora, com núcleo integrado | Véspera | Transmissão interrompida; cena final e exploração após a conclusão |

Yara fornece o gancho; Oren troca créditos por proteção; o cientista desertor explica a distribuição e fornece EMP; a IA corporativa revela o projeto de Véspera. Terminais, segredos e uma ponte de manutenção são opcionais. Passagens liberadas permitem retornar.

## Controles

- **A/D ou ←/→:** mover.
- **Espaço:** pular; pressionar novamente no ar executa salto duplo quando desbloqueado.
- **J ou clique:** atacar no chão ou no ar.
- **K:** implante contextual; gancho perto de ancoragens, EMP com energia suficiente, ou sobrecarga no contexto de energia restante.
- **Shift:** esquiva após Matrona.
- **E:** conversar, avançar falas, ler terminais, recolher itens e ativar checkpoints. Enter e o botão também avançam as falas durante conversas.
- **M / Esc:** mapa e pausa. **G:** laboratório de recursos.

## Salvamento

Yara é a hacker e informante do Setor 9, amiga de infância de Kael. Suas conversas alternam os dois personagens: reencontro, retorno da investigação do terminal, reação à vitória sobre Matrona e uma conversa curta nas visitas sem novidades. Os eventos `yara-reunion`, `yara-terminal` e `yara-matrona` registram conversas concluídas; `log-1` e a vitória sobre `boss-0` habilitam as novas falas. Uma conversa interrompida pode ser retomada desde o início sem reiniciar a missão. Oren continua responsável pelas melhorias mecânicas.

**Oren · Mecânico** usa seu sprite de 30×60 pixels no Setor 9 e no complexo industrial. O arquivo original encontrado em `assets/characters/npcs/Oreon/idle.png` foi preservado e copiado para `assets/characters/npcs/oren/idle.png`. As duas posições compartilham os eventos `oren-reunion` e `oren-matrona`, sem repetir revelações já concluídas. Oren acompanha Kael com o olhar durante a conversa e retorna à esquerda ao encerrar. Após as falas, escolha **Solicitar melhoria** e confirme **Comprar · 20 CR**: cada reforço concede +15 PV máximos e restaura a vida, até 190 PV. Conversar, cancelar ou não ter créditos não desconta saldo. Cada compra exige confirmação; cliques duplicados não compram dois reforços.

Versão 2, usando a mesma chave de armazenamento anterior. Guarda posição, mapa, checkpoint, bosses derrotados, implantes, objetivos, itens, créditos e eventos narrativos. Saves da campanha antiga são migrados; regiões removidas e posições bloqueadas são redirecionadas para checkpoints válidos. O primeiro salvamento mantém uma cópia do save legado. Abrigos e entrada de mapas salvam automaticamente; também é possível guardar no menu.

## Recursos visuais

Os PNGs atuais de Kael estão preservados, incluindo escala, capa, cajado e ataques terrestres/aéreos. Inimigos, NPCs, bosses e cenários continuam com desenhos provisórios onde ainda não existem PNGs. Nenhum recurso antigo foi apagado.

Para instalar sprites de outros personagens: adicione os PNGs, ajuste seu `config.json` e remova `procedural:true` da entidade em `js/config/assets.js`. O campo `assetId` de NPCs e bosses permite escolher outra entidade do manifesto. Para fundos, instale os arquivos registrados e habilite `loadBackgrounds`. Configurações de Esgotos e Abismo permanecem arquivadas, fora da campanha e do carregamento.

## Testes

```text
node tests/campaign.mjs
node tests/combat.mjs
node tests/player-animation.mjs
```

Com o servidor na porta 8765 e Edge/Chromium de teste expondo CDP na porta 9222:

```text
node tests/browser-combat.mjs
node tests/browser-campaign.mjs
```

Também é possível abrir `/tests/sprites.html`. Os testes de navegador geram capturas em `tests/campaign-*.png` e um relatório em `tests/campaign-browser-results.json`.

**Limites da validação:** os confrontos automatizados usam invulnerabilidade para testar a progressão e os impactos reais, sem medir dificuldade. A meta de 30–45 minutos e o equilíbrio para iniciantes ainda exigem partidas manuais; o percurso atual favorece uma campanha curta. Áudio e arte externa dos demais personagens continuam pendentes.
