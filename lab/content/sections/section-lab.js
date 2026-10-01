
(()=>{
 'use strict';
 const root=document.getElementById('cube-lab'), $=s=>root.querySelector(s);
 const {add,mul,dot,cross,norm,unit}=Stereo;
 const {vertices,presets}=SECTION_MODEL;
 const edges=SECTION_MODEL.edges.map(([a,b])=>[vertices[a],vertices[b]]);
 const defaults={...presets['sides'+SECTION_MODEL.maxSides],plane:true,challenge:false};let state={...defaults},animation=0;
 function geometry(s){return SectionGeometry.sectionGeometry(SECTION_MODEL,s);}
 let g=geometry(state),view;
 const probe=document.createElement('span');probe.style.display='none';root.appendChild(probe);
 function color(token){probe.style.color='var('+token+')';return getComputedStyle(probe).color;}
 function ink(c,text,x,y,align='left'){c.font=getComputedStyle(root).font;c.textAlign=align;c.fillStyle=color('--foreground');c.fillText(text,x,y);}
 function draw(vw){
   const c=vw.ctx;vw.clear();const fullW=vw.W,fullH=vw.H,small=fullW<520;
   const section=color('--viz-series-1'),neutral=color('--foreground'),muted=color('--muted-foreground'),border=color('--border');
   vw.W=small?fullW:fullW*.66;vw.H=small?fullH*.60:fullH;vw.S=Math.min(vw.W/4.8,vw.H/4.2);
   ink(c,'В пространстве',12,24);
   if(state.plane){const pc=mul(g.n,g.d),r=1.48;const corners=[[-r,-r],[r,-r],[r,r],[-r,r]].map(([a,b])=>add(pc,add(mul(g.u,a),mul(g.v,b))));c.globalAlpha=.10;vw.polygon(corners,section,section);c.globalAlpha=1;}
   edges.forEach(([a,b])=>vw.line(a,b,border,1.2));
   if(g.points.length>=3){c.globalAlpha=.26;vw.polygon(g.points,section,section);c.globalAlpha=1;g.points.forEach((p,i)=>vw.line(p,g.points[(i+1)%g.points.length],section,2.6));}
   if(g.points.length===2)vw.line(...g.points,section,2.6);
   g.points.forEach((p,i)=>{const q=vw.project(p);c.beginPath();c.arc(q[0],q[1],3.6,0,2*Math.PI);c.fillStyle=section;c.fill();ink(c,'P'+(i+1),q[0]+7,q[1]-8);});
   const x=small?fullW/2:fullW*.83,y=small?fullH*.80:fullH*.52;
   const spaceW=small?fullW:fullW*.32,spaceH=small?fullH*.37:fullH*.70;
   const rels=g.points.map(p=>add(p,mul(g.center,-1)));
   const extentX=Math.max(.5,...rels.map(p=>Math.abs(dot(p,g.u)))),extentY=Math.max(.5,...rels.map(p=>Math.abs(dot(p,g.v))));
   const scale=Math.min((spaceW-54)/(extentX*2),(spaceH-54)/(extentY*2));
   ink(c,'Сечение в своей плоскости',x,small?fullH*.64:42,'center');
   const flat=g.points.map(p=>{const rel=add(p,mul(g.center,-1));return[x+dot(rel,g.u)*scale,y-dot(rel,g.v)*scale];});
   if(flat.length){c.beginPath();flat.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));if(flat.length>=3){c.closePath();c.fillStyle=section;c.globalAlpha=.16;c.fill();c.globalAlpha=1;}c.strokeStyle=section;c.lineWidth=2.6;c.stroke();flat.forEach((p,i)=>{c.beginPath();c.arc(...p,3.6,0,2*Math.PI);c.fillStyle=section;c.fill();const dx=p[0]-x,dy=p[1]-y,l=Math.hypot(dx,dy)||1;ink(c,'P'+(i+1),p[0]+dx/l*15,p[1]+dy/l*15+4,'center');});}
   else{c.fillStyle=muted;ink(c,'Нет пересечения',x,y,'center');}
   vw.W=fullW;vw.H=fullH;
 }
 const names={0:'Плоскость вне многогранника',1:'Касание в вершине',2:'Касание по ребру',3:'Треугольник',4:'Четырёхугольник',5:'Пятиугольник',6:'Шестиугольник'};
 function update(){
   g=geometry(state);let name=names[g.points.length];
   if(g.points.length===4){const lengths=g.points.map((p,i)=>norm(add(p,mul(g.points[(i+1)%4],-1))));const a=add(g.points[1],mul(g.points[0],-1)),b=add(g.points[2],mul(g.points[1],-1));if(Math.max(...lengths)-Math.min(...lengths)<1e-7&&Math.abs(dot(a,b))<1e-7)name='Квадрат';}
   $('[data-status]').textContent=(g.boundary&&g.points.length>=3?'Совпадает с гранью · ':'')+name;
   $('[data-measure]').textContent=g.points.length>=3?'Площадь '+g.area.toFixed(3)+' · Периметр '+g.perimeter.toFixed(3):'';
   for(const key of ['shift','theta','phi']){$('[data-control="'+key+'"]').value=state[key];$('[data-value="'+key+'"]').textContent=key==='shift'?state[key].toFixed(1)+' %':state[key].toFixed(1)+'°';}
   $('[data-plane]').checked=state.plane;
   root.querySelectorAll('[data-preset]').forEach(b=>{const p=presets[b.dataset.preset];const active=Math.abs(state.shift-p.shift)<.01&&Math.abs(state.theta-p.theta)<.01&&(state.theta===0||Math.abs(state.phi-p.phi)<.01);b.setAttribute('aria-pressed',String(active));});
   $('[data-feedback]').textContent=state.challenge?(g.points.length===SECTION_MODEL.maxSides?'Получилось! Сечение имеет '+SECTION_MODEL.maxSides+' сторон.':'Получите сечение с '+SECTION_MODEL.maxSides+' сторонами, меняя положение и наклон плоскости.') :'';
   if(view)draw(view);
 }
 function save(){}
 view=new Stereo.View($('canvas'),draw,{span:4.8,yaw:.48,pitch:.50});update();
 function moveTo(target){
   cancelAnimationFrame(animation);
   if(matchMedia('(prefers-reduced-motion: reduce)').matches){Object.assign(state,target);update();save();return;}
   const from={...state},start=performance.now();
   function frame(time){const t=Math.min(1,(time-start)/350),ease=1-(1-t)**3;for(const key of ['theta','phi','shift'])state[key]=from[key]+(target[key]-from[key])*ease;update();if(t<1)animation=requestAnimationFrame(frame);else{Object.assign(state,target);update();save();}}
   animation=requestAnimationFrame(frame);
 }
 root.querySelectorAll('[data-control]').forEach(el=>el.addEventListener('input',()=>{cancelAnimationFrame(animation);state[el.dataset.control]=Number(el.value);update();}));
 root.querySelectorAll('[data-control]').forEach(el=>el.addEventListener('change',save));
 root.querySelectorAll('[data-preset]').forEach(b=>b.onclick=()=>moveTo(presets[b.dataset.preset]));
 $('[data-plane]').onchange=e=>{state.plane=e.target.checked;update();save();};
 $('[data-reset]').onclick=()=>{view.reset();save();};
 $('[data-challenge]').onclick=()=>{state.challenge=true;moveTo(presets.parallel);};
 $('canvas').addEventListener('pointerup',save);
 
 new MutationObserver(()=>draw(view)).observe(document.documentElement,{attributes:true,attributeFilter:['class','style','data-theme']});
 // Expose the pure model for numerical verification, without depending on the rendering.
 root.sectionModel={geometry,vertices,edges,presets};
})();
