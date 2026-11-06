export class Camera{
 constructor(){this.x=0;this.y=0;this.arena=null}
 update(target,w,h,worldW,worldH,dt){
  const maxX=Math.max(0,worldW-w),maxY=Math.max(0,worldH-h);
  let tx=Math.max(0,Math.min(maxX,target.x+target.w/2-w*.46));
  let ty=Math.max(0,Math.min(maxY,target.y+target.h/2-h*.58));
  if(this.arena){
   const a=this.arena;
   tx=w>=a.right-a.left?(a.left+a.right-w)/2:Math.max(a.left,Math.min(a.right-w,target.x+target.w/2-w/2));
   tx=Math.max(0,Math.min(maxX,tx));ty=Math.max(0,Math.min(maxY,a.floor-h+60));
  }
  this.x+=(tx-this.x)*Math.min(1,dt*5);this.y+=(ty-this.y)*Math.min(1,dt*4);
 }
}