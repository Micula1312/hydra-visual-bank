export const patches=[
{id:'corrupted',engine:'hydra',name:'CORRUPTED',description:'Feedback / noise / green distortion',code:`osc(3,0.05+p.speed*.3,1.2).modulate(noise(2+p.distortion*12,.1),.05+p.distortion*.4).color(.3,1,.5).blend(o0,p.feedback*.85).out(o0)`},
{id:'oscillator',engine:'hydra',name:'OSCILLATOR',description:'Sine wave / chromatic rhythm',code:`osc(5+p.speed*60,.03+p.speed*.2,1.4).rotate(.2+p.distortion).color(1,.2+p.feedback,.7).kaleid(2+Math.round(p.distortion*8)).out(o0)`},
{id:'liquid',engine:'hydra',name:'LIQUID',description:'Fluid noise / modulation',code:`voronoi(4+p.speed*12,.2,2).modulate(noise(2+p.distortion*7,.2),.1+p.feedback*.6).color(.2,.7,1).out(o0)`},
{id:'no-signal',engine:'hydra',name:'NO SIGNAL',description:'Harsh digital texture',code:`noise(3+p.speed*90,.1).thresh(.25+p.feedback*.5).pixelate(8+Math.round(p.distortion*90),12+Math.round(p.distortion*60)).color(1,.2,.35).out(o0)`},
{id:'particle-storm',engine:'three',name:'PARTICLE STORM 3D',description:'Three.js / instanced geometry / depth',code:'// Three.js preset: edit its geometry in screen/three-engine.js'}
];