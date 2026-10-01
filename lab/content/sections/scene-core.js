(function(root){
  'use strict';
  const add=(a,b)=>a.map((x,i)=>x+b[i]);
  const mul=(a,k)=>a.map(x=>x*k);
  const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const norm=a=>Math.hypot(...a);
  function unit(a){const n=norm(a);if(!n)throw Error('Zero vector');return mul(a,1/n);}
  // EPS is a numerical tolerance in world units, not a screen-space snap threshold.
  function linePlane(origin,direction,planePoint=[0,0,0],normal=[0,0,1],eps=1e-10){
    const d=unit(direction),n=unit(normal),den=dot(d,n),distance=dot(add(origin,mul(planePoint,-1)),n);
    if(Math.abs(den)<=eps)return {kind:Math.abs(distance)<=eps?'contained':'parallel',point:null};
    const t=-distance/den;return {kind:'intersecting',point:add(origin,mul(d,t)),t};
  }
  class View{
    constructor(canvas,draw,options={}){
      this.canvas=canvas;this.ctx=canvas.getContext('2d');this.draw=draw;
      this.initial={yaw:options.yaw??.45,pitch:options.pitch??.62};
      Object.assign(this,this.initial);this.span=options.span??6;this.W=600;this.H=500;this.S=80;
      let drag=null;
      canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={x:e.clientX,y:e.clientY,yaw:this.yaw,pitch:this.pitch,id:e.pointerId};canvas.setPointerCapture(e.pointerId);canvas.style.cursor='grabbing';});
      canvas.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;this.yaw=drag.yaw+(e.clientX-drag.x)*.008;this.pitch=Math.max(-1.4,Math.min(1.4,drag.pitch+(e.clientY-drag.y)*.008));draw(this);});
      const stop=()=>{drag=null;canvas.style.cursor='grab';};
      ['pointerup','pointercancel','lostpointercapture'].forEach(type=>canvas.addEventListener(type,stop));
      this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(canvas);
    }
    resize(){const r=this.canvas.getBoundingClientRect();this.W=r.width;this.H=r.height;const d=devicePixelRatio||1;this.canvas.width=Math.round(r.width*d);this.canvas.height=Math.round(r.height*d);this.ctx.setTransform(d,0,0,d,0,0);this.S=Math.min(this.W/this.span,this.H/(this.span*.83));this.draw(this);}
    reset(){Object.assign(this,this.initial);this.draw(this);}
    project(v){const x=Math.cos(this.yaw)*v[0]-Math.sin(this.yaw)*v[1],y=Math.sin(this.yaw)*v[0]+Math.cos(this.yaw)*v[1];return[this.W/2+this.S*x,this.H*.52-this.S*(Math.cos(this.pitch)*v[2]-Math.sin(this.pitch)*y),Math.sin(this.pitch)*v[2]+Math.cos(this.pitch)*y];}
    clear(){this.ctx.clearRect(0,0,this.W,this.H);}
    line(a,b,color='#8259ce',width=3,dash=[]){const c=this.ctx,p=this.project(a),q=this.project(b);c.beginPath();c.moveTo(p[0],p[1]);c.lineTo(q[0],q[1]);c.strokeStyle=color;c.lineWidth=width;c.setLineDash(dash);c.stroke();c.setLineDash([]);}
    polygon(points,fill='#568ed526',stroke='#7f9fc2'){const c=this.ctx;c.beginPath();points.map(p=>this.project(p)).forEach((p,i)=>i?c.lineTo(...p.slice(0,2)):c.moveTo(...p.slice(0,2)));c.closePath();c.fillStyle=fill;c.fill();c.strokeStyle=stroke;c.lineWidth=1;c.stroke();}
    label(p,text,color='#344d6c',dx=10,dy=-10){const c=this.ctx,q=this.project(p);c.font='600 16px system-ui';c.fillStyle=color;c.fillText(text,q[0]+dx,q[1]+dy);}
    point(p,text='',color='#d87545',radius=6){const c=this.ctx,q=this.project(p);c.beginPath();c.arc(q[0],q[1],radius,0,2*Math.PI);c.fillStyle=color;c.fill();c.strokeStyle='#fff';c.lineWidth=2;c.stroke();if(text)this.label(p,text,color);}
  }
  const api={add,mul,dot,cross,norm,unit,linePlane,View};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.Stereo=api;
})(typeof globalThis!=='undefined'?globalThis:this);
