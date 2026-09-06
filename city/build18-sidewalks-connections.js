// Build 18 - continuous sidewalks, cleaner road junctions, and bidirectional traffic via both city entrances
const sidewalk18=new T.Group();S.add(sidewalk18);
function clear18(g){while(g.children.length)g.remove(g.children[0])}
function roadPoint18(r,u){let cd=roadCurveData(r);if(!cd)return null;let q=cd.curve.getPointAt(C(u,0,1)),t=cd.curve.getTangentAt(C(u,0,1));return{q,t}}
function rebuildSidewalks18(){
 clear18(sidewalk18);let walk=m13(0xb6b5ae,.94,.01),curb=m13(0x8f918e,.96,.02),joint=m13(0xa9aaa5,.95,.01);
 for(const r of roads){if(!validRoad(r))continue;let cd=roadCurveData(r),w=RT[r.t].w;if(!cd)continue;let n=Math.max(5,Math.ceil(cd.len/.9));
  for(const side of[-1,1])for(let i=0;i<n;i++){let u0=i/n,u1=(i+1)/n,a=roadPoint18(r,u0),b=roadPoint18(r,u1);if(!a||!b)continue;let n0={x:-a.t.z,z:a.t.x},n1={x:-b.t.z,z:b.t.x},off=w*.5+.56,ca={x:a.q.x+n0.x*off*side,z:a.q.z+n0.z*off*side},cb={x:b.q.x+n1.x*off*side,z:b.q.z+n1.z*off*side};let s=LM(ca,cb,.82,walk,.075);if(s)sidewalk18.add(s);let co=w*.5+.08,da={x:a.q.x+n0.x*co*side,z:a.q.z+n0.z*co*side},db={x:b.q.x+n1.x*co*side,z:b.q.z+n1.z*co*side},c=LM(da,db,.13,curb,.12);if(c)sidewalk18.add(c)}
 }
 // junction pads hide tiny cracks where roads meet.
 let pts=[];for(const r of roads){if(!validRoad(r))continue;pts.push(r.p[0],r.p[r.p.length-1])}for(let i=0;i<pts.length;i++){let p=pts[i],count=0;for(const q of pts)if(Math.hypot(p.x-q.x,p.z-q.z)<.75)count++;if(count>1)sidewalk18.add(cyl13(1.25,1.25,.08,joint,p.x,.045,p.z,20))}
}

// When a new road ends on the middle of another road, split that road into two real graph segments.
function splitRoadAt18(pt){
 let hit=null,bd=.72;
 for(const r of [...roads]){if(!validRoad(r)||r.external)continue;for(let i=0;i<r.p.length-1;i++){let q=seg(pt,r.p[i],r.p[i+1]),a=r.p[0],b=r.p[r.p.length-1];if(q.d<bd&&Math.hypot(q.x-a.x,q.z-a.z)>.8&&Math.hypot(q.x-b.x,q.z-b.z)>.8){bd=q.d;hit={r,i,q:{x:q.x,z:q.z}}}}}
 if(!hit)return pt;let {r,i,q}=hit,idx=roads.indexOf(r);if(idx<0)return q;let base={...r};delete base._curve8;let p1=r.p.slice(0,i+1).concat([q]),p2=[q].concat(r.p.slice(i+1));roads.splice(idx,1,{...base,p:p1},{...base,p:p2});return q
}
const addRoadBefore18=addRoad;addRoad=function(p,t){if(Array.isArray(p)&&p.length>=2&&!['rs','rl'].includes(t)){p=[...p];p[0]=splitRoadAt18(p[0]);p[p.length-1]=splitRoadAt18(p[p.length-1])}let out=addRoadBefore18(p,t);roadsBuild();rebuildSidewalks18();saveGame();return out};
const roadsBuildBefore18=roadsBuild;roadsBuild=function(){roadsBuildBefore18();rebuildSidewalks18()};rebuildSidewalks18();

// Keep exactly two outside connections as the only city entrances/exits.
function entrances18(){return roads.filter(r=>r.external&&validRoad(r)&&['west','east'].includes(r.outsideId))}
let entranceRound18=0;
const spawnOutsideBefore18=spawnOutsideVehicle;spawnOutsideVehicle=function(){
 if(!outsideConnected()||cars.length>=46)return;let ext=entrances18();if(!ext.length)return;let canTruck=truckTargets().length>0,canCar=carTargets().length>0;if(!canTruck&&!canCar)return;let kind=canTruck&&Math.random()<.3?'truck':'car';if(kind==='car'&&!canCar)return;let destination=chooseTarget(kind);if(!destination)return;let r=ext[entranceRound18++%ext.length],g=carModel8(kind);mg.add(g);let cd=roadCurveData(r),p=cd?.curve.getPointAt(0);if(p)g.position.copy(p);cars.push({g,r,u:.002,dir:1,v:0,target:kind==='truck'?3.15:4.35,kind,destination,enteredFromOutside:true,entry18:r.outsideId})
};

