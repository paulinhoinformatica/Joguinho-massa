import{createPlayer}from'./player.js';
import{createBosses}from'./bosses.js';
import{freshAbilities}from'./abilities.js';
import{REGIONS,ROOM_W,WORLD_W,GROUND,regionAt,buildMap}from'./map.js';
import{checkpointFor,syncProgress,unlockedAct}from'./campaign.js';
const KEY='nova-aurora-save-v1';
const finite=(value,fallback,min=0,max=100000)=>Number.isFinite(value)?Math.max(min,Math.min(max,value)):fallback;
export function normalizeSave(v){
 if(!v||![1,2].includes(v.version)||!v.player||!Number.isFinite(v.player.x)||!Number.isFinite(v.player.y)||!Array.isArray(v.bosses))return null;
 const legacy=v.version===1,oldX=v.player.x;
 const abilities=freshAbilities();for(const id of Object.keys(abilities))abilities[id]=v.abilities?.[id]===true;
 const player={...createPlayer(),...v.player};
 player.maxHealth=finite(player.maxHealth,100,100,250);player.health=finite(player.health,player.maxHealth,1,player.maxHealth);
 player.maxEnergy=finite(player.maxEnergy,100,100,200);player.energy=finite(player.energy,player.maxEnergy,0,player.maxEnergy);
 Object.assign(player,{w:30,h:54,vx:0,vy:0,invuln:0,coyote:0,jumpBuffer:0,doubleJumpUsed:false,attackTimer:0,attackCooldown:0,dashTimer:0,dashCooldown:0,damageTimer:0,specialAnimTimer:0,landingTimer:0,animationEvent:null,attackHitConsumed:false,state:'idle',grounded:false,dead:false,fall:false,collisionConfigApplied:false});
 const bosses=createBosses();
 for(const b of bosses){const saved=v.bosses.find(old=>old.id===b.id);if(saved?.dead){b.dead=true;b.health=0}}
 // A later victory implies that earlier campaign gates have already been cleared.
 if(bosses[2].dead)bosses[1].dead=true;
 if(bosses[1].dead)bosses[0].dead=true;
 bosses.forEach(b=>{if(b.dead)b.health=0});
 const state={...v,version:2,player,abilities,bosses,events:Array.isArray(v.events)?[...new Set(v.events.filter(x=>typeof x==='string'))]:[],items:Array.isArray(v.items)?[...new Set(v.items.filter(x=>typeof x==='string'))]:[],credits:finite(v.credits,40,0,99999),playTime:finite(v.playTime,0),explored:[],quests:[]};
 syncProgress(state);
 const unlocked=unlockedAct(state);
 let desired=legacy?(Math.floor(oldX/ROOM_W)<=1?Math.floor(oldX/ROOM_W):Math.floor(oldX/ROOM_W)===2?1:2):REGIONS.indexOf(regionAt(oldX));
 desired=Math.max(0,Math.min(unlocked,desired));
 const oldIndex=Math.max(0,Math.floor(oldX/ROOM_W));
 const mappedX=desired*ROOM_W+(oldX%ROOM_W);
 const invalidPosition=oldX<0||(!legacy&&oldX>=WORLD_W)||player.y<0||player.y+player.h>GROUND+5;
 const wasDead=v.player.dead||v.player.health<=0;
 const relocate=invalidPosition||wasDead||(legacy&&oldIndex===2)||desired!==(legacy?(oldIndex>=3?2:oldIndex):Math.floor(oldX/ROOM_W));
 // Checkpoints are selected from real level data, never arbitrary stale coordinates.
 const checkpoints=buildMap().checkpoints;
 let cpRegion=legacy?(v.checkpoint?.region>=3?2:v.checkpoint?.region===2?1:v.checkpoint?.region):v.checkpoint?.region;
 cpRegion=Math.max(0,Math.min(unlocked,Number.isInteger(cpRegion)?cpRegion:desired));
 const checkpointX=v.checkpoint?.x;
 const mappedCheckpoint=legacy&&Number.isFinite(checkpointX)?cpRegion*ROOM_W+checkpointX%ROOM_W:checkpointX;
 const validCp=checkpoints.find(cp=>cp.x===mappedCheckpoint&&Math.floor(cp.x/ROOM_W)===cpRegion);
 state.checkpoint=validCp?{x:validCp.x,y:GROUND-player.h-3,region:cpRegion,name:validCp.name}:checkpointFor(cpRegion);
 if(relocate){if(!wasDead)state.checkpoint=checkpointFor(desired);player.x=state.checkpoint.x;player.y=state.checkpoint.y;if(wasDead)player.health=player.maxHealth;}
 else{player.x=Math.max(0,Math.min(WORLD_W-player.w,mappedX));player.y=Math.min(player.y,GROUND-player.h);}
 player.checkpoint={...state.checkpoint};
 const seen=Array.isArray(v.explored)?v.explored.filter(Number.isInteger):[];
 state.explored=[...new Set(seen.filter(id=>id>=0).flatMap(id=>legacy?(id<6?[id]:id<9?[]:id<15?[id>=12?8:id-3]:[]):id>=0&&id<9?[id]:[]))];
 syncProgress(state);if(!state.explored.includes(state.currentRoom))state.explored.push(state.currentRoom);
 return state;
}
export function saveGame(state){try{
 const previous=localStorage.getItem(KEY);
 let oldVersion;try{oldVersion=previous&&JSON.parse(previous).version}catch{}
 if(oldVersion===1&&!localStorage.getItem(KEY+'-legacy-backup'))localStorage.setItem(KEY+'-legacy-backup',previous);
 localStorage.setItem(KEY,JSON.stringify({...state,version:2,savedAt:Date.now()}));return true;
}catch(e){console.warn('Falha ao guardar',e);return false}}
export function loadGame(){try{return normalizeSave(JSON.parse(localStorage.getItem(KEY)||'null'))}catch{return null}}
export function hasSave(){return!!loadGame()}
