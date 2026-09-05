// Build 14 - smarter city simulation AI
// Goal: smarter routing, demand-aware growth, service influence and less robotic traffic.

const brain14={tick:0,demand:{res:.5,com:.5,ind:.5},service:{police:0,fire:0,hospital:0},graphStamp:''};
function roadStamp14(){return roads.map(r=>r.t+':'+r.p.length+':'+r.p[0].x.toFixed(1)+','+r.p[0].z.toFixed(1)+':'+r.p[r.p.length-1].x.toFixed(1)+','+r.p[r.p.length-1].z.toFixed(1)).join('|')}
function nearRoadEnd14(p,radius=1.05){let out=[];for(const r of roads){if(!validRoad(r))continue;let a=r.p[0],b=r.p[r.p.length-1];let da=Math.hypot(p.x-a.x,p.z-a.z),db=Math.hypot(p.x-b.x,p.z-b.z);if(da<radius)out.push({r,start:true,d:da});if(db<radius)out.push({r,start:false,d:db})}return out}
function roadAdj14(r,atEnd){let p=atEnd?r.p[r.p.length-1]:r.p[0],out=[];for(const o of roads){if(o===r||!validRoad(o))continue;let a=o.p[0],b=o.p[o.p.length-1],da=Math.hypot(p.x-a.x,p.z-a.z),db=Math.hypot(p.x-b.x,p.z-b.z);if(da<1.05)out.push({r:o,start:true,cost:roadCurveData(o)?.len||roadLen(o.p)});if(db<1.05)out.push({r:o,start:false,cost:roadCurveData(o)?.len||roadLen(o.p)})}return out}
function roadTarget14(b){let best=null,bd=Infinity;for(const r of roads){if(!validRoad(r)||r.external)continue;for(let i=0;i<r.p.length-1;i++){let q=seg(b,r.p[i],r.p[i+1]);if(q.d<bd){bd=q.d;best=r}}}return best}
function routeRoads14(start,targetBuilding){let goal=roadTarget14(targetBuilding);if(!goal||!start)return null;if(start===goal)return [start];let q=[start],prev=new Map([[start,null]]),cost=new Map([[start,0]]);while(q.length){q.sort((a,b)=>(cost.get(a)||0)-(cost.get(b)||0));let r=q.shift();if(r===goal)break;for(const atEnd of [true,false])for(const e of roadAdj14(r,atEnd)){let nc=(cost.get(r)||0)+e.cost;if(!cost.has(e.r)||nc<cost.get(e.r)){cost.set(e.r,nc);prev.set(e.r,r);if(!q.includes(e.r))q.push(e.r)}}}if(!prev.has(goal))return null;let path=[],r=goal;while(r){path.push(r);r=prev.get(r)}return path.reverse()}
function nextRoad14(c){if(!c.route14||!c.route14.length||!c.destination)return null;let idx=c.route14.indexOf(c.r);if(idx<0||idx>=c.route14.length-1)return null;let next=c.route14[idx+1],p=c.dir>0?c.r.p[c.r.p.length-1]:c.r.p[0],a=next.p[0],b=next.p[next.p.length-1],da=Math.hypot(p.x-a.x,p.z-a.z),db=Math.hypot(p.x-b.x,p.z-b.z);if(Math.min(da,db)>1.2)return null;return{r:next,start:da<=db}}
function trafficGap14(c){let gap=Infinity;for(const o of cars){if(o===c||o.r!==c.r||o.dir!==c.dir)continue;let du=(o.u-c.u)*(c.dir||1);if(du>0&&du<gap)gap=du}return gap}
function serviceScore14(kind){let service=buildings.filter(b=>b.k===kind),city=buildings.filter(b=>['res','com','ind'].includes(b.k));if(!city.length)return 1;if(!service.length)return 0;let covered=0;for(const b of city){let best=Infinity;for(const s of service)best=Math.min(best,Math.hypot(b.x-s.x,b.z-s.z));if(best<34)covered++}return covered/city.length}
function updateBrain14(){let r=buildings.filter(b=>b.k==='res').length,c=buildings.filter(b=>b.k==='com').length,i=buildings.filter(b=>b.k==='ind').length,total=r+c+i;let jobs=c*5+i*7,homes=r*8;brain14.demand.res=C((jobs+4)/(homes+4),.15,1);brain14.demand.com=C((homes+8)/(c*12+8),.12,1);brain14.demand.ind=C((c*5+homes*.35+6)/(i*14+6),.1,1);brain14.service.police=serviceScore14('police');brain14.service.fire=serviceScore14('fire');brain14.service.hospital=serviceScore14('hospital');let avg=(brain14.service.police+brain14.service.fire+brain14.service.hospital)/3;st.happy=C(58+avg*28-Math.max(0,total-80)*.08,25,96);st.pop=Math.round(r*8*(.7+.3*brain14.service.hospital))}
setInterval(updateBrain14,1800);updateBrain14();

