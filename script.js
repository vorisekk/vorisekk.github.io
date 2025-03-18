import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { FlyControls } from 'three/addons/controls/FlyControls.js';

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
scene.add(camera);

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

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

// SCENE GROUP
const sceneGroup = new THREE.Group();

// WEB XR
document.body.appendChild( VRButton.createButton( renderer ) );
renderer.xr.enabled = true;

// LIGHTS
const ambientLight = new THREE.AmbientLight(0xFFFFFF, .2);
scene.add(ambientLight);

function addLamp(x,y,z){
    const pl = new THREE.PointLight(0xffc379,0.6,3,0.95);
    pl.position.set(x,y,z);
    
    sceneGroup.add(pl);
}

addLamp(0,12,0);
addLamp(-10,7,5);
addLamp(-12,5,-10);
addLamp(-20,10,0);
addLamp(-25,15,5);
addLamp(-30,15,-5);
addLamp(-40,5,0);
addLamp(-30,5,10);
addLamp(-30,10,20);


// SCENE

//// KOCICKA
const kocickaBarvy = [
    [0.5,0.4,0.3],
    [0,0,0],
    [1,1,1],
];

class Kocicka {
    constructor(x,y,z,scale,rot) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.scale = scale;
        this.rot = rot;

        this.randomOff = randomRange(0,2*Math.PI);
 
        loader.load('models/kocicka.gltf', 
            (gltf) => {
                this.kocicka = gltf;

                this.head = this.kocicka.scene;
                this.eye1 =  this.kocicka.scene.children[1];
                this.eye2 =  this.kocicka.scene.children[2];
                this.mainColor = this.kocicka.scene.children[0].children[0].material.color;

                this.head.scale.set(scale, scale, scale);
                this.head.rotation.y = rot;

                this.head.position.set(x, y, z);

                this.color = kocickaBarvy[Math.floor(randomRange(0,kocickaBarvy.length))];
                this.mainColor.r = this.color[0];
                this.mainColor.g = this.color[1];
                this.mainColor.b = this.color[2];

                audioLoader.load(soundFiles[Math.floor(randomRange(0,4))], (buffer) => {
                    this.meowSound = new THREE.PositionalAudio(listener);
                    this.meowSound.setBuffer(buffer);
                    this.meowSound.setRefDistance(2);
                    this.meowSound.setVolume(0.25);

                    this.kocicka.scene.children[0].children[0].add(this.meowSound);
                });
                audioLoader.load('sfx/purr.wav', (buffer) => {
                    this.purrSound = new THREE.PositionalAudio(listener);
                    this.purrSound.setBuffer(buffer);
                    this.purrSound.setRefDistance(2);
                    this.purrSound.setVolume(0.75);

                    this.kocicka.scene.children[0].children[0].add(this.purrSound);
                });
                
                sceneGroup.add(this.head);
            },
            function ( xhr ) {
                console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
            },
            function ( error ) {
                console.log( error );
            }
        );
    }

    meow(){
        if (time%Math.floor(randomRange(200,800))==0 && time!=0 && this.meowSound && !this.meowSound.isPlaying){
            this.meowSound.play();
        }
    }

    purr(){
        let scale1 = (Math.sin(time*0.05)*.5+1)*2.5;
        let scale2 = (Math.cos(time*0.05+.5*Math.PI)*.5+.7)*2.5;

        this.eye1.scale.set(scale1,scale1,scale1);
        this.eye2.scale.set(scale2,scale2,scale2);

        if (time!=0 && this.purrSound && !this.purrSound.isPlaying){
            this.purrSound.play();
        }
    }
    dance(){
        let y = Math.sin(time*0.05+this.randomOff)+1;
        let scale1 = (Math.sin(time*0.05)*.5+1)*2.5;
        let scale2 = (Math.cos(time*0.05+.5*Math.PI)*.5+.7)*2.5;

        this.eye1.scale.set(scale1,scale1,scale1);
        this.eye2.scale.set(scale2,scale2,scale2);

        this.kocicka.scene.position.set(this.x,this.y+y,this.z);
    }
    reset(){
        if (this.purrSound){
            this.purrSound.stop();
            this.eye1.scale.set(1,1,1);
            this.eye2.scale.set(1,1,1);
        }
    }
}

let kocicky = [];

