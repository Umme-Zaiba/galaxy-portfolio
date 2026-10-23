import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';

/* ============ EDIT ME: chapter copy (physics line + programming line) ============ */
const EMAIL = 'hello@example.com';
const CH = [
  {n:'String',   lesson:'The smallest unit',  scale:'10⁻³⁵ m', file:'01_basics.js',   phys:'Before matter, there was only vibration — one note, played at the smallest scale there is. Every program begins the same way: a single character.', code:'"a"'},
  {n:'Quark',    lesson:'Syntax',             scale:'10⁻¹⁸ m', file:'02_syntax.js',   phys:'Vibrations bind into particles. Three quarks, held by a force, make something stable. Tokens bind into statements the same way.', code:'let x = 1;'},
  {n:'Atom',     lesson:'A language',         scale:'10⁻¹⁰ m', file:'03_language.js', phys:'Particles settle into atoms: nuclei with orbits, rules with structure. Syntax settles into a language you can reason in.', code:'function add(a, b) {\n  return a + b;\n}'},
  {n:'Cell',     lesson:'Structure',          scale:'10⁻⁵ m',  file:'04_structure.js',phys:'Atoms organise into a living cell that copies itself. Functions organise into classes and modules that compose and reproduce.', code:'class Cell {\n  divide() { return [new Cell(), new Cell()]; }\n}'},
  {n:'Astronaut',lesson:'You',                scale:'10⁰ m',   file:'05_you.js',      phys:'Cells become a person who looks up. The learner arrives — small, curious, and ready to build something that leaves the ground.', code:'const me = new Developer("Umme Zaiba");\nme.learn();'},
  {n:'Spaceship',lesson:'An application',     scale:'10² m',   file:'06_app.js',      phys:'Parts become a vessel. Modules, APIs and interfaces — assembled into something that actually works, and carries people somewhere.', code:'import { app } from "./modules";\napp.listen(3000);'},
  {n:'Star',     lesson:'Impact',             scale:'10⁹ m',   file:'07_impact.js',   phys:'A shipped product becomes a star: it gives light and warmth to everyone who orbits it.', code:'deploy({ users: Infinity });'},
  {n:'Galaxy',   lesson:'A goal worth orbiting', scale:'10²¹ m',file:'08_goal.js',    phys:'Stars gather around a centre of gravity. A goal pulls everything toward it — and the best things orbit it, shining.', code:'goal.orbit(me);'},
  {n:'Wormhole', lesson:'Breakthrough',       scale:'∞',       file:'09_breakthrough.js',phys:'Past the horizon, the rules bend. Every breakthrough feels like falling — until the understanding clicks on the other side.', code:'await breakthrough();'},
  {n:'White hole',lesson:'Rebirth',           scale:'new universe',file:'10_rebirth.js',phys:'And you come out the other side with a new universe to build. Every ending is just the next first line.', code:'return new Universe();'}
];
const ANCH=[.02,.10,.18,.26,.34,.42,.52,.64,.80,.92];       // scroll progress anchors per chapter
const CAMKEYS=[[0,14],[.02,12],[.10,-28],[.18,-71],[.26,-133],[.34,-181],[.42,-212],[.52,-302],[.60,-470],[.68,-775],[.735,-835],[.765,-872],[.778,-903],[.788,-915],[.90,-1450],[.925,-1530],[1,-1598]];

/* ============ helpers ============ */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v)),lerp=(a,b,t)=>a+(b-a)*t,sstep=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
const rnd=(a,b)=>a+Math.random()*(b-a);
$('#yr').textContent=new Date().getFullYear();$('#mail span').textContent=EMAIL;
history.scrollRestoration='manual';scrollTo(0,0);
const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('on');setTimeout(()=>t.classList.remove('on'),1800)};
$('#mail').onclick=()=>{navigator.clipboard?.writeText(EMAIL).catch(()=>{});toast('EMAIL COPIED')};
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});$$('.reveal').forEach(e=>io.observe(e));

/* ladder */
$('#ladder').innerHTML=CH.map((c,i)=>`<button data-i="${i}" aria-label="${c.n}"><span>${c.n}</span><i></i></button>`).join('');
const journey=$('#journey');const jmax=()=>journey.offsetHeight-innerHeight;
$$('#ladder button').forEach(b=>b.onclick=()=>scrollTo({top:ANCH[+b.dataset.i]*jmax(),behavior:'smooth'}));
$('#skip').onclick=()=>{scrollTo(0,journey.offsetHeight)};

/* chapter UI */
let curCh=-1,typeTimer=0;
function typeCode(s){clearInterval(typeTimer);const el=$('#cCode');el.textContent='';let i=0;typeTimer=setInterval(()=>{el.textContent=s.slice(0,++i);if(i>=s.length)clearInterval(typeTimer)},26)}
function setChap(i){if(i===curCh)return;curCh=i;const c=CH[i],box=$('#chap');box.classList.add('out');
  setTimeout(()=>{$('#cNum').textContent=String(i+1).padStart(2,'0');$('#cLesson').textContent=c.lesson;$('#cName').textContent=c.n;$('#cPhys').textContent=c.phys;$('#cFile').textContent=c.file;$('#cScale').textContent=c.scale;box.classList.remove('out');typeCode(c.code)},260);
  $$('#ladder button').forEach((b,k)=>b.classList.toggle('on',k===i))}

