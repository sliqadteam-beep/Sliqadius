// Build 11 - smoother camera, reliable road placement, true outside traffic

// 1) Keep outside connections, but extend their spawn ends well beyond the playable ground.
// The inner endpoints stay unchanged, so roads already connected to the city still match.
for(const r of roads){
 if(!r.external||!validRoad(r))continue;
 const end=r.p[r.p.length-1];
 if(end.x<0)r.p[0]={x:-118,z:-24};
 else r.p[0]={x:118,z:24};
 r._curve8=null;
}
roadsBuild();

// Remove any vehicle that existed before this traffic version loaded. Vehicles must now enter from outside.
purgeCars();

// 2) Much more dependable snapping: endpoints have priority, then road surface, otherwise free placement.
let snapHint11=null;
snap=function(p,m=2.6){
 if(!p)return null;
 let endpoint=null,ed=2.65;
 for(const r of roads){
  if(!validRoad(r))continue;
  for(const q of [r.p[0],r.p[r.p.length-1]]){
   const d=Math.hypot(p.x-q.x,p.z-q.z);
   if(d<ed){ed=d;endpoint={x:q.x,z:q.z,kind:'endpoint',r}}
  }
 }
 if(endpoint){snapHint11=endpoint;return{x:endpoint.x,z:endpoint.z}}
 let surface=null,sd=1.35;
 for(const r of roads){
  if(!validRoad(r))continue;
  for(let i=0;i<r.p.length-1;i++){
   const q=seg(p,r.p[i],r.p[i+1]);
   if(q.d<sd){sd=q.d;surface={x:q.x,z:q.z,kind:'road',r}}
  }
 }
 if(surface){snapHint11=surface;return{x:surface.x,z:surface.z}}
 snapHint11=null;return{x:p.x,z:p.z}
};

// Better road preview and release reliability. If pointer-up misses the ground slightly,
// use the last valid road preview point instead of silently cancelling the road.
let lastRoadPoint11=null;
R.domElement.onpointermove=e=>{
 if(orbit){
  az-=(e.clientX-last.x)*.0045;
  el=C(el+(e.clientY-last.y)*.0045,.25,1.35);
  last={x:e.clientX,y:e.clientY};
  return;
 }
 if(!drag)return;
 const p=pick(e);if(!p)return;
 const b=snap(p);lastRoadPoint11=b;
 pg.clear();
 const path=smoothRoadPath(drag.a,b);
 draw({t:drag.t,p:path},pg,.48);
};
R.domElement.onpointerup=e=>{
 if(e.button===2){orbit=0;return}
 if(!drag)return;
 let p=pick(e),d=drag;drag=null;pg.clear();
 let b=p?snap(p):lastRoadPoint11;lastRoadPoint11=null;
 if(!b)return;
 if(Math.hypot(b.x-d.a.x,b.z-d.a.z)<.55){toast('Road is too short');return}
 addRoad([d.a,b],d.t);
};

// 3) Smooth keyboard camera movement. Block the old instant WASD/QE handler only for movement keys.
const held11=new Set();
const moveKeys11=new Set(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','q','e','shift']);
addEventListener('keydown',e=>{
 const k=e.key.toLowerCase();
 if(!moveKeys11.has(k))return;
 held11.add(k);e.preventDefault();e.stopImmediatePropagation();
},{capture:true});
addEventListener('keyup',e=>{
 const k=e.key.toLowerCase();
 if(!moveKeys11.has(k))return;
 held11.delete(k);e.preventDefault();e.stopImmediatePropagation();
},{capture:true});
for(const k of Object.keys(keys))keys[k]=0;
let velX11=0,velZ11=0,turn11=0,lastMove11=performance.now();
(function smoothCamera11(now){
 requestAnimationFrame(smoothCamera11);
 let dt=Math.min(.05,(now-lastMove11)/1000);lastMove11=now;
 const fast=held11.has('shift'),max=fast?29:15;
 const fx=-Math.cos(az),fz=-Math.sin(az),rx=-fz,rz=fx;
 let ix=0,iz=0;
 if(held11.has('w')||held11.has('arrowup')){ix+=fx;iz+=fz}
 if(held11.has('s')||held11.has('arrowdown')){ix-=fx;iz-=fz}
 if(held11.has('a')||held11.has('arrowleft')){ix-=rx;iz-=rz}
 if(held11.has('d')||held11.has('arrowright')){ix+=rx;iz+=rz}
 let il=Math.hypot(ix,iz);if(il>0){ix/=il;iz/=il}
 const blend=1-Math.exp(-dt*7.5);
 velX11+=(ix*max-velX11)*blend;velZ11+=(iz*max-velZ11)*blend;
 if(il===0){const damp=Math.exp(-dt*8.5);velX11*=damp;velZ11*=damp}
 target.x+=velX11*dt;target.z+=velZ11*dt;
 let wantTurn=(held11.has('e')?1:0)-(held11.has('q')?1:0);
 turn11+=(wantTurn*1.25-turn11)*(1-Math.exp(-dt*9));
 if(!wantTurn)turn11*=Math.exp(-dt*7);
 az+=turn11*dt;
})(performance.now());

// 4) Vehicles can only be created at the far end of an outside connection.
// Trucks still require commercial/industrial destinations; cars require a real city destination.
spawnOutsideVehicle=function(){
 if(!outsideConnected()||cars.length>=46)return;
 const canTruck=truckTargets().length>0;
 const canCar=carTargets().length>0;
 if(!canCar&&!canTruck)return;
 let kind=canTruck&&Math.random()<.32?'truck':'car';
 if(kind==='car'&&!canCar)return;
 const destination=chooseTarget(kind);if(!destination)return;
 const ext=roads.filter(r=>r.external&&validRoad(r));if(!ext.length)return;
 const r=ext[(Math.random()*ext.length)|0],g=carModel8(kind);mg.add(g);
 const startCurve=roadCurveData(r),p=startCurve&&startCurve.curve.getPointAt(0);
 if(p)g.position.copy(p);
 cars.push({g,r,u:0,dir:1,v:0,target:kind==='truck'?3.1+Math.random()*.35:4.2+Math.random()*.7,kind,wait:0,destination,enteredFromOutside:true});
};

// Safety: remove any later vehicle that does not have an outside-entry marker.
const carsUp10=carsUp;
carsUp=function(dt){
 for(let i=cars.length-1;i>=0;i--){
  if(!cars[i].enteredFromOutside){removeCar(cars[i]);cars.splice(i,1)}
 }
 carsUp10(dt);
};

eval(await (await fetch('build12-connections-controls.js?v=12',{cache:'no-store'})).text());
