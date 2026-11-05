// NOVA AURORA - instalador pontual do ataque do Kael.
// Roda com: node scripts/instalar_ataque_kael.mjs
// Preserva o resto do config.json e do player.js; cria backups antes de alterar.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const base = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const configPath = path.join(base,'assets/characters/protagonist/config.json');
const playerPath = path.join(base,'js/player.js');
const imagePath = path.join(base,'assets/characters/protagonist/kael/spritesheets/melee.png');

function abort(message) { console.error(`ERRO: ${message}`);process.exit(1); }
for (const file of [configPath,playerPath,imagePath]) {
  if (!fs.existsSync(file)) abort(`Arquivo ausente: ${file}. Verifique se mesclou o ZIP na pasta principal.`);
}
const img = fs.readFileSync(imagePath);
if (img.subarray(1,4).toString('ascii')!=='PNG' || img.readUInt32BE(16)!==1360 || img.readUInt32BE(20)!==120) {
  abort('O arquivo melee.png deve ser o PNG fornecido, com dimensoes 1360 x 120.');
}
let cfg;
try { cfg = JSON.parse(fs.readFileSync(configPath,'utf8')); }
catch(e) { abort(`JSON invalido: ${e.message}`); }
if (cfg.id !== 'protagonist' || !cfg.animations || !cfg.animations.melee) abort('config.json nao corresponde ao protagonista esperado.');
const player = fs.readFileSync(playerPath,'utf8');

// Selecionar SOMENTE a declaracao export const attackBox = ...;
// Usa profundidade de parenteses/chaves para ignorar ponto-e-virgulas dentro da funcao.
function locateAttackBox(code) {
  const re = /\bexport\s+const\s+attackBox\s*=/g;
  const m = re.exec(code);
  if (!m) return null;
  const start = m.index;
  let i = re.lastIndex;
  let round=0, curly=0, square=0, quote='', escape=false, lineComment=false, blockComment=false;
  for (;i<code.length;i++) {
    const c=code[i], next=code[i+1];
    if (lineComment){ if(c==='\n') lineComment=false; continue; }
    if (blockComment){ if(c==='*'&&next==='/'){blockComment=false;i++;} continue; }
    if(quote){if(escape){escape=false;continue;}if(c==='\\'){escape=true;continue;}if(c===quote){quote='';}continue;}
    if(c==='/'&&next==='/'){lineComment=true;i++;continue;}
    if(c==='/'&&next==='*'){blockComment=true;i++;continue;}
    if(c==='"'||c==="'"||c==='`'){quote=c;continue;}
    if(c==='(') round++; else if(c===')') round--;
    else if(c==='{') curly++; else if(c==='}') curly--;
    else if(c==='[') square++; else if(c===']') square--;
    if(round<0||curly<0||square<0) return null;
    if(c===';' && round===0 && curly===0 && square===0) return {start,end:i+1};
  }
  if(round===0 && curly===0 && square===0 && code.slice(i).trim()==='') return {start,end:i};
  return null;
}
const selection=locateAttackBox(player);
if(!selection) abort('Nao foi possivel localizar com seguranca export const attackBox no player.js. Nada alterado. Use as instrucoes manuais ou o Codex.');

// P = caixa fisica real no jogo, nao as dimensoes transparentes do PNG.
// Com collision 30x54: 57px a frente, 30px de altura, topo a +21px.
const newAttackBox=`export const attackBox = p => {
  // 30x54 => ataque frontal de 57x30 px, com 3 px de sobreposicao.
  const alcance = Math.round(p.w * 1.9);
  const altura = Math.round(p.h * 0.56);
  const deslocamentoY = Math.round(p.h * 0.39);
  const sobreposicao = Math.max(2, Math.round(p.w * 0.1));
  return {
    x: p.facing >= 0 ? p.x + p.w - sobreposicao : p.x - alcance + sobreposicao,
    y: p.y + deslocamentoY,
    w: alcance,
    h: altura
  };
};`;
const newPlayer=player.slice(0,selection.start)+newAttackBox+player.slice(selection.end);

// Este objeto corresponde exatamente ao arquivo PNG entregue no pacote.
const prior=cfg.animations.melee;
cfg.animations.melee={
  ...prior,
  sheet:'assets/characters/protagonist/kael/spritesheets/melee.png',
  frameWidth:170,
  frameHeight:120,
  columns:8,
  count:8,
  fps:20,
  loop:false,
  freezeLast:false,
  origin:{x:72.5,y:101},
  events:[{frame:4,name:'hit'}]
};
delete cfg.animations.melee.frames;

for(const [file,content] of [[configPath,JSON.stringify(cfg,null,2)+'\n'],[playerPath,newPlayer]]){
  const backup=file+'.backup-antes-ataque-kael';
  if(!fs.existsSync(backup)) fs.copyFileSync(file,backup);
  fs.writeFileSync(file,content,'utf8');
  console.log('Atualizado:',path.relative(base,file));
  console.log('Backup:',path.relative(base,backup));
}
console.log('Ataque pronto: 8 quadros 170x120, 20 FPS, frame de impacto = 4 (quinto quadro).');
console.log('Hitbox para Kael 30x54: alcance 57 px, altura 30 px, offset vertical 21 px.');
console.log('Escala atual:',cfg.scale,'(recomendado 0.75, igual ao sprite walk).');
console.log('Abra o jogo pelo Live Server e recarregue Ctrl+Shift+R.');
