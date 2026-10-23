import * as THREE from 'https://esm.sh/three@0.180.0';
export function createParticleStorm(host,getParams){
 const scene=new THREE.Scene();scene.background=new THREE.Color(0x020205);
 const camera=new THREE.PerspectiveCamera(65,innerWidth/innerHeight,.1,250);camera.position.z=28;
 const renderer=new THREE.WebGLRenderer({antialias:false,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);host.append(renderer.domElement);
 const count=12000,geometry=new THREE.IcosahedronGeometry(.075,0),material=new THREE.MeshBasicMaterial({color:0xbaff42});
 const mesh=new THREE.InstancedMesh(geometry,material,count);mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);scene.add(mesh);
 const dummy=new THREE.Object3D(),positions=new Float32Array(count*3);
 for(let i=0;i<count;i++){const t=i/count*Math.PI*28,r=2+Math.sqrt(i/count)*14;positions[i*3]=Math.cos(t)*r;positions[i*3+1]=Math.sin(t)*r;positions[i*3+2]=(Math.random()-.5)*24}
 let frame=0,raf=0,stopped=false,last=0;
 function animate(now){if(stopped)return;raf=requestAnimationFrame(animate);if(now-last<1000/45)return;last=now;const p=getParams(),t=now*.0001*(.3+p.speed*5);
 for(let i=0;i<count;i++){const k=i*3;dummy.position.set(positions[k]+Math.sin(t*4+i*.1)*p.distortion*2,positions[k+1],positions[k+2]);dummy.rotation.set(t+i*.01,t*.6,0);const s=.5+p.feedback*3;dummy.scale.setScalar(s);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix)}
 mesh.instanceMatrix.needsUpdate=true;mesh.rotation.y=t*.8;mesh.rotation.z=t*.3;camera.position.z=22+p.distortion*22;renderer.render(scene,camera);frame++}
 const resize=()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)};
 window.addEventListener('resize',resize);raf=requestAnimationFrame(animate);
 return ()=>{stopped=true;cancelAnimationFrame(raf);window.removeEventListener('resize',resize);mesh.geometry.dispose();mesh.material.dispose();renderer.dispose();renderer.domElement.remove()}
}