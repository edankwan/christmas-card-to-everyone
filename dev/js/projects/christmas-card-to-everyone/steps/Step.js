define([
        'exports',
        'settings',
        'project/ui/instructions',
        'mout/object/mixIn'
    ],
    function(exports, settings, instructions, mixIn) {

        function Step() {}

        var _p = Step.prototype;

        function preInit(cfg) {
            mixIn(this, {
                index: 0,
                isActive: false
            }, cfg);
            this.locale = settings.locale['step' + this.index];
        }

        function init () {

            this._initVariables();
            this._initEvents();
        }

        function _initVariables() {

        }

        function _initEvents() {

        }

        function show() {
            instructions.canvasBtn.onClicked.add(this._onNextBtnClick, this);
        }

        function hide() {
            instructions.canvasBtn.onClicked.remove(this._onNextBtnClick, this);
            instructions.canvasBtn.disable();
        }

        function _onNextBtnClick(evt) {
            instructions.canvasBtn.disable();
        }


        _p.preInit = preInit;
        _p.init = init;
        _p._initVariables = _initVariables;
        _p._initEvents = _initEvents;
        _p.show = show;
        _p.hide = hide;
        _p._onNextBtnClick = _onNextBtnClick;

        return Step;

    }
);
