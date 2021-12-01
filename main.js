let canvas;
let gl;
let renderer;
let session;
let referenceSpace;
let viewerSpace;
let hitTestSource;

const camera = new THREE.PerspectiveCamera();
camera.matrixAutoUpdate = false;

const scene = new THREE.Scene();
const main_group = new THREE.Group();
const clickables = new THREE.Group();
const others = new THREE.Group();

let gltf_scene;
let cube, cylinder, icosphere, torus;

const raycaster = new THREE.Raycaster();
const touch_positions_on_screen = new THREE.Vector2();

function populate_scene() {
    scene.add(new THREE.AmbientLight(0x404040, 2));

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight.position.set(10, 15, 10);
    scene.add(directionalLight);

    main_group.add(clickables);
    main_group.add(others);
    scene.add(main_group);
    const loader = new THREE.GLTFLoader();
    loader.load("models/scene/scene_2.gltf", function (gltf) {
        gltf_scene = gltf.scene;
        others.add(gltf_scene);
    });
    loader.load("models/scene/scene_1.gltf", function (gltf) {
        cylinder = find(gltf.scene, "Cylinder");
        cylinder.visible = false;
        clickables.add(cylinder);

        cube = find(gltf.scene, "Cube");
        cube.visible = false;
        clickables.add(cube);

        icosphere = find(gltf.scene, "Icosphere");
        icosphere.visible = false;
        clickables.add(icosphere);

        torus = find(gltf.scene, "Torus");
        torus.visible = false;
        clickables.add(torus);
    });
}

function find(object, name) {
    if (object.type == "Mesh") {
        if (object.name == name) {
            return object;
        }
        else {
            return null;
        }
    }
    else if (object.type == "Group") {
        let children = object.children;
        for (i = 0; i < children.length; i++) {
            let res = find(children[i], name);
            if (res) return res;
        }
        return null;
    }
    return null;
}

var c = 0;
var section = 0;
function on_touch(event) {
    if (section == 0) {
        ///*Add an unclickable object to the scene*/
        //let clone = gltf_scene.clone()
        //clone.position.copy(main_group.position);
        //scene.add(clone);
        section = 1;
    }
    else if (section == 1) /*Raycasting/Clicking/Touching*/ {
        let axes = event.inputSource.gamepad.axes;
        touch_positions_on_screen.x = axes[0];
        touch_positions_on_screen.y = -axes[1];
        raycaster.setFromCamera(touch_positions_on_screen, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);
        for (i = 0; i < intersects.length; i++) {
            // Do Some Stuff
        }
        // give red or green color to the closest one
        if (intersects.length > 0) {
            if (c == 0) {
                intersects[0].object.material.color.set(0xff0000);
                c = 1;
            }
            else {
                intersects[0].object.material.color.set(0x00ff00);
                c = 0;
            }
        }
    }
}

function onXRFrame(time, frame) {
    session.requestAnimationFrame(onXRFrame);
    gl.bindFramebuffer(gl.FRAMEBUFFER, session.renderState.baseLayer.framebuffer)
    const viewerPose = frame.getViewerPose(referenceSpace);
    if (viewerPose) {
        const view = viewerPose.views[0];
        const viewport = session.renderState.baseLayer.getViewport(view);
        renderer.setSize(viewport.width, viewport.height)
        camera.matrix.fromArray(view.transform.matrix)
        camera.projectionMatrix.fromArray(view.projectionMatrix);
        camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
        camera.updateMatrixWorld(true);
        const hitTestResults = frame.getHitTestResults(hitTestSource);
        if (hitTestResults.length > 0) {
            do_update_if_webxr_sees_the_floor(viewerPose, hitTestResults, time);
        }
        renderer.render(scene, camera)
    }
}

function set_position(object, position) {
    object.position.set(position.x, position.y, position.z)
    object.updateMatrixWorld(true);
}

function do_update_if_webxr_sees_the_floor(viewerPose, hitTestResults, time) {
    const hitPose = hitTestResults[0].getPose(referenceSpace);
    if (section == 0) {
        main_group.visible = true;
        set_position(main_group, hitPose.transform.position)
    }
}

async function activateXR() {
    canvas = document.createElement("canvas");
    document.body.appendChild(canvas);
    gl = canvas.getContext("webgl", { xrCompatible: true });
    if (!gl) { return }
    renderer = new THREE.WebGLRenderer({
        alpha: true,
        preserveDrawingBuffer: true,
        canvas: canvas,
        context: gl
    });
    renderer.autoClear = false;

    session = await navigator.xr.requestSession("immersive-ar", { requiredFeatures: ['hit-test'] });
    session.updateRenderState({ baseLayer: new XRWebGLLayer(session, gl) });

    referenceSpace = await session.requestReferenceSpace('local');
    viewerSpace = await session.requestReferenceSpace('viewer');
    hitTestSource = await session.requestHitTestSource({ space: viewerSpace });

    populate_scene();

    session.addEventListener("select", on_touch);
    session.requestAnimationFrame(onXRFrame);
}