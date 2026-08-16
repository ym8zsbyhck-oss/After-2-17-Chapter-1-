(() => {
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const screens={menu:$('#menu'),settings:$('#settings'),credits:$('#credits'),game:$('#game')};
const SAVE='after0217_ch1_v1_2_save', SET='after0217_ch1_v1_settings';
const memStore={};const store={get(k){try{return localStorage.getItem(k)}catch{return memStore[k]??null}},set(k,v){try{localStorage.setItem(k,v)}catch{memStore[k]=v}},remove(k){try{localStorage.removeItem(k)}catch{delete memStore[k]}}};
const defaults={sensitivity:1,volume:.72,quality:.9,uiScale:1,grain:true};
let settings=load(SET,defaults),settingsReturn='menu';
function load(k,f){try{const v=JSON.parse(store.get(k));return v?{...f,...v}:{...f}}catch{return {...f}}}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function saveSettings(){store.set(SET,JSON.stringify(settings));applySettings()}
function show(name){Object.values(screens).forEach(s=>s.classList.remove('active'));screens[name].classList.add('active');syncMenuAudioForScreen(name)}
function hasSave(){return !!store.get(SAVE)}
function updateContinue(){$('#continueBtn').classList.toggle('hidden',!hasSave())}
const isIOS=/iPhone|iPad|iPod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);if(!isIOS)$('#touchOnlyBlocker').classList.remove('hidden');
['gesturestart','gesturechange','gestureend'].forEach(t=>document.addEventListener(t,e=>e.preventDefault(),{passive:false}));document.addEventListener('contextmenu',e=>e.preventDefault());document.addEventListener('dblclick',e=>e.preventDefault(),{passive:false});
$('#sensitivity').value=settings.sensitivity;$('#volume').value=settings.volume;$('#quality').value=String(settings.quality);$('#uiScale').value=settings.uiScale;$('#grain').checked=settings.grain;
$('#sensitivity').oninput=e=>{settings.sensitivity=+e.target.value;saveSettings()};$('#volume').oninput=e=>{settings.volume=+e.target.value;saveSettings()};$('#quality').onchange=e=>{settings.quality=+e.target.value;saveSettings()};$('#uiScale').oninput=e=>{settings.uiScale=+e.target.value;saveSettings()};$('#grain').onchange=e=>{settings.grain=e.target.checked;saveSettings()};
$('#resetSettings').onclick=()=>{settings={...defaults};$('#sensitivity').value=1;$('#volume').value=.72;$('#quality').value='.9';$('#uiScale').value=1;$('#grain').checked=true;saveSettings()};
$('#settingsBtn').onclick=()=>{settingsReturn='menu';show('settings')};$('#creditsBtn').onclick=()=>show('credits');$$('[data-back]').forEach(b=>b.onclick=()=>{if(settingsReturn==='game'){show('game');$('#pauseOverlay').classList.remove('hidden')}else show('menu');settingsReturn='menu'});

// Menu audio. menu_click.mp3 is the short user-provided selection sound.
// menu_theme.mp3 is the user-supplied looping background track for the main menu.
const menuClick=new Audio('menu_click.mp3');menuClick.preload='auto';
const menuTheme=new Audio('menu_theme.mp3');menuTheme.preload='auto';menuTheme.loop=true;menuTheme.playsInline=true;
let menuThemeStarted=false,menuThemeMissing=false,menuFadeRAF=0;
menuTheme.addEventListener('error',()=>{menuThemeMissing=true});
function playMenuClick(){try{menuClick.pause();menuClick.currentTime=0;menuClick.volume=clamp(settings.volume*.62,0,1);const p=menuClick.play();if(p&&p.catch)p.catch(()=>{})}catch{}}
function fadeMenuTheme(target,duration=360,pauseAfter=false){
 try{cancelAnimationFrame(menuFadeRAF);const from=Number.isFinite(menuTheme.volume)?menuTheme.volume:0;const start=performance.now();
 const tick=now=>{const k=Math.min(1,(now-start)/Math.max(1,duration));menuTheme.volume=clamp(from+(target-from)*k,0,1);if(k<1)menuFadeRAF=requestAnimationFrame(tick);else if(pauseAfter&&target<=.001)menuTheme.pause()};menuFadeRAF=requestAnimationFrame(tick)}catch{}
}
function startMenuThemeFromGesture(){
 if(menuThemeStarted||menuThemeMissing)return;menuThemeStarted=true;menuTheme.volume=0;
 try{const pr=menuTheme.play();if(pr&&pr.then)pr.then(()=>fadeMenuTheme(clamp(settings.volume*.30,0,.34),720)).catch(()=>{menuThemeStarted=false});else fadeMenuTheme(clamp(settings.volume*.30,0,.34),720)}catch{menuThemeStarted=false}
 const h=$('#menuSoundHint');if(h)h.classList.add('awake');
}
function syncMenuAudioForScreen(name){
 if(!menuThemeStarted||menuThemeMissing)return;
 if(name==='game')fadeMenuTheme(0,320,true);
 else{try{const pr=menuTheme.play();if(pr&&pr.catch)pr.catch(()=>{})}catch{}fadeMenuTheme(clamp(settings.volume*.30,0,.34),420,false)}
}
// iOS has no hover. A finger-down on a main-menu section is the hover/select equivalent.
$$('.menuButtons .button').forEach(b=>b.addEventListener('pointerdown',()=>{startMenuThemeFromGesture();playMenuClick()},{passive:true}));
$$('.backBtn').forEach(b=>b.addEventListener('pointerdown',()=>{if(settingsReturn!=='game'){startMenuThemeFromGesture();playMenuClick()}},{passive:true}));
$('#menu').addEventListener('pointerdown',startMenuThemeFromGesture,{passive:true});

// ---------- audio ----------
let ac=null,master=null;
function audio(){if(!ac){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;ac=new AC();master=ac.createGain();master.gain.value=settings.volume*.12;master.connect(ac.destination);const low=ac.createBiquadFilter();low.type='lowpass';low.frequency.value=130;low.connect(master);[[43,'sine',.055],[58,'triangle',.024]].forEach(([f,t,g])=>{const o=ac.createOscillator(),gg=ac.createGain();o.type=t;o.frequency.value=f;gg.gain.value=g;o.connect(gg);gg.connect(low);o.start()})}if(ac.state==='suspended')ac.resume()}
function tone(f=220,d=.1,g=.08,t='sine'){if(!ac)return;const o=ac.createOscillator(),gg=ac.createGain();o.type=t;o.frequency.value=f;gg.gain.setValueAtTime(g,ac.currentTime);gg.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+d);o.connect(gg);gg.connect(master);o.start();o.stop(ac.currentTime+d+.03)}
function knock(){[0,150,390].forEach((d,i)=>setTimeout(()=>tone(64-i*4,.12,.28,'triangle'),d))}
function scrape(){if(!ac)return;const n=Math.floor(ac.sampleRate*.5),b=ac.createBuffer(1,n,ac.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=(Math.random()*2-1)*(1-i/n);const s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();s.buffer=b;f.type='bandpass';f.frequency.value=170;f.Q.value=1.8;g.gain.value=.12;s.connect(f);f.connect(g);g.connect(master);s.start()}

// ---------- minimal local WebGL renderer ----------
const canvas=$('#glCanvas');let gl,program,bufCube,bufCyl,textures={},importedBuffers={},running=false,paused=true,last=0;
const player={x:0,z:2.55,yaw:0,pitch:0}, move={x:0,y:0};let lookTargetYaw=0,lookTargetPitch=0;function syncLookTarget(){lookTargetYaw=player.yaw;lookTargetPitch=player.pitch}
const flags0={clock:false,cabinet:false,fuse:false,fuseInserted:false,circuit:false,powered:false,computer:false,symbols:false,crank:false,shutter:false,radio:false,key:false,ended:false};let flags={...flags0};
let current=null,chairX=-3.0,chairMoved=false;
const monster={active:false,preview:false,x:4.55,z:3.35,yaw:0,speed:1.08};

// The Room is now a coherent security / employee break room instead of a prop scatter.
// North: exit + clock + coded maintenance locker.
// East: electrical service wall.
// South-west: security desk/CRT.
// East-south: waiting sofa.
// West: archive shelf + manual shutter mechanism.
const objects=[
 {id:'door',label:'Служебная дверь',x:0,z:-4.36,r:2.05,model:'door',y:0,yaw:0},
 {id:'clock',label:'Настенные часы · 02:17',x:-2.25,z:-4.31,r:1.75,model:'clock',y:2.23,yaw:0,scale:1},
 {id:'cabinet',label:'Кодовый шкаф обслуживания',x:4.55,z:-4.10,r:1.95,model:()=>flags.cabinet?'cabinetOpen':'cabinetClosed',y:0,yaw:0},
 {id:'fuseItem',label:'Керамический предохранитель',x:4.55,z:-3.68,r:1.45,model:'fuse',y:.96,yaw:0,scale:1.05,hidden:()=>!flags.cabinet||flags.fuse||flags.fuseInserted||flags.circuit},
 {id:'fusebox',label:'Электрощиток',x:5.79,z:-1.55,r:1.80,model:'fusebox',y:.72,yaw:-Math.PI/2},
 {id:'computer',label:'Терминал охраны',x:-3.0,z:3.03,r:1.75,imported:'computerScreen',y:.83,yaw:Math.PI,scale:2.25,tex:'metal_grid'},
 {id:'panel',label:'Панель аварийного доступа',x:5.79,z:.45,r:1.80,model:()=>flags.symbols?'symbolPanelOpen':'symbolPanel',y:.76,yaw:-Math.PI/2},
 {id:'radio',label:'Радио на архивной полке',x:-5.15,z:-.35,r:1.65,imported:'radio',y:.92,yaw:Math.PI/2,scale:2.45,tex:'metal_red'},
 {id:'crank',label:'Сервисная рукоятка',x:5.18,z:.45,r:1.45,model:'crank',y:.96,yaw:-Math.PI/2,scale:1.0,hidden:()=>!flags.symbols||flags.crank},
 {id:'shutter',label:'Ручной механизм архивного отсека',x:-5.77,z:-2.45,r:1.72,model:'crankSocket',y:.48,yaw:Math.PI/2},
 {id:'key',label:'Латунный ключ',x:-5.55,z:-3.05,r:1.35,model:'key',y:.88,yaw:Math.PI/2,scale:1.1,hidden:()=>!flags.shutter||flags.key}
];
const decor=[
 {imported:'desk',x:-3.0,y:0,z:3.35,yaw:0,scale:2.85,tex:'old_wood'},
 {imported:'chair',x:()=>chairX,y:0,z:2.32,yaw:Math.PI,scale:2.30,tex:'old_wood'},
 {model:'sofa',x:4.68,y:0,z:2.55,yaw:-Math.PI/2},
 {imported:'bookcaseOpen',x:-5.56,y:0,z:-.32,yaw:Math.PI/2,scale:2.35,tex:'old_wood'},
 {imported:'lampRoundFloor',x:5.00,y:0,z:3.72,yaw:0,scale:1.55,tex:'metal_yellow'},
 {imported:'computerKeyboard',x:-3.10,y:.80,z:2.91,yaw:Math.PI,scale:2.15,tex:'rubber'},
 {imported:'computerMouse',x:-2.42,y:.81,z:2.93,yaw:Math.PI,scale:2.20,tex:'rubber'},
 {model:'boxStack',x:4.70,y:0,z:-3.25,yaw:.06}
];
const staticColliders=[
 {id:'desk',x1:-4.45,x2:-1.55,z1:2.92,z2:3.98},
 {id:'sofa',x1:4.16,x2:5.35,z1:1.40,z2:3.62},
 {id:'bookcase',x1:-5.94,x2:-5.06,z1:-1.18,z2:.58},
 {id:'cabinet',x1:3.90,x2:5.20,z1:-4.20,z2:-3.50},
 {id:'boxes',x1:4.12,x2:5.28,z1:-3.86,z2:-2.66},
 {id:'lamp',x1:4.72,x2:5.28,z1:3.42,z2:4.04}
];
function chairCollider(){return {id:'chair',x1:chairX-.48,x2:chairX+.48,z1:1.91,z2:2.78}}
function circleHitsRect(x,z,r,c){const qx=clamp(x,c.x1,c.x2),qz=clamp(z,c.z1,c.z2),dx=x-qx,dz=z-qz;return dx*dx+dz*dz<r*r}
function collides(x,z,r=.23,ignoreChair=false){
 if(x-r<-5.72||x+r>5.72||z-r<-4.18||z+r>4.18)return true;
 for(const c of staticColliders)if(circleHitsRect(x,z,r,c))return true;
 if(!ignoreChair&&circleHitsRect(x,z,r,chairCollider()))return true;
 return false
}
function moveActor(actor,dx,dz,r=.23,ignoreChair=false){
 const nx=actor.x+dx,nz=actor.z+dz;
 if(!collides(nx,actor.z,r,ignoreChair))actor.x=nx;
 if(!collides(actor.x,nz,r,ignoreChair))actor.z=nz;
}

function compile(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}
function initGL(){if(gl)return;gl=canvas.getContext('webgl',{antialias:true,alpha:false,powerPreference:'high-performance'});if(!gl){alert('WebGL недоступен');return}const vs=`attribute vec3 aP;attribute vec3 aN;attribute vec2 aUV;uniform mat4 uM,uV,uP;varying vec3 vN;varying vec2 vUV;varying float vD;void main(){vec4 w=uM*vec4(aP,1.);vec4 e=uV*w;gl_Position=uP*e;vN=mat3(uM)*aN;vUV=aUV;vD=length(e.xyz);}`;const fs=`precision mediump float;varying vec3 vN;varying vec2 vUV;varying float vD;uniform vec3 uC;uniform float uUseTex;uniform sampler2D uTex;uniform vec2 uUVScale;uniform float uPower;void main(){vec3 n=normalize(vN);vec3 l=normalize(vec3(-.35,.82,.24));float diff=max(dot(n,l),0.);float amb=.18+uPower*.13;vec3 base=uC;if(uUseTex>.5)base*=texture2D(uTex,vUV*uUVScale).rgb;float light=amb+diff*(.26+uPower*.40);vec3 col=base*light;float fog=clamp((vD-4.)/13.,0.,.76);col=mix(col,vec3(.020,.023,.022),fog);gl_FragColor=vec4(col,1.);}`;program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,vs));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fs));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);bufCube=meshBuffer(cubeMesh());bufCyl=meshBuffer(cylinderMesh(18));[['wall','wall.webp'],['floor','floor.webp'],['wood','wood.webp'],['metal','metal.webp'],['leather','leather.webp'],['fabric','fabric.webp'],['carpet','carpet.webp'],['tiles','tiles.webp'],['wall_yellow','wall_yellow.webp'],['ceiling','ceiling.webp'],['metal_yellow','metal_yellow.webp'],['metal_grid','metal_grid.webp'],['metal_red','metal_red.webp'],['cardboard','cardboard.webp'],['rubber','rubber.webp'],['old_wood','old_wood.webp'],['shutter','shutter.webp']].forEach(([n,u])=>loadTex(n,u));initImported();resize();addEventListener('resize',resize)}
function meshBuffer(m){const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(m),gl.STATIC_DRAW);return {b,count:m.length/8}}
function initImported(){if(!window.KENNEY_MESHES)return;for(const [name,data] of Object.entries(window.KENNEY_MESHES))importedBuffers[name]=meshBuffer(data)}
function cubeMesh(){const V=[];const faces=[[[0,0,1],[[-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5]]],[[0,0,-1],[[.5,-.5,-.5],[-.5,-.5,-.5],[-.5,.5,-.5],[.5,.5,-.5]]],[[1,0,0],[[.5,-.5,.5],[.5,-.5,-.5],[.5,.5,-.5],[.5,.5,.5]]],[[-1,0,0],[[-.5,-.5,-.5],[-.5,-.5,.5],[-.5,.5,.5],[-.5,.5,-.5]]],[[0,1,0],[[-.5,.5,.5],[.5,.5,.5],[.5,.5,-.5],[-.5,.5,-.5]]],[[0,-1,0],[[-.5,-.5,-.5],[.5,-.5,-.5],[.5,-.5,.5],[-.5,-.5,.5]]]];for(const [n,p] of faces){const uv=[[0,0],[1,0],[1,1],[0,1]],idx=[0,1,2,0,2,3];for(const i of idx)V.push(...p[i],...n,...uv[i])}return V}
function cylinderMesh(seg){const V=[];for(let i=0;i<seg;i++){const a=i/seg*Math.PI*2,b=(i+1)/seg*Math.PI*2,ca=Math.cos(a),sa=Math.sin(a),cb=Math.cos(b),sb=Math.sin(b);const qu=[[ca,-.5,sa],[cb,-.5,sb],[cb,.5,sb],[ca,.5,sa]],uv=[[i/seg,0],[(i+1)/seg,0],[(i+1)/seg,1],[i/seg,1]],ix=[0,1,2,0,2,3];for(const k of ix)V.push(...qu[k],ca,0,sa,...uv[k]);for(const top of [-.5,.5]){const ny=top>0?1:-1;const tri=top>0?[[0,top,0],[cb,top,sb],[ca,top,sa]]:[[0,top,0],[ca,top,sa],[cb,top,sb]];for(const p of tri)V.push(...p,0,ny,0,.5+p[0]*.5,.5+p[2]*.5)}}return V}
function loadTex(name,url){const t=gl.createTexture();textures[name]=t;gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([100,100,100,255]));const im=new Image();im.onload=()=>{gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,im);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.generateMipmap(gl.TEXTURE_2D)};im.src=url}
function resize(){if(!gl)return;const q=settings.quality,pr=Math.min(devicePixelRatio||1,2)*q;const w=Math.max(480,Math.floor(innerWidth*pr)),h=Math.max(270,Math.floor(innerHeight*pr));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}gl.viewport(0,0,w,h)}
function M4(){return new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1])}function mul(a,b){const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)o[c*4+r]=a[0*4+r]*b[c*4+0]+a[1*4+r]*b[c*4+1]+a[2*4+r]*b[c*4+2]+a[3*4+r]*b[c*4+3];return o}function tr(x,y,z){const m=M4();m[12]=x;m[13]=y;m[14]=z;return m}function sc(x,y,z){const m=M4();m[0]=x;m[5]=y;m[10]=z;return m}function rx(a){const m=M4(),c=Math.cos(a),s=Math.sin(a);m[5]=c;m[6]=s;m[9]=-s;m[10]=c;return m}function ry(a){const m=M4(),c=Math.cos(a),s=Math.sin(a);m[0]=c;m[2]=-s;m[8]=s;m[10]=c;return m}function rz(a){const m=M4(),c=Math.cos(a),s=Math.sin(a);m[0]=c;m[1]=s;m[4]=-s;m[5]=c;return m}function persp(fov,asp,n,f){const t=1/Math.tan(fov/2),m=new Float32Array(16);m[0]=t/asp;m[5]=t;m[10]=(f+n)/(n-f);m[11]=-1;m[14]=2*f*n/(n-f);return m}
function modelMat(x,y,z,yaw=0,sx=1,sy=1,sz=1,rot=[0,0,0]){return mul(tr(x,y,z),mul(ry(yaw),mul(rx(rot[0]||0),mul(rz(rot[2]||0),sc(sx,sy,sz)))))}
function bindBuf(m){gl.bindBuffer(gl.ARRAY_BUFFER,m.b);const ap=gl.getAttribLocation(program,'aP'),an=gl.getAttribLocation(program,'aN'),au=gl.getAttribLocation(program,'aUV');gl.enableVertexAttribArray(ap);gl.vertexAttribPointer(ap,3,gl.FLOAT,false,32,0);gl.enableVertexAttribArray(an);gl.vertexAttribPointer(an,3,gl.FLOAT,false,32,12);gl.enableVertexAttribArray(au);gl.vertexAttribPointer(au,2,gl.FLOAT,false,32,24)}
function setUV(uv=[1,1]){gl.uniform2f(gl.getUniformLocation(program,'uUVScale'),uv[0]||1,uv[1]||1)}
function drawPart(part,base){const p=part.p||[0,0,0],d=part.d||[1,1,1],r=part.r||[0,0,0];let local=modelMat(p[0],p[1],p[2],r[1]||0,d[0],d[1],d[2],r);const mm=mul(base,local);gl.uniformMatrix4fv(gl.getUniformLocation(program,'uM'),false,mm);let col=part.c||[.5,.5,.5];const tm=performance.now();if(part.tag==='operatorScreen'){const n=.022+((Math.sin(tm*.061)+Math.sin(tm*.017))*0.5+1)*.010;col=[n,n*1.12,n*1.03]}else if(part.tag==='operatorStatic'){const n=.09+((Math.sin(tm*.089)+1)*.5)*.11;col=[n,n*1.10,n]}else if(part.tag==='operatorSensor'){const n=.68+((Math.sin(tm*.012)+1)*.5)*.28;col=[n,n,n*.92]}gl.uniform3fv(gl.getUniformLocation(program,'uC'),col);const texName=part.tex||'rubber',use=textures[texName];gl.uniform1f(gl.getUniformLocation(program,'uUseTex'),use?1:0);setUV(part.uv||[1,1]);if(use){gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,use);gl.uniform1i(gl.getUniformLocation(program,'uTex'),0)}const b=part.s==='cyl'?bufCyl:bufCube;bindBuf(b);gl.drawArrays(gl.TRIANGLES,0,b.count)}
function drawModel(name,x,y,z,yaw=0,scale=1){const mod=LOCAL_MODELS[name];if(!mod)return;const base=modelMat(x,y,z,yaw,scale,scale,scale);for(const p of mod.parts)drawPart(p,base)}
function drawImported(name,x,y,z,yaw=0,scale=1,tex='wood',color=[.78,.78,.74],uv=[1,1]){const b=importedBuffers[name];if(!b)return;const mm=modelMat(x,y,z,yaw,scale,scale,scale);gl.uniformMatrix4fv(gl.getUniformLocation(program,'uM'),false,mm);gl.uniform3fv(gl.getUniformLocation(program,'uC'),color);const use=textures[tex]||textures.rubber;gl.uniform1f(gl.getUniformLocation(program,'uUseTex'),use?1:0);setUV(uv);if(use){gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,use);gl.uniform1i(gl.getUniformLocation(program,'uTex'),0)}bindBuf(b);gl.drawArrays(gl.TRIANGLES,0,b.count)}
function drawEntity(e){const x=typeof e.x==='function'?e.x():e.x;const modelName=typeof e.model==='function'?e.model():e.model;if(e.imported)drawImported(e.imported,x,e.y||0,e.z,e.yaw||0,e.scale||1,e.tex||'wood',e.color||[.78,.78,.74],e.uv||[1,1]);else drawModel(modelName,x,e.y||0,e.z,e.yaw||0,e.scale||1)}
function drawBox(x,y,z,w,h,d,c,tex='rubber',uv=[1,1]){drawPart({s:'box',p:[0,0,0],d:[w,h,d],c,tex,uv},modelMat(x,y,z,0))}
function render(){gl.clearColor(.010,.012,.012,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.enable(gl.CULL_FACE);gl.useProgram(program);const P=persp(67*Math.PI/180,canvas.width/canvas.height,.05,40);const V=mul(rx(-player.pitch),mul(ry(player.yaw),tr(-player.x,-1.62,-player.z)));gl.uniformMatrix4fv(gl.getUniformLocation(program,'uP'),false,P);gl.uniformMatrix4fv(gl.getUniformLocation(program,'uV'),false,V);gl.uniform1f(gl.getUniformLocation(program,'uPower'),flags.powered?1:0);
 // Coherent employee-security room: worn cheerful materials over abandoned industrial infrastructure.
 drawBox(0,-.05,0,12,.10,9,[.98,.95,.86],'tiles',[6,4.5]);
 drawBox(0,3.22,0,12,.10,9,[.72,.73,.68],'ceiling',[6,4]);
 drawBox(0,1.60,-4.5,12,3.2,.14,[.90,.84,.65],'wall_yellow',[6,2]);
 drawBox(0,1.60,4.5,12,3.2,.14,[.90,.84,.65],'wall_yellow',[6,2]);
 drawBox(-6,1.60,0,.14,3.2,9,[.90,.84,.65],'wall_yellow',[4.5,2]);
 drawBox(6,1.60,0,.14,3.2,9,[.90,.84,.65],'wall_yellow',[4.5,2]);
 // turquoise worn service wainscot
 drawBox(0,.47,-4.41,11.72,.94,.05,[.66,.88,.84],'metal_grid',[6,1]);
 drawBox(0,.47,4.41,11.72,.94,.05,[.66,.88,.84],'metal_grid',[6,1]);
 drawBox(-5.91,.47,0,.05,.94,8.72,[.66,.88,.84],'metal_grid',[4.5,1]);
 drawBox(5.91,.47,0,.05,.94,8.72,[.66,.88,.84],'metal_grid',[4.5,1]);
 // cheerful-but-decayed toy-factory colour rhythm: original arrangement, not copied signage.
 drawBox(-4.65,1.63,-4.405,.52,3.08,.06,[.95,.55,.40],'metal_red',[1,2]);
 drawBox(4.62,1.63,-4.405,.52,3.08,.06,[1.00,.88,.45],'metal_yellow',[1,2]);
 drawBox(-5.905,1.65,2.95,.06,3.02,.62,[.95,.55,.40],'metal_red',[1,2]);
 drawBox(5.905,1.65,-2.95,.06,3.02,.62,[1.00,.88,.45],'metal_yellow',[1,2]);
 // accent floor tiles pull the eye through the room while keeping the center walkable
 const accents=[[-4.7,-3.35,[1.00,.50,.40]],[-2.6,-2.75,[1.00,.90,.46]],[-.4,-3.25,[.52,.88,.90]],[1.6,-2.55,[1.00,.50,.40]],[3.55,-1.95,[1.00,.90,.46]],[2.1,.15,[.52,.88,.90]],[.35,1.0,[1.00,.50,.40]]];
 for(const [x,z,c] of accents)drawBox(x,.014,z,.86,.028,.86,c,'tiles',[1,1]);
 // waiting-area rug
 drawBox(4.04,.018,2.55,2.55,.035,2.45,[.78,.76,.68],'carpet',[2,2]);
 // ceiling fluorescent fixtures
 for(const x of [-3.5,0,3.5]){drawBox(x,3.105,-.45,1.55,.075,.42,flags.powered?[1.40,1.35,1.13]:[.28,.28,.25],'ceiling',[1,1]);drawBox(x,3.07,-.45,1.72,.06,.55,[.62,.68,.63],'metal_grid',[1,1])}
 // props are deliberately zoned: security desk / lounge / archive / maintenance.
 for(const d of decor)drawEntity(d);for(const o of objects){if(o.hidden&&o.hidden())continue;drawEntity(o)}
 // Story state is visible in the room, not only in UI overlays.
 if(flags.fuseInserted||flags.circuit)drawModel('installedFuse',5.66,1.00,-1.55,-Math.PI/2,.78);
 drawModel(flags.shutter?'compartmentOpen':'compartmentClosed',-5.72,.38,-3.05,Math.PI/2,.92);
 if(monster.active||monster.preview)drawModel('operator',monster.x,0,monster.z,monster.yaw,1.02);
 // door frame and service trim
 drawBox(0,2.55,-4.34,1.72,.10,.22,[.92,.78,.39],'metal_yellow',[1,1]);
 drawBox(-.79,1.30,-4.34,.10,2.58,.22,[.80,.82,.75],'metal_grid',[1,2]);
 drawBox(.79,1.30,-4.34,.10,2.58,.22,[.80,.82,.75],'metal_grid',[1,2]);
}
function step(dt){const lookK=1-Math.exp(-dt*22);player.yaw+=(lookTargetYaw-player.yaw)*lookK;player.pitch+=(lookTargetPitch-player.pitch)*lookK;const sp=1.58,f=move.y,s=move.x;const dx=(Math.sin(player.yaw)*f+Math.cos(player.yaw)*s)*sp*dt,dz=(-Math.cos(player.yaw)*f+Math.sin(player.yaw)*s)*sp*dt;moveActor(player,dx,dz,.24,false);
 if(monster.active){const mx=player.x-monster.x,mz=player.z-monster.z,d=Math.hypot(mx,mz)||1;monster.yaw=Math.atan2(mx,-mz);const base=Math.atan2(mz,mx),offs=[0,.48,-.48,.92,-.92,1.45,-1.45];let moved=false;for(const off of offs){const a=base+off,dxm=Math.cos(a)*monster.speed*dt,dzm=Math.sin(a)*monster.speed*dt;const ox=monster.x,oz=monster.z;moveActor(monster,dxm,dzm,.29,false);if(Math.hypot(monster.x-ox,monster.z-oz)>.001){moved=true;break}}if(d<.66)caughtPlayer()}}

function updateFocus(){let best=null,score=1e9;for(const o of objects){if(o.hidden&&o.hidden())continue;const dx=o.x-player.x,dz=o.z-player.z,dist=Math.hypot(dx,dz);if(dist>o.r)continue;const ang=Math.atan2(dx,-dz);let d=ang-player.yaw;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;const sc=Math.abs(d)*2+dist*.12;if(Math.abs(d)<.42&&sc<score){best=o;score=sc}}current=best;$('#focusLabel').textContent=best?best.label:'';$('#focusLabel').classList.toggle('show',!!best);$('#actionBtn').classList.toggle('ready',!!best)}
function loop(t){if(!running||paused)return;const dt=Math.min(.035,(t-last)/1000||0);last=t;step(dt);updateFocus();render();requestAnimationFrame(loop)}
function applySettings(){document.documentElement.style.setProperty('--uiScale',settings.uiScale);$('#grainLayer').style.display=settings.grain?'block':'none';if(master)master.gain.value=settings.volume*.12;if(menuThemeStarted&&!menuTheme.paused)fadeMenuTheme(clamp(settings.volume*.30,0,.34),120,false);if(gl)resize()}

// ---------- game state ----------
let objectiveIndex=-1;
function objective(){
 let i=0,title='Откройте служебную дверь',detail='Осмотрите настоящие предметы комнаты и найдите способ снять блокировку.';
 if(flags.clock){i=1;title='Проверьте кодовый шкаф';detail='Стрелки настенных часов застыли на 02:17.'}
 if(flags.cabinet&&!flags.fuse&&!flags.fuseInserted&&!flags.circuit){i=2;title='Заберите предохранитель';detail='Шкаф открыт. Предохранитель лежит внутри на держателе.'}
 if(flags.fuse&&!flags.fuseInserted){i=3;title='Установите предохранитель';detail='Найдите настоящий электрощит на технической стене.'}
 if(flags.fuseInserted&&!flags.circuit){i=4;title='Замкните цепь';detail='Предохранитель установлен. Восстановите цепь внутри щита.'}
 if(flags.circuit){i=5;title='Проверьте включившуюся технику';detail='После скачка питания ожил CRT-терминал охраны.'}
 if(flags.computer){i=6;title='Разблокируйте аварийную панель';detail='Терминал показал последовательность из трёх символов.'}
 if(flags.symbols&&!flags.crank){i=7;title='Заберите рукоятку';detail='Из панели физически выдвинулся сервисный лоток.'}
 if(flags.crank){i=8;title='Найдите ручной механизм';detail='Рукоятка подходит к квадратному валу в архивной зоне.'}
 if(flags.shutter&&!flags.key){i=9;title='Заберите ключ';detail='Открылся настоящий скрытый металлический отсек.'}
 if(flags.key&&!monster.active){i=10;title='Откройте служебную дверь';detail='Ключ у вас. Возвращайтесь к выходу.'}
 if(monster.active){i=11;title='БЕГИТЕ К ДВЕРИ';detail='Оператор проснулся. Не дайте ему приблизиться.'}
 setObj(i,title,detail)
}
function setObj(i,title,detail){const e=$('#objective');if(i!==objectiveIndex){objectiveIndex=i;e.classList.remove('updated');void e.offsetWidth;e.classList.add('updated')}e.innerHTML=`<span>ТЕКУЩАЯ ЦЕЛЬ</span><b>${title}</b><small>${detail}</small>`}
function inv(){const a=[];if(flags.fuse&&!flags.circuit)a.push('ПРЕДОХРАНИТЕЛЬ');if(flags.crank&&!flags.shutter)a.push('РУКОЯТКА');if(flags.key)a.push('КЛЮЧ');$('#inventory').innerHTML=a.map(x=>`<span class="invItem">${x}</span>`).join('')}
function toast(t,ms=1900){const e=$('#toast');e.textContent=t;e.classList.add('show');clearTimeout(toast.tm);toast.tm=setTimeout(()=>e.classList.remove('show'),ms)}
function flash(op=.55,ms=90){const e=$('#flash');e.style.opacity=op;setTimeout(()=>e.style.opacity=0,ms)}
function saveGame(){store.set(SAVE,JSON.stringify({flags,player:{x:player.x,z:player.z,yaw:player.yaw,pitch:player.pitch},chairX,v:6}));updateContinue()}
function loadGame(){try{const s=JSON.parse(store.get(SAVE));if(!s)return false;flags={...flags0,...s.flags};Object.assign(player,s.player||{});chairX=s.chairX??-3.0;syncLookTarget();monster.active=false;monster.preview=false;objective();inv();return true}catch{return false}}
function resetGame(){flags={...flags0};Object.assign(player,{x:0,z:2.55,yaw:0,pitch:0});syncLookTarget();chairX=-3.0;chairMoved=false;monster.active=false;monster.preview=false;monster.x=4.55;monster.z=3.35;objective();inv()}
function start(cont){initGL();show('game');running=true;paused=true;if(cont&&!loadGame())resetGame();else if(!cont)resetGame();$('#introOverlay').classList.toggle('hidden',cont);$('#pauseOverlay').classList.add('hidden');$('#endingOverlay').classList.add('hidden');$('#caughtOverlay').classList.add('hidden');if(cont){paused=false;last=performance.now();requestAnimationFrame(loop)}}
$('#newGameBtn').onclick=()=>start(false);$('#continueBtn').onclick=()=>start(true);$('#enterRoomBtn').onclick=()=>{audio();$('#introOverlay').classList.add('hidden');paused=false;last=performance.now();toast('ЦЕЛЬ ОБНОВЛЕНА: откройте служебную дверь.',1900);objective();requestAnimationFrame(loop)};
$('#pauseBtn').onclick=()=>{if(!running)return;paused=true;move.x=move.y=0;resetStick();$('#pauseOverlay').classList.remove('hidden')};$('#resumeBtn').onclick=()=>{$('#pauseOverlay').classList.add('hidden');paused=false;last=performance.now();requestAnimationFrame(loop)};$('#pauseSettingsBtn').onclick=()=>{$('#pauseOverlay').classList.add('hidden');settingsReturn='game';show('settings')};$('#exitBtn').onclick=()=>{saveGame();running=false;show('menu');$('#pauseOverlay').classList.add('hidden')};

function interact(){if(!current||paused)return;audio();tone(260,.045,.05);const id=current.id;
 if(id==='clock'){flags.clock=true;toast('Стрелки часов неподвижны: 02:17.',2500);objective();saveGame();setTimeout(()=>{flash(.18,60);tone(70,.09,.16,'triangle')},700)}
 else if(id==='cabinet'){if(flags.cabinet){toast('Дверца шкафа открыта. Предохранитель лежит внутри.');return}openKeypad()}
 else if(id==='fuseItem'){flags.fuse=true;inv();objective();toast('Вы забрали керамический предохранитель.',2200);tone(410,.08,.08,'triangle');saveGame()}
 else if(id==='fusebox'){if(flags.circuit){toast('Щит работает. Предохранитель на месте.');return}if(!flags.fuseInserted){if(!flags.fuse){toast('Пустое гнездо. Нужен предохранитель.');return}flags.fuse=false;flags.fuseInserted=true;inv();objective();toast('Предохранитель установлен в держатель.',1400);tone(360,.08,.08,'triangle');saveGame();setTimeout(()=>openCircuit(),380);return}openCircuit()}
 else if(id==='computer'){if(!flags.powered){toast('Нет питания.');return}openComputer()}
 else if(id==='panel'){if(!flags.computer){toast('Три кнопки. Но порядок неизвестен.');return}openSymbols()}
 else if(id==='radio'){if(!flags.powered){toast('Радио молчит.');return}flags.radio=true;toast('91.3 МГц: «НЕ ОТКРЫВАЙТЕ ДВЕРЬ ПОСЛЕ 02:17»',3400);tone(91,.30,.12,'sawtooth');setTimeout(()=>tone(480,.05,.05,'square'),340);saveGame()}
 else if(id==='crank'){flags.crank=true;inv();objective();toast('Вы взяли тяжёлую рукоятку.',2100);tone(410,.10,.09,'triangle');saveGame()}
 else if(id==='shutter'){if(!flags.crank&&!flags.shutter){toast('Квадратный вал. Здесь не хватает рукоятки.');return}if(flags.shutter){toast('Механизм уже открыт.');return}flags.shutter=true;flags.crank=false;inv();objective();scrape();flash(.28,80);toast('Металлическая заслонка поднялась. Внутри виден ключ.',2600);saveGame()}
 else if(id==='key'){flags.key=true;inv();toast('Вы подняли ключ.');tone(460,.12,.10,'triangle');startChase();saveGame()}
 else if(id==='door'){if(!flags.key){toast('Заперто.');tone(78,.11,.16,'triangle');return}finish()}}
$('#actionBtn').addEventListener('pointerdown',e=>{e.preventDefault();interact()});

// keypad
let code='';function openKeypad(){paused=true;code='';updCode();$('#keypadOverlay').classList.remove('hidden')}function updCode(){$('#keypadDisplay').textContent=(code+'––––').slice(0,4)}function closeModal(id){$(id).classList.add('hidden');paused=false;last=performance.now();requestAnimationFrame(loop)}
const kg=$('#keypadGrid');['1','2','3','4','5','6','7','8','9','⌫','0','OK'].forEach(n=>{const b=document.createElement('button');b.textContent=n;b.onpointerdown=e=>{e.preventDefault();audio();tone(300,.04,.04);if(n==='⌫')code=code.slice(0,-1);else if(n==='OK'){if(code==='0217'){flags.cabinet=true;inv();objective();flash(.24,80);toast('Замок щёлкнул. Дверца шкафа открылась.',2200);saveGame();closeModal('#keypadOverlay')}else{code='';flash(.35,60);toast('Неверный код.')}}else if(code.length<4)code+=n;updCode()};kg.appendChild(b)});$('#keypadClose').onclick=()=>closeModal('#keypadOverlay');

// 4x4 touch circuit: reach OUT while passing both relay contacts.
const gridN=4, blockedNodes=new Set([3,4,7,8,12]), relayNodes=new Set([5,10]);let path=[];const cb=$('#circuitBoard');cb.style.gridTemplateColumns='repeat(4,1fr)';for(let i=0;i<16;i++){const n=document.createElement('div');n.className='cnode'+(blockedNodes.has(i)?' blocked':' active')+(i===0?' start':'')+(i===15?' end':'')+(relayNodes.has(i)?' relay':'');n.dataset.i=i;n.textContent=blockedNodes.has(i)?'×':relayNodes.has(i)?'⚡':'●';cb.appendChild(n)}
function drawCircuit(){$$('.cnode').forEach(n=>n.classList.toggle('path',path.includes(+n.dataset.i)));const rel=[...relayNodes].filter(i=>path.includes(i)).length;$('#circuitStatus').textContent=path.length?`Контакты: ${path.length} · реле ${rel}/2`:'Проведите пальцем от IN через оба реле к OUT.'}
function near(a,b){const ax=a%gridN,ay=Math.floor(a/gridN),bx=b%gridN,by=Math.floor(b/gridN);return Math.abs(ax-bx)+Math.abs(ay-by)===1}
function addNode(i){if(blockedNodes.has(i))return;if(path.length===0){if(i!==0)return;path=[0]}else{const last=path[path.length-1];if(i===last)return;if(!near(last,i)||path.includes(i))return;path.push(i)}drawCircuit();if(path[path.length-1]===15){if([...relayNodes].every(r=>path.includes(r))){setTimeout(circuitWin,180)}else{$('#circuitStatus').textContent='Цепь дошла до OUT, но одно из реле не запитано.';tone(92,.13,.16,'triangle')}}}
let circuitDown=false;cb.addEventListener('pointerdown',e=>{e.preventDefault();circuitDown=true;path=[];const n=e.target.closest('.cnode');if(n)addNode(+n.dataset.i);cb.setPointerCapture?.(e.pointerId)});cb.addEventListener('pointermove',e=>{if(!circuitDown)return;const el=document.elementFromPoint(e.clientX,e.clientY)?.closest?.('.cnode');if(el)addNode(+el.dataset.i)});cb.addEventListener('pointerup',()=>circuitDown=false);$('#circuitReset').onclick=()=>{path=[];drawCircuit()};
function openCircuit(){paused=true;path=[];drawCircuit();$('#circuitOverlay').classList.remove('hidden')};$('#circuitClose').onclick=()=>closeModal('#circuitOverlay');function circuitWin(){flags.circuit=true;flags.fuse=false;flags.fuseInserted=true;flags.powered=true;inv();objective();$('#circuitOverlay').classList.add('hidden');flash(.7,80);setTimeout(()=>flash(.42,70),170);setTimeout(()=>flash(.28,60),360);tone(55,.22,.20,'triangle');setTimeout(()=>tone(840,.08,.07,'square'),480);toast('Электричество вернулось.',2200);monster.preview=true;monster.x=2.75;monster.z=-3.35;monster.yaw=Math.PI;setTimeout(()=>{if(monster.preview){flash(.60,80);monster.preview=false;tone(48,.22,.20,'triangle')}},1250);saveGame();paused=false;last=performance.now();requestAnimationFrame(loop)}

function openComputer(){paused=true;$('#computerOverlay').classList.remove('hidden');tone(720,.05,.04,'square');setTimeout(()=>tone(860,.05,.04,'square'),90)}$('#computerClose').onclick=()=>{if(!flags.computer){flags.computer=true;chairX=-2.35;chairMoved=true;scrape();setTimeout(knock,430);toast('За спиной сдвинулся стул.',2200);objective();saveGame()}closeModal('#computerOverlay')};

let seq=[];const wanted=['circle','triangle','square'];function updSeq(){$('#symbolInput').textContent=(seq.map(s=>s==='circle'?'○':s==='triangle'?'△':'□').join(' ')+' · · ·').split(' ').slice(0,3).join(' ')}function openSymbols(){paused=true;seq=[];updSeq();$('#symbolOverlay').classList.remove('hidden')}$$('[data-symbol]').forEach(b=>b.onpointerdown=e=>{e.preventDefault();if(seq.length>=3)return;seq.push(b.dataset.symbol);tone(380+seq.length*80,.06,.07,'triangle');updSeq();if(seq.length===3)setTimeout(()=>{if(seq.every((x,i)=>x===wanted[i])){flags.symbols=true;objective();flash(.38,70);toast('Панель отщёлкнула маленький металлический лоток.',2400);tone(130,.16,.14,'triangle');saveGame();closeModal('#symbolOverlay')}else{seq=[];updSeq();flash(.25,60);toast('Последовательность сброшена.')}},180)});$('#symbolReset').onclick=()=>{seq=[];updSeq()};$('#symbolClose').onclick=()=>closeModal('#symbolOverlay');
function startChase(){monster.active=true;monster.preview=false;monster.x=4.35;monster.z=3.30;monster.speed=1.08;knock();setTimeout(scrape,220);flash(.65,90);toast('БЕГИТЕ К ДВЕРИ.',2000);objective()}
function caughtPlayer(){if(paused||!monster.active)return;monster.active=false;paused=true;move.x=move.y=0;resetStick();flash(.82,120);tone(46,.45,.30,'sawtooth');setTimeout(()=>$('#caughtOverlay').classList.remove('hidden'),160)}
$('#caughtRetryBtn').onclick=()=>{$('#caughtOverlay').classList.add('hidden');player.x=-4.85;player.z=-2.25;player.yaw=.95;player.pitch=0;syncLookTarget();monster.x=4.35;monster.z=3.30;monster.active=true;paused=false;last=performance.now();toast('БЕГИТЕ.',1300);objective();requestAnimationFrame(loop)};
function finish(){flags.ended=true;monster.active=false;paused=true;flash(.85,140);setTimeout(()=>$('#endingOverlay').classList.remove('hidden'),260);store.remove(SAVE);updateContinue()}$('#endingMenuBtn').onclick=()=>{running=false;$('#endingOverlay').classList.add('hidden');show('menu')};

// ---------- iOS touch controls only ----------
// v1.2: pointer-captured controls + corrected camera matrix.
// Same finger distance gives the same rotation; small movement around the stick center is ignored.
let stickId=null,stickOrigin={x:0,y:0};const stick=$('#stick'),knob=$('#stickKnob'),lz=$('#leftZone');
function placeStick(x,y){const size=104,pad=10,zone=lz.getBoundingClientRect();const minX=zone.left+size/2+pad,maxX=zone.right-size/2-pad,minY=zone.top+size/2+pad,maxY=zone.bottom-size/2-pad;const cx=clamp(x,minX,maxX),cy=clamp(y,minY,maxY);const s=settings.uiScale||1,localX=innerWidth/2+(cx-innerWidth/2)/s,localY=innerHeight/2+(cy-innerHeight/2)/s;stick.style.left=`${localX-size/2}px`;stick.style.top=`${localY-size/2}px`;stick.style.bottom='auto';stick.classList.add('floating');stickOrigin={x:cx,y:cy}}
function resetStick(){stickId=null;move.x=move.y=0;knob.style.transform='translate(-50%,-50%)';stick.classList.remove('active')}
function joyPoint(x,y){const dx=x-stickOrigin.x,dy=y-stickOrigin.y,max=42,dead=7,len=Math.hypot(dx,dy);if(len<dead){move.x=move.y=0;knob.style.transform='translate(-50%,-50%)';return}const vis=Math.min(max,len),nx=dx/len,ny=dy/len,strength=clamp((len-dead)/(max-dead),0,1);knob.style.transform=`translate(calc(-50% + ${nx*vis}px),calc(-50% + ${ny*vis}px))`;move.x=nx*strength;move.y=-ny*strength}
lz.addEventListener('pointerdown',e=>{if(paused||stickId!==null||e.pointerType==='mouse')return;stickId=e.pointerId;placeStick(e.clientX,e.clientY);stick.classList.add('active');lz.setPointerCapture?.(e.pointerId);e.preventDefault()},{passive:false});
lz.addEventListener('pointermove',e=>{if(e.pointerId!==stickId)return;joyPoint(e.clientX,e.clientY);e.preventDefault()},{passive:false});
function endStick(e){if(e.pointerId!==stickId)return;resetStick();e.preventDefault()}
lz.addEventListener('pointerup',endStick,{passive:false});lz.addEventListener('pointercancel',endStick,{passive:false});

let lookId=null,lx=0,ly=0;const lookZoneEl=$('#lookZone');
lookZoneEl.addEventListener('pointerdown',e=>{if(paused||lookId!==null||e.pointerType==='mouse')return;lookId=e.pointerId;lx=e.clientX;ly=e.clientY;lookTargetYaw=player.yaw;lookTargetPitch=player.pitch;lookZoneEl.setPointerCapture?.(e.pointerId);e.preventDefault()},{passive:false});
lookZoneEl.addEventListener('pointermove',e=>{if(e.pointerId!==lookId)return;let dx=clamp(e.clientX-lx,-42,42),dy=clamp(e.clientY-ly,-42,42);lx=e.clientX;ly=e.clientY;if(Math.abs(dx)<.35)dx=0;if(Math.abs(dy)<.35)dy=0;const sx=3.15/Math.max(innerWidth,640),sy=2.20/Math.max(innerHeight,320);lookTargetYaw+=dx*sx*settings.sensitivity;lookTargetPitch=clamp(lookTargetPitch-dy*sy*settings.sensitivity,-.72,.72);e.preventDefault()},{passive:false});
function endLook(e){if(e.pointerId!==lookId)return;lookId=null;e.preventDefault()}
lookZoneEl.addEventListener('pointerup',endLook,{passive:false});lookZoneEl.addEventListener('pointercancel',endLook,{passive:false});

applySettings();updateContinue();
if('serviceWorker' in navigator && location.protocol!=='file:'){navigator.serviceWorker.register('./sw.js').catch(()=>{});}
// tiny public test surface; no cheats exposed in normal UI
window.AFTER0217_DIAGNOSTICS={version:'1.2',chapter:'Chapter 1: The Room',puzzlePath:['clock 02:17','cabinet 0217','physical fuse pickup','install fuse','circuit','CRT ○△□','symbol panel','crank','mechanism','key','Operator chase','door'],offlineRuntime:true,importedKenneyModels:Object.keys(window.KENNEY_MESHES||{})};
})();