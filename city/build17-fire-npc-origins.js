// Build 17 - animated fire FX + NPCs only originate from homes or outside city connections

// --- Animated fire/smoke system ---
const fireAnim17=new T.Group();S.add(fireAnim17);const fireNodes17=new Map();
function buildingHeight17(b){
 if(b.k==='res'&&Number.isFinite(b.houseVariant15)&&HOUSE15[b.houseVariant15])return HOUSE15[b.houseVariant15].h;
 if(b.k==='com')return 4.5;
 if(b.k==='ind')return 3.2;
 return 3;
}
function makeFireNode17(e){
 const g=new T.Group(),flames=[],smoke=[];let h=buildingHeight17(e.b),count=h>8?14:9;
 for(let i=0;i<count;i++){
  let mat=new T.MeshStandardMaterial({color:i%3===0?0xffd24a:i%3===1?0xff7619:0xe93410,emissive:i%2?0xff3a00:0xff8a00,emissiveIntensity:2.5,transparent:true,opacity:.9,roughness:.45});
  let f=new T.Mesh(new T.ConeGeometry(.11+Math.random()*.13,.45+Math.random()*.65,8),mat);f.userData={ox:(Math.random()-.5)*1.35,oz:(Math.random()-.5)*1.35,phase:Math.random()*6.28,speed:1.2+Math.random()*1.8,base:.35+Math.random()*.35};g.add(f);flames.push(f)
 }
 for(let i=0;i<7;i++){
  let sm=new T.Mesh(new T.SphereGeometry(.18+Math.random()*.16,10,8),new T.MeshStandardMaterial({color:i<3?0x47494a:0x66696a,transparent:true,opacity:.36,roughness:1,depthWrite:false}));sm.userData={phase:Math.random()*6.28,ox:(Math.random()-.5)*.65,oz:(Math.random()-.5)*.65,speed:.4+Math.random()*.55};g.add(sm);smoke.push(sm)
 }
 g.position.set(e.b.x,0,e.b.z);fireAnim17.add(g);return{g,flames,smoke,e,h}
}
function syncFire17(){
 const active=new Set();for(const e of emergencies16){if(e.kind!=='fire'||e.resolved||!e.b||!e.b.onFire16)continue;active.add(e);if(!fireNodes17.has(e))fireNodes17.set(e,makeFireNode17(e))}
 for(const [e,n] of fireNodes17)if(!active.has(e)){fireAnim17.remove(n.g);fireNodes17.delete(e)}
}
(function animateFire17(now){requestAnimationFrame(animateFire17);syncFire17();let t=now/1000;for(const n of fireNodes17.values()){
  let roof=Math.max(.65,n.h*.7);
  n.flames.forEach((f,i)=>{let q=f.userData,wig=Math.sin(t*q.speed+q.phase),pulse=.75+.3*Math.sin(t*(q.speed*1.7)+q.phase);f.position.set(q.ox+wig*.08,roof+q.base+.25*Math.sin(t*2.6+q.phase),q.oz+Math.cos(t*q.speed+q.phase)*.07);f.scale.set(pulse,1+.22*Math.sin(t*3.7+q.phase),pulse);f.rotation.z=wig*.14;f.material.opacity=.74+.22*Math.sin(t*4+q.phase)});
  n.smoke.forEach((s,i)=>{let q=s.userData,cycle=(t*q.speed+q.phase)%3,up=cycle/3;s.position.set(q.ox+Math.sin(t*.8+q.phase)*.25,roof+1+up*3.8,q.oz+Math.cos(t*.7+q.phase)*.25);let sc=.8+up*1.8;s.scale.setScalar(sc);s.material.opacity=(1-up)*.34})
 }})(performance.now());

// Hide the old static fire cones so only the animated effect remains.
const rebuildEmergencyFxBefore17=rebuildEmergencyFx16;
rebuildEmergencyFx16=function(){rebuildEmergencyFxBefore17();for(const o of [...emergencyFx16.children]){if(o.geometry&&o.geometry.type==='ConeGeometry')emergencyFx16.remove(o)}};
rebuildEmergencyFx16();

// --- NPC origin rules ---
// Pedestrians may only spawn from residential houses or from the two outside connections.
function sidewalkData17(r,u,side){
 let pts=r.p,total=0,lens=[];for(let i=0;i<pts.length-1;i++){let l=Math.hypot(pts[i+1].x-pts[i].x,pts[i+1].z-pts[i].z);lens.push(l);total+=l}
 let d=C(u,0,1)*total,acc=0,idx=0;for(;idx<lens.length-1&&acc+lens[idx]<d;idx++)acc+=lens[idx];let a=pts[idx],b=pts[idx+1],l=lens[idx]||1,t=C((d-acc)/l,0,1),dx=b.x-a.x,dz=b.z-a.z,nx=-dz/l,nz=dx/l,off=RT[r.t].w*.62+.38;return{r,i:idx,t,side,nx,nz,off,x:a.x+dx*t+nx*off*side,z:a.z+dz*t+nz*off*side}}
