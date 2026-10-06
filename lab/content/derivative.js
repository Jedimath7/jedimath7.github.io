'use strict';
// The upper curve is the exact antiderivative of the lower curve.
const DerivativeModel = (() => {
  const knots=[[-2,-4],[-1,-3],[0,-1.3],[1,-3],[2,-1.3],[3,-1.7],[4,-2.5],[5,-2.8],[6,-2.7],[7,0],[8,2.6],[9,1.2],[10,4],[11,1.8]];
  const slopes=knots.map((k,i)=>i===0?1:i===knots.length-1?-2.2:((knots[i][1]-knots[i-1][1])*(knots[i+1][1]-knots[i][1])<=0?0:(knots[i+1][1]-knots[i-1][1])/2));
  const segments=knots.slice(0,-1).map(([x,y],i)=>{const next=knots[i+1][1],m=slopes[i],n=slopes[i+1];return {x,c:[y,m,3*(next-y)-2*m-n,2*(y-next)+m+n]};});
  const primitive=(c,t)=>c[0]*t+c[1]*t*t/2+c[2]*t**3/3+c[3]*t**4/4;
  let total=0;for(const s of segments){s.area=total;total+=primitive(s.c,1);}
  function exam(x,integral){const s=segments[Math.min(segments.length-1,Math.max(0,Math.floor(x+2)))],t=x-s.x;return integral?s.area+primitive(s.c,t):s.c[0]+s.c[1]*t+s.c[2]*t*t+s.c[3]*t**3;}
  const models={
    exam:{d:x=>exam(x,false),f:x=>exam(x,true),roots:[7],defaults:[-1,5],note:'Первый пример — учебная реконструкция формы производной по изображению, а не точная оцифровка. Верхний график получен интегрированием; выбрано f(−2) = 0. Добавление константы сдвигает функцию вверх или вниз, но не меняет точки экстремумов и ответ задачи.'},
    turns:{d:x=>(x-1)*(x-4)*(x-8)/20,f:x=>(x**4/4-13*x**3/3+44*x*x/2-32*x)/20,roots:[1,4,8],defaults:[0,10],note:'Учебный пример: f′(x) = (x − 1)(x − 4)(x − 8) / 20. Вертикальные масштабы двух графиков различаются; горизонтальная шкала общая.'},
    touch:{d:x=>(x-3)**2*(x-8)/35,f:x=>(x**4/4-14*x**3/3+57*x*x/2-72*x)/35,roots:[3,8],defaults:[0,10],note:'Учебный пример: f′(x) = (x − 3)²(x − 8) / 35. В x = 3 касательная горизонтальна, но знак производной не меняется: экстремума нет.'}
  };
  function candidates(m,a,b){return [a,...m.roots.filter(x=>x>a+1e-8&&x<b-1e-8),b].map(x=>({x,y:m.f(x)}));}
  return {models,candidates};
})();
if(typeof module!=='undefined')module.exports=DerivativeModel;
if(typeof document!=='undefined'){
const $=id=>document.getElementById(id),canvas=$('plot'),ctx=canvas.getContext('2d');
let model=DerivativeModel.models.exam,a=-1,b=5,x=2,width=800,height=610;
const fmt=n=>Math.abs(n)<0.0005?'0':Number(n.toFixed(2)).toLocaleString('ru-RU');
function update(){
  for(const r of model.roots)if(Math.abs(x-r)<.005){x=r;$('x').value=x;}
  const slope=model.d(x),left=model.d(x-.001),right=model.d(x+.001),zero=model.roots.some(r=>Math.abs(r-x)<.005);
  $('readout').textContent='x = '+fmt(x);
  $('point').innerHTML=zero?`В x = ${fmt(x)} производная равна нулю, касательная горизонтальна. `+(left*right<0?(left>0?'Знак меняется с + на −: <strong>локальный максимум.</strong>':'Знак меняется с − на +: <strong>локальный минимум.</strong>'):'Знак не меняется: <strong>экстремума нет.</strong>'):`f′(${fmt(x)}) = ${fmt(slope)}. `+(slope>0?'Производная положительна: функция <strong>возрастает</strong>, касательная направлена вверх.':'Производная отрицательна: функция <strong>убывает</strong>, касательная направлена вниз.');
  $('extrema').innerHTML=model.roots.map(r=>{const l=model.d(r-.001),q=model.d(r+.001);return l*q<0?`x = ${fmt(r)}: ${l>0?'максимум (+ → −)':'минимум (− → +)'}.`:`x = ${fmt(r)}: ноль без смены знака, экстремума нет.`;}).join('<br>');
  const c=DerivativeModel.candidates(model,a,b),lo=Math.min(...c.map(p=>p.y)),hi=Math.max(...c.map(p=>p.y));
  const at=v=>c.filter(p=>Math.abs(p.y-v)<1e-7).map(p=>fmt(p.x)).join('; ');
  $('answer').innerHTML=`На [${fmt(a)}; ${fmt(b)}] <strong>наименьшее значение</strong> при x = ${at(lo)}, <strong>наибольшее</strong> при x = ${at(hi)}.`+(model===DerivativeModel.models.exam&&b<7?' На всём отрезке f′(x) &lt; 0: функция убывает, поэтому наименьшее значение — на правом конце, наибольшее — на левом.':' Сравните высоты отмеченных точек верхнего графика.');
  $('candidates').innerHTML=c.map(p=>`<tr><td>${fmt(p.x)}</td><td>${fmt(p.y)}</td><td>${Math.abs(p.y-lo)<1e-7?'наименьшее':Math.abs(p.y-hi)<1e-7?'наибольшее':'—'}</td></tr>`).join('');
  $('model-note').textContent=model.note;draw(c,lo,hi);
}
function draw(c,lo,hi){
  const dpr=window.devicePixelRatio||1;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
  const L=44,R=width-22,span=R-L,X=v=>L+(v+2)/13*span;
  const gold='#e4c892',sage='#a8c9b9',red='#f4b6a6',ink='#ece6d8',muted='#b0b8b3';
  const text=(s,px,py,color=muted)=>{ctx.fillStyle=color;ctx.fillText(s,px,py);};
  const line=(x1,y1,x2,y2,color,dash=[])=>{ctx.strokeStyle=color;ctx.setLineDash(dash);ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.setLineDash([]);};
  ctx.font='12px Inter, system-ui, sans-serif';
  for(let panel=0;panel<2;panel++){
    const top=panel?height/2+32:42,bottom=panel?height-40:height/2-28,fn=panel?model.d:model.f,vals=Array.from({length:651},(_,i)=>fn(-2+i/50));
    let min=Math.min(0,...vals),max=Math.max(0,...vals),pad=(max-min)*.12||1;min-=pad;max+=pad;
    const Y=v=>bottom-(v-min)/(max-min)*(bottom-top);
    text(panel?'Производная  y = f′(x)':'Функция  y = f(x)',L,top-18,panel?sage:gold);
    ctx.fillStyle='#c9a86a12';ctx.fillRect(X(a),top,X(b)-X(a),bottom-top);
    ctx.lineWidth=1;for(let v=-2;v<=11;v++){line(X(v),top,X(v),bottom,'#3b4547');ctx.textAlign='center';if(width>500||v%2===0)text(String(v).replace('-','−'),X(v),bottom+19);}ctx.textAlign='left';
    const step=10**Math.floor(Math.log10((max-min)/4)),tick=step*Math.ceil((max-min)/5/step);
    for(let v=Math.ceil(min/tick)*tick;v<=max;v+=tick){line(L,Y(v),R,Y(v),'#3b4547');ctx.textAlign='right';text(fmt(v),L-6,Y(v)+4);}ctx.textAlign='left';
    line(L,Y(0),R,Y(0),'#b0b8b3');line(X(0),top,X(0),bottom,'#b0b8b3');text('x',R+5,bottom+19);
    for(const r of model.roots)line(X(r),top,X(r),bottom,'#8fa89b',[3,5]);
    line(X(a),top,X(a),bottom,gold,[5,4]);line(X(b),top,X(b),bottom,gold,[5,4]);
    const visible=panel||$('show-function').checked;
    if(visible){
      ctx.save();ctx.beginPath();ctx.rect(L,top,span,bottom-top);ctx.clip();
      ctx.lineWidth=2.5;
      for(let i=0;i<650;i++){const v=-2+i/50;line(X(v),Y(vals[i]),X(v+.02),Y(vals[i+1]),model.d(v+.01)>=0?sage:red);}
      if(!panel){ctx.lineWidth=2;line(X(x-1),Y(model.f(x)-model.d(x)),X(x+1),Y(model.f(x)+model.d(x)),gold);}
      ctx.restore();
      ctx.lineWidth=1;line(X(x),top,X(x),bottom,gold,[4,4]);
      ctx.fillStyle=gold;ctx.beginPath();ctx.arc(X(x),Y(fn(x)),5,0,Math.PI*2);ctx.fill();
      if(!panel){for(const p of c){ctx.fillStyle=Math.abs(p.y-lo)<1e-7||Math.abs(p.y-hi)<1e-7?gold:ink;ctx.beginPath();ctx.arc(X(p.x),Y(p.y),4,0,Math.PI*2);ctx.fill();}}
    }else{text('График скрыт. Исследуйте знак f′.',L+12,(top+bottom)/2);}
    if(panel){text('Зелёный: f′ > 0 · функция растёт',L,top-2,sage);if(width>600)text('Розовый: f′ < 0 · функция убывает',L+260,top-2,red);}
  }
}
function resize(){width=canvas.clientWidth;height=canvas.clientHeight;const dpr=window.devicePixelRatio||1;canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);update();}
function reset(){[a,b]=model.defaults;$('a').value=a;$('b').value=b;x=(a+b)/2;$('x').value=x;$('error').hidden=true;update();}
$('example').addEventListener('change',()=>{model=DerivativeModel.models[$('example').value];reset();});
$('reset').addEventListener('click',reset);
for(const id of ['a','b'])$(id).addEventListener('input',()=>{const aa=Number($('a').value),bb=Number($('b').value),valid=$('a').value!==''&&$('b').value!==''&&Number.isFinite(aa)&&Number.isFinite(bb)&&aa>=-1.9&&bb<=10.9&&aa<bb;$('error').hidden=valid;if(!valid){$('error').textContent='Введите −1,9 ≤ a < b ≤ 10,9. Пока показан последний корректный отрезок.';return;}a=aa;b=bb;update();});
$('x').addEventListener('input',()=>{x=Number($('x').value);update();});$('show-function').addEventListener('change',update);
function probe(event){const bounds=canvas.getBoundingClientRect();x=Math.min(10.9,Math.max(-1.9,-2+(event.clientX-bounds.left-44)/(width-66)*13));for(const r of model.roots)if(Math.abs(x-r)<.09)x=r;$('x').value=x;update();}
canvas.addEventListener('pointerdown',e=>{probe(e);canvas.setPointerCapture(e.pointerId);});canvas.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'||canvas.hasPointerCapture(e.pointerId))probe(e);});
new ResizeObserver(resize).observe(canvas);
}
