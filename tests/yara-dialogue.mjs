import assert from 'node:assert/strict';
import {newState} from '../js/engine.js';
import {YARA_DIALOGUES,yaraConversation} from '../js/dialogue.js';
import {normalizeSave} from '../js/save.js';
import {objective,syncProgress} from '../js/campaign.js';
import {buildMap} from '../js/map.js';

const state=newState();
assert.equal(buildMap().npcs.filter(n=>n.id==='yara').length,1);
assert.equal(buildMap().npcs.find(n=>n.id==='yara').name,'Yara · Hacker');
assert.equal(yaraConversation(state),YARA_DIALOGUES.reunion);
state.events.push('npc-yara'); // An old interaction alone must not complete the new conversation.
assert.equal(yaraConversation(state),YARA_DIALOGUES.reunion);
state.events.push('yara-reunion');assert.equal(yaraConversation(state),YARA_DIALOGUES.repeat);
state.events.push('log-1');syncProgress(state);
assert.equal(yaraConversation(state),YARA_DIALOGUES.terminal);
assert.ok(objective(state).includes('Volte a Yara'));
state.events.push('yara-terminal');assert.equal(yaraConversation(state),YARA_DIALOGUES.repeat);
assert.ok(objective(state).includes('Derrote Matrona'));
state.bosses[0].dead=true;syncProgress(state);assert.equal(yaraConversation(state),YARA_DIALOGUES.matrona);
state.events.push('yara-matrona');const quests=JSON.stringify(state.quests),events=[...state.events];
for(let i=0;i<5;i++)assert.equal(yaraConversation(state),YARA_DIALOGUES.repeat);
assert.deepEqual(state.events,events);assert.equal(JSON.stringify(state.quests),quests);
const restored=normalizeSave(JSON.parse(JSON.stringify(state)));
assert.equal(yaraConversation(restored),YARA_DIALOGUES.repeat);
assert.ok(restored.quests.find(q=>q.id==='act-1').complete);
assert.ok(restored.abilities.dash&&restored.events.includes('log-1'));
const overdue=newState();overdue.events.push('log-1');overdue.bosses[0].dead=true;
assert.equal(yaraConversation(overdue),YARA_DIALOGUES.reunion);
overdue.events.push('yara-reunion');assert.equal(yaraConversation(overdue),YARA_DIALOGUES.terminal);
overdue.events.push('yara-terminal');assert.equal(yaraConversation(overdue),YARA_DIALOGUES.matrona);
const skipped=newState();skipped.events.push('yara-reunion','yara-matrona','log-1');skipped.bosses[0].dead=true;
assert.equal(yaraConversation(skipped),YARA_DIALOGUES.repeat);
for(const conversation of Object.values(YARA_DIALOGUES)){
 assert.ok(conversation.lines.length>=3);
 conversation.lines.forEach((line,i)=>assert.equal(line.speaker,i%2===0?'Yara · Hacker':'Kael'));
}
console.log('PASS: Yara identity, friendship conversations, chronological selection, old events, persistence, objectives and completed quests.');