function addPedFromHome17(b){
 let pr=roadProjection16(b);if(!pr||pr.r.external)return false;let side=Math.random()<.5?-1:1,s=sidewalkData17(pr.r,pr.u,side),g=pm();pedg.add(g);g.position.set(b.x,0,b.z);peds.push({g,r:s.r,i:s.i,t:s.t,s:.045+Math.random()*.025,side,nx:s.nx,nz:s.nz,off:s.off,dir:Math.random()<.5?1:-1,origin17:'home',phase17:'leaveHome',from17:{x:b.x,z:b.z},to17:{x:s.x,z:s.z},phaseT17:0});return true
}
function addPedFromOutside17(){
 let ext=roads.filter(r=>r.external&&validRoad(r));if(!ext.length)return false;let r=ext[(Math.random()*ext.length)|0],side=Math.random()<.5?-1:1,u=0,s=sidewalkData17(r,u,side),g=pm();pedg.add(g);let p0=r.p[0],dx=r.p[1].x-p0.x,dz=r.p[1].z-p0.z,l=Math.hypot(dx,dz)||1;g.position.set(p0.x-dx/l*2.4,0,p0.z-dz/l*2.4);peds.push({g,r:s.r,i:s.i,t:s.t,s:.048+Math.random()*.025,side,nx:s.nx,nz:s.nz,off:s.off,dir:1,origin17:'outside',phase17:'enterCity',from17:{x:g.position.x,z:g.position.z},to17:{x:s.x,z:s.z},phaseT17:0});return true
}
sp=function(){
 if(peds.length>=40)return;let homes=buildings.filter(b=>b.k==='res'&&!b.burned16&&!b.onFire16),canOutside=roads.some(r=>r.external&&validRoad(r));if(!homes.length&&!canOutside)return;
 if(homes.length&&(Math.random()<.72||!canOutside)){let b=homes[(Math.random()*homes.length)|0];if(addPedFromHome17(b))return}
 if(canOutside)addPedFromOutside17()
};
pu=function(dt){
 if(Math.random()<dt*.48*Math.min(2,Math.max(.25,(buildings.filter(b=>b.k==='res'&&!b.burned16).length+1)/5)))sp();
 for(let i=peds.length-1;i>=0;i--){let p=peds[i];if(!p.r||!roads.includes(p.r)||!validRoad(p.r)){pedg.remove(p.g);peds.splice(i,1);continue}
  if(p.phase17==='leaveHome'||p.phase17==='enterCity'){
   p.phaseT17+=dt*(p.phase17==='enterCity'?.6:.8);let t=C(p.phaseT17,0,1),e=t*t*(3-2*t);p.g.position.set(p.from17.x+(p.to17.x-p.from17.x)*e,0,p.from17.z+(p.to17.z-p.from17.z)*e);p.g.rotation.y=Math.atan2(p.to17.x-p.from17.x,p.to17.z-p.from17.z);if(t>=1)p.phase17='walk';
  }else{
   let a=p.r.p[p.i],b=p.r.p[p.i+1];if(!a||!b){pedg.remove(p.g);peds.splice(i,1);continue}let dx=b.x-a.x,dz=b.z-a.z,l=Math.hypot(dx,dz)||1;p.nx=-dz/l;p.nz=dx/l;p.t+=dt*p.s*p.dir*st.speed;
   if(p.t>1||p.t<0){if(p.r.external&&p.origin17==='outside'&&p.t<0){pedg.remove(p.g);peds.splice(i,1);continue}p.dir*=-1;p.t=C(p.t,0,1)}
   p.g.position.set(a.x+dx*p.t+p.nx*p.off*p.side,0,a.z+dz*p.t+p.nz*p.off*p.side);p.g.rotation.y=Math.atan2(dx*p.dir,dz*p.dir)
  }
  let q=performance.now()*.008+p.g.userData.p,v=Math.sin(q)*.65;p.g.userData.al.rotation.x=v;p.g.userData.ar.rotation.x=-v;p.g.userData.ll.rotation.x=-v;p.g.userData.lr.rotation.x=v
 }
};

// Remove any already-spawned legacy NPCs that did not come from a valid origin.
for(let i=peds.length-1;i>=0;i--){if(!peds[i].origin17){pedg.remove(peds[i].g);peds.splice(i,1)}}
