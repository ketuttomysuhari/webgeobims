import { IFCLoader } from "./vendor/IFCLoader.js";
import {
  Matrix4,
  Vector3,
  AmbientLight,
  AxesHelper,
  DirectionalLight,
  GridHelper,
  PerspectiveCamera,
  MeshLambertMaterial,
  Scene,
  Raycaster,
  Vector2,
  WebGLRenderer,
} from "./vendor/three.module.js";
import { OrbitControls } from "./vendor/OrbitControls.js";

import {
  acceleratedRaycast,
  computeBoundsTree,
  disposeBoundsTree
} from './vendor/three-mesh-bvh/three-mesh-bvh.js';


function sendMessageToStreamlitClient(type, data) {
  console.log(type, data)
  const outData = Object.assign({
      isStreamlitMessage: true,
      type: type,
  }, data);
  window.parent.postMessage(outData, "*");
}

const Streamlit = {
    setComponentReady: function() {
        sendMessageToStreamlitClient("streamlit:componentReady", {apiVersion: 1});
    },
    setFrameHeight: function(height) {
        sendMessageToStreamlitClient("streamlit:setFrameHeight", {height: height});
    },
    setComponentValue: function(value) {
        sendMessageToStreamlitClient("streamlit:setComponentValue", {value: value});
    },
    RENDER_EVENT: "streamlit:render",
    loadViewer: function(callback) { 
          callback()
      },
    events: {
        addEventListener: function(type, callback) { 
            window.addEventListener("message", function(event) {
                if (event.data.type === type) {
                    event.detail = event.data
                    callback(event);
                }
            });
        }
    }
}


const ifcModels = [];
const ifcLoader = new IFCLoader();
const size = {
  width: window.innerWidth,
  height: window.innerHeight,
};
const preselectMat = new MeshLambertMaterial({
  transparent: true,
  opacity: 0.6,
  color: 0xf1a832,
  depthTest: false
})
const selectMat = new MeshLambertMaterial({
  transparent: true,
  opacity: 0.6,
  color: 0xc63f35,
  depthTest: false
})

function sendValue(value) {
  Streamlit.setComponentValue(value)
}

function setup(){
  //BASIC THREE JS SCENE, CAMERA, LIGHTS, MOUSE CONTROLS
    window.scene = new Scene();
    const ifc = ifcLoader.ifcManager;

    //Creates the camera (point of view of the user)
    const camera = new PerspectiveCamera(75, size.width / size.height);
    camera.position.z = 15;
    camera.position.y = 13;
    camera.position.x = 8;
  
    //Creates the lights of the scene
    const lightColor = 0xffffff;
    const ambientLight = new AmbientLight(lightColor, 0.5);
    window.scene.add(ambientLight);
    const directionalLight = new DirectionalLight(lightColor, 1);
    directionalLight.position.set(0, 10, 0);
    directionalLight.target.position.set(-5, 0, 0);
    window.scene.add(directionalLight);
    window.scene.add(directionalLight.target);
    window.scene.add(directionalLight.target);
  
    //Sets up the renderer, fetching the canvas of the HTML
    const threeCanvas = document.getElementById("three-canvas");
    const renderer = new WebGLRenderer({ canvas: threeCanvas, alpha: true });
    renderer.setSize(size.width, size.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  
    //Creates grids and axes in the window.scene
    const grid = new GridHelper(50, 30);
    window.scene.add(grid);
    const axes = new AxesHelper();
    axes.material.depthTest = false;
    axes.renderOrder = 1;
    window.scene.add(axes);
  
    //Creates the orbit controls (to navigate the scene)
    const controls = new OrbitControls(camera, threeCanvas);
    controls.enableDamping = true;
    controls.target.set(-2, 0, 0);
  
    //Animation loop
    const animate = () => {
      controls.update();
      renderer.render(window.scene, camera);
      requestAnimationFrame(animate);
    };
  
    animate();
  
    //Adjust the viewport to the size of the browser
    window.addEventListener("resize", () => {
      (size.width = window.innerWidth), (size.height = window.innerHeight);
      camera.aspect = size.width / size.height;
      camera.updateProjectionMatrix();
      renderer.setSize(size.width, size.height);
    });
  
    //Sets up the IFC loading

    ifc.setWasmPath("./vendor/IFC/");

    ifc.setupThreeMeshBVH(
      computeBoundsTree,
      disposeBoundsTree,
      acceleratedRaycast
      );
  
    // SELECTOR EXAMPLE
    const raycaster = new Raycaster();
      raycaster.firstHitOnly = true;
      const mouse = new Vector2();
    
      function getIntersection(event) {
    
        // Computes the position of the mouse on the screen
        const bounds = threeCanvas.getBoundingClientRect();
        const x1 = event.clientX - bounds.left;
        const x2 = bounds.right - bounds.left;
        mouse.x = (x1 / x2) * 2 - 1;

        const y1 = event.clientY - bounds.top;
        const y2 = bounds.bottom - bounds.top;
        mouse.y = -(y1 / y2) * 2 + 1;
    
        // Places the raycaster on the camera, pointing to the mouse
        raycaster.setFromCamera(mouse, camera);
    
        // Casts a ray
        const found = raycaster.intersectObjects(ifcModels)

        // Gets Express ID
        if (found[0]) { 
          const index = found[0].faceIndex;
          const geometry = found[0].object.geometry;
          return {"id":ifc.getExpressId(geometry, index), "modelID": found[0].object.modelID}
        }
        ;
    }
    
      function getObjectData(event) {
        const intersection = getIntersection(event);
        if (intersection){
          const objectId = intersection.id;
          const props = ifc.getItemProperties(intersection.modelID, objectId);
          const propsets = ifc.getPropertySets(intersection.modelID, objectId,true);
          let data = {
            "id": objectId,
            "props": propsets,
          }
          return JSON.stringify(data, null, 2)
        }
      }
      
    // HIGHLIGHT
    // References to the previous selections
      const highlightModel = { id: - 1};
      const selectModel = { id: - 1};
    function highlight(event, material, model) {
    const intersection = getIntersection(event)
    if (intersection) {
        // Creates subset
        ifc.createSubset({
            modelID: intersection.modelID,
            ids: [intersection.id],
            material: material,
            scene: window.scene,
            removePrevious: true
        })
    } 
    else {
        // Remove previous highlight
        ifc.removeSubset(model.id, window.scene, material);
    }
    }
    
    // Pre-Highlight Materials
    window.onmousemove = (event) => highlight(event, preselectMat, highlightModel);
      
    // Highlight Selected Object and send Object data to Python
      window.ondblclick = (event) => {
        highlight(event, selectMat, selectModel);
        let data = getObjectData(event);
        sendValue(data)
      }
}

async function sigmaLoader (url, ifcLoader){
  const ifcModel = await ifcLoader.ifcManager.parse(url.buffer)
  ifcModels.push(ifcModel.mesh)
  window.scene.add(ifcModel.mesh)
}
    
/**
 * The component's render function. This will be called immediately after
 * the component is initially loaded, and then again every time the
 * component gets new data from Python.
 */

 async function loadURL(event) {
  if (!window.rendered) {
    const {url} = event.detail.args;
    await sigmaLoader(url, ifcLoader);
    window.rendered = true
  }
}

//mapboxgl.accessToken = 'YOUR_API_KEY'
//this API key is restricted to this github repo. Make a free account to get your own: https://account.mapbox.com/auth/signup/
mapboxgl.accessToken = 'pk.eyJ1Ijoia2V0dXR0b215c3VoYXJpIiwiYSI6ImNsZGZ0N3kyejBtNDEzeG81MGJqMnR0am4ifQ.T6SmSYCEhAtyWKoK_NYN_Q';
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v10',
  zoom: 20.5,
  center: [13.4453, 52.4910],
  pitch: 75,
  bearing: -80,
  antialias: true
});

