export class EffectsManager{
 constructor(spriteRenderer){this.renderer=spriteRenderer;this.effects=[];this.nextId=1}
 add({entityId,animation,x,y,facing=1,scale=1,depth=0,loop=null,onEvent=null}){const effect={id:this.nextId++,entityId,animation,x,y,facing,scale,depth,loop,onEvent,age:0,life:null,dead:false,target:{x,y,facing}};this.effects.push(effect);return effect.id}
 update(dt,assets){for(const e of this.effects){e.age+=dt;const cfg=assets.getConfig(e.entityId),def=cfg?.animations?.[e.animation],count=def?.frames?.length||def?.count||1;if(!def){if(e.age>2)e.dead=true;continue}e.loop??=def.loop===true;e.life??=e.loop?Infinity:count/(def.fps||8);if(!e.loop&&e.age>=e.life)e.dead=true}this.effects=this.effects.filter(e=>!e.dead)}
 draw(ctx,dt=0){for(const e of [...this.effects].sort((a,b)=>a.depth-b.depth)){e.target.x=e.x;e.target.y=e.y;e.target.facing=e.facing;this.renderer.draw(ctx,e.entityId,e.animation,e.target,dt,{scaleOverride:e.scale,onEvent:e.onEvent||undefined})}}
 clear(){this.effects.length=0}
}
