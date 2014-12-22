define([
        './Step',
        '3d/stage3d',
        'project/3d/scene/terrainScene',
        'project/3d/scene/cardScene',
        'project/3d/card/card',
        'project/ui/instructions',
        'project/controllers/uiController',
        'project/controllers/stepController',
        'project/controllers/dataController',
        'mout/object/mixIn',
        'THREE',
        'EKTweener'
    ],
    function(Step, stage3d, terrainScene, cardScene, card, instructions, uiController, stepController, dataController, mixIn, THREE, EKTweener) {

        function Step3(){}

        var _super = Step.prototype;
        var _p = Step3.prototype = Object.create( _super );
        _p.constructor = Step3;

        function preInit(cfg) {
            _super.preInit.call(this, mixIn({
                index: 3
            }, cfg));
        }

        function _initVariables() {
            _super._initVariables.call(this);

        }

        function _initEvents() {
            _super._initEvents.call(this);

        }

        function show() {
            _super.show.call(this);
            instructions.goToStep(3);

            instructions.onUrlInputClicked.add(_onUrlInputClick);
        }

        function _onUrlInputClick(){
            instructions.canvasBtn.enable();
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
            instructions.onUrlInputClicked.remove(_onUrlInputClick);
            card.hide();
            instructions.hide();
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

        return Step3;

    }
);