kocicky.push(new Kocicka(-2,2,6,1,Math.PI));
kocicky.push(new Kocicka(-7,3,-8,1,2*Math.PI));
kocicky.push(new Kocicka(-10,3,8,1,Math.PI));
kocicky.push(new Kocicka(-15,2,5,1,3/4*Math.PI));
kocicky.push(new Kocicka(-20,5,-14,1,2*Math.PI));
kocicky.push(new Kocicka(-25,7,-13,1,1/4*Math.PI));
kocicky.push(new Kocicka(-21,5,6,1,Math.PI));
kocicky.push(new Kocicka(-23,9,11,1,6/4*Math.PI));
kocicky.push(new Kocicka(-40,6,11,1,1/2*Math.PI));
kocicky.push(new Kocicka(-43,6,-5,1,1/2*Math.PI));
kocicky.push(new Kocicka(-35,10,-12,1,2*Math.PI));

kocicky.push(new Kocicka(-23,9.5,21,1,5/4*Math.PI));
kocicky.push(new Kocicka(-28,9,24,1,Math.PI));
kocicky.push(new Kocicka(-25,4.5,21,1,5/4*Math.PI));
kocicky.push(new Kocicka(-22,4.5,18,1,5/4*Math.PI));
kocicky.push(new Kocicka(-23,0,15,1,5/4*Math.PI));
kocicky.push(new Kocicka(-29,0,19,1,Math.PI));


// CAVE
let scale = 1;
let cave;

loader.load('models/cave.glb', 
    (gltf) => {
        cave = gltf.scene;

        cave.scale.set(scale, scale, scale);
        cave.position.set(-23,0,-14);
        cave.rotation.set(0,Math.PI,0);

        let mainColor = cave.children[0].material.color;

        mainColor.r = 0.1;
        mainColor.g = 0.1;
        mainColor.b = 0.12;

        sceneGroup.add(cave);
    },
    function ( xhr ) {
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },
    function ( error ) {
        console.log( error );
    }
);

// PIANO
let piano;
loader.load('models/piano.gltf', 
    function (gltf) {
        piano = gltf.scene;

        piano.position.set(-26,0,22);
        piano.scale.set(0.25,0.25,0.25);
        piano.rotation.set(0,1/6*Math.PI,0);

        audioLoader.load('sfx/happy.wav', (buffer) => {
            let sound = new THREE.PositionalAudio(listener);
            sound.setBuffer(buffer);
            sound.setRefDistance(5);
            sound.setLoop(true);
            sound.setVolume(1.5);
            sound.setDirectionalCone(40, 90, .25);

            const speaker = new THREE.Mesh(
                new THREE.BoxGeometry(0, 0, 0),
                new THREE.MeshBasicMaterial({ color: 0xff0000 })
            );
            speaker.position.set(piano.position.x,piano.position.y,piano.position.z);
            speaker.rotation.set(0,10/9*Math.PI,0.1);
            speaker.add(sound);
            sceneGroup.add(speaker);

            sound.play();
        });

		sceneGroup.add(gltf.scene);
        console.log(gltf.scene);
	},
	function ( xhr ) {
		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
	},
	function ( error ) {
		console.log( error );
	}
);


// HELPERS
const size = 500;
const divisions = 100;

const axesHelper = new THREE.AxesHelper( 5 );
const gridHelper = new THREE.GridHelper( size, divisions );

const flyControls = new FlyControls(camera, renderer.domElement);

flyControls.movementSpeed = 1;
flyControls.rollSpeed = .5;

flyControls.dragToLook = true;

document.addEventListener("resize", (event) => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

scene.add(sceneGroup);
sceneGroup.scale.set(0.2,0.2,0.2);
sceneGroup.position.set(0,0.2,0);

camera.position.set(0,0.2,0);
camera.rotation.set(0,1/2*Math.PI,0);

function getDist(object){
    const objectPosition = new THREE.Vector3();
    object.getWorldPosition(objectPosition); // Get object's world position
    
    const cameraPosition = camera.position; // Camera's position
    const distance = cameraPosition.distanceTo(objectPosition); // Calculate distance
    
    const threshold = 2; // Define close range
    if (distance < threshold) {
        return true;
    }
    else {
        return false;
    }
}

function animate() {    
	renderer.render( scene, camera );

    flyControls.update(0.05);

    for (let i = 0; i<kocicky.length-6; i++){
        if (kocicky[i].kocicka){
            if(getDist(kocicky[i].head)){
                kocicky[i].purr();
            }
            else {
                kocicky[i].reset();
                kocicky[i].meow();
            }
        }
    }
    for (let i = kocicky.length-6; i<kocicky.length; i++){
        if (kocicky[i].kocicka){
            kocicky[i].dance();
            kocicky[i].meow();
        }
    }

    time++;
}