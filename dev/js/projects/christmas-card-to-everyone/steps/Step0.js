define([
        './Step',
        'settings',
        '2d/stage2d',
        '3d/stage3d',
        'project/3d/card/card',
        'inputController',
        'project/controllers/uiController',
        'project/controllers/dataController',
        'project/controllers/stepController',
        'project/ui/instructions',
        'project/ui/Indicator',
        'project/ui/hueSlider/hueSlider',
        'mout/object/mixIn',
        'utils/mathUtils',
        'PIXI',
        'THREE',
        'EKTweener'
    ],
    function(Step, settings, stage2d, stage3d, card, inputController, uiController, dataController, stepController, instructions, Indicator, hueSlider, mixIn, mathUtils, PIXI, THREE, EKTweener) {

        function Step0(){}

        var _super = Step.prototype;
        var _p = Step0.prototype = Object.create( _super );
        _p.constructor = Step0;

        var _animation = {
            message: 0
        };

        var _spriteBaseTexture;
        var _ribbonTexture;
        var _msgContainer;
        var _msgBase;
        var _tree;
        var _youJust;
        var _receivedA;
        var _christmas;
        var _card;
        var _cherries;

        var _openIndicator;
        var _closeIndicator;

        var _hasShownInstruction = false

        function preInit(cfg) {
            _super.preInit.call(this, mixIn({
                index: 0
            }, cfg));
        }

        function _initVariables() {
            _super._initVariables.call(this);
            _spriteTexture = new PIXI.BaseTexture(settings.spriteImage);
            _ribbonTexture = new PIXI.Texture(new PIXI.BaseTexture(settings.ribbonImage));

            _msgContainer = new PIXI.DisplayObjectContainer();

            _msgBase = new PIXI.Sprite(new PIXI.Texture(_spriteTexture, new PIXI.Rectangle(0, 0, 336, 238)));
            _msgContainer.addChild(_msgBase);

            _youJust = new PIXI.Sprite(new PIXI.Texture(_spriteTexture, new PIXI.Rectangle(80, 340, 44, 25)));
            _receivedA = new PIXI.Sprite(new PIXI.Texture(_spriteTexture, new PIXI.Rectangle(130, 340, 55, 27)));
            _christmas = new PIXI.Sprite(new PIXI.Texture(_spriteTexture, new PIXI.Rectangle(0, 240, 233, 99)));
            _card = new PIXI.Sprite(new PIXI.Texture(_spriteTexture, new PIXI.Rectangle(0, 340, 71, 52)));
            _cherries = new PIXI.Sprite(new PIXI.Texture(_spriteTexture, new PIXI.Rectangle(0, 400, 55, 61)));
            _tree = new PIXI.Sprite(new PIXI.Texture(_spriteTexture, new PIXI.Rectangle(60, 380, 127, 124)));

            _msgBase.anchor.x = _msgBase.anchor.y = 0.5;
            _tree.anchor.x = _tree.anchor.y = 0.5;
            _youJust.anchor.x = _youJust.anchor.y = 0.5;
            _receivedA.anchor.x = _receivedA.anchor.y = 0.5;
            _christmas.anchor.x = _christmas.anchor.y = 0.5;
            _card.anchor.x = _card.anchor.y = 0.5;
            _cherries.anchor.x = _cherries.anchor.y = 0.5;

            _tree.position.x = -1.5;
            _tree.position.y = 1;

            _youJust.position._x = -66;
            _youJust.position._y = -42.33;

            _receivedA.position._x = -45;
            _receivedA.position._y = -32;

            _christmas.position._x = -10.25;
            _christmas.position._y = -3;

            _card.position._x = 57.0;
            _card.position._y = 26.43;

            _cherries.position.x = 122.5;
            _cherries.position.y = 2.5;

            _msgContainer.addChild(_tree);
            _msgContainer.addChild(_youJust);
            _msgContainer.addChild(_receivedA);
            _msgContainer.addChild(_christmas);
            _msgContainer.addChild(_card);
            _msgContainer.addChild(_cherries);


            _openIndicator = new Indicator();
            _openIndicator.init({
                baseAlpha: 0.7
            });
            stage2d.stage.addChild(_openIndicator.container);

            _closeIndicator = new Indicator();
            _closeIndicator.init({
                baseAlpha: 0.7,
                color: 0xbbbbbb
            });
            stage2d.stage.addChild(_closeIndicator.container);
        }

        function _initEvents() {
            _super._initEvents.call(this);

        }

        function _render() {

        }

        function show() {
            _super.show.call(this);
            stage2d.beforeRendered.add(_render);
            stage2d.afterResized.add(_resize);

            stage2d.stage.addChild(_msgContainer);
            _resize(stage2d.width, stage2d.height);

             _render();

            _tweenScale(_tree, 2.5, 0.1, 3, 1, 0.1, 0.5);
            _tweenScale(_msgBase, 2.5, 0, 1.5, 0, 1, 0.5);
            _tweenScale(_cherries, 2.5, 0.75, 2, 0, 1, 0.5);

            _tweenText(_youJust, 2.5, 0, -100, 33, 0.5);
            _tweenText(_receivedA, 2.5, 0.1, 100, -33, 0.5);
            _tweenText(_christmas, 2.5, 0.2, -300, 100, 0.5);
            _tweenText(_card, 2.5, 0.3, 200, -50, 0.5);

            hueSlider.changeHue(dataController.recievedData.hue);

            setTimeout(function(){
                card.showReceivedCard();
                setTimeout(function(){
                    _openIndicator.show();
                    _addInput();
                }, 1000);
            }, 2400);
        }

        function _addInput() {
            inputController.onUped.add(_onClick);
        }

        function _onClick() {
            var raycaster = stage3d.getRaycaster();
            var clickedSide = stage3d.getRaycaster().intersectObjects([card.frontCover, card.frontInner])[0];
            if(clickedSide) {
                if(clickedSide.object == card.frontCover) {
                    card.open();
                    _openIndicator.hide();
                    _closeIndicator.show();
                    if(!_hasShownInstruction) {
                        _hasShownInstruction = true;
                        instructions.show();
                        instructions.goToStep(0);
                        instructions.canvasBtn.enable();
                    }
                } else {
                    card.close();
                    _openIndicator.show();
                    _closeIndicator.hide();
                }
            }
        }

        function _removeInput() {
            inputController.onUped.remove(_onClick);
        }

        function _tweenScale(target, duration, delay, scale, a0, a1, wait) {
            EKTweener.fromTo(target.scale, duration / 2 - delay, {x: scale, y: scale}, {delay: delay, x: 1, y: 1, ease: 'easeOutQuint', onComplete: function(){
                EKTweener.to(target.scale, duration / 2 - delay, {delay: wait, x: 1 / scale, y: 1 / scale, ease: 'easeInQuint'});
            }});
            EKTweener.to(target, 0, {alpha: 0});
            EKTweener.fromTo(target, duration / 2 - delay, {alpha: a0}, {ease: 'linear', delay: delay, alpha: a1, onComplete: function() {
                EKTweener.to(target, duration / 2 - delay, {ease: 'easeInQuint', delay: wait, alpha: 0});
            }});
        }

        function _tweenText(target, duration, delay, offsetX, offsetY, wait) {
            EKTweener.fromTo(target.position, duration / 2 - delay, {x: target.position._x + offsetX, y: target.position._y + offsetY}, {delay: delay, x: target.position._x, y: target.position._y, ease: 'easeOutQuint', onComplete: function(){
                EKTweener.to(target.position, duration / 2 - delay, {delay: wait, x: target.position._x - offsetX, y: target.position._y - offsetY, ease: 'easeInQuint'});
            }});
            EKTweener.to(target, 0, {alpha: 0});
            EKTweener.to(target, duration / 2 - delay, {ease: 'easeInQuint', delay: delay, alpha: 1, onComplete: function() {
                EKTweener.to(target, duration / 2 - delay, {ease: 'linear', delay: wait, alpha: 0});
            }});
        }

        function _resize(width, height) {
            _msgContainer.position.x = width / 2;
            _msgContainer.position.y = uiController.viewportCenterY;
            _openIndicator.container.position.x = width / 2 + card.WIDTH / 2 - 70;
            _openIndicator.container.position.y = uiController.viewportCenterY;
            _closeIndicator.container.position.x = width / 2 - card.WIDTH + 50;
            _closeIndicator.container.position.y = uiController.viewportCenterY;
        }

        function hide() {
            _super.hide.call(this);
        }

        function _onNextBtnClick() {
            _super._onNextBtnClick.call(this);
            _closeIndicator.hide();
            _openIndicator.hide();
            _removeInput();
            card.close();
            card.hideReceivedCard();

            setTimeout(function(){
                stepController.goToNext();
            }, 1000);
        }

        _p.preInit = preInit;
        _p._initVariables = _initVariables;
        _p._initEvents = _initEvents;
        _p.show = show;
        _p.hide = hide;
        _p._onNextBtnClick = _onNextBtnClick;

        return Step0;

    }
);
