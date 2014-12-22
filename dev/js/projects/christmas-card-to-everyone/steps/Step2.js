define([
        './Step',
        '2d/stage2d',
        '3d/stage3d',
        'project/3d/card/card',
        'project/3d/card/cardBack2d',
        'project/ui/instructions',
        'project/controllers/uiController',
        'project/controllers/stepController',
        'project/controllers/dataController',
        'project/ui/Indicator',
        'mout/object/mixIn',
        'THREE',
        'EKTweener'
    ],
    function(Step, stage2d, stage3d, card, cardBack2d, instructions, uiController, stepController, dataController, Indicator, mixIn, THREE, EKTweener) {

        function Step2(){}

        var _super = Step.prototype;
        var _p = Step2.prototype = Object.create( _super );
        _p.constructor = Step2;

        var _wasNextBtnActive = false;
        var _indicator;

        function preInit(cfg) {
            _super.preInit.call(this, mixIn({
                index: 2
            }, cfg));
        }

        function _initVariables() {
            _super._initVariables.call(this);

            _indicator = new Indicator();
            _indicator.init({
                baseAlpha: 0.3,
                color: 0x000000
            });
            stage2d.stage.addChild(_indicator.container);

        }

        function _initEvents() {
            _super._initEvents.call(this);

        }

        function show() {
            _super.show.call(this);
            EKTweener.to(card, 1, {openRatio: 1});
            cardBack2d.enableInput();
            instructions.goToStep(2);
            dataController.onCardTextChanged.add(_onTextChange);
            cardBack2d.onInputFocused.add(_onInputFocus);
            _wasNextBtnActive = false;
            stage2d.afterResized.add(_resize);
            _resize(stage2d.width, stage2d.height);
            _indicator.show();
            _indicator.time = 0;
        }

        function _onInputFocus() {
            _indicator.hide();
        }

        function _onTextChange(text) {
            if(_wasNextBtnActive && text === '') {
                _wasNextBtnActive = false;
                instructions.canvasBtn.disable();
            } else if(!_wasNextBtnActive && text !== '') {
                _wasNextBtnActive = true;
                instructions.canvasBtn.enable();
            }
        }

        function hide() {
            cardBack2d.disableInput();
            dataController.onCardTextChanged.remove(_onTextChange);
            stage2d.afterResized.remove(_resize);
            _super.hide.call(this);

        }

        function _beforeRender() {
            _super._beforeRender.call(this);

        }

        function _afterRender() {
            _super._afterRender.call(this);

        }

        function _resize(width, height) {
            _indicator.container.position.x = width / 2 + 50;
            _indicator.container.position.y = uiController.viewportCenterY;
        }

        function _onNextBtnClick() {
            _super._onNextBtnClick.call(this);
            cardBack2d.onInputFocused.remove(_onInputFocus);
            card.close();
            stepController.goToNext();
        }

        _p.preInit = preInit;
        _p._initVariables = _initVariables;
        _p._initEvents = _initEvents;
        _p.show = show;
        _p.hide = hide;
        _p._beforeRender = _beforeRender;
        _p._afterRender = _afterRender;
        _p._onNextBtnClick = _onNextBtnClick;

        return Step2;

    }
);
