// Build 12 - visible outside connections + predictable city-builder controls

// Always recreate the two fixed outside connections so they cannot disappear because of an old save.
const OUT12=[
 {t:'road4',external:true,outsideId:'west',p:[{x:-94,z:-24},{x:-72,z:-24}]},
 {t:'road4',external:true,outsideId:'east',p:[{x:94,z:24},{x:72,z:24}]}
];
roads=roads.filter(r=>!r.external);
for(const e of OUT12)roads.push({t:e.t,external:true,outsideId:e.outsideId,p:e.p.map(q=>({x:q.x,z:q.z}))});
roadsBuild();saveGame();purgeCars();

// Make them clearly visible at the map border.
let gate12=new T.Group();S.add(gate12);
function gateSign12(x,z,label){
 const postM=new T.MeshStandardMaterial({color:0x555d60,roughness:.72,metalness:.15});
 const signM=new T.MeshStandardMaterial({color:0x2e4b62,roughness:.55,metalness:.05});
 const g=new T.Group();
 for(const zz of[-1.55,1.55])g.add(B(.12,1.7,.12,postM,0,.85,zz));
 g.add(B(.12,.72,3.4,signM,0,1.48,0));
 g.position.set(x,0,z);gate12.add(g)
}
gateSign12(-88.6,-24,'WEST');gateSign12(88.6,24,'EAST');

// Outside roads are protected from bulldozing.
const begin12=beginInput;
beginInput=function(e,p){
 if(cat==='bulldoze'&&p){let n=near(p,3);if(n&&n.r&&n.r.external){toast('Outside connection cannot be demolished');return}}
 return begin12(e,p)
};

// --- Camera controls ---
// Predictable screen-relative WASD, almost no drift, middle-drag pan, right-drag rotate, smooth wheel zoom.
held11.clear();
let held12=new Set(),pointerMode12=null,last12={x:0,y:0},zoomTarget12=dist,lastFrame12=performance.now();
const keys12=new Set(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','q','e','shift']);
addEventListener('keydown',e=>{let k=e.key.toLowerCase();if(!keys12.has(k))return;held12.add(k);e.preventDefault();e.stopImmediatePropagation()},{capture:true});
addEventListener('keyup',e=>{let k=e.key.toLowerCase();if(!keys12.has(k))return;held12.delete(k);e.preventDefault();e.stopImmediatePropagation()},{capture:true});

R.domElement.oncontextmenu=e=>e.preventDefault();
R.domElement.onpointerdown=e=>{
 if(e.pointerType==='touch')return;
 last12={x:e.clientX,y:e.clientY};
 if(e.button===2){pointerMode12='rotate';try{R.domElement.setPointerCapture(e.pointerId)}catch{};return}
 if(e.button===1){pointerMode12='pan';try{R.domElement.setPointerCapture(e.pointerId)}catch{};return}
 pointerMode12='build';
 beginInput(e,pick(e));
 try{R.domElement.setPointerCapture(e.pointerId)}catch{}
};
R.domElement.onpointermove=e=>{
 const dx=e.clientX-last12.x,dy=e.clientY-last12.y;last12={x:e.clientX,y:e.clientY};
 if(pointerMode12==='rotate'){
  az-=dx*.0032;el=C(el+dy*.0032,.32,1.2);return
 }
 if(pointerMode12==='pan'){
  const fwdX=target.x-cam.position.x,fwdZ=target.z-cam.position.z,fl=Math.hypot(fwdX,fwdZ)||1,fx=fwdX/fl,fz=fwdZ/fl,rx=fz,rz=-fx;
  const scale=Math.max(.018,dist*.00155);
  target.x+=(-dx*rx+dy*fx)*scale;target.z+=(-dx*rz+dy*fz)*scale;
  target.x=C(target.x,-84,84);target.z=C(target.z,-84,84);return
 }
 if(drag){const p=pick(e);if(!p)return;const b=snap(p);lastRoadPoint11=b;pg.clear();draw({t:drag.t,p:smoothRoadPath(drag.a,b)},pg,.48)}
};
R.domElement.onpointerup=e=>{
 if(pointerMode12==='rotate'||pointerMode12==='pan'){pointerMode12=null;return}
 pointerMode12=null;
 if(!drag)return;
 let p=pick(e),d=drag;drag=null;pg.clear();let b=p?snap(p):lastRoadPoint11;lastRoadPoint11=null;if(!b)return;
 if(Math.hypot(b.x-d.a.x,b.z-d.a.z)<.55){toast('Road is too short');return}
 addRoad([d.a,b],d.t)
};
R.domElement.onpointercancel=()=>{pointerMode12=null;drag=null;pg.clear()};
R.domElement.onwheel=e=>{e.preventDefault();zoomTarget12=C(zoomTarget12+e.deltaY*.045,24,132)},{passive:false};

(function camera12(now){
 requestAnimationFrame(camera12);
 const dt=Math.min(.04,(now-lastFrame12)/1000);lastFrame12=now;
 // Project the real camera direction to the ground, so W always means toward the top of the view.
 let fx=target.x-cam.position.x,fz=target.z-cam.position.z,fl=Math.hypot(fx,fz)||1;fx/=fl;fz/=fl;let rx=fz,rz=-fx;
 let mx=0,mz=0;
 if(held12.has('w')||held12.has('arrowup')){mx+=fx;mz+=fz}
 if(held12.has('s')||held12.has('arrowdown')){mx-=fx;mz-=fz}
 if(held12.has('d')||held12.has('arrowright')){mx+=rx;mz+=rz}
 if(held12.has('a')||held12.has('arrowleft')){mx-=rx;mz-=rz}
 const ml=Math.hypot(mx,mz);if(ml){mx/=ml;mz/=ml;const speed=(held12.has('shift')?27:14)*dt;target.x+=mx*speed;target.z+=mz*speed}
 if(held12.has('q'))az-=1.05*dt;if(held12.has('e'))az+=1.05*dt;
 target.x=C(target.x,-84,84);target.z=C(target.z,-84,84);
 dist+=(zoomTarget12-dist)*(1-Math.exp(-dt*13));
})(performance.now());

// Keep vehicle spawning strictly tied to these two connections.
spawnOutsideVehicle=function(){
 if(!outsideConnected()||cars.length>=46)return;
 const canTruck=truckTargets().length>0,canCar=carTargets().length>0;if(!canTruck&&!canCar)return;
 let kind=canTruck&&Math.random()<.32?'truck':'car';if(kind==='car'&&!canCar)return;
 const destination=chooseTarget(kind);if(!destination)return;
 const ext=roads.filter(r=>r.external&&OUT12.some(o=>o.outsideId===r.outsideId));if(!ext.length)return;
 const r=ext[(Math.random()*ext.length)|0],g=carModel8(kind);mg.add(g);let cd=roadCurveData(r),p=cd&&cd.curve.getPointAt(0);if(p)g.position.copy(p);
 cars.push({g,r,u:0,dir:1,v:0,target:kind==='truck'?3.15:4.35,kind,destination,enteredFromOutside:true})
};

eval(await (await fetch('build13-photoreal-3d.js?v=13',{cache:'no-store'})).text());
eval(await (await fetch('build14-smart-simulation.js?v=14',{cache:'no-store'})).text());
