define([
        'settings',
        '3d/stage3d',
        '2d/stage2d',
        'inputController',
        'project/controllers/stage3dController',
        'project/controllers/uiController',
        'project/controllers/stepController',
        'project/ui/preloader',
        'tools/statsTool',
        'stageReference'
    ],
    function(settings, stage3d, stage2d, inputController, stage3dController, uiController, stepController, preloader, statsTool, stageReference) {

        function beforePreInit() {

            settings.appContainer = document.getElementById('app');
            settings.appContainer.classList.add(settings.IS_DESKTOP ? 'is-desktop' : 'is-mobile');

            inputController.init();
            stageReference.init();
            stageReference.startRender();

            stage3d.init({
                far: 10000,
                useComposer: true,
                inputEventTarget: settings.appContainer
            });
            stage3d.scene.fog = new THREE.Fog( 0x00d5ee, 0, 8000);

            stage2d.init({
                transparent: true
            });

            if(settings.IS_DEV) {
                statsTool.init({
                    hAlign: 'left',
                    vAlign: 'bottom'
                });
            }

            settings.appContainer.appendChild(stage3d.container);
            settings.appContainer.appendChild(stage2d.container);

            stageReference.onRendered.add(_render);
            stageReference.onResized.add(_onResize);
            _onResize();


            preloader.preInit(preInit);
        }

        function preInit() {

            stage3dController.preInit();
            uiController.preInit();
            stepController.preInit();
            _onResize();

            preloader.start(init, start);
        }

        function init() {
            stage3dController.init();
            uiController.init();
            stepController.init();
        }

        function start() {
            preloader.dispose();
            uiController.show();
            stepController.show();
        }

        function _render(dt) {
            stage3d.render(dt);
            stage2d.render(dt);
        }

        function _onResize() {
            var width = stageReference.stageWidth;
            var height = stageReference.stageHeight;
            stage3d.resize(width, height);
            stage2d.resize(width, height);
        }

        // pre-preloading :/
        beforePreInit();

    }

);
