# Matrona — sprite instalado

- `idle.png`: cópia idêntica do arquivo original `idle (1).png`, preservado nesta pasta; 130×254 pixels com transparência.
- `idle` tem um quadro. Escala: `130 / 254`, aproximadamente `0.511811`; altura visual de 130 pixels e largura de aproximadamente 67 pixels.
- Origem: `(65, 254)`, no centro da base. A colisão continua em 74×132, com diferença visual de cerca de 2 pixels no topo e 4 pixels nas laterais.
- O PNG foi desenhado olhando à esquerda. `idle.nativeFacing: -1` evita espelhá-lo quando a direção lógica também é esquerda. A direção lógica da IA não foi alterada.
- `attack`, `damage` e `death` foram preservados com `enabled: false`, suas dimensões, FPS, eventos e escala/origem antigas. Assim, seus PNGs ainda ausentes não são solicitados pelo carregador.
- `fallbackAnimation: "idle"` mantém o sprite estático durante esses estados. A IA e os sinais de ataque continuam independentes da apresentação; a derrota provisória mantém o desaparecimento gradual.
- Quando as animações forem produzidas, atualize as definições e remova `enabled: false` ou defina `enabled: true`. Ajuste `nativeFacing` por animação se a orientação original do novo PNG for diferente.
