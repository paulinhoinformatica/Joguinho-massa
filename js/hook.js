export const HOOK_RANGE=380;
export function hookOrigin(p){return {x:p.x+p.w/2+(p.facing||1)*8,y:p.y+Math.min(22,p.h*.42)}}
export function hookInRange(p,h){const a=hookOrigin(p);return Math.hypot(h.x-a.x,h.y-a.y)<=HOOK_RANGE}
export function nearestHook(p,points){
 const a=hookOrigin(p);let nearest=null,d=HOOK_RANGE;
 for(const h of points){const q=Math.hypot(h.x-a.x,h.y-a.y);if(q<=d){nearest=h;d=q}}
 return nearest;
}
export function activateHook(p,h){
 // Ballistic impulse using the existing gravity (1850), with enough height
 // to clear the platforms below the anchor. No dash/double jump dependency.
 const rise=Math.max(0,p.y+p.h-h.y)+12;
 p.vy=-Math.max(470,Math.sqrt(2*1850*rise));
 const ascent=-p.vy/1850;
 p.vx=Math.max(-430,Math.min(430,(h.x-(p.x+p.w/2))/ascent));
 p.hookLiftTimer=ascent;p.hookCable={x:h.x,y:h.y};p.hookCableTimer=.4;
 p.dashTimer=0;p.grounded=false;p.coyote=0;p.jumpBuffer=0;
 p.energy=Math.max(0,p.energy-12);p.specialAnimTimer=.3;
}