const modelOrigin = [13.4453, 52.4910];
const modelAltitude = 0;
const modelRotate = [Math.PI / 2, .72, 0];
 
const modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(modelOrigin, modelAltitude);
 
const modelTransform = {
  translateX: modelAsMercatorCoordinate.x,
  translateY: modelAsMercatorCoordinate.y,
  translateZ: modelAsMercatorCoordinate.z,
  rotateX: modelRotate[0],
  rotateY: modelRotate[1],
  rotateZ: modelRotate[2],
  scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits()
};
 
const scene = new Scene();
const camera = new PerspectiveCamera();
const renderer = new WebGLRenderer({
  canvas: map.getCanvas(),
  antialias: true,
});
renderer.autoClear = false;

const customLayer = {

  id: '3d-model',
  type: 'custom',
  renderingMode: '3d',

  onAdd: function () {
    const ifcLoader = new IFCLoader();
    ifcLoader.ifcManager.setWasmPath( '../../../' );
    ifcLoader.load( '../../../IFC/01.ifc', function ( model ) {
      scene.add( model );
    });

    const directionalLight = new DirectionalLight(0x404040);
    const directionalLight2 = new DirectionalLight(0x404040);
    const ambientLight = new AmbientLight( 0x404040, 3 ); 

    directionalLight.position.set(0, -70, 100).normalize();
    directionalLight2.position.set(0, 70, 100).normalize();

    scene.add(directionalLight, directionalLight2, ambientLight);
},

  render: function (gl, matrix) {
    const rotationX = new Matrix4().makeRotationAxis(
    new Vector3(1, 0, 0), modelTransform.rotateX);
    const rotationY = new Matrix4().makeRotationAxis(
    new Vector3(0, 1, 0), modelTransform.rotateY);
    const rotationZ = new Matrix4().makeRotationAxis(
    new Vector3(0, 0, 1), modelTransform.rotateZ);
  
    const m = new Matrix4().fromArray(matrix);
    const l = new Matrix4()
    .makeTranslation(
    modelTransform.translateX,
    modelTransform.translateY,
    modelTransform.translateZ
    )
    .scale(
    new Vector3(
    modelTransform.scale,
    -modelTransform.scale,
    modelTransform.scale)
    )
    .multiply(rotationX)
    .multiply(rotationY)
    .multiply(rotationZ);
    
    camera.projectionMatrix = m.multiply(l);
    renderer.resetState();
    renderer.render(scene, camera);
    map.triggerRepaint();
  }
};
 
map.on('style.load', () => {
  map.addLayer(customLayer, 'waterway-label');
});

Streamlit.loadViewer(setup)
// Render the component whenever python send a "render event"
Streamlit.events.addEventListener(Streamlit.RENDER_EVENT, loadURL)
// Tell Streamlit that the component is ready to receive events
Streamlit.setComponentReady()
// Render with the correct height, if this is a fixed-height component
Streamlit.setFrameHeight(window.innerWidth/2)