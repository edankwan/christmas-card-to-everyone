define([
        'exports',
        '3d/stage3d',
        'project/3d/scene/terrainScene',
        'project/3d/scene/cardScene',
        'three/shaders/HorizontalBlurShader',
        'three/shaders/VerticalBlurShader',
        'THREE',
        'EKTweener'
    ],
    function(exports, stage3d, terrainScene, cardScene, HorizontalBlurShader, VerticalBlurShader, THREE, EKTweener) {

        var undef;

        var _hBlurPass;
        var _vBlurPass;

        exports.focusRatio = 0;

        var _time = 0;

        function preInit() {
            stage3d.uiScene = new THREE.Scene();

            terrainScene.preInit();
            cardScene.preInit();
        }

        function init() {

            terrainScene.init();
            cardScene.init();

            stage3d.camera.position.z = 1000;

            stage3d.renderer.autoClearColor = false;
            stage3d.renderer.shadowMapEnabled = true;

            stage3d.composer.addPass(stage3d.renderPass);

            _hBlurPass = new THREE.ShaderPass( HorizontalBlurShader );
            stage3d.composer.addPass(_hBlurPass);

            _vBlurPass = new THREE.ShaderPass( VerticalBlurShader );
            stage3d.composer.addPass(_vBlurPass);

            stage3d.composer.addPass(terrainScene.postprocessing);
            terrainScene.postprocessing.renderToScreen = true;

            stage3d.beforeRendered.add(_beforeRender);
            stage3d.afterRendered.add(_afterRender, this, -1024);


        }

        function _beforeRender() {

            _hBlurPass.uniforms.h.value = 0;//(1 - exports.focusRatio) * 2 / stage3d.width;
            _vBlurPass.uniforms.v.value = 0;//(1 - exports.focusRatio) * 2 / stage3d.height;

            stage3d.camera.position.x = Math.cos(_time) * 20;
            stage3d.camera.position.y = Math.sin(_time * 2) * 10;
            stage3d.camera.lookAt(cardScene.container.position);
            cardScene.container.lookAt(stage3d.camera.position);
            _time += 0.005;
        }

        function _afterRender() {
            stage3d.renderer.render( stage3d.uiScene, stage3d.camera);
        }

        function focus(duration) {
            EKTweener.to(this, duration === undef ? 3.5: duration, {focusRatio: 1, ease: 'linear'});
        }

        function blur(duration) {
            EKTweener.to(this, duration === undef ? 3.5: duration, {focusRatio: 0, ease: 'linear'});
        }

        function addLightSetToScene(scene) {
            var spotlight = new THREE.SpotLight( 0xffffff, 1, 0, Math.PI / 2, 1 );
            spotlight.castShadow = true;
            spotlight.position.set(200, 200, 800);
            spotlight.target.position.set( 0, 0, 0 );

            spotlight.castShadow = true;

            spotlight.shadowCameraNear = 300;
            spotlight.shadowCameraFar = 3500;
            spotlight.shadowCameraFov = 50;

            spotlight.shadowBias = 0.0001;
            spotlight.shadowDarkness = 0.5;

            spotlight.shadowMapWidth = 1024;
            spotlight.shadowMapHeight = 1024;

            var directionalLight = new THREE.DirectionalLight(0xffffff, 0.15);
            directionalLight.position.x = -100;
            directionalLight.position.y = 100;
            directionalLight.position.z = 1000;

            var pointLight = new THREE.PointLight(0xb7f7ff, 2, 6000);
            pointLight.position.x = 0;
            pointLight.position.y = 1000;
            pointLight.position.z = -1400;

            scene.add(spotlight);
            scene.add(pointLight);
            scene.add(directionalLight);
        }

        exports.preInit = preInit;
        exports.init = init;
        exports.focus = focus;
        exports.blur = blur;
        exports.addLightSetToScene = addLightSetToScene;

    }
);
