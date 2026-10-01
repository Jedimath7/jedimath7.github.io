(function(root){
  'use strict';
  const Core=typeof module!=='undefined'&&module.exports?require('./shared/scene-core.js'):root.Stereo;
  const A=[-1.55,0,0],B=[1.55,0,0],EPS=1e-10;
  function state(mode,turn){
    if(mode==='collinear'){
      const angle=Number(turn)*Math.PI/180;
      return {mode,A,B,C:[.35,0,0],basis:[[1,0,0],[0,Math.cos(angle),Math.sin(angle)]],unique:false};
    }
    const C=[.25,.9,.75],u=Core.unit(Core.add(B,Core.mul(A,-1)));
    const raw=Core.add(C,Core.mul(A,-1));
    const v=Core.unit(Core.add(raw,Core.mul(u,-Core.dot(raw,u))));
    return {mode,A,B,C,basis:[u,v],unique:true};
  }
  function planeNormal(s){return Core.unit(Core.cross(s.basis[0],s.basis[1]));}
  function belongsToPlane(s,p){return Math.abs(Core.dot(Core.add(p,s.A.map(x=>-x)),planeNormal(s)))<EPS;}
  const api={A,B,state,planeNormal,belongsToPlane};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ThreePoints=api;
})(typeof globalThis!=='undefined'?globalThis:this);
