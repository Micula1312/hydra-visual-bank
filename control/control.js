import {patches} from '../shared/patches.js';
const channel=new BroadcastChannel('hydra-visual-bank-v1'),patchList=document.querySelector('#patches'),editor=document.querySelector('#code'),sliders=document.querySelector('#sliders');
let active=patches[0].id,params={speed:.5,feedback:.5,distortion:.3},blackout=false;
function send(data){channel.postMessage(data)}
function render(){patchList.replaceChildren();for(const patch of patches){const btn=document.createElement('button');btn.className='patch'+(patch.id===active?' active':'');btn.innerHTML='<strong></strong><small></small>';btn.querySelector('strong').textContent=patch.name+' / '+patch.engine.toUpperCase();btn.querySelector('small').textContent=patch.description;btn.onclick=()=>{active=patch.id;editor.value=patch.code;render();send({type:'patch',id:active})};patchList.append(btn)}}
const inputs={};
for(const key of ['speed','feedback','distortion']){const div=document.createElement('div');div.className='param';const label=document.createElement('label'),value=document.createElement('span'),input=document.createElement('input');label.textContent=key.toUpperCase();label.append(value);input.type='range';input.min=0;input.max=100;input.value=params[key]*100;value.textContent=input.value+'%';input.oninput=()=>{params[key]=Number(input.value)/100;value.textContent=input.value+'%';send({type:'params',params})};div.append(label,input);sliders.append(div);inputs[key]={input,value}}
document.querySelector('#run').onclick=()=>{if(patches.find(p=>p.id===active)?.engine==='three'){alert('Three.js editing will be added in the next phase.');return}send({type:'code',code:editor.value})};
document.querySelector('#reset').onclick=()=>{editor.value=patches.find(p=>p.id===active).code;send({type:'patch',id:active})};
function showBlackout(){document.querySelector('#blackout').textContent=blackout?'RESTORE OUTPUT':'BLACKOUT'}
document.querySelector('#blackout').onclick=()=>{blackout=!blackout;send({type:'blackout',value:blackout});showBlackout()};
document.querySelector('#open-screen').onclick=()=>window.open('../screen/','_blank');
document.querySelector('#save').onclick=()=>{const blob=new Blob([editor.value+'\n'],{type:'text/javascript'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=active+'-custom.js';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
channel.onmessage=e=>{const d=e.data;if(d.type==='screen-ready'||d.type==='screen-state'){document.querySelector('#connection').textContent='SCREEN CONNECTED / SAME DEVICE';if(d.active&&patches.some(p=>p.id===d.active)){active=d.active;editor.value=patches.find(p=>p.id===active).code;render()}if(d.params){params={...params,...d.params};for(const k in inputs){inputs[k].input.value=Math.round(params[k]*100);inputs[k].value.textContent=inputs[k].input.value+'%'}}if(typeof d.blackout==='boolean'){blackout=d.blackout;showBlackout()}}};
editor.value=patches[0].code;render();send({type:'request-state'});
const fxState={color:'#ff2d83',opacity:0,blend:'screen',effects:[]};
const palette=['#ff2d83','#baff42','#ffed00','#285bff','#ff3600','#ffffff','#000000'];
for(const color of palette){const b=document.createElement('button');b.textContent='●';b.style.cssText='font-size:25px;color:'+color+';background:#222;border:1px solid #666';b.onclick=()=>{fxState.color=color;send({type:'fx',state:fxState})};document.querySelector('#colors').append(b)}
document.querySelector('#overlay-opacity').oninput=e=>{fxState.opacity=Number(e.target.value)/100;send({type:'fx',state:fxState})};
document.querySelector('#blend').onchange=e=>{fxState.blend=e.target.value;send({type:'fx',state:fxState})};
for(const effect of ['bloom','rgb','pixel']){const b=document.createElement('button');b.textContent=effect.toUpperCase();b.onclick=()=>{fxState.effects=fxState.effects.includes(effect)?fxState.effects.filter(x=>x!==effect):[...fxState.effects,effect];b.style.borderColor=fxState.effects.includes(effect)?'#baff42':'#888';send({type:'fx',state:fxState})};document.querySelector('#effects').append(b)}
document.querySelector('#mic-start').onclick=()=>{send({type:'audio-start'});document.querySelector('#audio-status').textContent='Requesting microphone in SCREEN...'};
document.querySelector('#mic-stop').onclick=()=>send({type:'audio-stop'});
function sendMapping(){send({type:'audio-map',mapping:{enabled:document.querySelector('#audio-enabled').checked,band:document.querySelector('#audio-band').value,target:document.querySelector('#audio-target').value,amount:Number(document.querySelector('#audio-amount').value)/100}})}
for(const id of ['audio-enabled','audio-band','audio-target','audio-amount'])document.getElementById(id).addEventListener('input',sendMapping);
channel.addEventListener('message',e=>{if(e.data.type==='audio-level')document.querySelector('#meter-fill').style.width=Math.round((e.data.data.level||0)*100)+'%';if(e.data.type==='audio-status')document.querySelector('#audio-status').textContent=e.data.enabled?'MICROPHONE ACTIVE':('AUDIO OFF '+(e.data.error||''))});

const deviceSelect=document.querySelector('#audio-device');
document.querySelector('#audio-refresh').onclick=()=>send({type:'audio-devices'});
document.querySelector('#mic-start').onclick=()=>{send({type:'audio-start',deviceId:deviceSelect.value||undefined});document.querySelector('#audio-status').textContent='Select and authorize microphone in SCREEN...'};
channel.addEventListener('message',e=>{const d=e.data;if(d.type==='audio-devices'){const previous=deviceSelect.value;deviceSelect.replaceChildren(new Option('DEFAULT MICROPHONE',''));for(const item of d.devices||[])deviceSelect.add(new Option(item.label||'Audio input '+(deviceSelect.length),item.deviceId));if([...deviceSelect.options].some(o=>o.value===previous))deviceSelect.value=previous;document.querySelector('#audio-status').textContent=(d.devices||[]).length+' audio input(s) found'+(d.error?' / '+d.error:'')}});
send({type:'audio-devices'});
