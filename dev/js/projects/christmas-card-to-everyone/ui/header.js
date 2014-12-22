define([
        'exports',
        'settings',
        'ldsh!project/templates/ui/header',
        'project/controllers/uiController',
        'utils/domUtils',
        'EKTweener'
    ],
    function(exports, settings, tmpl, uiController, domUtils, EKTweener) {

        var container = exports.container = null;
        var _containerStyle;
        var _line1;
        var _line2;
        var _line3;

        function preInit() {

        }

        function init() {
            _initVariables();
            _initEvents();
        }

        function _initVariables() {
            container = exports.container = domUtils.createElement(tmpl(settings.locale));
            _containerStyle = container.style;

            _line1 = container.querySelector('.header-line-1');
            _line2= container.querySelector('.header-line-2');
            _line3 = container.querySelector('.header-line-3');
        }

        function _initEvents() {

        }

        function onResize() {
            _containerStyle.height = uiController.headerHeight + 'px';
        }

        function show() {
            _containerStyle.display = 'table';

            EKTweener.fromTo(_line1, 0.45, {opacity: 0, transform3d: 'translate3d(-100px,0,0)'}, {opacity: 1, transform3d: 'translate3d(0,0,0)'});
            EKTweener.fromTo(_line2, 0.3, {opacity: 0, transform3d: 'scale3d(3,3,1)'}, {opacity: 1, transform3d: 'scale3d(1,1,1)'});
            EKTweener.fromTo(_line3, 0.6, {opacity: 0, transform3d: 'translate3d(100px,0,0)'}, {opacity: 1, transform3d: 'translate3d(0,0,0)'});

        }

        exports.preInit = preInit;
        exports.init = init;
        exports.onResize = onResize;
        exports.show = show;

    }
);
