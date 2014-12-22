define([
        'exports',
        'settings',
        'signals',
        'THREE',
        'three/postprocessing/EffectComposer',
        'three/postprocessing/RenderPass',
        'mout/object/deepMixIn',
        'mout/function/bind',
        'inputController',
        'stageReference'
    ],
    function(exports, settings, signals, THREE, EffectComposer, RenderPass, deepMixIn, bind, inputController, stageReference) {

        function _noop(){}

        var renderer = exports.renderer = null;
        var scene = exports.scene = null;
        var camera = exports.camera = null;
        var container = exports.container = null;
        var composer = exports.composer = null;
        var controls = exports.controls = null;
        var lookAtTarget = exports.lookAtTarget = null;

        exports.rendererConfig = {
            alpha: false,
            antialias: true,
            preserveDrawingBuffer: false
        };
        exports.composerConfig = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBFormat,
            stencilBuffer: false
        };

        exports.fov = 45;
        exports.near = 1;
        exports.far = 3000;
        exports.useControl = false;
        exports.useView = false;
        exports.useComposer = false;
        exports.useWindowSize = true;
        exports.useFixedScale = false;
        exports.fixedScaleFactor = 1;
        exports.width = 1;
        exports.height = 1;
        exports.idealWidth = 1;
        exports.idealHeight = 1;
        exports.useContainerHeightAsRaeference = true;
        exports.isActive = true;
        exports.inputEventTarget = null;
        exports.className = 'stage3d';
        exports.mouseX = 0;
        exports.mouseY = 0;

        var beforeControlUpdated = exports.beforeControlUpdated = new signals.Signal();
        var beforeRendered = exports.beforeRendered = new signals.Signal();
        var afterRendered = exports.afterRendered = new signals.Signal();
        var beforeResized = exports.beforeResized = new signals.Signal();
        var afterResized = exports.afterResized = new signals.Signal();

        var onDowned = exports.onDowned = new signals.Signal();
        var onMoved = exports.onMoved = new signals.Signal();
        var onUped = exports.onUped = new signals.Signal();
        var onWheeled = exports.onWheeled = new signals.Signal();
        var onClicked = exports.onClicked = new signals.Signal();

        var _raycaster = null;
        var _raycasterHasUpdated = false;

        function init(cfg) {

            deepMixIn(exports, cfg);

            renderer = exports.renderer = exports.renderer || new THREE.WebGLRenderer(exports.rendererConfig);

            camera = exports.camera = exports.camera || new THREE.PerspectiveCamera(exports.fov, 1, exports.near, exports.far);

            scene = exports.scene = exports.scene || new THREE.Scene();

            lookAtTarget = exports.lookAtTarget = new THREE.Object3D();

            scene.add(lookAtTarget);

            _raycaster = new THREE.Raycaster();

            if(exports.useComposer) {

                composer = exports.composer = new THREE.EffectComposer( renderer);
                renderPass = exports.renderPass = new THREE.RenderPass( scene, camera );
            }

            container = exports.container = exports.renderer.domElement;

            container.className = exports.className;

            var inputEventTarget = exports.inputEventTarget || container;

            inputController.add(inputEventTarget, 'down', _onDown);
            inputController.onMoved.add(_onMove);
            inputController.onUped.add(_onUp);
            inputController.add(inputEventTarget, 'wheel', _onWheel);
            inputController.add(inputEventTarget, 'click', _onClick);

        }

        function _onDown(ev) {
            if(exports.isActive) {
                onDowned.dispatch(ev);
            }
        }

        function _onMove(ev) {
            exports.mouseX = inputController.x / exports.width * 2 - 1;
            exports.mouseY = - inputController.y / exports.height * 2 + 1;
            if(exports.isActive) {
                onMoved.dispatch(ev);
            }
        }

        function _onUp(ev) {
            if(exports.isActive) {
                onUped.dispatch(ev);
            }
        }

        function _onWheel(delta, ev) {
            if(exports.isActive) {
                onWheeled.dispatch(delta, ev);
            }
        }

        function _onClick(ev) {
            if(exports.isActive) {
                onClicked.dispatch(ev);
            }
        }

        function updateFixedScaleFactor() {
            return exports.fixedScaleFactor = 2 * Math.tan(exports.camera.fov / 360 * Math.PI) / (exports.useContainerHeightAsRaeference ? exports.height : exports.idealHeight);
        }

        function render(dt) {
            var useControl = exports.useControl && exports.controls.isActive;
            var useView = exports.useView && exports.view.isActive;
            if(useControl) {
                beforeControlUpdated.dispatch(dt);
                controls.update();
            }

            beforeRendered.dispatch(dt);

            if(useView) {
                view.render();
            } else {
                if(exports.useComposer) {
                    if(exports.composer) {
                        exports.composer.render(0.1);
                    }
                } else {
                    renderer.render( scene, camera );
                }
            }
            afterRendered.dispatch(dt);

            _raycasterHasUpdated = false;
        }

        function getRaycaster(forceUpdate) {
            if(!_raycasterHasUpdated || forceUpdate) {
                _raycasterHasUpdated = true;
                var vector = new THREE.Vector3(exports.mouseX, exports.mouseY, 1 ).unproject( camera );
                _raycaster.set( camera.position, vector.sub( camera.position ).normalize() );
            }
            return _raycaster;
        }

        function resize(width, height) {

            if(exports.isActive) {
                beforeResized.dispatch(width, height);

                var useControl = exports.useControl && exports.controls.isActive;
                var useView = exports.useView && exports.view.isActive;


                exports.width = width;
                exports.height = height;

                if(useView) {

                    view.resize(width, height);

                } else {

                    exports.camera.aspect = width / height;

                    var idealWidth = exports.idealWidth = screen.width;
                    var idealHeight = exports.idealHeight = screen.height;
                    updateFixedScaleFactor();

                    if(exports.useFixedScale) {
                        exports.camera.setViewOffset(idealWidth, idealHeight, idealWidth - width >> 1, idealHeight - height >> 1, width, height);
                    }
                    exports.camera.updateProjectionMatrix();

                    if(exports.useComposer) {
                        if(exports.composer) {
                            exports.composer.setSize(width, height);
                        }
                    }
                    exports.renderer.setSize(width, height);
                }
                afterResized.dispatch(width, height);

            }

        }


        function setControls(target) {
            if(target) {
                controls = exports.controls = target;
                exports.useControl = true;
            } else {
                controls = exports.controls = null;
                exports.useControl = false;
            }

        }
        function setView(target) {
            if(target) {
                view = exports.view = target;
                exports.useView = true;
            } else {
                view = exports.view = null;
                exports.useView = false;
            }
        }

        exports.init = init;
        exports.updateFixedScaleFactor = updateFixedScaleFactor;
        exports.render = render;
        exports.resize = resize;
        exports.setControls = setControls;
        exports.setView = setView;
        exports.getRaycaster = getRaycaster;

    }

);
