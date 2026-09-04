if(!localStorage.getItem('sliqadiusCityBuild8Fresh')){
 for(const c of cars||[])try{removeCar(c)}catch{}
 roads=[];buildings=[];cars=[];
 try{localStorage.removeItem('sliqadiusCityV6');localStorage.setItem('sliqadiusCityBuild8Fresh','1')}catch{}
}
const OUTSIDE_CONNECTIONS=[
 {t:'road4',external:true,p:[{x:-90,z:-24},{x:-82,z:-24}]},
 {t:'road4',external:true,p:[{x:90,z:24},{x:82,z:24}]}
];
function pclose(a,b,m=.45){return !!a&&!!b&&Math.hypot(a.x-b.x,a.z-b.z)<=m}
function ensureOutsideConnections(){
 roads=roads.filter(r=>!r.external);
 for(const e of OUTSIDE_CONNECTIONS)roads.push({t:e.t,external:true,p:e.p.map(q=>({x:q.x,z:q.z}))});
 roadsBuild();buildingsBuild();saveGame();
}
ensureOutsideConnections();

const _begin8=beginInput;
beginInput=function(e,p){
 if(cat==='bulldoze'&&p){let n=near(p,2.4);if(n&&n.r&&n.r.external){toast('Outside connections cannot be demolished');return}}
 return _begin8(e,p)
};

function endpointRoadInfo(p,skip=null,m=.85){
 let best=null,bd=m;
 for(const r of roads){
  if(r===skip||!validRoad(r))continue;
  for(let i=0;i<r.p.length-1;i++){
   let q=seg(p,r.p[i],r.p[i+1]);
   if(q.d<bd){let a=r.p[i],b=r.p[i+1],dx=b.x-a.x,dz=b.z-a.z,l=Math.hypot(dx,dz)||1;bd=q.d;best={r,x:q.x,z:q.z,tx:dx/l,tz:dz/l}}
  }
 }
 return best
}
function smoothRoadPath(a,b){
 let d=Math.hypot(b.x-a.x,b.z-a.z);if(d<.45)return[a,b];
 let ux=(b.x-a.x)/d,uz=(b.z-a.z)/d,n0=endpointRoadInfo(a),n1=endpointRoadInfo(b),h=Math.min(5.5,d*.28);
 let s0=n0?{x:n0.tx,z:n0.tz}:{x:ux,z:uz},s1=n1?{x:n1.tx,z:n1.tz}:{x:ux,z:uz};
 if(s0.x*ux+s0.z*uz<0){s0.x*=-1;s0.z*=-1}if(s1.x*ux+s1.z*uz<0){s1.x*=-1;s1.z*=-1}
 let c1={x:a.x+s0.x*h,z:a.z+s0.z*h},c2={x:b.x-s1.x*h,z:b.z-s1.z*h},steps=Math.max(8,Math.min(28,Math.ceil(d/1.3))),out=[];
 for(let i=0;i<=steps;i++){let t=i/steps,u=1-t;out.push({x:u*u*u*a.x+3*u*u*t*c1.x+3*u*t*t*c2.x+t*t*t*b.x,z:u*u*u*a.z+3*u*u*t*c1.z+3*u*t*t*c2.z+t*t*t*b.z})}
 return out
}
const _addRoad8=addRoad;
addRoad=function(p,t){
 if(Array.isArray(p)&&p.length===2&&!['rs','rl'].includes(t))p=smoothRoadPath(p[0],p[1]);
 return _addRoad8(p,t)
};

