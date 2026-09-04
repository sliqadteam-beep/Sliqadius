let zones9=[],zoneG9=new T.Group();S.add(zoneG9);
const ZCOL9={res:0x4f8e55,com:0x3d7fa8,ind:0xb48a3d};
function nearestRoadPoint9(p,max=5.5){let best=null,bd=max;for(const r of roads){if(!validRoad(r))continue;for(let i=0;i<r.p.length-1;i++){let q=seg(p,r.p[i],r.p[i+1]);if(q.d<bd){let a=r.p[i],b=r.p[i+1],dx=b.x-a.x,dz=b.z-a.z,l=Math.hypot(dx,dz)||1;bd=q.d;best={r,x:q.x,z:q.z,tx:dx/l,tz:dz/l,w:RT[r.t].w}}}}return best}
function redrawZones9(){zoneG9.clear();for(const z of zones9){let m=new T.Mesh(new T.PlaneGeometry(z.w,z.d),new T.MeshBasicMaterial({color:ZCOL9[z.k],transparent:true,opacity:.28,depthWrite:false,side:T.DoubleSide}));m.rotation.x=-Math.PI/2;m.rotation.z=-z.a;m.position.set(z.x,.035,z.z);zoneG9.add(m)}}
function paintZone9(p,k){let n=nearestRoadPoint9(p);if(!n)return toast('Zone must touch a road');let nx=-n.tz,nz=n.tx,side=((p.x-n.x)*nx+(p.z-n.z)*nz)>=0?1:-1,off=n.w*.55+3.1,x=n.x+nx*off*side,z=n.z+nz*off*side,a=Math.atan2(n.tz,n.tx);let ex=zones9.find(q=>q.k===k&&Math.hypot(q.x-x,q.z-z)<2.2);if(ex)return;zones9.push({x,z,a,k,w:5.6,d:5.2,built:false});redrawZones9();toast(k==='res'?'Residential zone':k==='com'?'Commercial zone':'Industrial zone')}
function canBuildZone9(z){if(z.built)return false;let n=nearestRoadPoint9(z,6);if(!n)return false;return !buildings.some(b=>Math.hypot(b.x-z.x,b.z-z)<2.4)}
function developZones9(){if(st.paused)return;let pool=zones9.filter(canBuildZone9);if(!pool.length)return;let z=pool[(Math.random()*pool.length)|0];z.built=true;buildings.push({x:z.x,z:z.z,k:z.k,level:1});buildingsBuild();saveGame()}
setInterval(developZones9,2200);
const _begin9=beginInput;beginInput=function(e,p){if(cat==='zones'&&p){paintZone9(p,tool);return}return _begin9(e,p)};
const _save9=saveGame;saveGame=function(){_save9();try{localStorage.setItem('sliqadiusZones9',JSON.stringify(zones9))}catch{}};
try{let q=JSON.parse(localStorage.getItem('sliqadiusZones9')||'[]');if(Array.isArray(q))zones9=q.filter(z=>z&&['res','com','ind'].includes(z.k)&&Number.isFinite(z.x)&&Number.isFinite(z.z));redrawZones9()}catch{}

smoothRoadPath=function(a,b){let d=Math.hypot(b.x-a.x,b.z-a.z);if(d<.45)return[a,b];let ux=(b.x-a.x)/d,uz=(b.z-a.z)/d,n0=endpointRoadInfo(a,null,1.25),n1=endpointRoadInfo(b,null,1.25),h=Math.min(8,d*.34);let s0=n0?{x:n0.tx,z:n0.tz}:{x:ux,z:uz},s1=n1?{x:n1.tx,z:n1.tz}:{x:ux,z:uz};if(s0.x*ux+s0.z*uz<0){s0.x*=-1;s0.z*=-1}if(s1.x*ux+s1.z*uz<0){s1.x*=-1;s1.z*=-1}let c1={x:a.x+s0.x*h,z:a.z+s0.z*h},c2={x:b.x-s1.x*h,z:b.z-s1.z*h},steps=Math.max(28,Math.min(96,Math.ceil(d/0.45))),out=[];for(let i=0;i<=steps;i++){let t=i/steps,u=1-t,tt=t*t,uu=u*u;out.push({x:uu*u*a.x+3*uu*t*c1.x+3*u*tt*c2.x+tt*t*b.x,z:uu*u*a.z+3*uu*t*c1.z+3*u*tt*c2.z+tt*t*b.z})}return out};

eval(await (await fetch('build10-buildings-graphics.js?v=10',{cache:'no-store'})).text());
