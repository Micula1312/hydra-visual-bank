import {AudioEngine} from './audio-engine.js';
import {createFx} from './fx-engine.js';
import {patches} from '../shared/patches.js';
const canvas=document.querySelector('#hydra'),host=document.querySelector('#three'),status=document.querySelector('#status');
const channel=new BroadcastChannel('hydra-visual-bank-v1');
const fx=createFx(document.body);let audioState={level:0,bass:0,mid:0,high:0},audioOn=false;const audio=new AudioEngine(v=>{audioState=v;channel.postMessage({type:'audio-level',data:v})});let mapping={enabled:false,band:'bass',target:'distortion',amount:.7};let lastAudioUpdate=0;
let hydra,active='corrupted',params={speed:.5,feedback:.5,distortion:.3},blackout=false,disposeThree=null,customCode=null,revision=0;
function report(message){status.style.opacity='1';status.textContent=message;setTimeout(()=>status.style.opacity='0',2500)}
async function run(){const ticket=++revision;const patch=patches.find(p=>p.id===active)||patches[0];
 if(disposeThree){disposeThree();disposeThree=null}host.style.display='none';canvas.style.display='block';
 if(patch.engine==='three'){canvas.style.display='none';host.style.display='block';try{const mod=await import('./three-engine.js');if(ticket!==revision)return;disposeThree=mod.createParticleStorm(host,()=>params);report('THREE / '+patch.name)}catch(e){report('THREE ERROR / '+e.message)}}
 else if(hydra){try{hush();new Function('p',customCode||patch.code)(params);report('HYDRA / '+patch.name)}catch(e){report('PATCH ERROR / '+e.message);console.error(e)}}
 setBlackout(blackout)
}
function setBlackout(value){blackout=!!value;canvas.style.visibility=blackout?'hidden':'visible';host.style.visibility=blackout?'hidden':'visible'}
function apply(msg){if(msg.type==='patch'){if(!patches.some(p=>p.id===msg.id))return;active=msg.id;customCode=null;run()}
 if(msg.type==='params'){params={...params,...msg.params};if((patches.find(p=>p.id===active)?.engine||'hydra')==='hydra')run()}
 if(msg.type==='code'){if(patches.find(p=>p.id===active)?.engine!=='hydra'){report('THREE EDITOR / COMING NEXT');return}customCode=msg.code;run()}
 if(msg.type==='blackout')setBlackout(msg.value);
 if(msg.type==='fx')fx.apply(msg.state);
 if(msg.type==='audio-devices')navigator.mediaDevices?.enumerateDevices().then(devices=>channel.postMessage({type:'audio-devices',devices:devices.filter(d=>d.kind==='audioinput').map(d=>({deviceId:d.deviceId,label:d.label}))})).catch(e=>channel.postMessage({type:'audio-devices',devices:[],error:e.message}));
 if(msg.type==='audio-start')audio.start(msg.deviceId).then(()=>{audioOn=true;channel.postMessage({type:'audio-status',enabled:true});apply({type:'audio-devices'})}).catch(e=>{audioOn=false;channel.postMessage({type:'audio-status',enabled:false,error:e.message})});
 if(msg.type==='audio-stop')audio.stop().then(()=>{audioOn=false;channel.postMessage({type:'audio-status',enabled:false})});
 if(msg.type==='audio-map')mapping={...mapping,...msg.mapping};
 if(msg.type==='request-state')channel.postMessage({type:'screen-state',active,params,blackout})}
channel.onmessage=e=>apply(e.data);
try{hydra=new Hydra({canvas,detectAudio:false,makeGlobal:true,autoLoop:true});run();channel.postMessage({type:'screen-ready',active,params})}catch(e){report('HYDRA ERROR / '+e.message)}
document.addEventListener('keydown',e=>{if(e.target.matches('input,textarea'))return;
 const n=Number(e.key);if(n>=1&&n<=patches.length)apply({type:'patch',id:patches[n-1].id});
 if(e.key.toLowerCase()==='b')apply({type:'blackout',value:!blackout});
 if(e.key.toLowerCase()==='f')document.documentElement.requestFullscreen?.();
 if(e.key==='ArrowRight'||e.key==='ArrowLeft'){const i=patches.findIndex(p=>p.id===active),d=e.key==='ArrowRight'?1:-1;apply({type:'patch',id:patches[(i+d+patches.length)%patches.length].id})}
 channel.postMessage({type:'screen-state',active,params,blackout})
});
setInterval(()=>{if(!audioOn||!mapping.enabled)return;const now=performance.now();if(now-lastAudioUpdate<90)return;lastAudioUpdate=now;const v=Math.max(0,Math.min(1,audioState[mapping.band]||0));params[mapping.target]=Math.max(0,Math.min(1,v*mapping.amount*3));if(patches.find(p=>p.id===active)?.engine==='hydra')run();channel.postMessage({type:'audio-param',target:mapping.target,value:params[mapping.target]})},100);
