import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// RANDOM
function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}
// MAP
function map(in_min, in_max, out_min, out_max) {
    return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

// SETUP
let time = 0;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );



let cameraGroup = new THREE.Group();
cameraGroup.add(camera);
scene.add(cameraGroup);

camera.position.y = 3;
camera.position.z = 7;

// AUDIO
const loader = new GLTFLoader();
const listener = new THREE.AudioListener();
const audioLoader = new THREE.AudioLoader();
camera.add(listener);

const soundFiles = [
    "sfx/cat1.wav",
    "sfx/cat2.wav",
    "sfx/cat3.wav",
    "sfx/cat4.wav"
]


// LIGHTS
const ambientLight = new THREE.AmbientLight(0xFFFFFF, .2);
const pointLight = new THREE.PointLight(0xFFFFFF,4,0,0.8);

scene.add( ambientLight, pointLight );


// SCENE

//// KOCICKA
class Kocicka {
    constructor(x,y,z,scale,rot) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.scale = scale;
        this.rot = rot;


        loader.load('models/kocicka.gltf', 
            (gltf) => {
                this.kocicka = gltf;

                this.head = this.kocicka.scene;
                this.eye1 =  this.kocicka.scene.children[1];
                this.eye2 =  this.kocicka.scene.children[2];
                this.mainColor = this.kocicka.scene.children[0].children[0].material.color;
                this.secondaryColor = this.kocicka.scene.children[0].children[2].material.color;

                this.head.scale.set(scale, scale, scale);
                this.head.rotation.y = rot;

                this.head.position.set(x, y, z);

                scene.add(this.head);

                this.sound = new THREE.PositionalAudio(listener);
                audioLoader.load(soundFiles[Math.floor(randomRange(0,4))], (buffer) => {
                    this.sound.setBuffer(buffer);
                    this.sound.setVolume(0.4);

                    this.kocicka.scene.children[0].children[0].add(this.sound);
                });


                console.log(this.head);
            },
            function ( xhr ) {
                console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
            },
            function ( error ) {
                console.log( 'An error happened' );
            }
        );
    }

    
    scaleEye(time){
        let scale1 = (Math.sin(time*0.05)*.5+1)*2.5;
        let scale2 = (Math.cos(time*0.05+.5*Math.PI)*.5+.7)*2.5;

        if (this.kocicka){
            this.mainColor.r = scale1;
            this.mainColor.g = scale2;
            this.mainColor.b = scale1*scale2;

            this.secondaryColor.r = scale2;
            this.secondaryColor.g = scale1;
            this.secondaryColor.b = scale1;

            this.eye1.scale.set(scale1,scale1,scale1);
            this.eye2.scale.set(scale2,scale2,scale2);

            if (time%Math.floor(randomRange(200,800))==0 && !this.sound.isPlaying && time != 0){
                this.sound.play();
                console.log("sound");
            }
        }
    }
}

let kocicky = [];
let kocickyCount = 50;
for (let i = 0; i<kocickyCount; i++){
    kocicky.push(new Kocicka(randomRange(-5,5),randomRange(-5,5),randomRange(-5,5),randomRange(.1,.5),randomRange(-Math.PI,Math.PI)));
}

// CAVE

let scale = 1.2;
let cave;

loader.load('models/cave.glb', 
    (gltf) => {
        cave = gltf.scene;

        cave.scale.set(scale, scale, scale);
        cave.position.set(0,-5,15);

        scene.add(cave);
    },
    function ( xhr ) {
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },
    function ( error ) {
        console.log( 'An error happened' );
    }
);

//// PIANO
// let piano;
// loader.load('models/piano.gltf', 
//     function (gltf) {
//         piano = gltf;

//         piano.scene.scale.set(0.05,0.05,0.05);
//         piano.scene.rotation.y = Math.PI;

// 		scene.add(gltf.scene);
// 	},
// 	function ( xhr ) {
// 		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
// 	},
// 	function ( error ) {
// 		console.log( 'An error happened' );
// 	}
// );


// HELPERS
const size = 500;
const divisions = 100;

const gridHelper = new THREE.GridHelper( size, divisions );
scene.add( gridHelper );

const controls = new OrbitControls( camera, renderer.domElement );

document.addEventListener("resize", (event) => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


function animate() {    
	renderer.render( scene, camera );

    for (let i = 0; i<kocickyCount; i++){
        kocicky[i].scaleEye(time);
    }

    cameraGroup.rotation.y += 0.005;

    time++;
}