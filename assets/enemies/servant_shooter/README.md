# Servo Atirador

`idle.png` é o original intacto: 128 × 128, transparente, área visível
x=27..100 e y=7..120. O design olha para a direita. A escala de 0,5 dá
aproximadamente 57 pixels de altura visível; a origem (64, 121) ancora a roda.
O colisor e a hurtbox medem 24 × 57, sem incluir a arma projetada para fora.

Não há spritesheet nem camadas derivadas. Roda e roupa se sobrepõem no PNG;
o SpriteRenderer desenha o original e `js/servant-shooter.js` acrescenta
detalhes rotativos discretos sobre a roda. O ângulo acompanha a distância
real percorrida, incluindo o sinal da direção e o espelhamento. Idle tem
oscilação de até meio pixel, pulso do olho e sinais ocasionais de energia.
A inclinação transitória é limitada a 0,035 radianos e retorna à vertical.
O olho fica mais intenso ao detectar Kael. O tiro possui preparação visual
de 0,35 s, recuo de 0,12 s e cooldown de 1,8 s.

O tipo `servant_shooter` substitui somente o robô de manutenção do Setor 9
original em x=1420, agora redistribuído para x=1120 entre coberturas. Mantém o ID `0-1420-maintenance` para as recompensas existentes,
48 HP e 13 de dano. Velocidade de patrulha: 48 unidades/s. Projéteis:
330 unidades/s, duração máxima de 2 s, colidem com estruturas sólidas e
respeitam a invulnerabilidade de Kael. Não há dano por contato.

Usa moveBody, o sistema de dano, o ciclo de morte/respawn e os registros de
projéteis existentes. Dano ou stun cancelam a preparação. A morte remove
o inimigo como os outros inimigos sem spritesheet de morte e limpa as balas.
Se o PNG falhar, o fallback Canvas representa um robô com uma única roda.

Teste no navegador: `tests/servant.html`. Resultado: `tests/servant-results.txt`.
