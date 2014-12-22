define([
        'exports',
        '3d/stage3d',
        'THREE',
        'mout/object/mixIn',
        'inputController',
        'stageReference'
    ],
    function(exports, stage3d, THREE, mixIn, inputController, stageReference) {

        exports.radius = 1000;
        exports.zoom = 1;
        exports.minZoom = 2;
        exports.maxZoom = 0.5;
        exports.wheelMulitplier = 0.03;
        exports.friction = 0.96;
        exports.maxSpeed = 1;
        exports.deltaXMultiplier = 0.001;
        exports.deltaYMultiplier = 0.001;
        exports.minPhi = Math.PI / 2;
        exports.isActive = true;
        exports.hasInitialized = false;

        var _camera;
        var _scene;

        var _isDown = false;
        var _vx = 0;
        var _vy = 0;
        var _phi = 0;
        var _theta = 0;

        var MIN_PHI = Math.PI / 3 * 2;

        function init(cfg) {
            if(exports.hasInitialized) return;
            mixIn(exports, cfg);
            _camera = stage3d.camera;
            _scene = stage3d.scene;

            stage3d.onDowned.add(_onDown);
            stage3d.onMoved.add(_onMove);
            stage3d.onUped.add(_onUp);
            stage3d.onWheeled.add(_onWheeled);
            stageReference.onBlurred.add(_onUp);

            exports.hasInitialized = true;
        }

        function _onDown() {
            if(exports.isActive) {
                _isDown = true;
            }
        }

        function _onMove() {
            if(_isDown && exports.isActive){
                _vx -= inputController.deltaX * exports.deltaXMultiplier;
                _vy += inputController.deltaY * exports.deltaYMultiplier;
            }
        }

        function _onUp() {
            _isDown = false;
        }

        function _onWheeled(delta) {
            var zoom = exports.zoom - delta * exports.wheelMulitplier;
            if(zoom > exports.minZoom) {
                exports.zoom = exports.minZoom;
            } else if(zoom < exports.maxZoom) {
                exports.zoom = exports.maxZoom;
            } else {
                exports.zoom = zoom;
            }
        }

        function update() {
            if(exports.isActive) {
                _vx *= exports.friction;
                _vy *= exports.friction;

                _phi += _vy;
                _theta += _vx;

                _phi = Math.max( -exports.minPhi, Math.min( exports.minPhi, _phi ) );

                var len = exports.radius * exports.zoom;
                var lookAtTargetPosition = stage3d.lookAtTarget.position;

                _camera.position.x = lookAtTargetPosition.x + len * Math.cos( _phi ) * Math.sin( _theta );
                _camera.position.y = lookAtTargetPosition.y + len * Math.sin( _phi );
                _camera.position.z = lookAtTargetPosition.z + len * Math.cos( _phi ) * Math.cos( _theta );
                _camera.lookAt(lookAtTargetPosition);
            }
        }

        function enable() {
            exports.isActive = true;
        }

        function disable() {
            exports.isActive = false;
        }

        exports.init = init;
        exports.update = update;
        exports.enable = enable;
        exports.disable = disable;

    }
);
