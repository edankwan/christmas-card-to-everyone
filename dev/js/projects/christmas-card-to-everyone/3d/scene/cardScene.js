define([
        'exports',
        'settings',
        'inputController',
        '3d/stage3d',
        'project/controllers/stage3dController',
        'project/3d/card/card',
        'project/controllers/uiController',
        'edankwan/loader/quickLoader',
        'THREE'
    ],
    function(exports, settings, inputController, stage3d, stage3dController, card, uiController, quickLoader, THREE) {

        var container = exports.container = null;
        var cardWrapper = exports.cardWrapper = null;

        function preInit() {
            card.preInit();
        }

        function init() {
            scene = stage3d.uiScene;
            container = exports.container = new THREE.Object3D();
            cardWrapper = exports.cardWrapper = new THREE.Object3D();
            container.add(cardWrapper);
            scene.add(container);

            stage3dController.addLightSetToScene(scene);

            _addCard();
            stage3d.beforeRendered.add(_beforeRender, this, -9999);
        }

        function _addCard() {
            card.init();
            cardWrapper.add(card.container);
        }

        function _beforeRender() {
            var scale = stage3d.fixedScaleFactor * container.position.distanceTo(stage3d.camera.position);
            card.container.scale.set(scale, scale, scale);
            cardWrapper.position.y = - uiController.viewportCenterYOffset * scale;

        }

        exports.preInit = preInit;
        exports.init = init;

    }
);
