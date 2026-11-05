import{Camera}from'./camera.js';import{World}from'./world.js';import{REGIONS,ROOM_W,MAP_ROOMS,GROUND,WORLD_W,WORLD_H,regionAt,assetRegionAt,buildMap}from'./map.js';import{createPlayer,updatePlayer,attackBox}from'./player.js';import{spawnEnemies,updateEnemies}from'./enemies.js';import{createBosses,updateBoss,damageBoss}from'./bosses.js';import{freshAbilities,awardAbility,ABILITY_INFO}from'./abilities.js';import{playerDamage,hurt}from'./combat.js';import{terminalText,yaraConversation,orenConversation,OREN_DIALOGUES}from'./dialogue.js';import{saveGame}from'./save.js';import{OREN_UPGRADE,buyOrenUpgrade}from'./upgrades.js';import{ACTS,checkpointFor,syncProgress,unlockedAct}from'./campaign.js';
import{AssetManager}from'./engine/assetManager.js';import{AnimationManager}from'./engine/animationManager.js';import{SpriteRenderer}from'./engine/spriteRenderer.js';import{EffectsManager}from'./engine/effectsManager.js';import{LayerRenderer}from'./engine/layerRenderer.js';import{AssetLab}from'./engine/assetLab.js';import{ASSET_MANIFEST}from'./config/assets.js';
export function newState(name='Kael'){const state={version:2,player:createPlayer(name),abilities:freshAbilities(),bosses:createBosses(),events:[],items:[],credits:40,quests:[],explored:[0],checkpoint:checkpointFor(),lastRegion:'slum',playTime:0};state.player.checkpoint={...state.checkpoint};syncProgress(state);return state}
export class Engine{
 constructor(canvas,state,ui){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.state=state;this.ui=ui;this.assets=new AssetManager(ASSET_MANIFEST);this.animations=new AnimationManager();this.spriteRenderer=new SpriteRenderer(this.assets,this.animations);this.effects=new EffectsManager(this.spriteRenderer);this.layerRenderer=new LayerRenderer(this.assets);this.assetLab=new AssetLab({assets:this.assets,renderer:this.spriteRenderer,layers:this.layerRenderer,animations:this.animations});this.world=new World(this.layerRenderer);this.world.map=buildMap(this.state.events);this.camera=new Camera();this.enemies=spawnEnemies();this.keys=new Set();this.pressed=new Set();this.paused=false;this.hazardTick=0;this.last=0;this.gateToast=-1;this.assetRegion='';this.hookPoints=this.world.map.hookPoints;this.state.credits??=40;this.state.player.abilities=this.state.abilities;syncProgress(this.state);this.state.lastRegion=this.state.region;this.requestRegionAssets()}
 requestRegionAssets(){const key=assetRegionAt(this.state.player.x);if(this.assetRegion===key)return;this.assetRegion=key;this.assets.loadRegion(key).then(()=>this.applyAssetCollisionConfigs())}
 applyAssetCollisionConfigs(){const apply=(entity,cfg)=>{if(!cfg?.collision||entity.collisionConfigApplied)return;const oldBottom=entity.y+entity.h,center=entity.x+entity.w/2;entity.w=cfg.collision.width;entity.h=cfg.collision.height;entity.x=center-entity.w/2+(cfg.collision.offsetX||0);entity.y=oldBottom-entity.h+(cfg.collision.offsetY||0);entity.collisionConfigApplied=true};apply(this.state.player,this.assets.getConfig('protagonist'));for(const e of this.enemies){const id=e.type==='drone'?'infected_drone':e.kind==='human'?'cyborg_soldier':'infected_robot';apply(e,this.assets.getConfig(id))}for(const b of this.state.bosses){const id=b.assetId;apply(b,this.assets.getConfig(id))}}
 toggleAssetLab(force){this.assetLab.toggle(force)}
 renderAssetLab(dt){this.assetLab.render(dt)}
 keydown(key){if(!this.keys.has(key))this.pressed.add(key);this.keys.add(key)}keyup(key){this.keys.delete(key)}consume(key){if(!this.pressed.has(key))return false;this.pressed.delete(key);return true}
 update(dt){if(this.paused)return;this.state.playTime=(this.state.playTime||0)+dt;const p=this.state.player,region=regionAt(p.x),room=Math.max(0,Math.min(MAP_ROOMS.length-1,Math.floor(p.x/800)));this.state.region=region.id;this.state.currentRoom=room;this.requestRegionAssets();if(!this.state.explored.includes(room))this.state.explored.push(room);
  const jump=this.consume(' '),attack=this.consume('j')||this.consume('mouse'),special=this.consume('k'),dash=this.keys.has('shift'),hitEvent=p.animationEvent==='hit';p.animationEvent=null;p.nextAttackAnimation=(!p.grounded||jump)&&this.spriteRenderer.available('protagonist','air_melee')?'air_melee':'melee';const attackAnimation=p.attackTimer>0?p.attackAnimation:p.nextAttackAnimation;p.attackUsesAsset=this.spriteRenderer.available('protagonist',attackAnimation||'melee');const melee=this.assets.getConfig('protagonist')?.animations?.[p.nextAttackAnimation];p.attackAnimationDuration=melee?(melee.frames?.length||melee.count||1)/(melee.fps||8):0.4;const previousAttack=p.attackSerial;const input={left:this.keys.has('a')||this.keys.has('arrowleft'),right:this.keys.has('d')||this.keys.has('arrowright'),jump,attack,special,dash,platforms:this.world.map.platforms};updatePlayer(p,input,dt,this.state.abilities);if(p.attackSerial!==previousAttack)this.animations.reset(p);p.externalAttackAnimation=p.state==='attack'&&p.attackUsesAsset;p.attackFrameReady=!p.externalAttackAnimation||(hitEvent&&p.attackSerial===previousAttack);p.attackBox=attackBox(p);p.abilities=this.state.abilities;
  if(special)this.useImplant();if(p.specialPulse)this.pulse();if(p.overloadTimer>0)p.overloadTimer-=dt;
  for(const e of this.enemies){const was=e.dead;if(!was&&playerDamage(p,e,!!p.overloadTimer)){if(e.dead){e.respawn=30;if(!this.state.events.includes('credit-'+e.id)){this.state.events.push('credit-'+e.id);this.state.credits+=8}}}}
  if(!this.state.events.includes('ending'))updateEnemies(this.enemies,p,dt,this.world);
  this.checkGates();
  for(const b of this.state.bosses){
   if(b.dead)b.deathTimer=Math.max(0,(b.deathTimer||0)-dt);
   const event=updateBoss(b,p,dt);
   if(event?.kind==='intro'){this.paused=true;this.keys.clear();this.pressed.clear();this.ui.showDialog(b.title,b.intro+' Observe os avisos e ataque durante a recuperação.');this.ui.toast(b.intro);document.querySelector('#boss-warning').classList.remove('hidden');setTimeout(()=>document.querySelector('#boss-warning').classList.add('hidden'),1400)}
   const victory=!b.dead&&damageBoss(b,p);
   if(victory||(!b.dead&&b.health<=0))this.finishBoss(b);
  }
  if(!this.state.events.includes('ending'))this.updateHazards(dt);this.checkGates();syncProgress(this.state);if(!this.state.explored.includes(this.state.currentRoom))this.state.explored.push(this.state.currentRoom);if(this.state.lastRegion!==this.state.region){this.state.lastRegion=this.state.region;this.state.checkpoint=checkpointFor(this.state.currentMap);p.checkpoint={...this.state.checkpoint};this.ui.toast(this.state.region==='factory'?'Ato II · Complexo Industrial':this.state.region==='slum'?'Ato I · Setor 9':'Ato III · Torre Aurora');saveGame(this.state)}if(p.fall||p.y>900)this.damagePlayer(25,0);if(p.health<=0&&document.querySelector('#death-screen').classList.contains('hidden')){p.dead=true;p.state='death';this.deathAnimationTimer=.9;this.paused=true;document.querySelector('#death-copy').textContent=`O último abrigo ativo foi ${this.state.checkpoint.name||'o abrigo'}.`;document.querySelector('#death-screen').classList.remove('hidden')}
  this.camera.update(p,this.canvas.width,this.canvas.height,WORLD_W,WORLD_H,dt);this.world.update(dt);this.effects.update(dt,this.assets);this.world.draw(this.ctx,this.canvas,this.camera,this.state,this.enemies,{assets:this.assets,spriteRenderer:this.spriteRenderer,effects:this.effects,dt});if(p.pulseTimer>0){p.pulseTimer=Math.max(0,p.pulseTimer-dt);if(!this.spriteRenderer.available('emp_pulse','pulse')){/* PROTOTYPE FALLBACK effect until the transparent pulse PNG is added. */this.ctx.save();this.ctx.strokeStyle='#5ffff0';this.ctx.lineWidth=3;this.ctx.beginPath();this.ctx.arc(p.x+p.w/2-this.camera.x,p.y+p.h/2-this.camera.y,80*(.3-p.pulseTimer)/.3,0,Math.PI*2);this.ctx.stroke();this.ctx.restore()}}this.ui.update(this.state);this.pressed.clear();
 }
 useImplant(){const p=this.state.player;if(this.state.abilities.hook){let nearest=null,d=230;for(const h of this.hookPoints){const q=Math.hypot(h.x-(p.x+p.w/2),h.y-p.y);if(q<d){d=q;nearest=h}}if(nearest){p.vx=Math.sign(nearest.x-p.x)*430;p.vy=-470;p.grounded=false;p.energy=Math.max(0,p.energy-12);p.specialAnimTimer=.3;this.ui.toast('Gancho magnético · ancoragem!');return}}
  if(this.state.abilities.emp&&p.energy>=35){p.energy-=35;p.pulseTimer=.3;p.specialAnimTimer=.3;this.effects.add({entityId:'emp_pulse',animation:'pulse',x:p.x+p.w/2,y:p.y+p.h/2,scale:1.1,depth:5});for(const e of this.enemies)if(!e.dead&&Math.hypot(e.x-p.x,e.y-p.y)<230){e.health-=32;e.hurtTimer=.3;e.stunTimer=1.2;if(e.health<=0){e.dead=true;e.respawn=8}}for(const b of this.state.bosses)if(b.active&&!b.dead&&b.attackType!=='windup'&&Math.hypot(b.x-p.x,b.y-p.y)<260){b.health=Math.max(0,b.health-24);b.warning=0}this.ui.toast('Pulso eletromagnético!');return}
  if(this.state.abilities.overload&&p.energy>=28){p.energy-=28;p.overloadTimer=.8;p.specialAnimTimer=.3;this.ui.toast('Sobrecarga armada · próximo golpe amplificado');return}this.ui.toast('Nenhum implante especial instalado.')}
 pulse(){this.state.player.pulseTimer=.3}
 damagePlayer(amount,source){const p=this.state.player;if(hurt(p,amount,source)){this.hazardTick=.65;if(p.dead){p.health=0}else p.health=Math.max(0,p.health)}}
 updateHazards(dt){this.hazardTick=Math.max(0,this.hazardTick-dt);if(this.hazardTick>0)return;const p=this.state.player;for(const h of this.world.map.hazards){if(p.x+p.w>h.x&&p.x<h.x+h.w&&p.y+p.h>h.y&&p.y<h.y+h.h){if((h.kind==='toxin'||h.kind==='virus')&&this.state.abilities.resistance)continue;if(h.kind==='laser'&&p.pulseTimer>0)continue;this.damagePlayer(h.kind==='laser'?17:12,h.x);return}}}
 finishBoss(b){
  if(this.state.events.includes('victory-'+b.id))return;
  this.state.events.push('victory-'+b.id);
  b.dead=true;b.health=0;b.deathTimer=.9;b.projectiles=[];
  const act=ACTS.find(a=>a.boss===b.id);
  this.state.credits+=50;this.state.player.health=Math.min(this.state.player.maxHealth,this.state.player.health+35);this.state.player.energy=this.state.player.maxEnergy;
  syncProgress(this.state);this.ui.update(this.state);
  this.state.checkpoint=checkpointFor(b.room,true);this.state.player.checkpoint={...this.state.checkpoint};
  this.paused=true;this.keys.clear();this.pressed.clear();
  if(b.id==='boss-3')this.ui.showEnding(this.state);
  else this.ui.showDialog(b.title+' · registros recuperados',act.revelation+' Novos implantes: '+act.abilities.map(id=>ABILITY_INFO[id].name).join(', ')+'.');
  saveGame(this.state);
 }
 checkGates(){
  const p=this.state.player,allowed=unlockedAct(this.state),limit=(allowed+1)*ROOM_W;
  if(allowed<2&&p.x+p.w>limit){p.x=limit-p.w;p.vx=0;if(this.gateToast!==allowed){this.gateToast=allowed;this.ui.toast(allowed===0?'Derrote Matrona para liberar o Complexo Industrial.':'Derrote Warden para obter a credencial da Torre Aurora.')}}else this.gateToast=-1;
  for(const b of this.state.bosses)if(b.active&&!b.dead){const x=Math.max(b.arena.left,Math.min(b.arena.right-p.w,p.x));if(x!==p.x){p.x=x;p.vx=0}}
 }
 advanceDialog(){
  if(this.ui.advanceDialogue())return;
  if(this.dialogEvent&&!this.state.events.includes(this.dialogEvent)){this.state.events.push(this.dialogEvent);saveGame(this.state)}
  if(this.dialogNpc?.shop&&this.dialogService==='conversation'){this.showOrenServices();return}
  if(this.dialogNpc?.shop&&this.dialogService==='upgrade-dialog'){this.showOrenUpgrade();return}
  this.closeDialog();
 }
 closeDialog(){
  const npc=this.dialogNpc;
  if(npc?.facePlayerOnDialog)npc.facing=npc.defaultFacing??this.assets.getConfig(npc.assetId||'npc_survivor')?.facing??1;
  this.dialogNpc=null;this.dialogEvent=null;this.dialogService=null;this.ui.dialogueLines=null;this.ui.clearDialogActions();
  this.render(false);
  document.querySelector('#dialog-screen').classList.add('hidden');
  this.paused=false;
 }
 showOrenServices(){
  this.dialogEvent=null;this.dialogService='services';
  this.ui.showDialogActions(this.dialogNpc.name,'Reforço de proteção: +15 PV máximos por 20 créditos. Saldo: '+this.state.credits+' créditos. Limite: 190 PV máximos.',[
   {label:'SOLICITAR MELHORIA',action:()=>this.requestOrenUpgrade()}
  ]);
 }
 requestOrenUpgrade(){
  if(!this.dialogNpc?.shop||this.dialogService!=='services')return;
  this.dialogService='upgrade-dialog';this.ui.showConversation(OREN_DIALOGUES.upgrade.lines);
 }
 showOrenUpgrade(){
  this.dialogService='upgrade-confirm';
  const maxed=this.state.player.maxHealth+OREN_UPGRADE.health>OREN_UPGRADE.maxHealth,poor=this.state.credits<OREN_UPGRADE.price;
  const message=maxed?'Seu reforço já está no nível máximo.':poor?'Preciso de 20 créditos. Você tem '+this.state.credits+'.':'+15 PV máximos e restauração da vida por 20 créditos. Seu saldo: '+this.state.credits+'.';
  this.ui.showDialogActions(this.dialogNpc.name,message,[
   {label:'COMPRAR · 20 CR',disabled:maxed||poor,action:()=>this.confirmOrenUpgrade()},
   {label:'VOLTAR',action:()=>this.showOrenServices()}
  ]);
 }
 confirmOrenUpgrade(){
  if(!this.dialogNpc?.shop||this.dialogService!=='upgrade-confirm')return;
  this.dialogService='upgrade-result';
  const result=buyOrenUpgrade(this.state);if(result.success)saveGame(this.state);
  this.ui.update(this.state);
  this.ui.showDialogActions(this.dialogNpc.name,result.message,[
   {label:'VOLTAR AOS SERVIÇOS',action:()=>this.showOrenServices()}
  ]);
 }
 interact(){const p=this.state.player;let npc=this.world.map.npcs.find(n=>Math.hypot(p.x+p.w/2-n.x,p.y+p.h-n.y)<76);if(npc){this.dialogEvent=null;this.dialogNpc=npc;if(npc.facePlayerOnDialog)npc.facing=Math.sign(p.x+p.w/2-(npc.x+14))||(npc.defaultFacing??1);if(!this.state.events.includes('npc-'+npc.id))this.state.events.push('npc-'+npc.id);if(npc.ability&&awardAbility(this.state,npc.ability))this.ui.toast(`Implante desbloqueado: ${ABILITY_INFO[npc.ability].name}`);this.paused=true;this.render(false);if(npc.id==='yara'||npc.shop){const conversation=npc.shop?orenConversation(this.state):yaraConversation(this.state);this.dialogService=npc.shop?'conversation':null;this.dialogEvent=conversation.event;this.ui.showConversation(conversation.lines)}else this.ui.showDialog(npc.name,npc.text);saveGame(this.state);return}let nearest=null,distance=112;for(const t of this.world.map.terminals){const d=Math.hypot(p.x+p.w/2-t.x,p.y+p.h/2-t.y);if(d<distance){nearest=t;distance=d}}for(const cp of this.world.map.checkpoints){const d=Math.hypot(p.x+p.w/2-cp.x,p.y+ p.h-GROUND);if(d<75){this.state.checkpoint={x:cp.x,y:GROUND-p.h-3,region:REGIONS.indexOf(regionAt(cp.x)),name:cp.name};p.checkpoint={...this.state.checkpoint};p.health=p.maxHealth;p.energy=p.maxEnergy;this.ui.toast(`Abrigo ativado: ${cp.name}`);saveGame(this.state);return}}
  for(const s of this.world.map.secrets){if(Math.abs(p.x+p.w/2-s.x)<56&&Math.abs(p.y+p.h-s.y)<68&&!this.state.items.includes(s.item)){this.state.items.push(s.item);if(s.item==='Célula de energia')p.maxEnergy+=20;if(s.item==='Filtro anticontaminação'){awardAbility(this.state,'resistance');this.ui.toast('Filtro anticontaminação integrado.')}else this.ui.toast(`Recuperado: ${s.item}`);this.state.credits+=20;saveGame(this.state);return}}
  if(!nearest){this.ui.toast('Nenhum terminal ou ponto de interesse ao alcance.');return}if(!this.state.events.includes(nearest.id)){this.state.events.push(nearest.id);if(nearest.shortcut)this.world.map.platforms.push({...nearest.shortcut})}syncProgress(this.state);if(this.state.quests.find(q=>q.id==='records')?.complete&&!this.state.events.includes('records-reward')){this.state.events.push('records-reward');this.state.credits+=35;this.ui.toast('Registros completos · +35 créditos')}
  if(nearest.id==='implant-hook'){awardAbility(this.state,'hook');this.ui.toast(`Implante desbloqueado: ${ABILITY_INFO.hook.name}`)}else if(nearest.id==='implant-double'){awardAbility(this.state,'doubleJump');this.ui.toast('Salto duplo integrado.')}else if(nearest.id==='implant-overload'){awardAbility(this.state,'overload');this.ui.toast(`Implante desbloqueado: ${ABILITY_INFO.overload.name}`)}else{this.ui.showDialog(nearest.name,terminalText(nearest));this.paused=true}saveGame(this.state)}
 renderPausedDeath(dt){if(!(this.deathAnimationTimer>0))return;this.deathAnimationTimer=Math.max(0,this.deathAnimationTimer-dt);this.camera.update(this.state.player,this.canvas.width,this.canvas.height,WORLD_W,WORLD_H,dt);this.world.draw(this.ctx,this.canvas,this.camera,this.state,this.enemies,{assets:this.assets,spriteRenderer:this.spriteRenderer,effects:this.effects,dt});}
 respawn(){const p=this.state.player;p.x=this.state.checkpoint.x;p.y=this.state.checkpoint.y;p.vx=p.vy=0;p.health=p.maxHealth;p.energy=p.maxEnergy;p.invuln=2;p.dead=false;p.fall=false;p.state='idle';p.attackTimer=p.attackCooldown=p.dashTimer=p.landingTimer=p.damageTimer=p.specialAnimTimer=0;p.attackHitConsumed=false;p.grounded=false;p.doubleJumpUsed=false;p.animationEvent=null;for(const b of this.state.bosses)if(!b.dead){b.active=false;b.health=b.maxHealth;b.projectiles=[];b.warning=0;b.attackType='recovery';b.timer=1}this.animations.reset(p);this.deathAnimationTimer=0;this.paused=false;this.keys.clear();this.pressed.clear();syncProgress(this.state);document.querySelector('#death-screen').classList.add('hidden');saveGame(this.state)}
 render(updateCamera=true){if(updateCamera)this.camera.update(this.state.player,this.canvas.width,this.canvas.height,WORLD_W,WORLD_H,1/60);this.world.draw(this.ctx,this.canvas,this.camera,this.state,this.enemies,{assets:this.assets,spriteRenderer:this.spriteRenderer,effects:this.effects,dt:0});this.ui.update(this.state)}
}
