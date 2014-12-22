define([
        'settings',
        '2d/stage2d',
        'PIXI',
        'edankwan/loader/quickLoader',
        'mout/object/mixIn',
        'mout/function/bind',
        'utils/mathUtils',
        'stageReference',
        'EKTweener'
    ],
    function(settings, stage2d, PIXI, quickLoader, mixIn, bind, mathUtils, stageReference, EKTweener) {

        function Indicator() {}

        var _p = Indicator.prototype;

        var _textureImg;
        var _texture;

        var DEFAULT_CONFIGS = {
            radius: 20,
            amount: 3,
            globalAlpha: 0,
            baseAlpha: 0.5,
            color: 0xFFFFFF,
            time: 0
        };

        function init(cfg) {
            mixIn(this, DEFAULT_CONFIGS, cfg);

            var container = this.container = new PIXI.DisplayObjectContainer();
            var parts = this.parts = [];
            var part;
            for(var i = 0, len = this.amount; i < len; i++) {
                part = this._createPart();
                parts.push(part);
                container.addChild(part);
            }

            this.boundRender = bind(this.render, this);
        }

        function _createPart() {
            var part = new PIXI.Graphics();
            part.beginFill(this.color, 1.0);
            part.drawCircle(0, 0, this.radius);
            part.blendMode = PIXI.blendModes.ADD;
            part.alpha = 0;
            return part;
        }

        function render() {

            var part;
            var parts = this.parts;
            var ratio;
            for(var i = 0, len = this.amount; i < len; i++) {
                part = parts[i];
                ratio = Math.pow(mathUtils.clampNorm((this.time + i * 20) % 100, 40, 100), 2);
                part.scale.x = part.scale.y = 0.8 + i * 0.2 + ratio * 1;
                part.alpha = this.globalAlpha * Math.pow((1 - Math.abs(ratio - 0.5) * 2), 0.9) * this.baseAlpha;
            }

            this.time++;
        }

        function show() {
            this.container.visible = true;
            this.time = 0;
            stage2d.beforeRendered.add(this.boundRender);
            EKTweener.fromTo(this, 0.5, {globalAlpha: 0}, {globalAlpha: 1});
        }

        function hide() {
            var self = this;
            EKTweener.to(this, 0.5, {globalAlpha: 0, onComplete: function(){
                stage2d.beforeRendered.remove(self.boundRender);
                self.container.visible = false;
            }});
        }

        _p.init = init;
        _p._createPart = _createPart;
        _p.render = render;
        _p.show = show;
        _p.hide = hide;

        return Indicator;
    }
);