/* loader */
let loadDone=false;
(function fakeLoad(){const t0=performance.now();(function s(t){const p=clamp((t-t0)/1500,0,1);$('#lbar').style.width=p*100+'%';$('#lpct').textContent=Math.round(p*100)+'%';p<1?requestAnimationFrame(s):(loadDone=true,$('#loader').classList.add('done'),document.body.classList.remove('loading'),setChap(0))})(t0)})();

/* ============ WebGL ============ */
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas:$('#gl'),antialias:false,powerPreference:'high-performance'})}catch(e){renderer=null}
if(!renderer){document.body.classList.add('nogl');document.body.classList.remove('loading');$('#loader').remove()}
else initGL();

function initGL(){
const mobile=innerWidth<800;
renderer.setPixelRatio(Math.min(devicePixelRatio||1,mobile?1.25:1.6));renderer.setSize(innerWidth,innerHeight);
const scene=new THREE.Scene();scene.background=new THREE.Color(0x02030a);
const cam=new THREE.PerspectiveCamera(60,innerWidth/innerHeight,.1,4000);scene.add(cam);
scene.add(new THREE.AmbientLight(0x8899cc,.9));
const camLight=new THREE.PointLight(0xffffff,1.7,90,1.6);cam.add(camLight);
const sun=new THREE.DirectionalLight(0xfff0dd,1.4);sun.position.set(5,8,6);scene.add(sun);

const composer=new EffectComposer(renderer,new THREE.WebGLRenderTarget(innerWidth,innerHeight,{type:THREE.HalfFloatType,samples:0}));
composer.addPass(new RenderPass(scene,cam));
const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),.6,.7,.18);composer.addPass(bloom);composer.addPass(new OutputPass());

const ADD=THREE.AdditiveBlending;
const glowTex=(()=>{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),gr=g.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.22,'rgba(255,255,255,.55)');gr.addColorStop(.6,'rgba(255,255,255,.12)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);return new THREE.CanvasTexture(c)})();
const dotTex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.35,'rgba(255,255,255,.85)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(c)})();
const glow=(color,size,op=1)=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,color,transparent:true,opacity:op,blending:ADD,depthWrite:false}));s.scale.setScalar(size);return s};
const NOISE=`float h3(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float n3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*n3(p);p*=2.03;a*=.5;}return s;}`;

const objs=[];const reg=(g,z,range,update,vis)=>{g.position.z=z;scene.add(g);objs.push({g,z,range,update,vis})};

/* ---- global stars + nebulae ---- */
{const N=mobile?4500:8000,pos=new Float32Array(N*3),col=new Float32Array(N*3),c=new THREE.Color();
 for(let i=0;i<N;i++){pos.set([rnd(-450,450),rnd(-450,450),rnd(80,-1800)],i*3);c.setHSL(rnd(.5,.72),rnd(.1,.6),rnd(.7,1));col.set([c.r,c.g,c.b],i*3)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));
 scene.add(new THREE.Points(g,new THREE.PointsMaterial({size:2.2,map:dotTex,alphaTest:.02,vertexColors:true,sizeAttenuation:true,transparent:true,opacity:.9,depthWrite:false,blending:ADD})));
 const cols=[0x6a4cff,0x2a7bff,0x1fd1b0,0xff5fa8,0x8a5cff];
 for(let i=0;i<14;i++){const s=glow(cols[i%5],rnd(220,480),rnd(.05,.1));s.position.set(rnd(-220,220),rnd(-160,160),rnd(-60,-1700));scene.add(s)}}

/* ---- 1 STRING ---- */
{const g=new THREE.Group(),L=[];
 for(let i=0;i<7;i++){const n=260,geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(n*3),3));const col=new THREE.Color().setHSL(.48+i*.06,.85,.62);
  g.add(new THREE.Line(geo,new THREE.LineBasicMaterial({color:col,transparent:true,opacity:.95,blending:ADD,depthWrite:false})));
  g.add(new THREE.Points(geo,new THREE.PointsMaterial({color:col,size:.11,map:dotTex,transparent:true,opacity:.9,blending:ADD,depthWrite:false})));L.push({geo,n,i})}
 g.add(glow(0x66ccff,26,.16));
 reg(g,0,110,t=>{L.forEach(({geo,n,i})=>{const p=geo.attributes.position;for(let j=0;j<n;j++){const u=j/(n-1),x=(u-.5)*18,env=Math.sin(u*Math.PI);
   p.setXYZ(j,x,(i-3)*.95+Math.sin(x*(1.1+i*.45)+t*(1.8+i*.7))*1.1*env*(.6+.4*Math.sin(t*.6+i)),Math.cos(x*(.8+i*.3)-t*(1.3+i*.5))*.8*env)}p.needsUpdate=true})})}

