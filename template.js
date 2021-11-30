const canvas;
const gl;
const renderer;
const session;
const referenceSpace;
const viewerSpace;
const hitTestSource;

const camera = new THREE.PerspectiveCamera();
camera.matrixAutoUpdate = false;

const scene = new THREE.Scene();
const raycaster = new THREE.Raycaster();
const touch_positions_on_screen = new THREE.Vector2();

function populate_scene() {
    const light = new THREE.AmbientLight(0x404040, 4);
    scene.add(light);
    var main_group = new THREE.Group();
    var clickables = new THREE.Group();
    var others = new THREE.Group();
    main_group.add(clickables);
    main_group.add(others);
    scene.add(main_group);
    let gltf_scene;
    const loader = new THREE.GLTFLoader();
    loader.load("models/scene/scene.gltf", function (gltf) {
        gltf_scene = gltf.scene;
        clickables.add(gltf_scene);
        console.log(gltf_scene);
    });
}


var textureID = 0;
function do_job(object) {
    if (object.uuid == button_to_change_texture.children[0].uuid) {
        if (textureID == 0) {
            box_lid_red.visible = false;
            box_lid_zebra.visible = true;
            box_lid_white.visible = false;
            textureID = 1;
        }
        else if (textureID == 1) {
            box_lid_red.visible = false;
            box_lid_zebra.visible = false;
            box_lid_white.visible = true;
            textureID = 2;
        }
        else if (textureID == 2) {
            box_lid_red.visible = true;
            box_lid_zebra.visible = false;
            box_lid_white.visible = false;
            textureID = 0;
        }
    }
    else if (object.uuid == info_button_1.children[0].uuid) {
        info_1.visible = true;
        info_2.visible = false;
        info_3.visible = false;
        info_4.visible = false;
        info_5.visible = false;
        cross.visible = true;
    }
    else if (object.uuid == info_button_2.children[0].uuid) {
        info_1.visible = false;
        info_2.visible = true;
        info_3.visible = false;
        info_4.visible = false;
        info_5.visible = false;
        cross.visible = true;
    }
    else if (object.uuid == info_button_3.children[0].uuid) {
        info_1.visible = false;
        info_2.visible = false;
        info_3.visible = true;
        info_4.visible = false;
        info_5.visible = false;
        cross.visible = true;
    }
    else if (object.uuid == info_button_4.children[0].uuid) {
        info_1.visible = false;
        info_2.visible = false;
        info_3.visible = false;
        info_4.visible = true;
        info_5.visible = false;
        cross.visible = true;
    }
    else if (object.uuid == info_button_5.children[0].uuid) {
        info_1.visible = false;
        info_2.visible = false;
        info_3.visible = false;
        info_4.visible = false;
        info_5.visible = true;
        cross.visible = true;
    }
    else if (object.uuid == cross.children[0].uuid) {
        info_1.visible = false;
        info_2.visible = false;
        info_3.visible = false;
        info_4.visible = false;
        info_5.visible = false;
        cross.visible = false;
    }
}

var stage = 0;
function on_touch(event) {
    let axes = event.inputSource.gamepad.axes;
    mouse.x = axes[0];
    mouse.y = -axes[1];

    if (stage == 0) {
        if (main_group.visible) {
            stage = 1;
        }
    }
    else if (stage == 1) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(clickables.children, true);
        if (intersects[0]) do_job(intersects[0].object);
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
            // Code here!!!
            do_update_if_webxr_sees_the_floor(viewerPose, hitTestResults, time);
        }
        renderer.render(scene, camera)
    }
}

function do_update_if_webxr_sees_the_floor(viewerPose, hitTestResults,time) {
    const hitPose = hitTestResults[0].getPose(referenceSpace);
    if (stage == 0) {
        main_group.visible = true;
        main_group.position.set(hitPose.transform.position.x, hitPose.transform.position.y, hitPose.transform.position.z)
        main_group.updateMatrixWorld(true);
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