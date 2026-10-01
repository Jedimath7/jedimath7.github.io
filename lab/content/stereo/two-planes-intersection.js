(function(root){
  'use strict';
  const Core=typeof module!=='undefined'&&module.exports?require('./shared/scene-core.js'):root.Stereo;
  const EPS=1e-10;
  function state(angle,position){
    const t=Number(angle)*Math.PI/180;
    const alpha={normal:[0,0,1],basis:[[1,0,0],[0,1,0]]};
    const beta={normal:[0,-Math.sin(t),Math.cos(t)],basis:[[1,0,0],[0,Math.cos(t),Math.sin(t)]]};
    const direction=Core.unit(Core.cross(alpha.normal,beta.normal));
    const M=Core.mul(direction,Number(position));
    return {alpha,beta,direction,M,distinct:Core.norm(Core.cross(alpha.normal,beta.normal))>EPS};
  }
  function inPlane(p,plane){return Math.abs(Core.dot(p,plane.normal))<EPS;}
  const api={state,inPlane};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.TwoPlanes=api;
})(typeof globalThis!=='undefined'?globalThis:this);
