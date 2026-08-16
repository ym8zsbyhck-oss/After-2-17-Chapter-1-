(() => {
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const screens={menu:$('#menu'),settings:$('#settings'),credits:$('#credits'),game:$('#game')};
const SAVE='after0217_ch1_v1_save', SET='after0217_ch1_v1_settings';
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
const player={x:0,z:3.2,yaw:0,pitch:0}, move={x:0,y:0};
const flags0={clock:false,cabinet:false,fuse:false,circuit:false,powered:false,computer:false,symbols:false,crank:false,shutter:false,radio:false,key:false,ended:false};let flags={...flags0};
let current=null,chairX=-3.55,chairMoved=false;
const monster={active:false,preview:false,x:4.9,z:3.55,yaw:0,speed:.72};
const objects=[
 {id:'door',label:'Запертая дверь',x:2.75,z:-4.36,r:2.15,model:'door',y:0,yaw:0},
 {id:'clock',label:'Настенные часы',x:-2.55,z:-4.34,r:2.1,model:'clock',y:2.2,yaw:0,scale:1},
 {id:'cabinet',label:'Шкафчик с кодовым замком',x:.05,z:-4.12,r:2.2,model:'cabinet',y:0,yaw:0},
 {id:'fusebox',label:'Электрощиток',x:5.82,z:.45,r:2.0,model:'fusebox',y:1.15,yaw:-Math.PI/2},
 {id:'computer',label:'Старый CRT-монитор',x:-3.55,z:1.37,r:2.0,imported:'computerScreen',y:.83,yaw:Math.PI,scale:2.25,tex:'metal'},
 {id:'panel',label:'Странная панель',x:5.82,z:-2.25,r:2.0,model:'symbolPanel',y:1.0,yaw:-Math.PI/2},
 {id:'radio',label:'Старое радио',x:-5.20,z:-1.28,r:1.75,imported:'radio',y:.92,yaw:Math.PI/2,scale:2.45,tex:'metal'},
 {id:'crank',label:'Металлическая рукоятка',x:5.15,z:-2.32,r:1.75,model:'crank',y:.12,yaw:0,hidden:()=>!flags.symbols||flags.crank},
 {id:'shutter',label:'Ручной механизм',x:-5.79,z:-2.55,r:1.85,model:'crankSocket',y:.72,yaw:Math.PI/2},
 {id:'key',label:'Старый ключ',x:-5.18,z:-2.12,r:1.75,model:'key',y:.08,yaw:0,hidden:()=>!flags.shutter||flags.key}
];
const decor=[
 {imported:'desk',x:-3.25,y:0,z:1.58,yaw:0,scale:2.85,tex:'wood'},
 {imported:'chair',x:()=>chairX,y:0,z:2.62,yaw:Math.PI,scale:2.30,tex:'wood'},
 {model:'sofa',x:3.65,y:0,z:2.88,yaw:-Math.PI/2},
 {imported:'bookcaseOpen',x:-5.58,y:0,z:-1.38,yaw:Math.PI/2,scale:2.35,tex:'wood'},
 {imported:'lampRoundFloor',x:4.85,y:0,z:2.55,yaw:0,scale:1.55,tex:'metal'},
 {imported:'computerKeyboard',x:-3.45,y:.80,z:1.18,yaw:Math.PI,scale:2.15,tex:'metal'},
 {imported:'computerMouse',x:-2.78,y:.81,z:1.20,yaw:Math.PI,scale:2.20,tex:'metal'},
 {model:'boxStack',x:4.65,y:0,z:-3.35,yaw:.12}
];
const blockers=[[-4.85,-2.25,1.0,1.92],[2.85,4.48,2.0,3.95],[-.72,.8,-4.45,-3.68],[4.2,5.2,-3.8,-2.9]];
function blocked(x,z){if(x<-5.7||x>5.7||z<-4.18||z>4.18)return true;return blockers.some(([x1,x2,z1,z2])=>x>x1&&x<x2&&z>z1&&z<z2)}

function compile(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}
function initGL(){if(gl)return;gl=canvas.getContext('webgl',{antialias:true,alpha:false,powerPreference:'high-performance'});if(!gl){alert('WebGL недоступен');return}const vs=`attribute vec3 aP;attribute vec3 aN;attribute vec2 aUV;uniform mat4 uM,uV,uP;varying vec3 vN;varying vec2 vUV;varying float vD;void main(){vec4 w=uM*vec4(aP,1.);vec4 e=uV*w;gl_Position=uP*e;vN=mat3(uM)*aN;vUV=aUV;vD=length(e.xyz);}`;const fs=`precision mediump float;varying vec3 vN;varying vec2 vUV;varying float vD;uniform vec3 uC;uniform float uUseTex;uniform sampler2D uTex;uniform float uPower;void main(){vec3 n=normalize(vN);vec3 l=normalize(vec3(-.35,.8,.22));float diff=max(dot(n,l),0.);float amb=.16+uPower*.12;vec3 base=uC;if(uUseTex>.5)base*=texture2D(uTex,vUV).rgb;float light=amb+diff*(.25+uPower*.38);vec3 col=base*light;float fog=clamp((vD-3.)/11.,0.,.82);col=mix(col,vec3(.018,.021,.020),fog);gl_FragColor=vec4(col,1.);}`;program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,vs));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fs));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);bufCube=meshBuffer(cubeMesh());bufCyl=meshBuffer(cylinderMesh(18));loadTex('wall','wall.webp');loadTex('floor','floor.webp');loadTex('wood','wood.webp');loadTex('metal','metal.webp');loadTex('leather','leather.webp');loadTex('fabric','fabric.webp');loadTex('carpet','carpet.webp');initImported();resize();addEventListener('resize',resize)}
function meshBuffer(m){const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(m),gl.STATIC_DRAW);return {b,count:m.length/8}}
function initImported(){if(!window.KENNEY_MESHES)return;for(const [name,data] of Object.entries(window.KENNEY_MESHES))importedBuffers[name]=meshBuffer(data)}
function cubeMesh(){const V=[];const faces=[[[0,0,1],[[-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5]]],[[0,0,-1],[[.5,-.5,-.5],[-.5,-.5,-.5],[-.5,.5,-.5],[.5,.5,-.5]]],[[1,0,0],[[.5,-.5,.5],[.5,-.5,-.5],[.5,.5,-.5],[.5,.5,.5]]],[[-1,0,0],[[-.5,-.5,-.5],[-.5,-.5,.5],[-.5,.5,.5],[-.5,.5,-.5]]],[[0,1,0],[[-.5,.5,.5],[.5,.5,.5],[.5,.5,-.5],[-.5,.5,-.5]]],[[0,-1,0],[[-.5,-.5,-.5],[.5,-.5,-.5],[.5,-.5,.5],[-.5,-.5,.5]]]];for(const [n,p] of faces){const uv=[[0,0],[1,0],[1,1],[0,1]],idx=[0,1,2,0,2,3];for(const i of idx)V.push(...p[i],...n,...uv[i])}return V}
function cylinderMesh(seg){const V=[];for(let i=0;i<seg;i++){const a=i/seg*Math.PI*2,b=(i+1)/seg*Math.PI*2,ca=Math.cos(a),sa=Math.sin(a),cb=Math.cos(b),sb=Math.sin(b);const qu=[[ca,-.5,sa],[cb,-.5,sb],[cb,.5,sb],[ca,.5,sa]],uv=[[i/seg,0],[(i+1)/seg,0],[(i+1)/seg,1],[i/seg,1]],ix=[0,1,2,0,2,3];for(const k of ix)V.push(...qu[k],ca,0,sa,...uv[k]);for(const top of [-.5,.5]){const ny=top>0?1:-1;const tri=top>0?[[0,top,0],[cb,top,sb],[ca,top,sa]]:[[0,top,0],[ca,top,sa],[cb,top,sb]];for(const p of tri)V.push(...p,0,ny,0,.5+p[0]*.5,.5+p[2]*.5)}}return V}
function loadTex(name,url){const t=gl.createTexture();textures[name]=t;gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([100,100,100,255]));const im=new Image();im.onload=()=>{gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,im);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.generateMipmap(gl.TEXTURE_2D)};im.src=url}
function resize(){if(!gl)return;const q=settings.quality,pr=Math.min(devicePixelRatio||1,2)*q;const w=Math.max(480,Math.floor(innerWidth*pr)),h=Math.max(270,Math.floor(innerHeight*pr));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}gl.viewport(0,0,w,h)}
function M4(){return new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1])}function mul(a,b){const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)o[c*4+r]=a[0*4+r]*b[c*4+0]+a[1*4+r]*b[c*4+1]+a[2*4+r]*b[c*4+2]+a[3*4+r]*b[c*4+3];return o}function tr(x,y,z){const m=M4();m[12]=x;m[13]=y;m[14]=z;return m}function sc(x,y,z){const m=M4();m[0]=x;m[5]=y;m[10]=z;return m}function rx(a){const m=M4(),c=Math.cos(a),s=Math.sin(a);m[5]=c;m[6]=s;m[9]=-s;m[10]=c;return m}function ry(a){const m=M4(),c=Math.cos(a),s=Math.sin(a);m[0]=c;m[2]=-s;m[8]=s;m[10]=c;return m}function rz(a){const m=M4(),c=Math.cos(a),s=Math.sin(a);m[0]=c;m[1]=s;m[4]=-s;m[5]=c;return m}function persp(fov,asp,n,f){const t=1/Math.tan(fov/2),m=new Float32Array(16);m[0]=t/asp;m[5]=t;m[10]=(f+n)/(n-f);m[11]=-1;m[14]=2*f*n/(n-f);return m}
function modelMat(x,y,z,yaw=0,sx=1,sy=1,sz=1,rot=[0,0,0]){return mul(tr(x,y,z),mul(ry(yaw),mul(rx(rot[0]||0),mul(rz(rot[2]||0),sc(sx,sy,sz)))))}
function bindBuf(m){gl.bindBuffer(gl.ARRAY_BUFFER,m.b);const ap=gl.getAttribLocation(program,'aP'),an=gl.getAttribLocation(program,'aN'),au=gl.getAttribLocation(program,'aUV');gl.enableVertexAttribArray(ap);gl.vertexAttribPointer(ap,3,gl.FLOAT,false,32,0);gl.enableVertexAttribArray(an);gl.vertexAttribPointer(an,3,gl.FLOAT,false,32,12);gl.enableVertexAttribArray(au);gl.vertexAttribPointer(au,2,gl.FLOAT,false,32,24)}
function drawPart(part,base){const p=part.p||[0,0,0],d=part.d||[1,1,1],r=part.r||[0,0,0];let local=modelMat(p[0],p[1],p[2],r[1]||0,d[0],d[1],d[2],r);const mm=mul(base,local);gl.uniformMatrix4fv(gl.getUniformLocation(program,'uM'),false,mm);let col=part.c||[.5,.5,.5];const tm=performance.now();if(part.tag==='operatorScreen'){const n=.022+((Math.sin(tm*.061)+Math.sin(tm*.017))*0.5+1)*.010;col=[n,n*1.12,n*1.03]}else if(part.tag==='operatorStatic'){const n=.09+((Math.sin(tm*.089)+1)*.5)*.11;col=[n,n*1.10,n]}else if(part.tag==='operatorSensor'){const n=.68+((Math.sin(tm*.012)+1)*.5)*.28;col=[n,n,n*.92]}gl.uniform3fv(gl.getUniformLocation(program,'uC'),col);const use=part.tex&&textures[part.tex];gl.uniform1f(gl.getUniformLocation(program,'uUseTex'),use?1:0);if(use){gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,use);gl.uniform1i(gl.getUniformLocation(program,'uTex'),0)}const b=part.s==='cyl'?bufCyl:bufCube;bindBuf(b);gl.drawArrays(gl.TRIANGLES,0,b.count)}
function drawModel(name,x,y,z,yaw=0,scale=1){const mod=LOCAL_MODELS[name];if(!mod)return;const base=modelMat(x,y,z,yaw,scale,scale,scale);for(const p of mod.parts)drawPart(p,base)}
function drawImported(name,x,y,z,yaw=0,scale=1,tex='wood',color=[.78,.78,.74]){const b=importedBuffers[name];if(!b)return;const mm=modelMat(x,y,z,yaw,scale,scale,scale);gl.uniformMatrix4fv(gl.getUniformLocation(program,'uM'),false,mm);gl.uniform3fv(gl.getUniformLocation(program,'uC'),color);const use=tex&&textures[tex];gl.uniform1f(gl.getUniformLocation(program,'uUseTex'),use?1:0);if(use){gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,use);gl.uniform1i(gl.getUniformLocation(program,'uTex'),0)}bindBuf(b);gl.drawArrays(gl.TRIANGLES,0,b.count)}
function drawEntity(e){const x=typeof e.x==='function'?e.x():e.x;if(e.imported)drawImported(e.imported,x,e.y||0,e.z,e.yaw||0,e.scale||1,e.tex||'wood',e.color||[.78,.78,.74]);else drawModel(e.model,x,e.y||0,e.z,e.yaw||0,e.scale||1)}
function drawBox(x,y,z,w,h,d,c,tex=null){drawPart({s:'box',p:[0,0,0],d:[w,h,d],c,tex},modelMat(x,y,z,0))}
function render(){gl.clearColor(.008,.010,.010,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.enable(gl.CULL_FACE);gl.useProgram(program);const P=persp(67*Math.PI/180,canvas.width/canvas.height,.05,40);const V=mul(rx(-player.pitch),mul(ry(-player.yaw),tr(-player.x,-1.62,-player.z)));gl.uniformMatrix4fv(gl.getUniformLocation(program,'uP'),false,P);gl.uniformMatrix4fv(gl.getUniformLocation(program,'uV'),false,V);gl.uniform1f(gl.getUniformLocation(program,'uPower'),flags.powered?1:0);
 // room
 drawBox(0,-.05,0,12,.10,9,[.48,.46,.42],'floor');drawBox(0,3.22,0,12,.10,9,[.08,.085,.08]);drawBox(0,1.6,-4.5,12,3.2,.14,[.50,.47,.40],'wall');drawBox(0,1.6,4.5,12,3.2,.14,[.50,.47,.40],'wall');drawBox(-6,1.6,0,.14,3.2,9,[.50,.47,.40],'wall');drawBox(6,1.6,0,.14,3.2,9,[.50,.47,.40],'wall');
 // rug — imported CC0 dirty carpet texture
 drawBox(.65,.015,1.1,2.8,.03,1.65,[.72,.70,.64],'carpet');
 // decor + interactives
 for(const d of decor)drawEntity(d);for(const o of objects){if(o.hidden&&o.hidden())continue;drawEntity(o)}
 // "Operator": original geometry, imported CC0 workwear fabric + rusted metal; procedural CRT face
 if(monster.active||monster.preview)drawModel('operator',monster.x,0,monster.z,monster.yaw,1.02);
 // simple ceiling fixture + emergency beacon
 drawBox(-.3,3.10,.1,1.15,.08,.20,flags.powered?[.70,.67,.54]:[.16,.17,.15]);drawBox(2.75,2.55,-4.34,1.58,.10,.24,[.11,.12,.11]);drawBox(2.02,1.29,-4.34,.10,2.58,.24,[.11,.12,.11]);drawBox(3.48,1.29,-4.34,.10,2.58,.24,[.11,.12,.11]);
 // darkness overlay via clear shader brightness; fake flashlight omitted
}
function step(dt){const sp=1.65,f=move.y,s=move.x;const dx=(Math.sin(player.yaw)*f+Math.cos(player.yaw)*s)*sp*dt,dz=(-Math.cos(player.yaw)*f+Math.sin(player.yaw)*s)*sp*dt;const nx=player.x+dx,nz=player.z+dz;if(!blocked(nx,player.z))player.x=nx;if(!blocked(player.x,nz))player.z=nz;
 if(monster.active){const mx=player.x-monster.x,mz=player.z-monster.z,d=Math.hypot(mx,mz)||1;monster.yaw=Math.atan2(mx,-mz);monster.x+=mx/d*monster.speed*dt;monster.z+=mz/d*monster.speed*dt;if(d<.68)caughtPlayer()}}

function updateFocus(){let best=null,score=1e9;for(const o of objects){if(o.hidden&&o.hidden())continue;const dx=o.x-player.x,dz=o.z-player.z,dist=Math.hypot(dx,dz);if(dist>o.r)continue;const ang=Math.atan2(dx,-dz);let d=ang-player.yaw;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;const sc=Math.abs(d)*2+dist*.12;if(Math.abs(d)<.42&&sc<score){best=o;score=sc}}current=best;$('#focusLabel').textContent=best?best.label:'';$('#focusLabel').classList.toggle('show',!!best);$('#actionBtn').classList.toggle('ready',!!best)}
function loop(t){if(!running||paused)return;const dt=Math.min(.035,(t-last)/1000||0);last=t;step(dt);updateFocus();render();requestAnimationFrame(loop)}
function applySettings(){document.documentElement.style.setProperty('--uiScale',settings.uiScale);$('#grainLayer').style.display=settings.grain?'block':'none';if(master)master.gain.value=settings.volume*.12;if(menuThemeStarted&&!menuTheme.paused)fadeMenuTheme(clamp(settings.volume*.30,0,.34),120,false);if(gl)resize()}

// ---------- game state ----------
function objective(){if(!flags.clock)return setObj('Осмотритесь в комнате');if(!flags.cabinet)return setObj('Найдите, где пригодится 02:17');if(!flags.circuit)return setObj('Замкните цепь в электрощитке');if(!flags.computer)return setObj('Проверьте компьютер');if(!flags.symbols)return setObj('Найдите панель с тремя символами');if(!flags.crank)return setObj('Найдите то, что открылось у панели');if(!flags.shutter)return setObj('Найдите механизм для рукоятки');if(!flags.key)return setObj('Заберите то, что открыл механизм');if(monster.active)return setObj('БЕГИТЕ К ДВЕРИ');setObj('Откройте дверь')}
function setObj(t){$('#objective').textContent=t}
function inv(){const a=[];if(flags.fuse&&!flags.circuit)a.push('ПРЕДОХРАНИТЕЛЬ');if(flags.crank&&!flags.shutter)a.push('РУКОЯТКА');if(flags.key)a.push('КЛЮЧ');$('#inventory').innerHTML=a.map(x=>`<span class="invItem">${x}</span>`).join('')}
function toast(t,ms=1900){const e=$('#toast');e.textContent=t;e.classList.add('show');clearTimeout(toast.tm);toast.tm=setTimeout(()=>e.classList.remove('show'),ms)}
function flash(op=.55,ms=90){const e=$('#flash');e.style.opacity=op;setTimeout(()=>e.style.opacity=0,ms)}
function saveGame(){store.set(SAVE,JSON.stringify({flags,player:{x:player.x,z:player.z,yaw:player.yaw,pitch:player.pitch},chairX,v:4}));updateContinue()}
function loadGame(){try{const s=JSON.parse(store.get(SAVE));if(!s)return false;flags={...flags0,...s.flags};Object.assign(player,s.player||{});chairX=s.chairX??-3.55;monster.active=false;monster.preview=false;objective();inv();return true}catch{return false}}
function resetGame(){flags={...flags0};Object.assign(player,{x:0,z:3.2,yaw:0,pitch:0});chairX=-3.55;chairMoved=false;monster.active=false;monster.preview=false;monster.x=4.9;monster.z=3.55;objective();inv()}
function start(cont){initGL();show('game');running=true;paused=true;if(cont&&!loadGame())resetGame();else if(!cont)resetGame();$('#introOverlay').classList.toggle('hidden',cont);$('#pauseOverlay').classList.add('hidden');$('#endingOverlay').classList.add('hidden');$('#caughtOverlay').classList.add('hidden');if(cont){paused=false;last=performance.now();requestAnimationFrame(loop)}}
$('#newGameBtn').onclick=()=>start(false);$('#continueBtn').onclick=()=>start(true);$('#enterRoomBtn').onclick=()=>{audio();$('#introOverlay').classList.add('hidden');paused=false;last=performance.now();toast('Найдите выход.',1500);requestAnimationFrame(loop)};
$('#pauseBtn').onclick=()=>{if(!running)return;paused=true;move.x=move.y=0;resetStick();$('#pauseOverlay').classList.remove('hidden')};$('#resumeBtn').onclick=()=>{$('#pauseOverlay').classList.add('hidden');paused=false;last=performance.now();requestAnimationFrame(loop)};$('#pauseSettingsBtn').onclick=()=>{$('#pauseOverlay').classList.add('hidden');settingsReturn='game';show('settings')};$('#exitBtn').onclick=()=>{saveGame();running=false;show('menu');$('#pauseOverlay').classList.add('hidden')};

function interact(){if(!current||paused)return;audio();tone(260,.045,.05);const id=current.id;
 if(id==='clock'){flags.clock=true;toast('Часы остановились на 02:17.',2500);objective();saveGame();setTimeout(()=>{flash(.18,60);tone(70,.09,.16,'triangle')},700)}
 else if(id==='cabinet'){if(flags.cabinet){toast('Шкафчик уже открыт.');return}openKeypad()}
 else if(id==='fusebox'){if(!flags.fuse&&!flags.circuit){toast('Внутри пустое гнездо для предохранителя.');return}if(flags.circuit){toast('Цепь работает.');return}openCircuit()}
 else if(id==='computer'){if(!flags.powered){toast('Нет питания.');return}openComputer()}
 else if(id==='panel'){if(!flags.computer){toast('Три кнопки. Но порядок неизвестен.');return}openSymbols()}
 else if(id==='radio'){if(!flags.powered){toast('Радио молчит.');return}flags.radio=true;toast('91.3 МГц: «НЕ ОТКРЫВАЙТЕ ДВЕРЬ ПОСЛЕ 02:17»',3400);tone(91,.30,.12,'sawtooth');setTimeout(()=>tone(480,.05,.05,'square'),340);saveGame()}
 else if(id==='crank'){flags.crank=true;inv();objective();toast('Вы взяли тяжёлую рукоятку.',2100);tone(410,.10,.09,'triangle');saveGame()}
 else if(id==='shutter'){if(!flags.crank&&!flags.shutter){toast('Квадратный вал. Здесь не хватает рукоятки.');return}if(flags.shutter){toast('Механизм уже открыт.');return}flags.shutter=true;flags.crank=false;inv();objective();scrape();flash(.28,80);toast('За книжным шкафом открылся узкий отсек.',2600);saveGame()}
 else if(id==='key'){flags.key=true;inv();toast('Вы подняли ключ.');tone(460,.12,.10,'triangle');startChase();saveGame()}
 else if(id==='door'){if(!flags.key){toast('Заперто.');tone(78,.11,.16,'triangle');return}finish()}}
$('#actionBtn').addEventListener('pointerdown',e=>{e.preventDefault();interact()});

// keypad
let code='';function openKeypad(){paused=true;code='';updCode();$('#keypadOverlay').classList.remove('hidden')}function updCode(){$('#keypadDisplay').textContent=(code+'––––').slice(0,4)}function closeModal(id){$(id).classList.add('hidden');paused=false;last=performance.now();requestAnimationFrame(loop)}
const kg=$('#keypadGrid');['1','2','3','4','5','6','7','8','9','⌫','0','OK'].forEach(n=>{const b=document.createElement('button');b.textContent=n;b.onpointerdown=e=>{e.preventDefault();audio();tone(300,.04,.04);if(n==='⌫')code=code.slice(0,-1);else if(n==='OK'){if(code==='0217'){flags.cabinet=true;flags.fuse=true;inv();objective();flash(.24,80);toast('Внутри лежит предохранитель.',2200);saveGame();closeModal('#keypadOverlay')}else{code='';flash(.35,60);toast('Неверный код.')}}else if(code.length<4)code+=n;updCode()};kg.appendChild(b)});$('#keypadClose').onclick=()=>closeModal('#keypadOverlay');

// circuit puzzle: valid path 0-1-4-7-8, blocked 2,3,5,6
const valid=[0,1,4,7,8], blockedNodes=new Set([2,3,5,6]);let path=[];const cb=$('#circuitBoard');for(let i=0;i<9;i++){const n=document.createElement('div');n.className='cnode'+(blockedNodes.has(i)?' blocked':' active')+(i===0?' start':'')+(i===8?' end':'');n.dataset.i=i;n.textContent=blockedNodes.has(i)?'×':'●';cb.appendChild(n)}
function drawCircuit(){$$('.cnode').forEach(n=>n.classList.toggle('path',path.includes(+n.dataset.i)));$('#circuitStatus').textContent=path.length?'Цепь: '+path.map(i=>i+1).join(' → '):'Проведите пальцем по контактам.'}
function near(a,b){const ax=a%3,ay=Math.floor(a/3),bx=b%3,by=Math.floor(b/3);return Math.abs(ax-bx)+Math.abs(ay-by)===1}
function addNode(i){if(blockedNodes.has(i))return;if(path.length===0){if(i!==0)return;path=[0]}else{const last=path[path.length-1];if(i===last)return;if(!near(last,i)||path.includes(i))return;path.push(i)}drawCircuit();if(path[path.length-1]===8){if(JSON.stringify(path)===JSON.stringify(valid)){setTimeout(circuitWin,180)}else{$('#circuitStatus').textContent='Ток не проходит. Попробуйте другой путь.';tone(92,.13,.16,'triangle')}}}
let circuitDown=false;cb.addEventListener('pointerdown',e=>{e.preventDefault();circuitDown=true;path=[];const n=e.target.closest('.cnode');if(n)addNode(+n.dataset.i);cb.setPointerCapture?.(e.pointerId)});cb.addEventListener('pointermove',e=>{if(!circuitDown)return;const el=document.elementFromPoint(e.clientX,e.clientY)?.closest?.('.cnode');if(el)addNode(+el.dataset.i)});cb.addEventListener('pointerup',()=>circuitDown=false);$('#circuitReset').onclick=()=>{path=[];drawCircuit()};
function openCircuit(){paused=true;path=[];drawCircuit();$('#circuitOverlay').classList.remove('hidden')};$('#circuitClose').onclick=()=>closeModal('#circuitOverlay');function circuitWin(){flags.circuit=true;flags.fuse=false;flags.powered=true;inv();objective();$('#circuitOverlay').classList.add('hidden');flash(.7,80);setTimeout(()=>flash(.42,70),170);setTimeout(()=>flash(.28,60),360);tone(55,.22,.20,'triangle');setTimeout(()=>tone(840,.08,.07,'square'),480);toast('Электричество вернулось.',2200);monster.preview=true;monster.x=2.75;monster.z=-3.35;monster.yaw=Math.PI;setTimeout(()=>{if(monster.preview){flash(.60,80);monster.preview=false;tone(48,.22,.20,'triangle')}},1250);saveGame();paused=false;last=performance.now();requestAnimationFrame(loop)}

function openComputer(){paused=true;$('#computerOverlay').classList.remove('hidden');tone(720,.05,.04,'square');setTimeout(()=>tone(860,.05,.04,'square'),90)}$('#computerClose').onclick=()=>{if(!flags.computer){flags.computer=true;chairX=-3.18;chairMoved=true;scrape();setTimeout(knock,430);toast('За спиной сдвинулся стул.',2200);objective();saveGame()}closeModal('#computerOverlay')};

let seq=[];const wanted=['circle','triangle','square'];function updSeq(){$('#symbolInput').textContent=(seq.map(s=>s==='circle'?'○':s==='triangle'?'△':'□').join(' ')+' · · ·').split(' ').slice(0,3).join(' ')}function openSymbols(){paused=true;seq=[];updSeq();$('#symbolOverlay').classList.remove('hidden')}$$('[data-symbol]').forEach(b=>b.onpointerdown=e=>{e.preventDefault();if(seq.length>=3)return;seq.push(b.dataset.symbol);tone(380+seq.length*80,.06,.07,'triangle');updSeq();if(seq.length===3)setTimeout(()=>{if(seq.every((x,i)=>x===wanted[i])){flags.symbols=true;objective();flash(.38,70);toast('Панель отщёлкнула маленький металлический лоток.',2400);tone(130,.16,.14,'triangle');saveGame();closeModal('#symbolOverlay')}else{seq=[];updSeq();flash(.25,60);toast('Последовательность сброшена.')}},180)});$('#symbolReset').onclick=()=>{seq=[];updSeq()};$('#symbolClose').onclick=()=>closeModal('#symbolOverlay');
function startChase(){monster.active=true;monster.preview=false;monster.x=4.85;monster.z=3.70;monster.speed=.74;knock();setTimeout(scrape,220);flash(.65,90);toast('БЕГИТЕ К ДВЕРИ.',2000);objective()}
function caughtPlayer(){if(paused||!monster.active)return;monster.active=false;paused=true;move.x=move.y=0;resetStick();flash(.82,120);tone(46,.45,.30,'sawtooth');setTimeout(()=>$('#caughtOverlay').classList.remove('hidden'),160)}
$('#caughtRetryBtn').onclick=()=>{$('#caughtOverlay').classList.add('hidden');player.x=-5.0;player.z=-2.25;player.yaw=1.35;monster.x=4.85;monster.z=3.70;monster.active=true;paused=false;last=performance.now();toast('БЕГИТЕ.',1300);objective();requestAnimationFrame(loop)};
function finish(){flags.ended=true;monster.active=false;paused=true;flash(.85,140);setTimeout(()=>$('#endingOverlay').classList.remove('hidden'),260);store.remove(SAVE);updateContinue()}$('#endingMenuBtn').onclick=()=>{running=false;$('#endingOverlay').classList.add('hidden');show('menu')};

// ---------- iOS touch controls only ----------
let stickId=null,stickOrigin={x:0,y:0};const stick=$('#stick'),knob=$('#stickKnob'),lz=$('#leftZone');function resetStick(){stickId=null;move.x=move.y=0;knob.style.transform='translate(-50%,-50%)'}function joy(t){const dx=t.clientX-stickOrigin.x,dy=t.clientY-stickOrigin.y,m=38,l=Math.hypot(dx,dy)||1,k=Math.min(1,m/l),x=dx*k,y=dy*k;knob.style.transform=`translate(calc(-50% + ${x}px),calc(-50% + ${y}px))`;move.x=clamp(dx/m,-1,1);move.y=clamp(-dy/m,-1,1)}
lz.addEventListener('touchstart',e=>{if(paused)return;const t=e.changedTouches[0],r=stick.getBoundingClientRect();stickId=t.identifier;stickOrigin={x:r.left+r.width/2,y:r.top+r.height/2};joy(t);e.preventDefault()},{passive:false});lz.addEventListener('touchmove',e=>{for(const t of e.changedTouches)if(t.identifier===stickId)joy(t);e.preventDefault()},{passive:false});lz.addEventListener('touchend',e=>{for(const t of e.changedTouches)if(t.identifier===stickId)resetStick();e.preventDefault()},{passive:false});
let lookId=null,lx=0,ly=0;const lookZoneEl=$('#lookZone');lookZoneEl.addEventListener('touchstart',e=>{if(paused)return;const t=e.changedTouches[0];lookId=t.identifier;lx=t.clientX;ly=t.clientY;e.preventDefault()},{passive:false});lookZoneEl.addEventListener('touchmove',e=>{for(const t of e.changedTouches)if(t.identifier===lookId){const dx=t.clientX-lx,dy=t.clientY-ly;lx=t.clientX;ly=t.clientY;player.yaw+=dx*.0040*settings.sensitivity;player.pitch=clamp(player.pitch+dy*.0034*settings.sensitivity,-.72,.72)}e.preventDefault()},{passive:false});lookZoneEl.addEventListener('touchend',e=>{lookId=null;e.preventDefault()},{passive:false});

applySettings();updateContinue();
if('serviceWorker' in navigator && location.protocol!=='file:'){navigator.serviceWorker.register('./sw.js').catch(()=>{});}
// tiny public test surface; no cheats exposed in normal UI
window.AFTER0217_DIAGNOSTICS={version:'1.0',chapter:'Chapter 1: The Room',puzzlePath:['clock 02:17','cabinet 0217','circuit','CRT ○△□','symbol panel','crank','mechanism','key','Operator chase','door'],offlineRuntime:true,importedKenneyModels:Object.keys(window.KENNEY_MESHES||{})};
})();