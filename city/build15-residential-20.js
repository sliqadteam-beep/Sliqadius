// Build 15 - 20 distinct residential house types, all constrained to the painted zoning lot.
const HOUSE15=[
 {w:2.0,d:2.1,h:1.8,style:'gable',name:'Compact Cottage'},
 {w:2.4,d:2.0,h:2.2,style:'gable',name:'Wide Cottage'},
 {w:2.1,d:2.6,h:2.5,style:'hip',name:'Town Cottage'},
 {w:2.8,d:2.2,h:2.7,style:'gable',name:'Family House'},
 {w:3.1,d:2.4,h:3.0,style:'hip',name:'Large Family House'},
 {w:2.5,d:2.5,h:3.6,style:'flat',name:'Urban House'},
 {w:3.3,d:2.5,h:3.8,style:'flat',name:'Wide Urban House'},
 {w:2.7,d:2.8,h:4.4,style:'balcony',name:'Small Apartments'},
 {w:3.4,d:2.8,h:4.9,style:'balcony',name:'Courtyard Apartments'},
 {w:3.0,d:3.0,h:5.5,style:'brick',name:'Brick Apartments'},
 {w:3.6,d:3.0,h:6.2,style:'balcony',name:'City Apartments'},
 {w:3.2,d:3.3,h:6.9,style:'modern',name:'Modern Apartments'},
 {w:3.8,d:3.1,h:7.6,style:'brick',name:'Large Apartment Block'},
 {w:3.5,d:3.5,h:8.4,style:'modern',name:'Mid Rise Residence'},
 {w:4.0,d:3.4,h:9.2,style:'balcony',name:'Wide Mid Rise'},
 {w:3.4,d:3.7,h:10.0,style:'tower',name:'Residential Tower A'},
 {w:3.8,d:3.6,h:10.8,style:'tower',name:'Residential Tower B'},
 {w:4.2,d:3.7,h:11.6,style:'modern',name:'Large Residence'},
 {w:4.3,d:3.9,h:12.5,style:'tower',name:'High Rise Residence'},
 {w:4.5,d:4.0,h:13.5,style:'premium',name:'Grand Residential Tower'}
];
function clampHouse15(spec,b){
 const lotW=Math.max(2.2,Number.isFinite(b.lotW)?b.lotW:5.6),lotD=Math.max(2.2,Number.isFinite(b.lotD)?b.lotD:5.2),margin=.55;
 const maxW=Math.max(1.5,lotW-margin*2),maxD=Math.max(1.5,lotD-margin*2),scale=Math.min(1,maxW/spec.w,maxD/spec.d);
 return{...spec,w:spec.w*scale,d:spec.d*scale,h:spec.h};
}
function roof15(g,s,w,d,h,seed){
 const dark=m13([0x4c4945,0x55585a,0x62554c,0x454b4e][Math.floor(h10(seed+5)*4)],.82,.04);
 if(s.style==='gable'||s.style==='hip'){
  const a=B(w*.58,.12,d*1.05,dark,-w*.23,h+.28,0);a.rotation.z=-.44;g.add(a);
  const c=B(w*.58,.12,d*1.05,dark,w*.23,h+.28,0);c.rotation.z=.44;g.add(c)
 }else{
  g.add(B(w+.08,.16,d+.08,dark,0,h+.08,0));
  if(s.h>5.5){g.add(B(Math.min(.75,w*.22),.34,Math.min(.72,d*.22),m13(0x73797a,.62,.18),w*.2,h+.25,-d*.16))}
 }
}
function windows15(g,w,d,h,seed){
 const floors=Math.max(1,Math.floor(h/1.25)),cols=Math.max(2,Math.floor(w/.72)),frame=m13(0x43494b,.5,.18),glass=glass13(0x82a5b2);
 for(let fy=0;fy<floors;fy++)for(let cx=0;cx<cols;cx++){
  if(h10(seed+fy*31+cx*17)<.09)continue;
  const x=-w/2+(cx+.5)*w/cols,y=.62+fy*(h-.9)/Math.max(1,floors-1),ww=Math.min(.38,w/cols*.62),wh=Math.min(.43,.55*h/floors);
  g.add(B(ww+.045,wh+.045,.03,frame,x,y,d/2+.018));g.add(B(ww,wh,.035,glass,x,y,d/2+.04));
  if(h>4){g.add(B(ww,wh,.025,glass,x,y,-d/2-.04))}
 }
}
function residential15(b){
 const seed=seed10(b),idx=((Number.isFinite(b.houseVariant15)?b.houseVariant15:Math.floor(h10(seed+1515)*20))%20+20)%20;b.houseVariant15=idx;
 const s=clampHouse15(HOUSE15[idx],b),g=new T.Group();
 const wallPalette=[0xd8c7b5,0xc5b7aa,0xe1ddd3,0xb8c2bf,0xca9d86,0xb6b7b1,0xd0c3ad,0xaeb8b7];
 const wall=m13(wallPalette[Math.floor(h10(seed+9)*wallPalette.length)],s.style==='modern'||s.style==='premium'?.66:.83,s.style==='modern'||s.style==='premium'?.05:.015);
 g.add(B(s.w,s.h,s.d,wall,0,s.h/2,0));roof15(g,s,s.w,s.d,s.h,seed);windows15(g,s.w,s.d,s.h,seed);
 // entrance and steps
 g.add(B(Math.min(.58,s.w*.22),Math.min(1.05,s.h*.35),.07,m13(0x45413d,.62,.12),0,Math.min(.52,s.h*.17),s.d/2+.05));
 g.add(B(Math.min(1.15,s.w*.42),.08,.48,m13(0x99958c,.92),0,.04,s.d/2+.27));
 // balconies for apartment variants
 if(['balcony','modern','premium','tower'].includes(s.style)&&s.h>4){
  const rail=m13(0x555d60,.48,.28),slab=m13(0x929694,.78,.06);
  for(let y=1.6;y<s.h-.65;y+=1.55){
   if(h10(seed+y*13)<.18)continue;
   g.add(B(s.w*.58,.07,.48,slab,0,y,s.d/2+.25));g.add(B(s.w*.57,.025,.025,rail,0,y+.34,s.d/2+.48));
   for(let x of[-s.w*.26,0,s.w*.26])g.add(B(.025,.34,.025,rail,x,y+.18,s.d/2+.48))
  }
 }
 // tower setbacks make tall buildings visibly different without exceeding lot footprint.
 if((s.style==='tower'||s.style==='premium')&&s.h>9){
  const capW=s.w*.7,capD=s.d*.68,capH=Math.min(2.2,s.h*.16),cap=m13(0xaeb8b7,.68,.05);
  g.add(B(capW,capH,capD,cap,0,s.h+capH/2,0));roof15(g,{...s,style:'flat'},capW,capD,s.h+capH,seed+70)
 }
 g.position.set(b.x,0,b.z);g.userData.houseVariant=idx+1;g.userData.houseName=s.name;g.userData.footprint={w:s.w,d:s.d,lotW:b.lotW||5.6,lotD:b.lotD||5.2};
 return g
}
const houseBefore15=house;
house=function(b){
 if(!b||b.k!=='res')return houseBefore15(b);
 let g=residential15(b),n=typeof nearestRoadPoint9==='function'?nearestRoadPoint9(b,8):null;
 if(n)g.rotation.y=Math.atan2(n.tx,n.tz)+Math.PI/2;else g.rotation.y=b.rot10||0;
 return g
};
// Store lot dimensions on newly developed buildings, so every model is bounded by the exact painted zone.
developZones9=function(){
 if(st.paused)return;updateBrain14();
 let pool=zones9.filter(canBuildZone9).filter(z=>Math.random()<brain14.demand[z.k]);if(!pool.length)return;
 pool.sort((a,b)=>brain14.demand[b.k]-brain14.demand[a.k]);let z=pool[0];z.built=true;
 let n=nearestRoadPoint9(z,7),rot=n?Math.atan2(n.tx,n.tz)+Math.PI/2:0;
 buildings.push({x:z.x,z:z.z,k:z.k,level:1,rot10:rot,seed10:Math.floor(Math.random()*999999),lotW:z.w,lotD:z.d,houseVariant15:z.k==='res'?Math.floor(Math.random()*20):undefined});
 buildingsBuild();saveGame()
};
// Existing residential buildings also get a stable variant and default zoning footprint.
for(const b of buildings)if(b.k==='res'){if(!Number.isFinite(b.houseVariant15))b.houseVariant15=Math.floor(h10(seed10(b)+1515)*20);if(!Number.isFinite(b.lotW))b.lotW=5.6;if(!Number.isFinite(b.lotD))b.lotD=5.2}
buildingsBuild();saveGame();

eval(await (await fetch('build16-emergency-services.js?v=16',{cache:'no-store'})).text());
