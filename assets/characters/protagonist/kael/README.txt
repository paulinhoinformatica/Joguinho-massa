NOVA AURORA — KAEL
Organização inicial dos sprites gerados no PixelLab

ESTRUTURA
- spritesheets/: uma faixa horizontal por sequência, com 4 quadros.
- frames/: os mesmos quadros separados em PNGs individuais.
- referencia_original.png: imagem original recebida.

DIMENSÕES
- Imagem original: 256 x 256 px.
- Grade presumida: 4 colunas x 4 linhas.
- Cada célula exportada: 64 x 64 px.
- Formato: PNG RGBA (transparência preservada quando presente na origem).

IDENTIFICAÇÃO PROVISÓRIA DAS LINHAS
1. idle_provisorio: poses quase em pé; candidata a animação de repouso.
2. movimento_provisorio: mudança de postura e posição do bastão; não é possível confirmar se é caminhada ou preparação de ataque.
3. ataque_bastao_provisorio: poses baixas e movimento amplo do bastão; candidata a ataque.
4. impulso_esquiva_provisorio: poses inclinadas e rastros de energia; candidata a impulso/esquiva.

IMPORTANTE
A imagem não possui rótulos. Portanto, as animações 2, 3 e 4 foram nomeadas
provisoriamente para evitar classificar incorretamente os movimentos. Confira
a reprodução quadro a quadro antes de configurar velocidade e hitboxes no jogo.

INTEGRAÇÃO
Copie a pasta kael para dentro de assets/characters/ do projeto.
Use primeiro os PNGs de spritesheets se o motor do jogo suportar faixas
horizontais com 4 quadros. Caso contrário, use os arquivos em frames/.
