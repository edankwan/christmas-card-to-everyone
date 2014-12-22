define([
        'exports',
        'settings',
        '2d/stage2d',
        './teeth/TeethSet',
        './teeth/TeethSetCover',
        './teeth/Tooth',
        'project/ui/Indicator',
        'inputController',
        'controllers/audioController',
        'project/controllers/uiController',
        'mout/math/lerp',
        'mout/math/clamp',
        'PIXI',
        'EKTweener'
    ],
    function(exports, settings, stage2d, TeethSet, TeethSetCover, Tooth, Indicator, inputController, audioController, uiController, lerp, clamp, PIXI, EKTweener) {

        var container = exports.container = null;

        exports.openRatio = 0;
        exports.showTeethRatio = 0;
        exports.mouseDownRatio = 0;
        exports.mouseDragRatio = 0;
        exports.mouseDragRatioTarget = 0;
        exports.isDraggable = false;

        var _width = 0;
        var _height = 0;
        var _maxLength = 0;

        var _isDragLeftSide = false;

        var _topCover;
        var _bottomCover;

        var _topContainer;
        var _topGraphics;
        var _topTeethSet;

        var _bottomContainer;
        var _bottomGraphics;
        var _bottomTeethSet;

        var _center = 0;

        var _leftIndicator;
        var _rightIndicator;

        var MIN_TOP = 150;
        var MIN_BOTTOM = 90;

        var _topFrom = MIN_TOP;
        var _topTo = MIN_TOP;
        var _bottomFrom = MIN_BOTTOM;
        var _bottomTo = MIN_BOTTOM;

        var _startCallback;

        function preInit() {
            audioController.add('hallelujah', settings.AUDIOS_PATH + 'hallelujah.' + settings.audioFormat, true);
            audioController.add('bgm', settings.AUDIOS_PATH + 'its_beginning_to_look_a_lot_like_christmas.' + settings.audioFormat, true);

        }

        function init () {
            container = exports.container = new PIXI.DisplayObjectContainer();
            _topContainer = new PIXI.DisplayObjectContainer();
            _bottomContainer = new PIXI.DisplayObjectContainer();

            _topTeethSet = new TeethSet();
            _topTeethSet.init({direction: -1});
            _bottomTeethSet = new TeethSet();
            _bottomTeethSet.init();
            _bottomTeethSet.container.position.y = - Tooth.DISTANCE;

            _topGraphics = new PIXI.Graphics();
            _bottomGraphics = new PIXI.Graphics();

            _topContainer.addChild(_topGraphics);
            _topContainer.addChild(_topTeethSet.container);
            _bottomContainer.addChild(_bottomTeethSet.container);
            _bottomContainer.addChild(_bottomGraphics);

            _topCover = new TeethSetCover();
            _topCover.init({direction: -1});
            container.addChild(_topCover);
            _bottomCover = new TeethSetCover();
            _bottomCover.init({});
            container.addChild(_bottomCover);

            _leftIndicator = new Indicator();
            _rightIndicator = new Indicator();
            _leftIndicator.init();
            _rightIndicator.init();
            container.addChild(_leftIndicator.container);
            container.addChild(_rightIndicator.container);

        }

        function _onDown(){
            if(exports.isDraggable) {
                _leftIndicator.hide();
                _rightIndicator.hide();
                _isDragLeftSide = inputController.x < _width / 2;
                EKTweener.to(exports, 0.5, {mouseDownRatio: 1, ease: 'easeOutElastic'});
                audioController.play('hallelujah', true, 0);
            }
        }

        function _onMoved(evt){
            if(exports.isDraggable) {
                if(inputController.isDown) {
                    exports.mouseDragRatioTarget = clamp((_isDragLeftSide ? -evt.distanceX : evt.distanceX) / _height * 5 / 2, 0, 1);
                }
            }
        }

        function _onUp(){
            if(exports.isDraggable) {
                _leftIndicator.show();
                _rightIndicator.show();
                exports.mouseDragRatioTarget = 0;
                audioController.pause('hallelujah');

                if(exports.mouseDragRatio > 0.8) {
                    open(1);
                } else {
                    EKTweener.to(exports, 0.5, {mouseDownRatio: 0});
                }
            }
        }

        function open(duration) {
            audioController.play('bgm', true);
            exports.isDraggable = false;
            container.removeChild(_leftIndicator.container);
            container.removeChild(_rightIndicator.container);
            EKTweener.to(exports, duration, {mouseDownRatio: 1, mouseDragRatio: 1, mouseDragRatioTarget: 1, openRatio: 1, ease: 'easeOutQuint', onComplete: function(){
                container.addChild(_topContainer);
                container.addChild(_bottomContainer);
                container.removeChild(_topCover);
                container.removeChild(_bottomCover);
                container.rotation = 0;
                _resize(_width, _height);
                _startCallback();
            }});
        }

        function _render(dt) {
            var openRatio = exports.openRatio;

            if(openRatio < 1) {
                if(exports.isDraggable) {
                    exports.mouseDragRatio += (exports.mouseDragRatioTarget - exports.mouseDragRatio) * 0.2;
                }
                _topCover.position.y = lerp(openRatio, _topFrom, _topTo);
                _topCover.update(openRatio, exports.showTeethRatio, exports.mouseDownRatio, exports.mouseDragRatio);
                _bottomCover.position.y = lerp(openRatio, _bottomFrom, _bottomTo);
                _bottomCover.update(openRatio, exports.showTeethRatio, exports.mouseDownRatio, exports.mouseDragRatio);

                container.pivot.x = _maxLength / 2;
                container.pivot.y = _height / 2;
                container.position.x = _width / 2;
                container.position.y = _height / 2;
                container.rotation = -Math.PI / 2 * (1 - openRatio);

                _leftIndicator.container.position.x = _maxLength / 2;
                _leftIndicator.container.position.y = _height / 2 - 120 - exports.mouseDownRatio * 80;
                _rightIndicator.container.position.x = _maxLength / 2;
                _rightIndicator.container.position.y = _height / 2 + 120 + exports.mouseDownRatio * 80;

            } else {
                _topContainer.position.y = _topTo;
                _topTeethSet.update(inputController.x, inputController.y - _topTo, dt);
                _bottomContainer.position.y = _bottomTo;
                _bottomTeethSet.update(inputController.x, inputController.y - _bottomTo, dt);
            }
        }

        function _resize(width, height) {
            _width = width;
            _height = height;
            _maxLength = Math.sqrt(width * width + height * height);

            var halfHeight = height / 2;

            _topFrom = halfHeight - 44;
            _bottomFrom = halfHeight + 44;

            var headerHeight = Math.max(height / 5, MIN_TOP);
            var footerHeight = Math.max(height / 9, MIN_BOTTOM);

            uiController.updateHeights(headerHeight, footerHeight);
            _topTo = headerHeight - 22;
            _bottomTo = height - footerHeight + 22;

            if(exports.openRatio < 1) {

                _topCover.refresh(_maxLength, _maxLength / 2);
                _bottomCover.refresh(_maxLength, _maxLength / 2);

            } else {

                _topTeethSet.resize(width, height);
                _bottomTeethSet.resize(width, height);

                _topGraphics.clear();
                _topGraphics.beginFill(0xe83737, 1);
                _topGraphics.drawRect(0, -halfHeight, width, Math.ceil(halfHeight));
                _topGraphics.endFill();

                _bottomGraphics.clear();
                _bottomGraphics.beginFill(0xe83737, 1);
                _bottomGraphics.drawRect(0, 0, width, halfHeight);
                _bottomGraphics.endFill();

                container.pivot.x = _width / 2;
                container.pivot.y = _height / 2;
                container.position.x = _width / 2;
                container.position.y = _height / 2;
            }

        }

        function show(startCallback) {
            _startCallback = startCallback;
            exports.isDraggable = true;

            stage2d.beforeRendered.add(_render);
            stage2d.afterResized.add(_resize);

            inputController.onDowned.add(_onDown);
            inputController.onMoved.add(_onMoved);
            inputController.onUped.add(_onUp);
            _resize(stage2d.width, stage2d.height);
            _render();

            _leftIndicator.show();
            _rightIndicator.show();
        }


        function hide() {

            stage2d.beforeRendered.remove(_render);
            stage2d.afterResized.remove(_resize);

            inputController.onDowned.remove(_onDown);
            inputController.onMoved.remove(_onMoved);
            inputController.onUped.remove(_onUp);

        }

        exports.preInit = preInit;
        exports.init = init;
        exports.open = open;
        exports.show = show;
        exports.hide = hide;

    }
);