// Separate outbound vehicles so residents/workers also visibly leave through either outside road.
const outboundCars18=[];
function routeToRoad18(start,goal){if(!start||!goal)return null;if(start===goal)return[start];let q=[start],prev=new Map([[start,null]]),cost=new Map([[start,0]]);while(q.length){q.sort((a,b)=>(cost.get(a)||0)-(cost.get(b)||0));let r=q.shift();if(r===goal)break;for(const at of[true,false])for(const e of roadAdj14(r,at)){let nc=(cost.get(r)||0)+e.cost;if(!cost.has(e.r)||nc<cost.get(e.r)){cost.set(e.r,nc);prev.set(e.r,r);if(!q.includes(e.r))q.push(e.r)}}}if(!prev.has(goal))return null;let path=[],r=goal;while(r){path.push(r);r=prev.get(r)}return path.reverse()}
function spawnOutboundCar18(){if(outboundCars18.length>=12||!buildings.some(b=>['res','com','ind'].includes(b.k)))return;let ext=entrances18();if(!ext.length)return;let srcs=buildings.filter(b=>['res','com','ind'].includes(b.k)&&!b.burned16);if(!srcs.length)return;let b=srcs[(Math.random()*srcs.length)|0],sp=roadProjection16(b),goal=ext[entranceRound18++%ext.length];if(!sp)return;let route=routeToRoad18(sp.r,goal);if(!route)return;let g=carModel8('car');mg.add(g);let ev={g,r:route[0],route,idx:0,u:sp.u,dir:1,v:0,goal};if(route.length>1){let c=connectedSide16(route[0],route[1]);ev.dir=c.ai===1?1:-1}else ev.dir=.5>=sp.u?1:-1;outboundCars18.push(ev)}
function updateOutboundCars18(dt){if(!st.paused&&Math.random()<dt*.08*st.speed)spawnOutboundCar18();for(let i=outboundCars18.length-1;i>=0;i--){let c=outboundCars18[i],cd=roadCurveData(c.r);if(!cd){if(c.g.parent)c.g.parent.remove(c.g);outboundCars18.splice(i,1);continue}c.v+=(4.2-c.v)*(1-Math.exp(-dt*4));c.u+=c.dir*c.v*dt*st.speed/cd.len;if(c.u>=1||c.u<=0){if(c.idx<c.route.length-1){let cur=c.r,next=c.route[++c.idx],cc=connectedSide16(cur,next);c.r=next;c.dir=cc.bi===0?1:-1;c.u=c.dir>0?.004:.996;cd=roadCurveData(c.r)}else if(c.r===c.goal){if(c.g.parent)c.g.parent.remove(c.g);outboundCars18.splice(i,1);continue}else{if(c.g.parent)c.g.parent.remove(c.g);outboundCars18.splice(i,1);continue}}let uu=c.dir<0?1-c.u:c.u,p=cd.curve.getPointAt(C(uu,0,1)),tg=cd.curve.getTangentAt(C(uu,0,1));if(c.dir<0)tg.multiplyScalar(-1);c.g.position.copy(p);c.g.rotation.y=Math.atan2(tg.x,tg.z)}}

// Pedestrians can enter through both roads and can also leave through both roads.
let pedEntrance18=0;
const spawnPedBefore18=sp;sp=function(){let ext=entrances18(),homes=buildings.filter(b=>b.k==='res'&&!b.burned16&&!b.onFire16);if(peds.length>=40||(!ext.length&&!homes.length))return;if(ext.length&&Math.random()<.32){let r=ext[pedEntrance18++%ext.length],a=r.p[0],s=roadSpawnFromPoint17(a,'outside',r);if(s){let g=pm();pedg.add(g);let cd=roadCurveData(r),q=cd.curve.getPointAt(.01),tg=cd.curve.getTangentAt(.01),nx=-tg.z,nz=tg.x,side=Math.random()<.5?-1:1,off=RT[r.t].w*.62+.4;g.position.set(q.x+nx*off*side,0,q.z+nz*off*side);peds.push({g,r,u:.01,dir:1,s:.06+Math.random()*.02,side,off,source17:'outside',life17:0,maxLife17:45+Math.random()*45})}return}spawnPedBefore18()};

const carsUpBefore18=carsUp;carsUp=function(dt){carsUpBefore18(dt);updateOutboundCars18(dt)};
