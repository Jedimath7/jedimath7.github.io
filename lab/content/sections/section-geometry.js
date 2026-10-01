(()=>{
'use strict';

const {add,mul,dot,cross,norm,unit}=Stereo;
const EPS=1e-9; // Допуск вычислений в мировых координатах; не экранное прилипание.
function sectionGeometry(model,s){
 const t=s.theta*Math.PI/180,p=s.phi*Math.PI/180,n=[Math.sin(t)*Math.cos(p),Math.sin(t)*Math.sin(p),Math.cos(t)];
 const projections=model.vertices.map(a=>dot(n,a)),lo=Math.min(...projections),hi=Math.max(...projections),d=(lo+hi)/2+s.shift/100*(hi-lo)/2;
 const u=unit(cross(n,Math.abs(n[2])<.9?[0,0,1]:[0,1,0])),v=cross(n,u),points=[];
 function push(q){if(!points.some(a=>norm(add(q,mul(a,-1)))<EPS))points.push(q);}
 for(const [ia,ib]of model.edges){const a=model.vertices[ia],b=model.vertices[ib],da=dot(n,a)-d,db=dot(n,b)-d;if(Math.abs(da)<EPS)push(a);if(Math.abs(db)<EPS)push(b);if(da*db<0&&Math.abs(da)>EPS&&Math.abs(db)>EPS)push(add(a,mul(add(b,mul(a,-1)),da/(da-db))));}
 const center=points.length?mul(points.reduce((a,b)=>add(a,b),[0,0,0]),1/points.length):mul(n,d);
 points.sort((a,b)=>Math.atan2(dot(add(a,mul(center,-1)),v),dot(add(a,mul(center,-1)),u))-Math.atan2(dot(add(b,mul(center,-1)),v),dot(add(b,mul(center,-1)),u)));
 let area=0,perimeter=0;for(let i=0;points.length>=3&&i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];area+=dot(cross(add(a,mul(center,-1)),add(b,mul(center,-1))),n)/2;perimeter+=norm(add(b,mul(a,-1)));}
 return{n,d,u,v,lo,hi,points,center,area:Math.abs(area),perimeter,boundary:Math.abs(d-lo)<EPS||Math.abs(d-hi)<EPS};
}
window.SectionGeometry={sectionGeometry,EPS};

})();