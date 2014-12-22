define([
        'exports',
        'settings',
        './card',
        'edankwan/loader/quickLoader',
        'text!project/shaders/hue.frag',
        'THREE',
        'PIXI'
    ],
    function(exports, settings, card, quickLoader, fs, THREE, PIXI) {

        var renderer = exports.renderer = null;
        var stage = exports.stage = null;
        var scene = exports.scene = null;
        var texture = exports.texture = null;

        var _uniforms;
        var _image;
        var _baseTexture;
        var _logo;
        var _text1;
        var _text2;
        var _mask;

        var _canvas;
        var _ctx;

        function preInit() {
            _image = quickLoader.addSingle(settings.IMAGES_PATH + 'card_front.png', 'image').content;
        }

        function init() {

            renderer = exports.renderer = PIXI.autoDetectRenderer(card.WIDTH, card.HEIGHT, {
                antialiasing: false,
                transparent: false
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

            stage = exports.stage = new PIXI.Stage(0xffffff);
            scene = exports.scene = new PIXI.DisplayObjectContainer();

            _baseTexture = new PIXI.BaseTexture(_image);
            var texture2d = new PIXI.Texture(_baseTexture);
            texture2d.setFrame(new PIXI.Rectangle(0, 0, 360, 400));
            _base = new PIXI.Sprite(texture2d);
            _base.anchor = new PIXI.Point(0.5, 0.5);
            _base.position.x = card.WIDTH / 2;
            _base.position.y = card.HEIGHT / 2;
            _base.filters = [new PIXI.AbstractFilter(fs.split('\n'), _uniforms = {
                u_hue: { type: '1f', value: 0 },
            })];

            texture2d = new PIXI.Texture(_baseTexture);
            texture2d.setFrame(new PIXI.Rectangle(204,404,35,35));
            _logo = new PIXI.Sprite(texture2d);
            _logo.anchor = new PIXI.Point(0.5, 0.5);
            _logo.position.x = card.WIDTH / 2;
            _logo.position.y = 115;

            texture2d = new PIXI.Texture(_baseTexture);
            texture2d.setFrame(new PIXI.Rectangle(0,401,194,72));
            _text1 = new PIXI.Sprite(texture2d);
            _text1.anchor = new PIXI.Point(0.5, 2);
            _text1.position.x = card.WIDTH / 2;
            _text1.position.y = 195;

            texture2d = new PIXI.Texture(_baseTexture);
            texture2d.setFrame(new PIXI.Rectangle(204,451,147,9));
            _text2 = new PIXI.Sprite(texture2d);
            _text2.anchor = new PIXI.Point(0.5, 2);
            _text2.position.x = card.WIDTH / 2;
            _text2.position.y = 165;

            _mask = new PIXI.Graphics();
            _mask.beginFill(0x000000);
            _mask.drawRect(0, 0, card.WIDTH - 30 * 2, card.HEIGHT - 30 * 2);
            _mask.endFill();
            _mask.position.x = 30;
            _mask.position.y = 30;

            _base.mask = _mask;

            scene.addChild(_base);
            scene.addChild(_logo);
            scene.addChild(_text1);
            scene.addChild(_text2);
            scene.addChild(_mask);
            stage.addChild(scene);

        }

        function render() {
            _base.position.x = card.WIDTH / 2 - card.rY * 30;
            _base.position.y = card.HEIGHT / 2 - card.rX * 30;

            renderer.render(stage);

            if(settings.isChrome) {
                _ctx.drawImage(renderer.view, 0, 0);
            }
            texture.minFilter = THREE.LinearFilter ;
            texture.needsUpdate = true;
        }

        function updateHue(ratio) {
            _uniforms.u_hue.value = ratio;
            texture.needsUpdate = true;
        }

        exports.preInit = preInit;
        exports.init = init;
        exports.render = render;
        exports.updateHue = updateHue;

    }
);
