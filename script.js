import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { FlyControls } from 'three/addons/controls/FlyControls.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';

// SETUP
let time = 0;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
scene.add(camera);

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

// AUDIO
const gltfLoader = new GLTFLoader();
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

// const textureLoader = new THREE.TextureLoader();
// const heightMap = textureLoader.load("/assets/height.png");
// const textureMap = textureLoader.load("/assets/map.png");

// const mountainGeometry = new THREE.PlaneGeometry(100,100,1024,1024);
// const mountainMaterial = new THREE.MeshStandardMaterial({
//     color:'gray',
//     map: textureMap,
//     displacementMap: heightMap,
//     displacementScale: 100
// })

// const mountain = new THREE.Mesh( mountainGeometry, mountainMaterial );
// mountain.rotation.set(-Math.PI/2,0,0)

// scene.add(mountain)

const bgrLoader = new THREE.TextureLoader();
bgrLoader.load('hdr/2.jpg', function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
    scene.environment = texture;
    scene.environmentIntensity = .3;
});

let yurt, vase;
gltfLoader.load('models/house.glb', 
    function (gltf) {
        yurt = gltf.scene;

        const scale=.3;

        yurt.position.set(0,0,-2);
        yurt.scale.set(scale,scale,scale);
        yurt.rotation.set(0,-Math.PI/2,0);

        vase = yurt.children.find(obj => obj.name === "CLICKABLE_VASE_");
        console.log(vase);
        
        const pointLight = new THREE.PointLight(0xFFFFFF,.2,0,1.5)
        vase.getWorldPosition(pointLight.position);


        // audioLoader.load('sfx/happy.wav', (buffer) => {
        //     let sound = new THREE.PositionalAudio(listener);
        //     sound.setBuffer(buffer);
        //     sound.setRefDistance(5);
        //     sound.setLoop(true);
        //     sound.setVolume(1);

        //     mountain.children[0].add(sound);

        //     sound.play();
        // });

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

        const scale=4;

        mountain.position.set(30,-6,0);
        mountain.scale.set(scale,scale,scale);

        // audioLoader.load('sfx/happy.wav', (buffer) => {
        //     let sound = new THREE.PositionalAudio(listener);
        //     sound.setBuffer(buffer);
        //     sound.setRefDistance(5);
        //     sound.setLoop(true);
        //     sound.setVolume(1);

        //     mountain.children[0].add(sound);

        //     sound.play();
        // });

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
let lastCamPos = new THREE.Vector3();

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

    text.style.opacity = getDist(vase, 0.6) ? 1 : 0;

    if (justPressed || justTriggered) {
        if (!teleported && getDist(vase, 10)) {
            lastCamPos.copy(camera.position);
            camera.position.copy(new THREE.Vector3(mountain.position.x,camera.position.y,mountain.position.z));
            yurt.visible = false;
            teleported = true;

        } else if (teleported && getDist(mountain, 5)) {
            camera.position.copy(lastCamPos);
            yurt.visible = true;
            teleported = false;
        }
    }
    
    justTriggered = false;
    justPressed = false;

    flyControls.update(0.1);
    time++;
}