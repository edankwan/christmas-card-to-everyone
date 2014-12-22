define([
        './Step',
        'settings',
        '3d/stage3d',
        'project/3d/card/card',
        'project/ui/instructions',
        'project/controllers/uiController',
        'project/controllers/stepController',
        'project/controllers/dataController',
        'project/ui/hueSlider/hueSlider',
        'mout/object/mixIn',
        'THREE'
    ],
    function(Step, settings, stage3d, card, instructions, uiController, stepController, dataController, hueSlider, mixIn, THREE) {

        function Step1(){}

        var _super = Step.prototype;
        var _p = Step1.prototype = Object.create( _super );
        _p.constructor = Step1;

        function preInit(cfg) {
            _super.preInit.call(this, mixIn({
                index: 1
            }, cfg));

            hueSlider.preInit();
        }

        function _initVariables() {
            _super._initVariables.call(this);

            hueSlider.init();

            settings.appContainer.appendChild(hueSlider.container);
        }

        function _initEvents() {
            _super._initEvents.call(this);

        }

        function show() {
            _super.show.call(this);

            // dirty timeouts :)
            setTimeout(function() {
                hueSlider.changeHue(0);
                card.show();
            }, 1000);
            setTimeout(function() {
                instructions.show();
                instructions.goToStep(1);
                hueSlider.show();
                card.enableDragging();
            }, 2000);
            setTimeout(function() {
                hueSlider.demo();
            }, 2800);
            setTimeout(function() {
                instructions.canvasBtn.enable();
            }, 3500);
        }

        function hide() {
            _super.hide.call(this);

        }

        function _beforeRender() {
            _super._beforeRender.call(this);

        }

        function _afterRender() {
            _super._afterRender.call(this);

        }

        function _onNextBtnClick() {
            _super._onNextBtnClick.call(this);
            card.disableDragging();
            hueSlider.hide();
            dataController.updateCardItems();
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

        return Step1;

    }
);
