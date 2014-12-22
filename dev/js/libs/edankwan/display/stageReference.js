define([
        'exports',
        'signals',
        'edankwan/polyfill/rAF'
    ], function(exports, signals) {

        exports.windowWidth = 0;
        exports.windowHeight = 0;
        exports.minWidth = 0;
        exports.minHeight = 0;
        exports.stageWidth = 0;
        exports.stageHeight = 0;
        exports.currentTime = +new Date();
        exports.deltaTime = 1000 / 60;
        exports.isRendering = false;

        var onResized = exports.onResized = new signals.Signal();
        var onRendered = exports.onRendered = new signals.Signal();
        var onBlurred= exports.onBlurred = new signals.Signal();

        var onResizedDispatcher = function(){ onResized.dispatch()};
        var onBlurredDispatcher = function(){ onBlurred.dispatch()};

        var doc = document;
        var win = window;

        function init(){
            if('addEventListener' in win) {
                win.addEventListener( 'resize', onResizedDispatcher, false );
                win.addEventListener( 'orientationchange', function(){onResized.dispatch(true)}, false );
                win.addEventListener( 'blur', onBlurredDispatcher, false );
            }else{
                win.attachEvent('onresize', onResizedDispatcher);
                win.attachEvent('onblur', onBlurredDispatcher);
            }
            onRendered.add(_beforeRender);
            onResized.add(_onResize);
            _onResize();
        }

        function _onResize(){
            if('innerWidth' in win) {
                exports.windowWidth = win.innerWidth;
                exports.windowHeight = win.innerHeight;
            } else if (doc.documentElement) {
                exports.windowWidth = doc.documentElement.clientWidth;
                exports.windowHeight = doc.documentElement.clientHeight;
            } else {
                exports.windowWidth = doc.body.clientWidth;
                exports.windowHeight = doc.body.clientHeight;
            }
            exports.stageWidth = Math.max(exports.windowWidth, exports.minWidth);
            exports.stageHeight = Math.max(exports.windowHeight, exports.minHeight);
        }

        function _beforeRender() {
            var currentTime = +new Date();
            var deltaTime = currentTime - exports.currentTime;
            exports.currentTime = currentTime;
            if(deltaTime !== 0) {
                exports.deltaTime = deltaTime;
            }
        }

        function _render(){
            if(exports.isRendering) {
                win.requestAnimationFrame(_render);
                onRendered.dispatch(exports.deltaTime);
            }
        }

        function startRender() {
            exports.isRendering = true;
            _render();
        }

        function stopRender() {
            exports.isRendering = false;
        }

        function renderOnce (){
            onRendered.dispatch(exports.deltaTime);
        }

        exports.init = init;
        exports.onResized =  onResized;
        exports.onRendered =  onRendered;
        exports.startRender = startRender;
        exports.stopRender = stopRender;
        exports.renderOnce = renderOnce;

    }
);
