import {patches} from '../shared/patches.js';
const channel=new BroadcastChannel('hydra-visual-bank-v1'),patchList=document.querySelector('#patches'),editor=document.querySelector('#code'),sliders=document.querySelector('#sliders');
let active=patches[0].id,params={speed:.5,feedback:.5,distortion:.3},blackout=false;
function send(data){channel.postMessage(data)}
function render(){patchList.replaceChildren();for(const patch of patches){const btn=document.createElement('button');btn.className='patch'+(patch.id===active?' active':'');btn.innerHTML='<strong></strong><small></small>';btn.querySelector('strong').textContent=patch.name;btn.querySelector('small').textContent=patch.description;btn.onclick=()=>{active=patch.id;editor.value=patch.code;render();send({type:'patch',id:active})};patchList.append(btn)}}
for(const key of ['speed','feedback','distortion']){const div=document.createElement('div');div.className='param';const label=document.createElement('label'),value=document.createElement('span'),input=document.createElement('input');label.textContent=key.toUpperCase();label.append(value);input.type='range';input.min=0;input.max=100;input.value=params[key]*100;value.textContent=input.value+'%';input.oninput=()=>{params[key]=Number(input.value)/100;value.textContent=input.value+'%';send({type:'params',params})};div.append(label,input);sliders.append(div)}
document.querySelector('#run').onclick=()=>send({type:'code',code:editor.value});
document.querySelector('#reset').onclick=()=>{editor.value=patches.find(p=>p.id===active).code;send({type:'patch',id:active})};
document.querySelector('#blackout').onclick=()=>{blackout=!blackout;send({type:'blackout',value:blackout});document.querySelector('#blackout').textContent=blackout?'RESTORE OUTPUT':'BLACKOUT'};
document.querySelector('#open-screen').onclick=()=>window.open('../screen/','_blank');
document.querySelector('#save').onclick=()=>{const blob=new Blob([editor.value+'\n'],{type:'text/javascript'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=active+'-custom.js';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
channel.onmessage=e=>{if(e.data.type==='screen-ready'||e.data.type==='screen-state')document.querySelector('#connection').textContent='SCREEN CONNECTED / SAME DEVICE'};
editor.value=patches[0].code;render();send({type:'request-state'});