function roadCurveData(r){
 if(!r||!validRoad(r))return null;
 let sig=r.p.length+':'+r.p.map(q=>q.x.toFixed(2)+','+q.z.toFixed(2)).join('|');
 if(r._curve8&&r._curve8.sig===sig)return r._curve8;
 let pts=r.p.map(q=>new T.Vector3(q.x,.03,q.z)),curve=new T.CatmullRomCurve3(pts,false,'centripetal',.5),len=Math.max(.1,curve.getLength());
 return r._curve8={sig,curve,len}
}
function roadConnectionFromEnd(r,atEnd=true){
 let p=atEnd?r.p[r.p.length-1]:r.p[0],best=null,bd=.62;
 for(const o of roads){if(o===r||!validRoad(o))continue;for(const start of[true,false]){let q=start?o.p[0]:o.p[o.p.length-1],d=Math.hypot(p.x-q.x,p.z-q.z);if(d<bd){bd=d;best={r:o,start}}}}
 return best
}
function cityHasDestination(){return buildings.some(b=>['res','com','ind'].includes(b.k))}
function outsideConnected(){
 for(const e of roads.filter(r=>r.external&&validRoad(r))){
  for(const r of roads.filter(r=>!r.external&&validRoad(r))){
   for(const q of[r.p[0],r.p[r.p.length-1]])for(let i=0;i<e.p.length-1;i++)if(seg(q,e.p[i],e.p[i+1]).d<.7)return true
  }
 }
 return false
}
function carModel8(kind){
 let g=new T.Group(),body=new T.MeshStandardMaterial({color:kind==='truck'?0xe6e8e8:[0x315f8c,0xb74f45,0x386f44,0xd8d3c7,0x555b61][(Math.random()*5)|0],roughness:.42,metalness:.12});
 if(kind==='truck'){g.add(B(.78,.48,1.75,body,0,.37,0));g.add(B(.70,.57,.72,new T.MeshStandardMaterial({color:0x516d78,roughness:.4}),0,.45,-.5))}
 else{g.add(B(.66,.25,1.16,body,0,.25,0));g.add(B(.50,.22,.56,gl,0,.46,0))}
 return g
}
function spawnOutsideVehicle(){
 if(!cityHasDestination()||!outsideConnected()||cars.length>=46)return;
 let ext=roads.filter(r=>r.external&&validRoad(r));if(!ext.length)return;
 let r=ext[(Math.random()*ext.length)|0],kind=Math.random()<.32?'truck':'car',g=carModel8(kind);mg.add(g);
 cars.push({g,r,u:0,dir:1,v:0,target:kind==='truck'?3.1+Math.random()*.35:4.2+Math.random()*.7,kind,wait:0})
}
function segmentInfoForU(r,u){
 let lens=[],total=0;for(let i=0;i<r.p.length-1;i++){let l=Math.hypot(r.p[i+1].x-r.p[i].x,r.p[i+1].z-r.p[i].z);lens.push(l);total+=l}let d=C(u,0,1)*Math.max(.001,total),acc=0;for(let i=0;i<lens.length;i++){if(d<=acc+lens[i]||i===lens.length-1)return{i,t:lens[i]?C((d-acc)/lens[i],0,1):0};acc+=lens[i]}return{i:0,t:0}
}
carsUp=function(dt){
 if(cityHasDestination()&&outsideConnected()&&Math.random()<dt*.52*st.speed)spawnOutsideVehicle();
 for(let i=cars.length-1;i>=0;i--){
  let c=cars[i];if(!validRoad(c.r)||!roads.includes(c.r)){removeCar(c);cars.splice(i,1);continue}
  let cd=roadCurveData(c.r);if(!cd){removeCar(c);cars.splice(i,1);continue}
  let si=segmentInfoForU(c.r,c.u),blocked=false;
  if(!c.r.external){let q=stop(c.r,si.i,si.t,c.dir||1);blocked=!!q}
  let wanted=blocked?0:c.target;c.v+=(wanted-c.v)*(1-Math.exp(-dt*(blocked?8:3.2)));
  c.u+=((c.v*dt*st.speed)/cd.len)*(c.dir||1);
  if(c.u>=1||c.u<=0){
   let end=c.u>=1,con=roadConnectionFromEnd(c.r,end);
   if(con){c.r=con.r;c.dir=con.start?1:-1;c.u=con.start?.002:.998;cd=roadCurveData(c.r)}
   else if(c.r.external&&end){c.u=.998;c.v*=.3}
   else if(!c.r.external){c.dir*=-1;c.u=C(c.u,0,1)}
   else{removeCar(c);cars.splice(i,1);continue}
  }
  let uu=c.dir<0?1-c.u:c.u,p=cd.curve.getPointAt(C(uu,0,1)),tg=cd.curve.getTangentAt(C(uu,0,1));
  if(c.dir<0)tg.multiplyScalar(-1);c.g.position.copy(p);c.g.rotation.y=Math.atan2(tg.x,tg.z)
 }
 pu(dt)
};

const _new8=document.getElementById('newcity');if(_new8)_new8.remove();
