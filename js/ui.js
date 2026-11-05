import{REGIONS,MAP_ROOMS,regionAt}from'./map.js';
import{ABILITY_INFO}from'./abilities.js';
import{objective,defeated}from'./campaign.js';
import{LOGS}from'./dialogue.js';
export class UI{
 constructor(){this.toastEl=document.querySelector('#toast');this.toastTimer=0;this.panelTab='map'}
 toast(message){this.toastEl.textContent=message;this.toastEl.classList.add('show');clearTimeout(this.toastTimer);this.toastTimer=setTimeout(()=>this.toastEl.classList.remove('show'),3000)}
 update(state){
  const p=state.player;
  document.querySelector('#health-fill').style.width=`${p.health/p.maxHealth*100}%`;
  document.querySelector('#health-text').textContent=`${Math.ceil(p.health)} / ${p.maxHealth}`;
  document.querySelector('#energy-fill').style.width=`${p.energy/p.maxEnergy*100}%`;
  document.querySelector('#energy-text').textContent=`${Math.floor(p.energy)} / ${p.maxEnergy}`;
  document.querySelector('#credits-label').textContent=state.credits??40;
  const r=regionAt(p.x);document.querySelector('#area-label').textContent=`${r.name.toUpperCase()} · ${r.subtitle}`;
  document.querySelector('#objective').textContent=objective(state)+' · E para interagir';
  const boss=state.bosses.find(b=>b.active&&!b.dead);
  document.querySelector('#boss-hud').classList.toggle('hidden',!boss);
  if(boss){document.querySelector('#boss-name').textContent=boss.name+(boss.attackType==='windup'?' · DEFESA ATIVA':' · VULNERÁVEL');document.querySelector('#boss-fill').style.width=`${boss.health/boss.maxHealth*100}%`}
 }
 panel(state,tab=this.panelTab){
  this.panelTab=tab;const title=document.querySelector('#panel-title'),content=document.querySelector('#panel-content');
  document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  if(tab==='map'){
   title.textContent='MAPA DE NOVA AURORA';
   content.innerHTML='<div class="map-route">'+MAP_ROOMS.map(room=>{
    const seen=state.explored.includes(room.id),current=state.currentRoom===room.id;
    const gate=room.id===2?(defeated(state,'boss-0')?'INDUSTRIAL LIBERADO':'MATRONA'):room.id===5?(defeated(state,'boss-2')?'TORRE LIBERADA':'WARDEN'):room.id===8?'VÉSPERA':'';
    return `<div class="map-node ${seen?'seen':''} ${current?'current':''}"><small>${room.id+1} · ${REGIONS[room.region].name}</small><strong>${seen?room.name:'ÁREA NÃO EXPLORADA'}</strong><small class="gate-note">${gate}</small></div>`;
   }).join('')+'</div><p>Três atos conectados. As passagens abertas permitem retornar. E ativa abrigos, diálogos e terminais; os pontos amarelos aceitam o gancho (K).</p>';
  }else if(tab==='abilities'){
   title.textContent='IMPLANTES';content.innerHTML=Object.entries(ABILITY_INFO).map(([id,a])=>`<div class="ability-row"><strong>${a.name} · ${state.abilities[id]?'ATIVO':'BLOQUEADO'}</strong><br>${a.text}</div>`).join('');
  }else{
   title.textContent='INVESTIGAÇÃO';
   content.innerHTML=`<p>${state.bosses.filter(b=>b.dead).length}/3 bosses · ${state.credits} créditos · ${Math.floor((state.playTime||0)/60)} min de jornada</p>`+
    state.quests.map(q=>`<div class="ability-row"><strong>${q.name}</strong><br>${q.complete?'CONCLUÍDO':q.progress+'/'+q.goal}</div>`).join('')+
    ['log-1','log-2','log-3'].filter(id=>state.events.includes(id)).map(id=>'<div class="ability-row">'+LOGS[id]+'</div>').join('')+
    '<p>'+objective(state)+'</p>';
  }
 }
 clearDialogActions(){const actions=document.querySelector('#dialog-actions');actions.replaceChildren();actions.classList.add('hidden')}
 showDialog(speaker,text){this.clearDialogActions();this.dialogueLines=null;this.dialogueIndex=0;document.querySelector('#speaker').textContent=speaker;document.querySelector('#dialog-text').textContent=text;document.querySelector('#dialog-close').textContent='FECHAR · E / ENTER';document.querySelector('#dialog-screen').classList.remove('hidden')}
 showConversation(lines){this.clearDialogActions();this.dialogueLines=lines;this.dialogueIndex=0;this.renderDialogueLine()}
 showDialogActions(speaker,text,choices){
  this.showDialog(speaker,text);const actions=document.querySelector('#dialog-actions');
  for(const choice of choices){const button=document.createElement('button');button.type='button';button.textContent=choice.label;button.disabled=Boolean(choice.disabled);button.onclick=choice.action;actions.append(button)}
  actions.classList.remove('hidden');
 }
 renderDialogueLine(){
  const line=this.dialogueLines[this.dialogueIndex];
  document.querySelector('#speaker').textContent=line.speaker;
  document.querySelector('#dialog-text').textContent=line.text;
  document.querySelector('#dialog-close').textContent=(this.dialogueIndex<this.dialogueLines.length-1?'PRÓXIMA':'CONCLUIR')+' · E / ENTER';
  document.querySelector('#dialog-screen').classList.remove('hidden');
 }
 advanceDialogue(){if(!this.dialogueLines||this.dialogueIndex>=this.dialogueLines.length-1)return false;this.dialogueIndex++;this.renderDialogueLine();return true}
 showEnding(state){
  document.querySelector('#dialog-screen').classList.add('hidden');
  const screen=document.querySelector('#ending-screen');screen.classList.remove('hidden');
  document.querySelector('#ending-summary').textContent=`Três ameaças neutralizadas · ${state.quests.find(q=>q.id==='records')?.progress||0}/3 registros recuperados`;
 }
}
