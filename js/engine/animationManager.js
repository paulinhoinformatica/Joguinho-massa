export class AnimationManager{
 constructor(){this.instances=new WeakMap()}
 play(target,key,definition,dt,onEvent=()=>{}){
  if(!definition)return null;
  let state=this.instances.get(target);
  const emit=index=>{for(const event of definition.events||[])if(event.frame===index)onEvent(event.name,event)};
  if(!state||state.key!==key||state.definition!==definition){state={key,definition,time:0,index:0,finished:false};this.instances.set(target,state);emit(0)}
  const count=frameCount(definition),duration=1/(definition.fps||8);
  if(!state.finished){state.time+=Math.max(0,Number.isFinite(dt)?dt:0);while(state.time>=duration&&!state.finished){state.time-=duration;if(state.index+1>=count){if(definition.loop===false){state.finished=true;state.time=0}else{state.index=0;emit(0)}}else{state.index++;emit(state.index)}}}
  if(state.finished&&definition.loop===false&&definition.freezeLast===false)return null;
  return{index:state.index,finished:state.finished,time:state.time};
 }
 reset(target){this.instances.delete(target)}
}
export function frameCount(def){if(def.frames?.length)return def.frames.length;if(Number.isFinite(def.count))return Math.max(1,def.count);return Math.max(1,(def.columns||1)*(def.rows||1))}