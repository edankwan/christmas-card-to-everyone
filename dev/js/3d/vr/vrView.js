define([
        'exports',
        '3d/stage3d',
        '3d/vr/vrController',
        'THREE',
        'mout/object/mixIn'
    ],
    function(exports, stage3d, vrController, THREE, mixIn) {

        exports.eyeOffsetScale = 1;
        exports.VR_POSITION_SCALE = 25;

        var isSupported = exports.isSupported = vrController.isSupported;
        var abstractedCamera = exports.abstractedCamera = null;
        var cameraLeft = exports.cameraLeft = null;
        var cameraRight = exports.cameraRight = null;

        exports.isActive = false;

        var _camera;
        var _scene;
        var _renderer;
        var _composer;
        var _renderTargetWidth = 1920;
        var _renderTargetHeight = 1080;
        var _fovScale = 1.0;

        var RAD_TO_DEGREE_RATIO = Math.PI / 180;

        function init(cfg) {

            if(isSupported) {

                if(!vrController.isDeviceReady) {
                    console.log('vrController is not ready yet!');
                    return;
                }
                mixIn(exports, cfg);

                _camera = stage3d.camera;
                _scene = stage3d.scene;
                _renderer = stage3d.renderer;
                _composer = stage3d.composer;
                abstractedCamera = exports.abstractedCamera = new THREE.Object3D();
                cameraLeft = exports.cameraLeft = new THREE.PerspectiveCamera(_camera.fov, _camera.aspect, _camera.near, _camera.far);
                cameraRight = exports.cameraRight = new THREE.PerspectiveCamera(_camera.fov, _camera.aspect, _camera.near, _camera.far);
                updateFOVScale(1);

                _scene.add(abstractedCamera);
            }
        }


        function updateFOVScale(value) {

            if(isSupported) {

                var hmdDevice = vrController.hmdDevice;
                var fovLeft, fovRight;

                _fovScale = value || 1;

                if ('setFieldOfView' in hmdDevice) {
                    if (_fovScale < 0.1) {
                        _fovScale = 0.1;
                    }

                    vrController.updateFOVScale(_fovScale);
                }

                if ('getRecommendedEyeRenderRect' in hmdDevice) {
                    var leftEyeViewport = hmdDevice.getRecommendedEyeRenderRect('left');
                    var rightEyeViewport = hmdDevice.getRecommendedEyeRenderRect('right');
                    _renderTargetWidth = leftEyeViewport.width + rightEyeViewport.width;
                    _renderTargetHeight = Math.max(leftEyeViewport.height, rightEyeViewport.height);
                }

                resize();

                if ('getCurrentEyeFieldOfView' in hmdDevice) {
                    fovLeft = hmdDevice.getCurrentEyeFieldOfView('left');
                    fovRight = hmdDevice.getCurrentEyeFieldOfView('right');
                } else {
                    fovLeft = hmdDevice.getRecommendedEyeFieldOfView('left');
                    fovRight = hmdDevice.getRecommendedEyeFieldOfView('right');
                }

                cameraLeft.projectionMatrix = _perspectiveMatrixFromVRFOV(fovLeft, 0.1, 1000);
                cameraRight.projectionMatrix = _perspectiveMatrixFromVRFOV(fovRight, 0.1, 1000);

            }
        }

        function _perspectiveMatrixFromVRFOV(fov, zNear, zFar) {
            var matrix = new THREE.Matrix4();
            var elements = matrix.elements;
            var upTan, downTan, leftTan, rightTan;
            if (fov == null) {
                // If no FOV is given plug in some dummy values
                upTan = Math.tan(50 * RAD_TO_DEGREE_RATIO);
                downTan = Math.tan(50 * RAD_TO_DEGREE_RATIO);
                leftTan = Math.tan(45 * RAD_TO_DEGREE_RATIO);
                rightTan = Math.tan(45 * RAD_TO_DEGREE_RATIO);
            } else {
                upTan = Math.tan(fov.upDegrees * RAD_TO_DEGREE_RATIO);
                downTan = Math.tan(fov.downDegrees * RAD_TO_DEGREE_RATIO);
                leftTan = Math.tan(fov.leftDegrees * RAD_TO_DEGREE_RATIO);
                rightTan = Math.tan(fov.rightDegrees * RAD_TO_DEGREE_RATIO);
            }

            var xScale = 2.0 / (leftTan + rightTan);
            var yScale = 2.0 / (upTan + downTan);

            elements[0] = xScale;
            elements[4] = 0.0;
            elements[8] = -((leftTan - rightTan) * xScale * 0.5);
            elements[12] = 0.0;

            elements[1] = 0.0;
            elements[5] = yScale;
            elements[9] = ((upTan - downTan) * yScale * 0.5);
            elements[13] = 0.0;

            elements[2] = 0.0;
            elements[6] = 0.0;
            elements[10] = zFar / (zNear - zFar);
            elements[14] = (zFar * zNear) / (zNear - zFar);

            elements[3] = 0.0;
            elements[7] = 0.0;
            elements[11] = -1.0;
            elements[15] = 0.0;

            return matrix;
        }

        function resize() {
            if(exports.isActive) {
                _camera.aspect = _renderTargetWidth / _renderTargetHeight;
                _camera.updateProjectionMatrix();
                if(stage3d.useComposer) {
                    _composer.setSize(_renderTargetWidth, _renderTargetHeight);
                } else {
                    _renderer.setSize( _renderTargetWidth, _renderTargetHeight );
                }

                cameraLeft.near = cameraRight.near = _camera.near;
                cameraLeft.far = cameraRight.far = _camera.far;
                cameraLeft.updateProjectionMatrix();
                cameraRight.updateProjectionMatrix();
            }
        }

        function enable() {
            if(isSupported) {
                exports.isActive = true;
                resize();
                vrController.setFullscreen(_renderer.domElement);
            }
        }

        function disable() {
            if(isSupported) {
                exports.isActive = false;
            }
        }

        var _toggle = 0;

        function render() {

            vrController.update();
            var state = vrController.state;
            if (state.position) {
                abstractedCamera.position.x = _camera.position.x + state.position.x * exports.VR_POSITION_SCALE;
                abstractedCamera.position.y = _camera.position.y + state.position.y * exports.VR_POSITION_SCALE;
                abstractedCamera.position.z = _camera.position.z + state.position.z * exports.VR_POSITION_SCALE;
            }
            if (state.orientation) {
                abstractedCamera.quaternion.multiplyQuaternions(
                    _camera.quaternion,
                    new THREE.Quaternion(
                        state.orientation.x,
                        state.orientation.y,
                        state.orientation.z,
                        state.orientation.w
                    )
                );
            }

            cameraLeft.position.copy(abstractedCamera.position);
            cameraLeft.quaternion.copy(abstractedCamera.quaternion);
            cameraRight.position.copy(abstractedCamera.position);
            cameraRight.quaternion.copy(abstractedCamera.quaternion);

            var eyeOffsetScale = exports.eyeOffsetScale;
            cameraLeft.translateX(vrController.eyeOffsetLeft.x * eyeOffsetScale);
            cameraLeft.translateY(vrController.eyeOffsetLeft.y * eyeOffsetScale);
            cameraLeft.translateZ(vrController.eyeOffsetLeft.z * eyeOffsetScale);
            cameraRight.translateX(vrController.eyeOffsetRight.x * eyeOffsetScale);
            cameraRight.translateY(vrController.eyeOffsetRight.y * eyeOffsetScale);
            cameraRight.translateZ(vrController.eyeOffsetRight.z * eyeOffsetScale);

            var renderer = stage3d.useComposer ? _composer : _renderer;

            renderer.enableScissorTest ( true );
            renderer.setScissor( 0, 0, _renderTargetWidth / 2, _renderTargetHeight );
            renderer.setViewport( 0, 0, _renderTargetWidth / 2, _renderTargetHeight );
            renderer.render(_scene, cameraLeft);

            // Render right eye
            renderer.setScissor( _renderTargetWidth / 2, 0, _renderTargetWidth / 2, _renderTargetHeight );
            renderer.setViewport( _renderTargetWidth / 2, 0, _renderTargetWidth / 2, _renderTargetHeight );
            renderer.render(_scene, cameraRight);

        }

        exports.init = init;
        exports.enable = enable;
        exports.disable = disable;

        exports.resize = resize;
        exports.render = render;

    }
);