const developOld14=developZones9;
developZones9=function(){if(st.paused)return;updateBrain14();let pool=zones9.filter(canBuildZone9).filter(z=>Math.random()<brain14.demand[z.k]);if(!pool.length)return;pool.sort((a,b)=>brain14.demand[b.k]-brain14.demand[a.k]);let z=pool[0];z.built=true;let n=nearestRoadPoint9(z,7),rot=n?Math.atan2(n.tx,n.tz)+Math.PI/2:0;buildings.push({x:z.x,z:z.z,k:z.k,level:1,rot10:rot,seed10:Math.floor(Math.random()*999999)});buildingsBuild();saveGame()};

const spawn14=spawnOutsideVehicle;
spawnOutsideVehicle=function(){let before=cars.length;spawn14();if(cars.length<=before)return;let c=cars[cars.length-1];if(!c||!c.destination)return;let route=routeRoads14(c.r,c.destination);if(route)c.route14=route;else{removeCar(c);cars.pop()}}

carsUp=function(dt){
 if(cityHasDestination()&&outsideConnected()&&Math.random()<dt*.42*st.speed)spawnOutsideVehicle();
 for(let i=cars.length-1;i>=0;i--){
  let c=cars[i];if(!c.enteredFromOutside||!validRoad(c.r)||!roads.includes(c.r)){removeCar(c);cars.splice(i,1);continue}
  if(c.kind==='truck'&&(!c.destination||!['com','ind'].includes(c.destination.k))){c.destination=chooseTarget('truck');c.route14=c.destination?routeRoads14(c.r,c.destination):null;if(!c.route14){removeCar(c);cars.splice(i,1);continue}}
  if(!c.destination||!buildings.includes(c.destination)){c.destination=chooseTarget(c.kind==='truck'?'truck':'car');c.route14=c.destination?routeRoads14(c.r,c.destination):null;if(!c.route14){removeCar(c);cars.splice(i,1);continue}}
  let cd=roadCurveData(c.r);if(!cd){removeCar(c);cars.splice(i,1);continue}
  let si=segmentInfoForU(c.r,c.u),blocked=!c.r.external&&!!stop(c.r,si.i,si.t,c.dir||1),gap=trafficGap14(c),gapBlock=gap<.055;
  let base=c.kind==='truck'?3.15:4.45,wanted=(blocked||gapBlock)?0:base*(gap<.13?.55:1);c.v+=(wanted-c.v)*(1-Math.exp(-dt*(wanted===0?9:4.2)));
  c.u+=((c.v*dt*st.speed)/cd.len)*(c.dir||1);
  if(c.u>=1||c.u<=0){let nxt=nextRoad14(c);if(nxt){c.r=nxt.r;c.dir=nxt.start?1:-1;c.u=nxt.start?.003:.997;cd=roadCurveData(c.r)}else if(c.route14&&c.r===c.route14[c.route14.length-1]){let uu=c.dir<0?1-c.u:c.u,p=cd.curve.getPointAt(C(uu,0,1));if(reachedDestination(c,p)||Math.hypot(p.x-c.destination.x,p.z-c.destination.z)<7){removeCar(c);cars.splice(i,1);continue}else{c.route14=routeRoads14(c.r,c.destination);c.u=C(c.u,0,1);c.v*=.25}}else{removeCar(c);cars.splice(i,1);continue}}
  let uu=c.dir<0?1-c.u:c.u,p=cd.curve.getPointAt(C(uu,0,1)),tg=cd.curve.getTangentAt(C(uu,0,1));if(reachedDestination(c,p)){removeCar(c);cars.splice(i,1);continue}if(c.dir<0)tg.multiplyScalar(-1);c.g.position.copy(p);let yaw=Math.atan2(tg.x,tg.z),old=c.g.rotation.y||yaw,diff=Math.atan2(Math.sin(yaw-old),Math.cos(yaw-old));c.g.rotation.y=old+diff*(1-Math.exp(-dt*10))
 }
 pu(dt)
};

const roadsBuildOld14=roadsBuild;roadsBuild=function(){roadsBuildOld14();let s=roadStamp14();if(s!==brain14.graphStamp){brain14.graphStamp=s;for(const c of cars)if(c.destination)c.route14=routeRoads14(c.r,c.destination)}};
brain14.graphStamp=roadStamp14();

eval(await (await fetch('build15-residential-20.js?v=15',{cache:'no-store'})).text());
