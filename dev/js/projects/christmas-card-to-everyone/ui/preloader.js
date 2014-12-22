define([
        'exports',
        'settings',
        '2d/stage2d',
        'project/ui/mouth',
        'project/ui/prompt',
        'project/ui/pubic',
        'tools/fontBusterTool',
        'edankwan/loader/quickLoader',
        'mout/math/clamp',
        'PIXI',
        'EKTweener',
        'stageReference'
    ],
    function(exports, settings, stage2d, mouth, prompt, pubic, fontBusterTool, quickLoader, clamp, PIXI, EKTweener, stageReference) {

        var container = exports.container = null;

        exports.percent = 0;

        var _initCallback;
        var _startCallback;

        var _container;
        var _base;
        var _baseBar;
        var _candyBar;

        var _percent;

        var _sparksContainer;
        var _sparks = [];

        var _width = 0;
        var _height = 0;
        var _time = 0;
        var _isLoaded = false;

        var SPARK_AMOUNT = 1500;

        function preInit (cb) {

            // preload locale file
            quickLoader.addSingle(settings.LOCALE_URL, 'jsonp', {
                jsonpCallback: function(data) {
                    settings.locale = data;
                    data._settings = settings;
                }
            });

            // preload fonts
            quickLoader.addSingle('quicksand-fonts', 'any', {loadFunc: function(url, cb) {
                fontBusterTool.load([
                        'quicksand-regular',
                        'quicksand-bold'
                    ], cb
                );
            }});

            if(!settings.SKIP_PROMPT) {
                prompt.preInit();
            }

            quickLoader.start(function(percent){
                if(percent == 1) {
                    if(!settings.SKIP_PROMPT) {
                        prompt.init(cb);
                    } else {
                        cb();
                    }
                }
            });

        }

        function init () {

            _container = new PIXI.DisplayObjectContainer();
            stage2d.stage.addChild(_container);

            _initBase();
            _initCandyBar();
            _initSparks();
            _initPercent();

            mouth.preInit();
            pubic.init();

        }

        function _initBase() {

            _base = new PIXI.Graphics();
            _base.beginFill(0xe83737);
            _base.drawRect(-4, -8, 8, 8);
            _base.endFill();

            _baseBar = new PIXI.Graphics();
            _baseBar.beginFill(0xcb2a2a);
            _baseBar.drawRect(-4, -8, 8, 8);
            _baseBar.endFill();

            _container.addChild(_base);
            _container.addChild(_baseBar);

        }

        function _initPercent() {
            _percent = new PIXI.Text('', {
                font: '48px quicksand-bold',
                fill: '#fff'
            });
            _percent.position.x = 40;
            _container.addChild(_percent);
        }

        function _initCandyBar() {
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            canvas.width = 8;
            canvas.height = 16;

            ctx.fillStyle = '#fff';
            ctx.fillRect(0,0,8,16);
            ctx.fillStyle = '#ff5252';
            ctx.moveTo(0,0);
            ctx.lineTo(8,7);
            ctx.lineTo(8,14);
            ctx.lineTo(0,7);
            ctx.fill();

            _candyBar = new PIXI.TilingSprite(new PIXI.Texture (new PIXI.BaseTexture(canvas)), 8, 16);
            _candyBar.anchor = new PIXI.Point(0.5, 1);
            _container.addChild(_candyBar);

        }

        function _initSparks() {
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            canvas.width = 32;
            canvas.height = 32;
            var gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
            gradient.addColorStop(0, 'rgba(100, 60, 80, 1)');
            gradient.addColorStop(1, 'rgba(30, 10, 5, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0,0,32,32);

            var texture = new PIXI.Texture (new PIXI.BaseTexture(canvas));
            var spark;
            _sparksContainer = new PIXI.SpriteBatch();
            for (var i = 0; i < SPARK_AMOUNT; i++) {
                spark = new PIXI.Sprite(texture);
                spark._life = 0;
                spark._fade = 0;
                spark._delay = ~~(Math.random() * 100);
                spark.anchor.x = 0.5;
                spark.anchor.y = 0.5;
                spark.alpha = 0;
                spark.blendMode = PIXI.blendModes.ADD;
                _sparks.push(spark);

                _sparksContainer.addChild(spark);
            }
            _container.addChild(_sparksContainer);

        }


        function start (initCallback, startCallback) {
            _initCallback = initCallback;
            _startCallback = startCallback;

            _show();
            if(!settings.SKIP_PROMPT) {
                setTimeout(function() {
                    quickLoader.start(_onLoading);
                }, 700);
            } else {
                quickLoader.start(_onLoading);
            }
        }

        function _onLoading(percent) {
            EKTweener.to(exports, settings.SKIP_PRELOADING ? 0 : 2, {percent: percent, ease: 'easeInOutSine'});
        }

        function _render(dt) {
            var percent = exports.percent;
            _candyBar.height = percent * _height;
            _candyBar.tilePosition.y = _candyBar.height - _time * 0.3;

            _percent.position.y = -clamp(percent * _height + 30, 60, _height);
            _percent.setText(~~(percent * 100) + '%');

            var spark, scale;
            for (var i = 0; i < SPARK_AMOUNT; i++) {
                spark = _sparks[i];

                if(spark._life <= 0) {
                    if(spark._delay > 0) {
                        spark._delay--;
                    } else if(percent < 1){
                        // reset
                        spark._life = 255;
                        spark._speedX = (Math.random() - 0.5) * 5;
                        spark._speedY = (Math.random() - 0.5) * 5 - 5;
                        spark._percent = percent;
                        spark._x = 0;
                        spark._y = 0;

                        scale = 0.1 + Math.pow(Math.random(), 8) * 2;
                        spark._fade = - 3 - Math.random() * 3 - scale * 2;

                        spark.scale.set(scale, scale);
                    } else {
                        spark.visible = false;
                    }
                } else {
                    spark.alpha = spark._life / 255;

                    spark._x += spark._speedX;
                    spark._y += spark._speedY;

                    spark.position.x = spark._x * Math.sin(spark._life * 0.1);
                    spark.position.y = -spark._percent * _height + spark._y;
                    spark._life += spark._fade;
                    spark._speedY+=0.9;
                }
            }

            _time++;

            if(percent == 1 && !_isLoaded) {
                _hide();
                _isLoaded = true;

                _initCallback();

                mouth.init();
                stage2d.stage.addChild(mouth.container);
                stage2d.stage.addChild(pubic.container);
                pubic.show();

                EKTweener.to(mouth, 1, {showTeethRatio: 1, ease: 'easeOutElastic'});
                mouth.show(_startCallback);
                if(settings.SKIP_DRAGGING) {
                    mouth.open(0);
                } else {
                    EKTweener.to(mouth, 1, {showTeethRatio: 1, ease: 'easeOutElastic'});
                }
            }
        }

        function _resize(width, height) {
            _width = width;
            _height = height;
            _container.position.x = _width / 2 | 0;
            _container.position.y = _height;

            _base.width = _width;
            _base.height = _height;
            _baseBar.height = _height;
        }

        function _show() {
            stage2d.beforeRendered.add(_render);
            stage2d.afterResized.add(_resize);
            _resize(stage2d.width, stage2d.height);
        }

        function _hide() {
            stage2d.stage.removeChild(_container);
            stage2d.beforeRendered.remove(_render);
            stage2d.afterResized.remove(_resize);
        }

        function dispose() {
            pubic.hide();
        }

        exports.preInit = preInit;
        exports.init = init;
        exports.start = start;
        exports.dispose = dispose;

    }
);
