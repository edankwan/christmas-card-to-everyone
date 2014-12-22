define([
        'exports',
        'PIXI',
        'signals',
        'mout/object/mixIn'
    ],
    function(exports, PIXI, signals, mixIn) {

        var container = exports.container = null;
        var renderer = exports.renderer = null;
        var beforeRendered = exports.beforeRendered = new signals.Signal();
        var afterRendered = exports.afterRendered = new signals.Signal();
        var beforeResized = exports.beforeResized = new signals.Signal();
        var afterResized = exports.afterResized = new signals.Signal();
        var stage = exports.stage = null;

        var DEFAULT_CONFIG = {
            width: 640,
            height: 480,
            antialiasing: false,
            transparent: false,
            resolution: 1,
            stageColor: 0x000000,
            className: 'stage2d'
        };

        function init(cfg) {

            mixIn(exports, DEFAULT_CONFIG, cfg);

            renderer = exports.renderer = PIXI.autoDetectRenderer(1, 1, exports);
            stage = exports.stage = new PIXI.Stage(exports.stageColor);
            container = exports.container = renderer.view;

            container.className = exports.className;

            resize(exports.width, exports.height);

        }

        function resize(width, height) {
            beforeResized.dispatch(width, height);

            exports.width = width;
            exports.height = height;
            renderer.resize(width, height);
            container.style.width = width + 'px';
            container.style.height = height + 'px';

            afterResized.dispatch(width, height);
        }

        function render(dt) {
            beforeRendered.dispatch(dt);

            renderer.render(stage);

            afterRendered.dispatch(dt);
        }


        exports.init = init;
        exports.resize = resize;
        exports.render = render;

    }
);
