// Transient platform state belongs to the live map; permanent bridges use events.
export function updateLevelPlatforms(map,p,dt){
 for(const s of map.platforms){
  if(s.kind!=='unstable')continue;
  if(s.disabled){s.restoreTimer=Math.max(0,s.restoreTimer-dt);if(!s.restoreTimer){s.disabled=false;s.warning=0}continue}
  const standing=p.grounded&&Math.abs(p.y+p.h-s.y)<2&&p.x+p.w>s.x&&p.x<s.x+s.w;
  if(standing||s.warning>0)s.warning+=dt;
  if(s.warning>=.65){s.disabled=true;s.restoreTimer=4;s.warning=0}
 }
}
export function resetLevelPlatforms(map){for(const s of map.platforms)if(s.kind==='unstable'){s.disabled=false;s.warning=s.restoreTimer=0}}
