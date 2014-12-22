define([
        'exports',
        'settings',
        'ldsh!project/templates/ui/footer',
        'project/controllers/uiController',
        'utils/domUtils',
        'EKTweener'
    ],
    function(exports, settings, tmpl, uiController, domUtils, EKTweener) {

        var container = exports.container = null;
        var _containerStyle;
        var _line1;

        function preInit() {

        }

        function init() {
            _initVariables();
            _initEvents();
        }

        function _initVariables() {
            container = exports.container = domUtils.createElement(tmpl(settings.locale));
            _containerStyle = container.style;

            _line1 = container.querySelector('.footer-line-1');
        }

        function _initEvents() {

        }

        function onResize() {
            _containerStyle.height = uiController.footerHeight + 'px';
        }

        function show() {
            _containerStyle.display = 'table';

            EKTweener.fromTo(_line1, 0.45, {opacity: 0, transform3d: 'translate3d(0,30px,0)'}, {opacity: 1, transform3d: 'translate3d(0,0,0)'});

        }

        exports.preInit = preInit;
        exports.init = init;
        exports.onResize = onResize;
        exports.show = show;

    }
);
