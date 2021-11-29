async function activateXR() {
    // Add a canvas element and initialize a WebGL context that is compatible with WebXR.
    const canvas = document.createElement("canvas");
    document.body.appendChild(canvas);
    const gl = canvas.getContext("webgl", { xrCompatible: true });
    if (!gl) {
        alert("Failure!!!")
        return
    }
    const scene = new THREE.Scene();

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 15, 10);
    scene.add(directionalLight);

    // Set up the WebGLRenderer, which handles rendering to the session's base layer.
    const renderer = new THREE.WebGLRenderer({
        alpha: true,
        preserveDrawingBuffer: true,
        canvas: canvas,
        context: gl
    });
    renderer.autoClear = false;

    // The API directly updates the camera matrices.
    // Disable matrix auto updates so three.js doesn't attempt
    // to handle the matrices independently.
    const camera = new THREE.PerspectiveCamera();
    camera.matrixAutoUpdate = false;

    // Initialize a WebXR session using "immersive-ar".
    const session = await navigator.xr.requestSession("immersive-ar", { requiredFeatures: ['hit-test'] });
    session.updateRenderState({
        baseLayer: new XRWebGLLayer(session, gl)
    });

    // A 'local' reference space has a native origin that is located
    // near the viewer's position at the time the session was created.
    const referenceSpace = await session.requestReferenceSpace('local');

    // Create another XRReferenceSpace that has the viewer as the origin.
    const viewerSpace = await session.requestReferenceSpace('viewer');
    // Perform hit testing using the viewer as origin.
    const hitTestSource = await session.requestHitTestSource({ space: viewerSpace });

    var main_group = new THREE.Group();
    var clickables = new THREE.Group();
    var unclickables = new THREE.Group();
    main_group.add(clickables);
    main_group.add(unclickables);
    let box, worm, dirt, cross, box_lid_red, box_lid_zebra, box_lid_white, button_to_change_texture;
    let button_to_open_and_close_lid, info_button_1, info_button_2, info_button_3, info_button_4;
    let info_button_5, info_1, info_2, info_3, info_4, info_5, apple;
    const loader = new THREE.GLTFLoader();
    loader.load("models/box/box.gltf", function (gltf) {
        box = gltf.scene;
        unclickables.add(box);
    });
    loader.load("models/box/worm.gltf", function (gltf) {
        worm = gltf.scene;
        unclickables.add(worm);
    });
    loader.load("models/box/dirt.gltf", function (gltf) {
        dirt = gltf.scene;
        unclickables.add(dirt);
    });
    loader.load("models/box/cross.gltf", function (gltf) {
        cross = gltf.scene;
        cross.visible = false;
        clickables.add(cross);
    });
    loader.load("models/box/box_lid_red.gltf", function (gltf) {
        box_lid_red = gltf.scene;
        unclickables.add(box_lid_red);
    });
    loader.load("models/box/box_lid_zebra.gltf", function (gltf) {
        box_lid_zebra = gltf.scene;
        box_lid_zebra.visible = false;
        unclickables.add(box_lid_zebra);
    });
    loader.load("models/box/box_lid_white.gltf", function (gltf) {
        box_lid_white = gltf.scene;
        box_lid_white.visible = false;
        unclickables.add(box_lid_white);
    });
    loader.load("models/box/button_to_change_texture.gltf", function (gltf) {
        button_to_change_texture = gltf.scene;
        clickables.add(button_to_change_texture);
    });
    loader.load("models/box/button_to_open_and_close_lid.gltf", function (gltf) {
        button_to_open_and_close_lid = gltf.scene;
        clickables.add(button_to_open_and_close_lid);
    });
    loader.load("models/box/info_button_1.gltf", function (gltf) {
        info_button_1 = gltf.scene;
        clickables.add(info_button_1);
    });
    loader.load("models/box/info_button_2.gltf", function (gltf) {
        info_button_2 = gltf.scene;
        clickables.add(info_button_2);
    });
    loader.load("models/box/info_button_3.gltf", function (gltf) {
        info_button_3 = gltf.scene;
        clickables.add(info_button_3);
    });
    loader.load("models/box/info_button_4.gltf", function (gltf) {
        info_button_4 = gltf.scene;
        clickables.add(info_button_4);
    });
    loader.load("models/box/info_button_5.gltf", function (gltf) {
        info_button_5 = gltf.scene;
        clickables.add(info_button_5);
    });
    loader.load("models/box/info_1.gltf", function (gltf) {
        info_1 = gltf.scene;
        info_1.visible = false;
        unclickables.add(info_1);
    });
    loader.load("models/box/info_2.gltf", function (gltf) {
        info_2 = gltf.scene;
        info_2.visible = false;
        unclickables.add(info_2);
    });
    loader.load("models/box/info_3.gltf", function (gltf) {
        info_3 = gltf.scene;
        info_3.visible = false;
        unclickables.add(info_3);
    });
    loader.load("models/box/info_4.gltf", function (gltf) {
        info_4 = gltf.scene;
        info_4.visible = false;
        unclickables.add(info_4);
    });
    loader.load("models/box/info_5.gltf", function (gltf) {
        info_5 = gltf.scene;
        info_5.visible = false;
        unclickables.add(info_5);
    });
    loader.load("models/apple/apple.gltf", function (gltf) {
        apple = gltf.scene;
        unclickables.add(apple);
    });

    scene.add(main_group);

    var textureID = 0;
    function do_job(object){
        if(object.uuid == button_to_change_texture.children[0].uuid){
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
        else if(object.uuid == info_button_1.children[0].uuid){
            info_1.visible = true;
            info_2.visible = false;
            info_3.visible = false;
            info_4.visible = false;
            info_5.visible = false;
            cross.visible = true;
        }
        else if(object.uuid == info_button_2.children[0].uuid){
            info_1.visible = false;
            info_2.visible = true;
            info_3.visible = false;
            info_4.visible = false;
            info_5.visible = false;
            cross.visible = true;
        }
        else if(object.uuid == info_button_3.children[0].uuid){
            info_1.visible = false;
            info_2.visible = false;
            info_3.visible = true;
            info_4.visible = false;
            info_5.visible = false;
            cross.visible = true;
        }
        else if(object.uuid == info_button_4.children[0].uuid){
            info_1.visible = false;
            info_2.visible = false;
            info_3.visible = false;
            info_4.visible = true;
            info_5.visible = false;
            cross.visible = true;
        }
        else if(object.uuid == info_button_5.children[0].uuid){
            info_1.visible = false;
            info_2.visible = false;
            info_3.visible = false;
            info_4.visible = false;
            info_5.visible = true;
            cross.visible = true;
        }
        else if(object.uuid == cross.children[0].uuid){
            info_1.visible = false;
            info_2.visible = false;
            info_3.visible = false;
            info_4.visible = false;
            info_5.visible = false;
            cross.visible = false;
        }
    }

    var stage = 0;
    function onSelect(event) {
        let axes = event.inputSource.gamepad.axes;
        mouse.x = axes[0];
        mouse.y = -axes[1] * 16.0 / 9.0;

        if (stage == 0) {
            if (main_group.visible) {
                stage = 1;
            }
        }
        else if (stage == 1) {
            // update the picking ray with the camera and mouse position
            raycaster.setFromCamera(mouse, camera);

            // calculate objects intersecting the picking ray
            const intersects = raycaster.intersectObjects(clickables.children, true);

            if (intersects[0]) do_job(intersects[0].object)

        }
    }

    session.addEventListener("select", (event) => { onSelect(event); });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Create a render loop that allows us to draw on the AR view.
    const onXRFrame = (time, frame) => {
        // Queue up the next draw request.
        session.requestAnimationFrame(onXRFrame);

        // Bind the graphics framebuffer to the baseLayer's framebuffer
        gl.bindFramebuffer(gl.FRAMEBUFFER, session.renderState.baseLayer.framebuffer)

        // Retrieve the pose of the device.
        // XRFrame.getViewerPose can return null while the session attempts to establish tracking.
        const pose = frame.getViewerPose(referenceSpace);
        if (pose) {
            // In mobile AR, we only have one view.
            const view = pose.views[0];

            const viewport = session.renderState.baseLayer.getViewport(view);
            renderer.setSize(viewport.width, viewport.height)

            // Use the view's transform matrix and projection matrix to configure the THREE.camera.
            camera.matrix.fromArray(view.transform.matrix)
            camera.projectionMatrix.fromArray(view.projectionMatrix);
            camera.updateMatrixWorld(true);

            const hitTestResults = frame.getHitTestResults(hitTestSource);
            if (hitTestResults.length > 0) {
                const hitPose = hitTestResults[0].getPose(referenceSpace);
                if (stage == 0) {
                    main_group.visible = true;
                    main_group.position.set(hitPose.transform.position.x, hitPose.transform.position.y, hitPose.transform.position.z)
                    main_group.updateMatrixWorld(true);
                }
            }

            // Render the scene with THREE.WebGLRenderer.
            renderer.render(scene, camera)
        }
    }
    session.requestAnimationFrame(onXRFrame);
}