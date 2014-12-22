define([
        'exports',
        'settings',
        '2d/stage2d',
        './HuePenis',
        'inputController',
        'ldsh!project/templates/ui/hueSlider',
        'text!project/shaders/hue.frag',
        'project/3d/card/card',
        'project/3d/card/cardFront2d',
        'project/controllers/uiController',
        'utils/domUtils',
        'utils/mathUtils',
        'mout/math/lerp',
        'PIXI',
        'EKTweener'
    ],
    function(exports, settings, stage2d, HuePenis, inputController, tmpl, fs, card, cardFront2d, uiController, domUtils, mathUtils, lerp, PIXI, EKTweener) {

        var container = exports.container = null;

        exports.hueRatio = 0;
        exports.showRatio = 0;
        exports.demoRatio = 0;

        var _containerStyle;

        var _innerStyle;
        var _btnStyle;

        var _penisContainer;
        var _penis;
        var _hood;
        var _uniforms;
        var _isDown = false;
        var _isDemoing = false;
        var _y = 0;

        var _transform3DStyle = settings.transform3DStyle;

        function preInit() {
            if(settings.pervertMode) {
                _penis = new HuePenis({});
                _penis.preInit();
            }
        }

        function init() {
            _initVariables();
            _initEvents();

        }

        function _initVariables() {
            container = exports.container = domUtils.createElement(tmpl(settings.locale));
            _containerStyle = container.style;

            if(settings.pervertMode) {
                _penisContainer = new PIXI.DisplayObjectContainer();
                _penis.init();

                var texture = new PIXI.Texture(HuePenis.baseTexture);
                texture.setFrame(new PIXI.Rectangle(28, 300, 70, 14));
                _hood = new PIXI.Sprite(texture);
                _hood.anchor = new PIXI.Point(0.5, 0.5);
                _hood.scale.x = 0.5;
                _hood.scale.y = 0.5;

                _penisContainer.addChild(_penis);
                _penisContainer.addChild(_hood);
                _penisContainer.filters = [new PIXI.AbstractFilter(fs.split('\n'), _uniforms = {
                    u_hue: { type: '1f', value: 0 },
                })];

                _penisContainer.visible = false;
                stage2d.stage.addChild(_penisContainer);
            } else {
                _innerStyle = container.querySelector('.hue-slider-inner').style;
                _btnStyle = container.querySelector('.hue-slider-btn').style;
                _innerStyle.display = 'block';
            }
        }

        function _initEvents() {
            inputController.add(container, 'down', _onDown);
            inputController.onUped.add(_onUp);
        }

        function _onDown(evt) {
            _isDown = true;
        }

        function _onUp(evt) {
            _isDown = false;
        }

        function _resize(width, height) {
            var x = (width + card.WIDTH) / 2 + 5;
            _y = uiController.viewportCenterY + card.HEIGHT / 2 - HuePenis.HEIGHT - 5;
            _containerStyle.left = x + 'px';
            if(settings.pervertMode) {
                _penisContainer.position.x = x + HuePenis.CENTER;
            }
        }

        function show() {
            if(settings.pervertMode) {
                _penisContainer.visible = true;
            }
            _containerStyle.display = 'block';
            stage2d.beforeRendered.add(_beforeRender);
            stage2d.afterResized.add(_resize);
            _resize(stage2d.width, stage2d.height);
            cardFront2d.updateHue(exports.hueRatio);
            EKTweener.fromTo(exports, 0.5, {showRatio: 0}, {showRatio: 1});
            // _containerStyle.display = 'block';
        }

        function hide() {
            if(settings.pervertMode) {
                _penisContainer.visible = false;
            }
            _containerStyle.display = 'none';
            stage2d.beforeRendered.remove(_beforeRender);
            stage2d.afterResized.remove(_resize);
            EKTweener.to(exports, 0.5, {showRatio: 0});
            // _containerStyle.display = 'block';
        }

        function _beforeRender() {
            var hueRatio = exports.hueRatio;
            var showRatio = exports.showRatio;

            var y = _y + (1 - showRatio) * 50;
            var fromY = y + HuePenis.DICK_HEAD_HEIGHT;

            if(_isDemoing) {
                changeHue(exports.demoRatio);
            } else if(_isDown) {
                changeHue(mathUtils.clampNorm(inputController.y, fromY, fromY + HuePenis.SEGMENTS_HEIGHT));
            }

            _containerStyle.top = y + 'px';

            if(settings.pervertMode) {
                var segIndexValue = hueRatio * (HuePenis.SEGMENTS - 1) + 1;
                var segIndex = ~~(segIndexValue);
                var segFract = segIndexValue - segIndex;
                _uniforms.u_hue.value = hueRatio;
                _penis.bendRatio = hueRatio;
                _penis.update();
                _hood.position.x = segIndex == HuePenis.SEGMENTS ? _penis.xs[segIndex] : lerp(segFract, _penis.xs[segIndex], _penis.xs[segIndex + 1]);
                _hood.position.y = segIndex == HuePenis.SEGMENTS ? _penis.ys[segIndex] : lerp(segFract, _penis.ys[segIndex], _penis.ys[segIndex + 1]);
                _hood.rotation = segIndex == HuePenis.SEGMENTS ? _penis.angles[segIndex] : lerp(segFract, _penis.angles[segIndex], _penis.angles[segIndex + 1]);
                _penisContainer.alpha = showRatio;
                _penisContainer.position.y = y;
            } else {
                _btnStyle[_transform3DStyle] = 'translate3d(0,' + (hueRatio * HuePenis.SEGMENTS_HEIGHT) + 'px,0)';
                _btnStyle.backgroundColor = 'hsla(' + (hueRatio * 360).toFixed(0) + ',100%,50%,1)';
                _containerStyle.opacity = showRatio;
            }
        }

        function demo() {
            _isDemoing = true;
            EKTweener.fromTo(exports, 0.5, {demoRatio: 0}, {demoRatio: 1, ease: 'easeInOutQuint', onComplete: function(){
                EKTweener.to(exports, 0.5, {demoRatio: 0, ease: 'easeInOutQuint',  onComplete: function(){
                    _isDemoing = false;
                }});
            }});
        }

        function changeHue(hueRatio) {
            exports.hueRatio = hueRatio;
            cardFront2d.updateHue(exports.hueRatio);
        }

        exports.preInit = preInit;
        exports.init = init;
        exports.show = show;
        exports.hide = hide;
        exports.demo = demo;
        exports.changeHue = changeHue;

    }
);
