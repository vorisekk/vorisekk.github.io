import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { FlyControls } from 'three/addons/controls/FlyControls.js';
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

// SETUP
let time = 0;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
scene.add(camera);

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

// 3D
const gltfLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( 'decoder/' );
gltfLoader.setDRACOLoader( dracoLoader );

// AUDIO
const listener = new THREE.AudioListener();
const audioLoader = new THREE.AudioLoader();
camera.add(listener);

const soundFiles = [

]

// SCENE GROUP
const sceneGroup = new THREE.Group();

// WEB XR
document.body.appendChild( VRButton.createButton( renderer ) );
renderer.xr.enabled = true;

const controllerModelFactory = new XRControllerModelFactory();

const controller1 = renderer.xr.getController(0);
const controller2 = renderer.xr.getController(1);

scene.add(controller1);
scene.add(controller2);

const controllerGrip1 = renderer.xr.getControllerGrip(0);
controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
scene.add(controllerGrip1);

// LIGHTS
const ambientLight = new THREE.AmbientLight(0xFFFFFF, .1);
const hemiLight = new THREE.HemisphereLight( 0xf5f0e7, 0x2b2620, 1 ); 

scene.add(ambientLight, hemiLight);

// HELPERS
const size = 500;
const divisions = 100;

const axesHelper = new THREE.AxesHelper( 5 );
const gridHelper = new THREE.GridHelper( size, divisions );
//scene.add( axesHelper, gridHelper );

// CONTROLS
const flyControls = new FlyControls(camera, renderer.domElement);
flyControls.movementSpeed = .5;
flyControls.rollSpeed = .5;
flyControls.dragToLook = true;

// SCENE

const bgrLoader = new THREE.TextureLoader();
bgrLoader.load('hdr/2.jpg', function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
    scene.environment = texture;
    scene.environmentIntensity = .3;
});

let yurt, vase, music;
gltfLoader.load('models/house.glb', 
    function (gltf) {
        yurt = gltf.scene;

        const scale=1;

        yurt.position.set(0,0,-2);
        yurt.scale.set(scale,scale,scale);
        yurt.rotation.set(0,-Math.PI/2,0);

        vase = yurt.children.find(obj => obj.name === "CLICKABLE_VASE_");
        console.log(vase);
        
        const pointLight = new THREE.PointLight(0xFFFFFF,.2,0,1.5)
        vase.getWorldPosition(pointLight.position);


        audioLoader.load('sfx/yurt.mp3', (buffer) => {
            music = new THREE.PositionalAudio(listener);
            music.setBuffer(buffer);
            music.setRefDistance(3);
            music.setLoop(true);
            music.setVolume(.5);

            vase.add(music);

            music.play();
        });

        sceneGroup.add(yurt, pointLight);
        console.log(yurt);
    },
    function () {
        console.log( "Loaded" );
    },
    function ( error ) {
        console.log( error );
    }
);

let mountain;
gltfLoader.load('models/mountain.glb', 
    function (gltf) {
        mountain = gltf.scene;

        const scale=6;

        mountain.position.set(100,-10,0);
        mountain.scale.set(scale,scale,scale);

        audioLoader.load('sfx/mountain.mp3', (buffer) => {
            let sound = new THREE.PositionalAudio(listener);
            sound.setBuffer(buffer);
            sound.setRefDistance(1);
            sound.setLoop(true);
            sound.setVolume(1);

            mountain.children[0].add(sound);

            sound.play();
        });

		sceneGroup.add(mountain);
        console.log(mountain);
	},
	function () {
		console.log( "Loaded" );
	},
	function ( error ) {
		console.log( error );
	}
);

function getDist(object, threshold){
    if (object){
        const objectPosition = new THREE.Vector3();
        object.getWorldPosition(objectPosition);
        
        const cameraPosition = camera.position;
        const distance = cameraPosition.distanceTo(objectPosition);
        
        if (distance < threshold) {
            return true;
        }
        else {
            return false;
        }
    }
}

const groupScale = 1;
sceneGroup.position.set(0,-1,0)
sceneGroup.scale.set(groupScale,groupScale,groupScale)


const text = document.getElementById("info-text");


document.addEventListener("resize", (event) => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

scene.add(sceneGroup);
        
let justPressed = false;
let teleported = false;
let lastPos = new THREE.Vector3();

let justTriggered = false;
let triggerPressedLastFrame = false;

document.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        justPressed = true;
    }
});

function animate() {
    renderer.render(scene, camera);

    const session = renderer.xr.getSession();
    if (session) {
        session.inputSources.forEach((inputSource) => {
            const gamepad = inputSource.gamepad;
            if (gamepad && gamepad.buttons[0]) {
                const isPressed = gamepad.buttons[0].pressed;

                if (isPressed && !triggerPressedLastFrame) {
                    justTriggered = true;
                }

                triggerPressedLastFrame = isPressed;
            }
        });
    }

    text.style.opacity = getDist(vase, 2) && yurt.visible ? 1 : 0;

    if (justPressed || justTriggered) {
        if (!teleported && getDist(vase, 2) && yurt.visible) {
            lastPos.copy(mountain.position);
            mountain.position.copy(new THREE.Vector3(camera.position.x,mountain.position.y,camera.position.z));
            yurt.visible = false;
            teleported = true;
            music.setVolume(0);

        } else if (teleported && getDist(mountain, 20)) {
            mountain.position.copy(lastPos);
            yurt.visible = true;
            teleported = false;
            music.setVolume(.5);
        }
    }
    
    justTriggered = false;
    justPressed = false;

    flyControls.update(0.1);
    time++;
}