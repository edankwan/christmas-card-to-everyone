define([
        'exports',
        'settings',
        'inputController',
        'ldsh!project/templates/ui/instructions',
        'project/controllers/uiController',
        'project/controllers/dataController',
        'project/controllers/stepController',
        'project/3d/card/card',
        'project/widgets/CanvasBtn',
        'project/utils/socialUtils',
        'utils/domUtils',
        'signals',
        'stageReference',
        'EKTweener'
    ],
    function(exports, settings, inputController, tmpl, uiController, dataController, stepController, card, CanvasBtn, socialUtils, domUtils, signals, stageReference, EKTweener) {

        var container = exports.container = null;
        var _containerStyle;

        var canvasBtn = exports.canvasBtn = null;
        var _canvasBtnStyle;
        var _canvasBtnNextTextStyle;
        var _canvasBtnRestartTextStyle;

        var _title;
        var _texts;
        var _socialItems;

        var onUrlInputClicked = exports.onUrlInputClicked = new signals.Signal();
        var _shareWrapper;
        var _urlInput;

        var _activeText;
        var _isActive = false;

        var WIDTH = 230;

        function preInit() {

        }

        function init() {
            _initVariables();
            _initEvents();
        }

        function _initVariables() {
            container = exports.container = domUtils.createElement(tmpl(settings.locale));
            _containerStyle = container.style;

            _title = container.querySelector('.instructions-title');
            _texts = container.querySelectorAll('.instructions-text');

            _shareWrapper = container.querySelector('.instructions-share-wrapper');
            _urlInput = container.querySelector('.instructions-url-input');
            _socialItems = container.querySelectorAll('.instruction-social-item');

            container.querySelector('.instructions-text.is-step-3').appendChild(_shareWrapper);

            canvasBtn = exports.canvasBtn = CanvasBtn.create({
                container: container.querySelector('.instructions-canvas-btn')
            });
            _canvasBtnNextTextStyle = canvasBtn.container.querySelector('.is-next').style;
            _canvasBtnRestartTextStyle = canvasBtn.container.querySelector('.is-restart').style;
            canvasBtn.init();
        }

        function _initEvents() {
            inputController.add(_urlInput, 'click', _onUrlInputFocus);
            inputController.add(_socialItems, 'click', _onSocialItemClick);
        }

        function _onSocialItemClick() {
            socialUtils.share(this.dataset.id);
        }

        function _onUrlInputFocus() {
            onUrlInputClicked.dispatch();
            this.setSelectionRange(0, this.value.length);
        }

        function onResize() {
            _containerStyle.top = uiController.headerHeight + 'px';
            _containerStyle.height = uiController.viewportHeight + 'px';
            _containerStyle.right = (( stageReference.stageWidth - card.WIDTH) / 2 - WIDTH >> 1) + 'px';
        }

        function show() {
            if(!_isActive) {
                _isActive = true;
                canvasBtn.show();
                _containerStyle.display = 'table';
                EKTweener.fromTo(_title, 1, {opacity: 0, transform3d: 'translate3d(0, 30px,0)'}, {opacity: 1, transform3d: 'translate3d(0,0,0)'});
                EKTweener.fromTo(canvasBtn.container, 1.4, {opacity: 0, transform3d: 'translate3d(0, 60px,0)'}, {opacity: 1, transform3d: 'translate3d(0,0,0)'});
            }
        }

        function hide() {
            if(_isActive) {
                _isActive = false;
                EKTweener.to(_title, 1, {opacity: 0, transform3d: 'translate3d(0, 30px,0)'});
                EKTweener.to(canvasBtn.container, 0.8, {opacity: 0, transform3d: 'translate3d(0, 60px,0)', onComplete: function(){
                    _activeText.style.display = 'none';
                    _containerStyle.display = 'none';
                }});
            }
        }

        function goToStep(index) {
            var target = domUtils.filterByClass(_texts, 'is-step-' + index, true);
            if(_activeText && target !== _activeText) {
                _hideText(_activeText);
                EKTweener.to(target, 0, {opacity: 0, transform3d: 'scale3d(1.1,1.1,1)'});
                EKTweener.to(target, 0.8, {delay: 1, opacity: 1, transform3d: 'scale3d(1,1,1)'});
            } else {
                EKTweener.fromTo(target, 1.2, {opacity: 0, transform3d: 'translate3d(0, 45px,0)'}, {opacity: 1, transform3d: 'translate3d(0,0,0)'});
            }
            _activeText = target;

            _canvasBtnNextTextStyle.display = index < 3 ? 'block' : 'none';
            _canvasBtnRestartTextStyle.display = index == 3 ? 'block' : 'none';
            if(index == 3) {
                var url = dataController.getShareUrl();
                _urlInput.value = url;
                dataController.setHash(url.split('#')[1]);
            }
        }

        function _hideText(text) {
            EKTweener.to(_activeText, 0.5, {opacity: 0, transform3d: 'scale3d(1.1,1.1,1)'});
        }

        exports.preInit = preInit;
        exports.init = init;
        exports.onResize = onResize;
        exports.show = show;
        exports.hide = hide;
        exports.goToStep = goToStep;

    }
);
