define([
        'exports',
        'settings',
        '2d/stage2d',
        'PIXI',
        'inputController',
        'controllers/audioController',
        'ldsh!project/templates/ui/prompt',
        'text!project/shaders/prompt/radiation.frag',
        'text!project/shaders/prompt/buddyChrist.frag',
        'tools/shaderTool',
        'edankwan/loader/quickLoader',
        'utils/domUtils',
        'stageReference',
        'EKTweener'
    ],
    function(exports, settings, stage2d, PIXI, inputController, audioController, tmpl, radiationFrag, buddyChristFrag, shaderTool, quickLoader, domUtils, stageReference, EKTweener) {

        exports.backgroundAnimation = 0;
        exports.buddyChristAnimation = 0;
        exports.dialogAnimation = 0;
        exports.hideAnimation = 0;

        var container = exports.container = null;
        var _containerStyle;
        var _callback;

        var _container2d;
        var _base;
        var _buddyChristImage;
        var _buddyChrist;
        var _buddyChristUniforms;
        var _radialBg;
        var _radialGraphics;
        var _radialUniforms;
        var _radialMask;

        var _dialog;
        var _dialogStyle;
        var _answers;

        var _width = 0;
        var _height = 0;
        var _lazerRadius = 0;

        var _time = 0;

        var LAZER_AMOUNT = 36;
        var BASE_RADIUS = 32;
        var LAZER_SEG_ANGLE = Math.PI * 2 / LAZER_AMOUNT;

        var _transform3DStyle = settings.transform3DStyle;

        function preInit() {
            _buddyChristImage = quickLoader.addSingle(settings.IMAGES_PATH + 'buddy_christ.png').content;
            audioController.add('evil_laugh', settings.AUDIOS_PATH + 'evil_laugh.' + settings.audioFormat, true);
        }

        function init(cb) {
            _callback = cb;

            _initVariables();
            _initEvents();

            show();
        }

        function _initVariables() {
            container = exports.container = domUtils.createElement(tmpl(settings.locale));
            _containerStyle = container.style;

            _dialog = container.querySelector('.prompt-dialog');
            _dialogStyle = _dialog.style;
            _answers = container.querySelectorAll('.prompt-answer');


            _container2d = new PIXI.DisplayObjectContainer();
            stage2d.stage.addChild(_container2d);

            _createBase();
            _createRadialBg();
            _createBuddyChrist();
        }

        function _createBase() {
            _base = new PIXI.Graphics();
            _container2d.addChild(_base);
        }

        function _createRadialBg() {
            _radialBg = new PIXI.DisplayObjectContainer();
            _radialBg.alpha = 0;

            var graphics = new PIXI.Graphics();
            graphics.beginFill(0xffb0fc);
            graphics.drawRect(-BASE_RADIUS, -BASE_RADIUS, BASE_RADIUS * 2, BASE_RADIUS * 2);
            graphics.endFill();

            _radialBg.addChild(graphics);

            graphics = _radialGraphics = new PIXI.Graphics();
            graphics.beginFill(0xff15af);
            graphics.moveTo(0, 0);
            var angle = 0;
            var deltaAngle = Math.PI / LAZER_AMOUNT;
            for(var i = 0; i < LAZER_AMOUNT; i++) {
                graphics.lineTo(Math.sin(angle) * BASE_RADIUS, Math.cos(angle) * BASE_RADIUS);
                angle += deltaAngle;
                graphics.lineTo(Math.sin(angle) * BASE_RADIUS, Math.cos(angle) * BASE_RADIUS);
                graphics.lineTo(0, 0);
                angle += deltaAngle;
            }
            graphics.endFill();
            _radialBg.addChild(graphics);
            _radialUniforms = {
                u_center: { type: '2f', value: {x: 0.5, y: 0.5}},
                dimensions:   {type: '4fv', value:[0,0,0,0]}
            };
            _radialBg.filters = [new PIXI.AbstractFilter(shaderTool.compile(radiationFrag).split('\n'), _radialUniforms)];
            _container2d.addChild(_radialBg);

            _radialMask = new PIXI.Graphics();

            _container2d.addChild(_radialMask);

            _radialBg.mask = _radialMask;

        }

        function _createBuddyChrist() {
            _buddyChrist = new PIXI.Sprite(new PIXI.Texture(new PIXI.BaseTexture(_buddyChristImage)));
            _buddyChrist.anchor.x = 0.6;
            _buddyChrist.anchor.y = 0.8;
            _buddyChristUniforms = {
                u_time: { type: '1f', value: 0},
                dimensions:   {type: '4fv', value:[0,0,0,0]}
            };
            _buddyChrist.filters = [new PIXI.AbstractFilter(shaderTool.compile(buddyChristFrag).split('\n'), _buddyChristUniforms)];
            _container2d.addChild(_buddyChrist);
        }

        function _initEvents() {
            inputController.add(_answers, 'click', _onAnswerClick);
        }

        function updateHeight(height) {
            _containerStyle.height = height + 'px';
        }

        function _render() {

            var backgroundAnimation = exports.backgroundAnimation;
            var buddyChristAnimation = exports.buddyChristAnimation;
            var dialogAnimation = exports.dialogAnimation;
            var hideAnimation = exports.hideAnimation;

            _radialBg.alpha = buddyChristAnimation;
            _radialBg.rotation += 0.01;

            _radialMask.clear();
            _radialMask.fillAlpha = 1;
            _radialMask.beginFill(0xffffff);
            _radialMask.moveTo(0, 0);
            _radialMask.lineTo(_width, 0);
            _radialMask.lineTo(_width, _height);
            _radialMask.lineTo(0, _width);
            _radialMask.lineTo(0, 0);
            _radialMask.endFill();
            _radialMask.beginFill(0xffffff);
            _radialMask.fillAlpha = 0;
            _radialMask.arc ( _radialBg.position.x, _radialBg.position.y, hideAnimation * _lazerRadius,  0,  Math.PI * 2 );
            _radialMask.endFill();

            if(dialogAnimation > 0) {
                _dialogStyle.display = 'block';
                if(hideAnimation > 0) {
                    _dialogStyle[_transform3DStyle] = 'translate3d(' + (- hideAnimation * (_lazerRadius + 200)) +'px,' + (- hideAnimation * _height) +'px,0) rotateZ(' + (hideAnimation * 32143) +'deg)';
                } else {
                    _dialogStyle[_transform3DStyle] = 'scale3d(' + dialogAnimation + ',' + dialogAnimation + ',1)';
                }
            }

            if(hideAnimation > 0) {
                _base.visible = false;
            }

            var offsetX = _width - (1 - _buddyChrist.anchor.x) * 370;
            var offsetY = _height - (1 - _buddyChrist.anchor.y) * 284;

            offsetY += (1 - buddyChristAnimation ) * 320 + hideAnimation * 500;
            _buddyChrist.rotation = (1 - buddyChristAnimation ) * 0.4;
            _buddyChrist.position.x = offsetX;
            _buddyChrist.position.y = offsetY;
            _buddyChristUniforms.u_time.value ++;

            stage2d.stage.children.sort(_alwaysOnTopSorting);

        }

        function _alwaysOnTopSorting(a, b) {
            if(a == _container2d) {
                return 1;
            }
            return 0;
        }

        function _resize(width, height) {
            _width = width;
            _height = height;
            _lazerRadius = Math.sqrt(_width * _width + _height * _height);
            _radialBg.scale.x = _radialBg.scale.y = _lazerRadius / BASE_RADIUS;
            _radialBg.position.x = _width - 350;
            _radialBg.position.y = _height - 242;
            _radialUniforms.u_center.value.x = (_width - 350) / _width;
            _radialUniforms.u_center.value.y = 1 - (_height - 242) / _height;

            _base.clear();
            _base.beginFill(0xffffff);
            _base.drawRect(0, 0, _width, _height);
            _base.endFill();
        }

        function _onAnswerClick() {
            _dialogStyle.pointerEvents = 'none';
            settings.pervertMode = !!this.dataset.val;
            if(this.dataset.val) {
                audioController.play('evil_laugh');
            }
            _callback();
            EKTweener.to(exports, 1.3, {hideAnimation: 1, onComplete: hide, ease: 'easeInOutQuint'});
        }

        function show() {
            stage2d.beforeRendered.add(_render);
            stage2d.afterResized.add(_resize);
            settings.appContainer.appendChild(container);

            EKTweener.to(exports, 4, {backgroundAnimation: 1});
            EKTweener.to(exports, 1, {delay: 0.7, buddyChristAnimation: 1, ease: 'easeOutBounce'});
            EKTweener.to(exports, 0.4, {delay: 1.4, dialogAnimation: 1, ease: 'easeOutBounce'});
            _resize(stage2d.width, stage2d.height);

        }

        function hide() {
            stage2d.beforeRendered.remove(_render);
            stage2d.afterResized.remove(_resize);

            settings.appContainer.removeChild(container);
            stage2d.stage.removeChild(_container2d);
        }

        exports.preInit = preInit;
        exports.init = init;
        exports.updateHeight = updateHeight;
        exports.show = show;

    }
);
