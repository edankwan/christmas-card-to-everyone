define([
        'exports',
        'settings',
        '3d/stage3d',
        'project/controllers/dataController',
        './card',
        'THREE',
        'PIXI',
        'signals',
        'mout/string/trim',
        'three/renderers/Projector'
    ],
    function(exports, settings, stage3d, dataController, card, THREE, PIXI, signals, trim) {

        var renderer = exports.renderer = null;
        var stage = exports.stage = null;
        var scene = exports.scene = null;
        var texture = exports.texture = null;
        exports.isInputActive = false;

        var onInputFocused = exports.onInputFocused = new signals.Signal();
        var onInputBlurred = exports.onInputBlurred = new signals.Signal();

        var _inputField;
        var _inputFieldStyle;
        var _text2d;

        var _transform3DStyle = settings.transform3DStyle;

        var _text = null;
        var _time = 0;
        var _defaultMessage;

        var _canvas;
        var _ctx;

        var RESOLUTION = 1.5;

        function preInit() {

        }

        function init() {
            _initPixi();
            _initInputField();

            _defaultMessage = settings.locale.card.defaultMessage;
            reset();
        }

        function _initPixi() {
            renderer = exports.renderer = PIXI.autoDetectRenderer(card.WIDTH, card.HEIGHT, {
                antialiasing: false,
                transparent: false,
                resolution: RESOLUTION
            });

            // for some reason, when I am developing the site,
            // Chrome stable 39.0.2171.95 m on my PC have the
            // bug that the texture got flipped vertically when I try
            // to draw a webgl element as texture. FF, IE, Canary are fine
            if(settings.isChrome) {
                _canvas = document.createElement('canvas');
                _canvas.width = card.WIDTH;
                _canvas.height = card.HEIGHT;
                _ctx = _canvas.getContext('2d');
                texture = exports.texture = new THREE.Texture(_canvas);
            } else {
                texture = exports.texture = new THREE.Texture(renderer.view);
            }

            stage = exports.stage = new PIXI.Stage(0xe6e4dc);
            scene = exports.scene = new PIXI.DisplayObjectContainer();
            stage.addChild(scene);

            _text2d = new PIXI.Text('', {
                font: '32px lobster',
                wordWrap: true,
                wordWrapWidth: card.WIDTH - 80,
                fill: '#333',
                align: 'center'
            });
            _text2d.anchor.x = _text2d.anchor.y = 0.5;
            _text2d.position.x = card.WIDTH / 2;
            _text2d.position.y = card.HEIGHT / 2;
            scene.addChild(_text2d);
        }

        function _initInputField() {

            _inputField = document.createElement('input');
            _inputField.className = 'card-back-input';
            _inputFieldStyle = _inputField.style;
            _inputFieldStyle.width = card.WIDTH + 'px';
            _inputFieldStyle.height = card.HEIGHT + 'px';
            _inputFieldStyle.marginLeft = (- card.WIDTH / 2) + 'px';
            _inputFieldStyle.marginTop = (- card.HEIGHT / 2) + 'px';
            _inputFieldStyle.display = 'none';

            settings.appContainer.appendChild(_inputField);

            _inputField.addEventListener('focus', _onFocus);
            _inputField.addEventListener('blur', _onBlur);
        }

        // from David Walsh http://davidwalsh.name/caret-end
        function _onFocus(el) {
            if (typeof el.selectionStart == 'number') {
                el.selectionStart = el.selectionEnd = el.value.length;
            } else if (typeof el.createTextRange != "undefined") {
                el.focus();
                var range = el.createTextRange();
                range.collapse(false);
                range.select();
            }
            if(trim(_inputField.value) == _defaultMessage) {
                _inputField.value = '';
            }

            onInputFocused.dispatch();
        }

        function _onBlur() {
            if(trim(_inputField.value) === '') {
                _inputField.value = _defaultMessage;
            }

            onInputBlurred.dispatch();
        }

        function reset() {
            _inputField.value = _defaultMessage;
        }

        function render(isVisible) {
            if(isVisible) {

                var vector = new THREE.Vector3();
                vector.setFromMatrixPosition( card.back.matrixWorld );
                vector.project(stage3d.camera);

                _inputFieldStyle[_transform3DStyle] = 'translate3d(' + (vector.x * stage3d.width / 2) + 'px,' + (-vector.y * stage3d.height / 2) + 'px,0)';

                var inputText = trim(_inputField.value);
                _text2d.alpha = inputText == !exports.isInputActive ? 1 : _defaultMessage ? 0.5: 0.7 + Math.sin(_time += 0.1) * 0.15;
                if(_text !== inputText) {
                    _text = inputText;
                    dataController.updateCardText(inputText == _defaultMessage ? '' : inputText);
                    _text2d.setText(_text);
                }

                renderer.render(stage);

                if(settings.isChrome) {
                    _ctx.save();
                    _ctx.scale(1 / RESOLUTION, 1 / RESOLUTION);
                    _ctx.drawImage(renderer.view, 0, 0);
                    _ctx.restore();
                }

                texture.minFilter = THREE.LinearFilter ;
                texture.needsUpdate = true;

            }
            _inputFieldStyle.display = isVisible && exports.isInputActive ? 'block' : 'none';
        }

        function enableInput() {
            exports.isInputActive = true;
        }

        function disableInput() {
            exports.isInputActive = false;
        }

        function changeText(text) {
            _inputField.value = text || _defaultMessage;
        }

        exports.preInit = preInit;
        exports.init = init;
        exports.render = render;
        exports.reset = reset;
        exports.enableInput = enableInput;
        exports.disableInput = disableInput;
        exports.changeText = changeText;

    }
);
