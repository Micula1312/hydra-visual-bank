import {patches} from '../shared/patches.js';
const canvas=document.querySelector('#hydra'), status=document.querySelector('#status');
const channel=new BroadcastChannel('hydra-visual-bank-v1');
let hydra,active='corrupted',params={speed:.5,feedback:.5,distortion:.3},blackout=false;
function run(){if(!hydra)return;const patch=patches.find(p=>p.id===active)||patches[0];try{hush();const fn=new Function('p',patch.code);fn(params);status.textContent='HYDRA / '+patch.name;setTimeout(()=>status.style.opacity='0',2200)}catch(e){status.style.opacity='1';status.textContent='PATCH ERROR / '+e.message;console.error(e)}}
function apply(msg){if(msg.type==='patch'){active=msg.id;blackout=false;run()}if(msg.type==='params'){params={...params,...msg.params};run()}if(msg.type==='code'){try{hush();new Function('p',msg.code)(params);status.textContent='HYDRA / LIVE EDIT'}catch(e){status.textContent='CODE ERROR / '+e.message}}if(msg.type==='blackout'){blackout=!!msg.value;canvas.style.visibility=blackout?'hidden':'visible'}if(msg.type==='request-state')channel.postMessage({type:'screen-state',active,params})}
channel.onmessage=e=>apply(e.data);
try{hydra=new Hydra({canvas,detectAudio:false,makeGlobal:true,autoLoop:true});run();channel.postMessage({type:'screen-ready',active,params})}catch(e){status.textContent='HYDRA INIT ERROR / '+e.message}
document.addEventListener('keydown',e=>{if(e.key==='f')document.documentElement.requestFullscreen?.();if(e.key==='Escape')document.exitFullscreen?.()});