define([
        'exports',
        'signals'
    ],
    function(exports, signals) {

        exports.state = {};
        var info = exports.info = {};
        var onDeviceFailed = exports.onDeviceFailed = new signals.Signal();
        var onDeviceReady = exports.onDeviceReady = new signals.Signal();

        exports.eyeOffsetLeft = 0;
        exports.eyeOffsetRight = 0;
        exports.isDeviceReady = false;
        var isSupported = exports.isSupported = !!(navigator.getVRDevices || navigator.mozGetVRDevices);

        var hmdDevice = exports.hmdDevice = null;
        var sensorDevice = exports.sensorDevice = null;

        function init() {
            if(isSupported) {
                if (navigator.getVRDevices) {
                    navigator.getVRDevices().then(_enumerateVRDevices);
                } else {
                    notavigator.mozGetVRDevices(_enumerateVRDevices);
                }
            } else {
                onDeviceFailed.dispatch();
            }
        }

        function _enumerateVRDevices(devices) {
            for (var i = 0; i < devices.length; ++i) {
                if (devices[i] instanceof HMDVRDevice) {
                    hmdDevice = exports.hmdDevice = devices[i];
                    exports.eyeOffsetLeft = hmdDevice.getEyeTranslation('left');
                    exports.eyeOffsetRight = hmdDevice.getEyeTranslation('right');
                }
            }

            // Next find a sensor that matches the HMD hardwareUnitId
            for (var i = 0; i < devices.length; ++i) {
                if (devices[i] instanceof PositionSensorVRDevice &&
                    (!hmdDevice || devices[i].hardwareUnitId == hmdDevice.hardwareUnitId)) {
                    sensorDevice = exports.sensorDevice = devices[i];

                    info.hardwareUnitId = sensorDevice.hardwareUnitId;
                    info.deviceId = sensorDevice.deviceId;
                    info.deviceName = sensorDevice.deviceName;
                }
            }
            exports.isDeviceReady = true;
            onDeviceReady.dispatch();
        }

        function setFullscreen(domElement) {
            if(isSupported) {
                if (domElement.webkitRequestFullscreen) {
                    domElement.webkitRequestFullscreen({ vrDisplay: hmdDevice });
                } else if (domElement.mozRequestFullScreen) {
                    domElement.mozRequestFullScreen({ vrDisplay: hmdDevice });
                }
            }
        }

        function update() {
            if(isSupported) {
                exports.state = sensorDevice.getState();
            }
        }

        function updateFOVScale(fovScale) {

            var fovLeft = hmdDevice.getRecommendedEyeFieldOfView('left');
            var fovRight = hmdDevice.getRecommendedEyeFieldOfView('right');

            fovLeft.upDegrees *= fovScale;
            fovLeft.downDegrees *= fovScale;
            fovLeft.leftDegrees *= fovScale;
            fovLeft.rightDegrees *= fovScale;

            fovRight.upDegrees *= fovScale;
            fovRight.downDegrees *= fovScale;
            fovRight.leftDegrees *= fovScale;
            fovRight.rightDegrees *= fovScale;

            hmdDevice.setFieldOfView(fovLeft, fovRight);
        }

        exports.init = init;
        exports.setFullscreen = setFullscreen;
        exports.update = update;
        exports.updateFOVScale = updateFOVScale;

    }
);