/* ---- 2 QUARKS ---- */
{const g=new THREE.Group(),cols=[0xff3b5c,0x3bff9a,0x3b8bff];
 const q=cols.map(c=>{const m=new THREE.Mesh(new THREE.SphereGeometry(.55,24,16),new THREE.MeshBasicMaterial({color:c}));m.add(glow(c,4.4,.9));g.add(m);return m});
 const shell=new THREE.Mesh(new THREE.IcosahedronGeometry(3.8,2),new THREE.MeshBasicMaterial({color:0x88aaff,wireframe:true,transparent:true,opacity:.13,blending:ADD,depthWrite:false}));g.add(shell);
 const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(12),3));g.add(new THREE.Line(lg,new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.55,blending:ADD})));
 const N=320,sp=new Float32Array(N*3);for(let i=0;i<N;i++){const v=new THREE.Vector3().randomDirection().multiplyScalar(rnd(1,5.2));sp.set([v.x,v.y,v.z],i*3)}
 const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.BufferAttribute(sp,3));const spk=new THREE.Points(sg,new THREE.PointsMaterial({color:0xaac8ff,size:.08,map:dotTex,transparent:true,opacity:.8,blending:ADD,depthWrite:false}));g.add(spk);
 reg(g,-40,75,t=>{q.forEach((m,i)=>{const a=t*1.3+i*2.094,r=2+Math.sin(t*2+i)*.35;m.position.set(Math.cos(a)*r,Math.sin(a*1.3+i)*r*.8,Math.sin(a)*r)});
  const P=lg.attributes.position;[0,1,2,0].forEach((k,j)=>P.setXYZ(j,q[k].position.x,q[k].position.y,q[k].position.z));P.needsUpdate=true;shell.rotation.y=t*.2;shell.rotation.x=t*.13;spk.rotation.y=-t*.1})}

/* ---- 3 ATOM ---- */
{const g=new THREE.Group(),nuc=new THREE.Group(),els=[];
 for(let i=0;i<12;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(.45,18,14),new THREE.MeshStandardMaterial({color:i%2?0xff5a7a:0x5aa0ff,emissive:i%2?0x66142a:0x142a66,roughness:.3}));m.position.set(rnd(-.8,.8),rnd(-.8,.8),rnd(-.8,.8));nuc.add(m)}
 nuc.add(glow(0xffaa66,8,.55));g.add(nuc);
 [[0,0],[1.05,.6],[-1.05,1.1]].forEach(([rx,rz],k)=>{const R=5.6+k*1.2,pts=new THREE.EllipseCurve(0,0,R,R*.8,0,Math.PI*2).getPoints(160).map(p=>new THREE.Vector3(p.x,p.y,0));
  const ring=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0x7fd8ff,transparent:true,opacity:.4,blending:ADD,depthWrite:false}));ring.rotation.set(rx,0,rz);g.add(ring);
  const e=new THREE.Mesh(new THREE.SphereGeometry(.3,16,12),new THREE.MeshBasicMaterial({color:0xbff3ff}));e.add(glow(0x66ddff,3.6,.9));ring.add(e);els.push({e,R,k})});
 reg(g,-85,70,t=>{nuc.rotation.y=t*.5;nuc.rotation.x=t*.3;els.forEach(({e,R,k})=>{const a=t*(1.7-k*.3)+k*2;e.position.set(Math.cos(a)*R,Math.sin(a)*R*.8,0)})})}

/* ---- 4 CELL ---- */
{const g=new THREE.Group(),drift=[];
 g.add(new THREE.Mesh(new THREE.SphereGeometry(16,64,40),new THREE.ShaderMaterial({transparent:true,side:THREE.DoubleSide,depthWrite:false,blending:ADD,
  vertexShader:`varying vec3 vN;varying vec3 vV;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,
  fragmentShader:`varying vec3 vN;varying vec3 vV;void main(){float f=pow(max(1.-abs(dot(normalize(vN),normalize(vV))),0.),2.2);vec3 c=mix(vec3(.2,.95,.75),vec3(.95,.4,1.),f);gl_FragColor=vec4(c*(f*1.1+.04),1.);}`})));
 const nuc=new THREE.Mesh(new THREE.SphereGeometry(3.6,40,28),new THREE.MeshStandardMaterial({color:0xffc27a,emissive:0x5a3010,roughness:.5,transparent:true,opacity:.32,depthWrite:false}));nuc.position.set(4.5,1.5,-6);g.add(nuc);
 const nl=new THREE.Mesh(new THREE.SphereGeometry(1,24,16),new THREE.MeshStandardMaterial({color:0xff8a3a,emissive:0x7a2a08}));nuc.add(nl);
 /* DNA helix inside nucleus */
 const hp=[],hl=[];for(let k=0;k<2;k++)for(let i=0;i<90;i++){const y=(i/89-.5)*5.2,a=i*.34+k*Math.PI;hp.push(Math.cos(a)*1.3,y,Math.sin(a)*1.3)}
 for(let i=0;i<90;i+=3){const y=(i/89-.5)*5.2,a=i*.34;hl.push(Math.cos(a)*1.3,y,Math.sin(a)*1.3,Math.cos(a+Math.PI)*1.3,y,Math.sin(a+Math.PI)*1.3)}
 const helix=new THREE.Group();
 const hg=new THREE.BufferGeometry();hg.setAttribute('position',new THREE.Float32BufferAttribute(hp,3));helix.add(new THREE.Points(hg,new THREE.PointsMaterial({color:0x7fe7ff,size:.22,map:dotTex,transparent:true,blending:ADD,depthWrite:false})));
 const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(hl,3));helix.add(new THREE.LineSegments(rg,new THREE.LineBasicMaterial({color:0xff9ad5,transparent:true,opacity:.6,blending:ADD})));nuc.add(helix);
 for(let i=0;i<8;i++){const m=new THREE.Mesh(new THREE.CapsuleGeometry(.7,1.8,6,14),new THREE.MeshStandardMaterial({color:0xff5d8f,emissive:0x5a1030,roughness:.4}));const v=new THREE.Vector3().randomDirection().multiplyScalar(rnd(7,13));m.position.copy(v);m.rotation.set(rnd(0,3),rnd(0,3),0);g.add(m);drift.push({m,b:v.clone(),s:rnd(.3,.8),p:rnd(0,6)})}
 for(let i=0;i<60;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(rnd(.2,.6),12,10),new THREE.MeshBasicMaterial({color:0x7fe7ff,transparent:true,opacity:.45,blending:ADD,depthWrite:false}));const v=new THREE.Vector3().randomDirection().multiplyScalar(rnd(4,14));m.position.copy(v);g.add(m);drift.push({m,b:v.clone(),s:rnd(.4,1.1),p:rnd(0,6)})}
 const er=new THREE.Points(new THREE.TorusKnotGeometry(2.8,.4,200,10,2,3),new THREE.PointsMaterial({color:0xff7ad0,size:.12,map:dotTex,transparent:true,blending:ADD,depthWrite:false}));er.position.set(-7,-3,-4);g.add(er);
 reg(g,-135,60,t=>{drift.forEach(({m,b,s,p})=>m.position.set(b.x+Math.sin(t*s+p)*.9,b.y+Math.cos(t*s*.8+p)*.9,b.z+Math.sin(t*s*.6+p)*.9));helix.rotation.y=t*.6;nuc.rotation.y=t*.1;er.rotation.y=t*.3;er.rotation.x=t*.2})}

/* ---- 5 ASTRONAUT (+ Earth) ---- */
{const g=new THREE.Group(),A=new THREE.Group(),white=new THREE.MeshStandardMaterial({color:0xf2f4fb,roughness:.55,metalness:.05}),grey=new THREE.MeshStandardMaterial({color:0xaab2c8,roughness:.6});
 const part=(geo,mat,x,y,z,rx=0,rz=0)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.rotation.set(rx,0,rz);A.add(m);return m};
 part(new THREE.CapsuleGeometry(.75,.95,8,20),white,0,0,0);
 part(new THREE.SphereGeometry(.68,32,24),white,0,1.5,0);
 const visor=part(new THREE.SphereGeometry(.52,32,24),new THREE.MeshStandardMaterial({color:0x0d1b3d,emissive:0x0a1a40,roughness:.08,metalness:.95}),0,1.52,.3);visor.scale.set(1,.85,.7);
 const refl=glow(0x9fd8ff,.9,.8);refl.position.set(.18,1.7,.62);A.add(refl);
 part(new THREE.BoxGeometry(1.05,1.3,.55),grey,0,.15,-.78);
 const armL=part(new THREE.CapsuleGeometry(.24,.85,6,14),white,-1,.35,0,0,.5),armR=part(new THREE.CapsuleGeometry(.24,.85,6,14),white,1,.35,0,0,-.5);
 const legL=part(new THREE.CapsuleGeometry(.28,1,6,14),white,-.38,-1.5,0,0,.08),legR=part(new THREE.CapsuleGeometry(.28,1,6,14),white,.38,-1.5,0,0,-.08);
 part(new THREE.BoxGeometry(.5,.34,.1),new THREE.MeshStandardMaterial({color:0xff6a3d,emissive:0x501800}),0,.55,.75);
 A.scale.setScalar(1.15);g.add(A);
 /* earth */
 const c=document.createElement('canvas');c.width=1024;c.height=512;const x=c.getContext('2d');x.fillStyle='#0a3f94';x.fillRect(0,0,1024,512);
 for(let i=0;i<70;i++){x.fillStyle=`hsl(${90+Math.random()*50},45%,${26+Math.random()*14}%)`;x.beginPath();x.ellipse(Math.random()*1024,60+Math.random()*390,20+Math.random()*80,12+Math.random()*40,Math.random()*3,0,7);x.fill()}
 for(let i=0;i<150;i++){x.fillStyle='rgba(255,255,255,.34)';x.beginPath();x.ellipse(Math.random()*1024,Math.random()*512,30+Math.random()*90,6+Math.random()*16,Math.random()*3,0,7);x.fill()}
 const earth=new THREE.Mesh(new THREE.SphereGeometry(16,64,48),new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(c),roughness:.9}));earth.position.set(-62,-22,-42);g.add(earth);
 const atm=new THREE.Mesh(new THREE.SphereGeometry(17.4,48,32),new THREE.ShaderMaterial({transparent:true,side:THREE.BackSide,blending:ADD,depthWrite:false,vertexShader:`varying vec3 vN;void main(){vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec3 vN;void main(){float i=pow(max(.72-dot(vN,vec3(0,0,1.)),0.),3.);gl_FragColor=vec4(.3,.62,1.,1.)*i*1.6;}`}));atm.position.copy(earth.position);g.add(atm);
 reg(g,-190,120,t=>{A.rotation.set(Math.sin(t*.4)*.25,Math.sin(t*.45)*.9-.25,Math.cos(t*.3)*.18);A.position.y=Math.sin(t*.8)*.35;armL.rotation.z=.5+Math.sin(t*1.1)*.18;armR.rotation.z=-.5-Math.sin(t*1.3)*.18;legL.rotation.z=.08+Math.sin(t*.9)*.1;legR.rotation.z=-.08-Math.sin(t*1.0)*.1;earth.rotation.y=t*.03})}

/* ---- 6 SPACESHIP ---- */
{const g=new THREE.Group(),S=new THREE.Group(),hull=new THREE.MeshStandardMaterial({color:0xdfe6f4,roughness:.28,metalness:.7}),dark=new THREE.MeshStandardMaterial({color:0x2a3350,roughness:.4,metalness:.8});
 const prof=[[0,6.2],[.5,5.3],[1,3.8],[1.45,1.4],[1.6,-1.2],[1.35,-3.4],[.9,-4.3],[0,-4.4]].map(([r,y])=>new THREE.Vector2(r,y));
 const body=new THREE.Mesh(new THREE.LatheGeometry(prof,40),hull);body.rotation.x=-Math.PI/2;S.add(body);
 const cock=new THREE.Mesh(new THREE.SphereGeometry(.85,24,16),new THREE.MeshStandardMaterial({color:0x7fe7ff,emissive:0x1a6a88,roughness:.05,metalness:.2}));cock.scale.set(1,.7,1.9);cock.position.set(0,.95,-2.2);S.add(cock);
 const sh=new THREE.Shape();sh.moveTo(0,0);sh.lineTo(5.4,2.6);sh.lineTo(5.4,3.6);sh.lineTo(0,3.2);sh.closePath();
 [-1,1].forEach(sd=>{const w=new THREE.Mesh(new THREE.ExtrudeGeometry(sh,{depth:.2,bevelEnabled:false}),dark);w.rotation.x=Math.PI/2;w.rotation.z=0;w.scale.x=sd;w.position.set(sd*1.1,-.1,-1.4);S.add(w)});
 const fin=new THREE.Mesh(new THREE.BoxGeometry(.18,2.2,2.2),dark);fin.position.set(0,1.5,3.3);S.add(fin);
 const flames=[];[-.8,.8].forEach(sx=>{const e=new THREE.Mesh(new THREE.CylinderGeometry(.5,.62,.9,20),dark);e.rotation.x=Math.PI/2;e.position.set(sx,0,4.5);S.add(e);const f=glow(0x66ccff,5,.95);f.position.set(sx,0,5.3);S.add(f);flames.push(f)});
 S.scale.setScalar(1.5);g.add(S);
 const N=500,tp=new Float32Array(N*3),tr=[];for(let i=0;i<N;i++){tr.push({x:rnd(-1,1),y:rnd(-.5,.5),z:rnd(0,60),s:rnd(.5,1.4)})}
 const tg=new THREE.BufferGeometry();tg.setAttribute('position',new THREE.BufferAttribute(tp,3));g.add(new THREE.Points(tg,new THREE.PointsMaterial({color:0x8fdfff,size:.16,map:dotTex,transparent:true,opacity:.7,blending:ADD,depthWrite:false})));
 reg(g,-250,120,t=>{S.rotation.set(Math.sin(t*.5)*.1,Math.sin(t*.35)*.35+.3,Math.cos(t*.45)*.35);S.position.set(Math.sin(t*.4)*2,Math.cos(t*.5)*1,0);flames.forEach((f,i)=>f.scale.setScalar(4.4+Math.sin(t*30+i)*.7));
  for(let i=0;i<N;i++){const p=tr[i];p.z=(p.z+p.s*.5)%60;tp[i*3]=S.position.x+p.x*(1+p.z*.05)*1.2;tp[i*3+1]=S.position.y+p.y*(1+p.z*.05);tp[i*3+2]=6+p.z}tg.attributes.position.needsUpdate=true})}

/* ---- 7 STAR ---- */
{const g=new THREE.Group(),mat=new THREE.ShaderMaterial({uniforms:{t:{value:0}},vertexShader:`varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`varying vec3 vP;uniform float t;${NOISE}void main(){vec3 p=normalize(vP)*3.;float n=fbm(p+vec3(0.,t*.15,t*.1)),n2=fbm(p*2.-t*.2);float v=n*.7+n2*.5;vec3 c=mix(vec3(1.,.22,0.),vec3(1.,.85,.3),v);c=mix(c,vec3(1.),pow(clamp(v,0.,1.),3.));gl_FragColor=vec4(c*1.7,1.);}`});
 g.add(new THREE.Mesh(new THREE.SphereGeometry(30,64,48),mat));const sg1=glow(0xff8a2a,170,.65),sg2=glow(0xff5a1a,360,.28),sg3=glow(0xffd9a0,90,.6);g.add(sg1,sg2,sg3);
 const N=1800,cp=new Float32Array(N*3);for(let i=0;i<N;i++){const v=new THREE.Vector3().randomDirection().multiplyScalar(rnd(31,48));cp.set([v.x,v.y,v.z],i*3)}
 const cg=new THREE.BufferGeometry();cg.setAttribute('position',new THREE.BufferAttribute(cp,3));const corona=new THREE.Points(cg,new THREE.PointsMaterial({color:0xffb060,size:.9,map:dotTex,transparent:true,opacity:.7,blending:ADD,depthWrite:false}));g.add(corona);
 const pl=[[75,6,0xc08a5a,0],[108,9,0x5a8ad0,1],[150,13,0xd0a0e0,2]].map(([R,r,c,k])=>{const m=new THREE.Mesh(new THREE.SphereGeometry(r,40,28),new THREE.MeshStandardMaterial({color:c,roughness:.7}));if(k===2){const rg=new THREE.Mesh(new THREE.RingGeometry(r*1.5,r*2.3,64),new THREE.MeshBasicMaterial({color:0xe8d0ff,side:THREE.DoubleSide,transparent:true,opacity:.5}));rg.rotation.x=1.2;m.add(rg)}g.add(m);return{m,R,k}});
 const sl=new THREE.PointLight(0xffaa66,4,600,1);g.add(sl);
 reg(g,-380,300,t=>{const f=clamp((-cam.position.z-230)/150,0,1);sg1.material.opacity=.65*f;sg2.material.opacity=.28*f;sg3.material.opacity=.6*f;mat.uniforms.t.value=t;corona.rotation.y=t*.05;corona.rotation.z=t*.03;pl.forEach(({m,R,k})=>{const a=t*(.25-k*.06)+k*2;m.position.set(Math.cos(a)*R,Math.sin(a*.5)*6,Math.sin(a)*R)})},z=>z<-225&&z>-760)}

/* ---- 8 GALAXY + BLACK HOLE ---- */
const BH_Z=-900;let orbiter,orbitTrail,bhTilt,halo;
{const g=new THREE.Group();
 const N=mobile?22000:50000,pos=new Float32Array(N*3),col=new Float32Array(N*3),c=new THREE.Color(),arms=4,R=440;
 for(let i=0;i<N;i++){const arm=i%arms,r=20+Math.pow(Math.random(),.7)*(R-20),ang=r*.0125+arm*(Math.PI*2/arms)+rnd(-.5,.5)*(1-r/R*.55)*.9,jit=(1-r/R)*14+3;
  pos.set([Math.cos(ang)*r+rnd(-jit,jit),rnd(-jit,jit)*.35*(1-r/R*.6),Math.sin(ang)*r+rnd(-jit,jit)],i*3);
  const k=r/R;c.setRGB(1,.82,.55).lerp(new THREE.Color(.5,.65,1),sstep(.05,.7,k)).lerp(new THREE.Color(1,.45,.8),Math.random()<.08?.6:0);c.multiplyScalar(rnd(.5,1.1)*(1.05-k*.4)*.7);col.set([c.r,c.g,c.b],i*3)}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('color',new THREE.BufferAttribute(col,3));
 const gal=new THREE.Points(geo,new THREE.PointsMaterial({size:2.6,map:dotTex,alphaTest:.02,vertexColors:true,transparent:true,opacity:.95,blending:ADD,depthWrite:false,sizeAttenuation:true}));gal.rotation.x=.95;g.add(gal);
 const bigGlow=glow(0xffb070,360,.35);g.add(bigGlow);
 /* black hole */
 bhTilt=new THREE.Group();bhTilt.rotation.x=Math.PI/2-.16;g.add(bhTilt);
 const Rbh=9;g.add(new THREE.Mesh(new THREE.SphereGeometry(Rbh,64,48),new THREE.MeshBasicMaterial({color:0x000000})));
 const disk=new THREE.Mesh(new THREE.RingGeometry(11,40,160,1),new THREE.ShaderMaterial({transparent:true,side:THREE.DoubleSide,blending:ADD,depthWrite:false,uniforms:{t:{value:0}},
  vertexShader:`varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`varying vec3 vP;uniform float t;${NOISE}void main(){float r=length(vP.xy),a=atan(vP.y,vP.x),rn=(r-11.)/29.;float sw=a*3.+rn*16.-t*(3./(rn+.22));float n=fbm(vec3(vP.xy*.16+vec2(cos(sw),sin(sw))*.7,t*.15));float heat=pow(max(1.-rn,0.),2.1);vec3 c=mix(vec3(1.,.3,.04),vec3(1.,.93,.75),heat);float I=(n*1.3+.15)*heat*1.15;float dop=.55+.7*(.5+.5*cos(a-1.3));float al=smoothstep(0.,.06,rn)*(1.-smoothstep(.7,1.,rn));gl_FragColor=vec4(c*I*dop*al,1.);}`}));
 bhTilt.add(disk);g.userData.disk=disk;
 halo=new THREE.Mesh(new THREE.RingGeometry(Rbh*1.02,Rbh*1.9,128,1),new THREE.ShaderMaterial({transparent:true,side:THREE.DoubleSide,blending:ADD,depthWrite:false,
  vertexShader:`varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`varying vec3 vP;void main(){float r=length(vP.xy),rn=(r-9.18)/(17.1-9.18);float q=clamp(1.-rn,0.,1.);float I=pow(q,4.)*.9+smoothstep(.05,0.,rn)*1.2;vec3 c=mix(vec3(1.,.4,.08),vec3(1.,.95,.85),q*q);gl_FragColor=vec4(c*I*(1.-smoothstep(.75,1.,rn)),1.);}`}));
 g.add(halo);
 g.add(glow(0xffa050,110,.16));
 /* orbiter = "me" */
 orbiter=new THREE.Group();orbiter.add(new THREE.Mesh(new THREE.SphereGeometry(1.1,20,16),new THREE.MeshBasicMaterial({color:0xbff6ff})),glow(0x7fe7ff,12,1));bhTilt.add(orbiter);
 const TL=120,tp=new Float32Array(TL*3);orbitTrail={tp,TL,hist:[]};const tg=new THREE.BufferGeometry();tg.setAttribute('position',new THREE.BufferAttribute(tp,3));
 const trail=new THREE.Line(tg,new THREE.LineBasicMaterial({color:0x7fe7ff,transparent:true,opacity:.6,blending:ADD,depthWrite:false}));bhTilt.add(trail);
 reg(g,BH_Z,1700,t=>{const f=clamp((-cam.position.z-380)/260,0,1)*(1-sstep(-700,-860,cam.position.z)*.9);gal.material.opacity=.95*f;bigGlow.material.opacity=.3*f;gal.material.size=2.6*(1-sstep(-600,-860,cam.position.z)*.6);gal.rotation.y=t*.02;disk.material.uniforms.t.value=t;halo.lookAt(cam.position);
  const a=t*.32,R2=62;orbiter.position.set(Math.cos(a)*R2,Math.sin(a)*R2,0);orbitTrail.hist.unshift(orbiter.position.x,orbiter.position.y,orbiter.position.z);orbitTrail.hist.length=Math.min(orbitTrail.hist.length,TL*3);
  tp.fill(0);orbitTrail.hist.forEach((v,i)=>tp[i]=v);for(let i=orbitTrail.hist.length/3;i<TL;i++){tp[i*3]=orbitTrail.hist[orbitTrail.hist.length-3]||0;tp[i*3+1]=orbitTrail.hist[orbitTrail.hist.length-2]||0;tp[i*3+2]=orbitTrail.hist[orbitTrail.hist.length-1]||0}tg.attributes.position.needsUpdate=true},z=>z<-400&&z>-1500)}

/* ---- 9 WORMHOLE tunnel ---- */
const tunU={t:{value:0}};
{const g=new THREE.Group(),L=620;
 const geo=new THREE.CylinderGeometry(7.5,7.5,L,72,120,true);geo.rotateX(Math.PI/2);
 g.add(new THREE.Mesh(geo,new THREE.ShaderMaterial({side:THREE.BackSide,transparent:true,blending:ADD,depthWrite:false,uniforms:tunU,
  vertexShader:`varying vec2 vUv;varying float vAlong;void main(){vUv=uv;vAlong=1.-uv.y;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`varying vec2 vUv;varying float vAlong;uniform float t;${NOISE}void main(){float a=vUv.x*6.2831;float z=vAlong*60.;float n=fbm(vec3(cos(a)*1.6,sin(a)*1.6,z*.4-t*2.5));float st=pow(max(.5+.5*sin(a*5.+z*1.4-t*3.+n*6.),0.),3.);float ring=pow(max(.5+.5*sin(z*2.-t*7.),0.),6.);
   vec3 c=mix(vec3(.02,.04,.25),vec3(.2,.08,.5),n);c+=vec3(.1,.45,.7)*st*.55+vec3(.6,.2,.5)*ring*.3;c*=.5+.5*(1.-vAlong);c=mix(c,vec3(1.),smoothstep(.9,1.,vAlong)*.8);gl_FragColor=vec4(c,1.);}`})));
 const N=1600,sp=new Float32Array(N*3),sv=[];for(let i=0;i<N;i++){const a=Math.random()*6.283,r=rnd(1,6.8);sv.push({a,r,z:rnd(0,L),s:rnd(.8,2.6)})}
 const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.BufferAttribute(sp,3));g.add(new THREE.Points(sg,new THREE.PointsMaterial({color:0xcfe8ff,size:.35,map:dotTex,transparent:true,opacity:.85,blending:ADD,depthWrite:false})));
 reg(g,BH_Z-L/2,520,t=>{tunU.t.value=t;for(let i=0;i<N;i++){const p=sv[i];p.z=(p.z-p.s*1.2+L)%L;sp[i*3]=Math.cos(p.a+t*.2)*p.r;sp[i*3+1]=Math.sin(p.a+t*.2)*p.r;sp[i*3+2]=L/2-p.z}sg.attributes.position.needsUpdate=true})}

/* ---- 10 WHITE HOLE ---- */
const WH_Z=-1522;
{const g=new THREE.Group();const core=new THREE.Mesh(new THREE.SphereGeometry(16,48,32),new THREE.MeshBasicMaterial({color:0xffffff})),w1=glow(0xffffff,240,1),w2=glow(0xbfdfff,520,.55),w3=glow(0xffe6c0,900,.3);g.add(core,w1,w2,w3);
 const N=2200,ep=new Float32Array(N*3),ev=[];for(let i=0;i<N;i++){ev.push({d:new THREE.Vector3().randomDirection(),r:rnd(16,260),s:rnd(.5,2.2)})}
 const eg=new THREE.BufferGeometry();eg.setAttribute('position',new THREE.BufferAttribute(ep,3));g.add(new THREE.Points(eg,new THREE.PointsMaterial({color:0xdfeaff,size:1.1,map:dotTex,transparent:true,opacity:.85,blending:ADD,depthWrite:false})));
 reg(g,WH_Z,700,t=>{const f=sstep(-1230,-1490,cam.position.z);const f3=f*f*f;core.scale.setScalar(.08+.92*f3);w1.scale.setScalar(30+210*f3);w1.material.opacity=f3;w2.material.opacity=.55*f3*f;w3.material.opacity=.3*f3*f*f;for(let i=0;i<N;i++){const e=ev[i];e.r+=e.s*.5;if(e.r>260)e.r=16;ep[i*3]=e.d.x*e.r;ep[i*3+1]=e.d.y*e.r;ep[i*3+2]=e.d.z*e.r}eg.attributes.position.needsUpdate=true})}

/* ---- 11 NEW UNIVERSE (home) ---- */
{const g=new THREE.Group();const sunM=new THREE.Mesh(new THREE.SphereGeometry(5,40,28),new THREE.MeshBasicMaterial({color:0xfff2d0}));sunM.add(glow(0xffc070,60,.8),glow(0xff7a30,150,.3));sunM.position.set(16,5,-58);g.add(sunM);
 const pl=[[12,1.4,0x7fe7ff],[19,2.2,0xb794ff],[28,1.8,0xffb36b],[38,2.8,0x6ad6a0]].map(([R,r,c],k)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(r,32,24),new THREE.MeshStandardMaterial({color:c,roughness:.5,emissive:c,emissiveIntensity:.12}));g.add(m);return{m,R,k}});
 const pt=new THREE.PointLight(0xffd9a0,3,200,1.2);pt.position.copy(sunM.position);g.add(pt);
 reg(g,-1600,300,t=>{pl.forEach(({m,R,k})=>{const a=t*(.4-k*.07)+k*1.7;m.position.set(sunM.position.x+Math.cos(a)*R,sunM.position.y+Math.sin(a*.6)*2,sunM.position.z+Math.sin(a)*R*.7)})})}

/* clamp point sprites so near particles never blow up into screen-sized blobs */
scene.traverse(o=>{if(o.isPoints){const m=o.material;m.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <fog_vertex>','gl_PointSize=min(gl_PointSize,'+(mobile?'10.':'14.')+');\n#include <fog_vertex>')}}});
/* ============ main loop ============ */
let pt=0,ps=0,mx=0,my=0,smx=0,smy=0,t=0,last=performance.now(),lastFov=60;
const camZ=p=>{for(let i=1;i<CAMKEYS.length;i++){if(p<=CAMKEYS[i][0]){const[a,za]=CAMKEYS[i-1],[b,zb]=CAMKEYS[i],u=(p-a)/(b-a),e=u*u*(3-2*u);return lerp(za,zb,u*.55+e*.45)}}return CAMKEYS.at(-1)[1]};
addEventListener('pointermove',e=>{mx=e.clientX/innerWidth*2-1;my=-(e.clientY/innerHeight*2-1)});
const upd=()=>{pt=clamp(scrollY/Math.max(1,jmax()),0,1)};addEventListener('scroll',upd,{passive:true});upd();
addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);composer.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()});
const flash=$('#flash'),orbTag=$('#orbTag'),hint=$('#hint'),chapEl=$('#chap'),v3=new THREE.Vector3();

function frame(now){requestAnimationFrame(frame);const dt=Math.min(.05,(now-last)/1000);last=now;t+=dt;
 ps+=(pt-ps)*(1-Math.exp(-dt*4.2));smx+=(mx-smx)*.05;smy+=(my-smy)*.05;
 const z=camZ(ps),inTun=sstep(.776,.792,ps)*(1-sstep(.9,.925,ps));
 cam.position.set(Math.sin(ps*40)*.5*(1-inTun)+smx*(1.8-inTun*1.3),Math.cos(ps*31)*.35*(1-inTun)+smy*(1.1-inTun*.8),z);
 cam.lookAt(smx*3,smy*2,z-20);cam.rotateZ(inTun*(ps-.78)*26+Math.sin(ps*20)*.02);
 const fov=60+inTun*38+sstep(.9,.935,ps)*10*(1-sstep(.935,.99,ps));if(Math.abs(fov-lastFov)>.05){cam.fov=fov;cam.updateProjectionMatrix();lastFov=fov}
 bloom.strength=lerp(.55,.8,sstep(.55,.7,ps))-inTun*.28+sstep(.9,.935,ps)*1.1*(1-sstep(.95,1,ps));
 objs.forEach(o=>{const vis=o.vis?o.vis(z):Math.abs(z-o.z)<o.range;o.g.visible=vis;if(vis)o.update(t)});
 /* flash (white hole) */
 flash.style.opacity=(sstep(.905,.935,ps)*(1-sstep(.945,.99,ps))).toFixed(3);
 /* chapter ui */
 let idx=0;for(let i=0;i<ANCH.length;i++)if(ps>=ANCH[i]-.045)idx=i;setChap(idx);chapEl.classList.toggle('hide',ps>.955||!loadDone);$('#ladder').classList.toggle('hide',ps>.96);$('.meter').classList.toggle('hide',ps>.96);
 hint.classList.toggle('gone',scrollY>40);
 /* orbiter tag */
 if(idx===7&&ps>.55&&ps<.74){orbiter.getWorldPosition(v3);v3.project(cam);if(v3.z<1&&Math.abs(v3.x)<1&&Math.abs(v3.y)<1){orbTag.style.opacity=1;orbTag.style.transform=`translate(${(v3.x*.5+.5)*innerWidth+16}px,${(-v3.y*.5+.5)*innerHeight-8}px)`}else orbTag.style.opacity=0}else orbTag.style.opacity=0;
 composer.render()}
requestAnimationFrame(frame);
}
