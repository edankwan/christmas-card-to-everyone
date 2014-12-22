define([
        'settings',
        'PIXI',
        'edankwan/loader/quickLoader',
        'mout/object/mixIn'
    ],
    function(settings, PIXI, quickLoader, mixIn) {

        function HuePenis() {}

        var _super = PIXI.Strip.prototype;
        var _p = HuePenis.prototype = Object.create( _super );
        _p.constructor = HuePenis;

        var WIDTH = HuePenis.WIDTH = 63;
        var HEIGHT = HuePenis.HEIGHT = 136;
        var CENTER = HuePenis.CENTER = WIDTH / 2;

        // use double sized texture to make it looks better when the image got distorted
        var TEXTURE_W = 126 / 128;
        var TEXTURE_H = 272 / 512;

        var SEGMENTS = HuePenis.SEGMENTS = 10;
        var SEGMENTS_3 = HuePenis.SEGMENTS_3 = SEGMENTS + 3;

        var DICK_HEAD_HEIGHT = HuePenis.DICK_HEAD_HEIGHT = 30;
        var BALLS_HEIGHT = HuePenis.BALLS_HEIGHT = 40;
        var SEGMENTS_HEIGHT = HuePenis.SEGMENTS_HEIGHT = HEIGHT - DICK_HEAD_HEIGHT - BALLS_HEIGHT;
        var SEGMENT_HEIGHT = HuePenis.SEGMENT_HEIGHT = SEGMENTS_HEIGHT / SEGMENTS;


        var _img;

        function preInit(cfg) {
            mixIn(this, {
                side: 1,
                bendRatio: 0
            }, cfg);

            _img = quickLoader.addSingle(settings.IMAGES_PATH + 'hueSlider.png', 'image').content;

        }

        function init() {
            HuePenis.baseTexture = HuePenis.baseTexture || new PIXI.BaseTexture(_img);
            _super.constructor.call(this, new PIXI.Texture(HuePenis.baseTexture));

            this.refresh();
        }


        // base on Pixi.Rope
        function refresh() {

            this.vertices = new PIXI.Float32Array(SEGMENTS_3 * 4);
            this.uvs = new PIXI.Float32Array(SEGMENTS_3 * 4);
            this.colors = new PIXI.Float32Array(SEGMENTS_3 * 2);
            this.indices = new PIXI.Uint16Array(SEGMENTS_3 * 2);

            var vertices = this.vertices;
            var uvs = this.uvs;
            var indices = this.indices;
            var colors = this.colors;
            var y, index;
            var angles = this.angles = new PIXI.Float32Array(SEGMENTS + 1);
            var xs = this.xs = new PIXI.Float32Array(SEGMENTS + 1);
            var ys = this.ys = new PIXI.Float32Array(SEGMENTS + 1);

            for (var i = 0; i < SEGMENTS_3; ++i) {
                index = i * 4;

                if(i < 2) {
                    y = i * DICK_HEAD_HEIGHT;
                } else if(i < SEGMENTS_3 - 1) {
                    y = DICK_HEAD_HEIGHT + (i - 2) * SEGMENT_HEIGHT;
                } else {
                    y = HEIGHT;
                }

                vertices[index] = - CENTER;
                vertices[index+1] = y;
                vertices[index+2] = CENTER;
                vertices[index+3] = y;

                uvs[index] = 0;
                uvs[index + 1] = y / HEIGHT * TEXTURE_H;
                uvs[index + 2] = TEXTURE_W;
                uvs[index + 3] = y / HEIGHT * TEXTURE_H;

                index = i * 2;
                colors[index] = 1;
                colors[index+1] = 1;
                indices[index] = index;
                indices[index + 1] = index + 1;

                angles[i] = 0;
            }

        }

        function update(dt) {

            var i = SEGMENTS_3 - 2;
            var bendRatio = this.bendRatio * this.side;
            var segmentRatio;
            var vertices = this.vertices;
            var angles = this.angles;
            var xs = this.xs;
            var ys = this.ys;
            var x = 0;
            var y = HEIGHT - BALLS_HEIGHT;
            var angle, dx, dy;
            while(i--) {
                segmentRatio = 1 - i / SEGMENTS;

                if(i) {
                    angles[i] = angle;
                    xs[i] = x;
                    ys[i] = y;
                }

                angle = bendRatio * segmentRatio * 90 / 180 * Math.PI;
                x  += Math.sin(angle) * (i ? SEGMENT_HEIGHT : DICK_HEAD_HEIGHT);
                y  -= Math.cos(angle) * (i ? SEGMENT_HEIGHT : DICK_HEAD_HEIGHT);

                dx = Math.cos(angle) * CENTER;
                dy = Math.sin(angle) * CENTER;
                vertices[i * 4] = x - dx;
                vertices[i * 4 + 1] = y - dy;
                vertices[i * 4 + 2] = x + dx;
                vertices[i * 4 + 3] = y + dy;

            }

        }

        _p.preInit = preInit;
        _p.init = init;
        _p.refresh = refresh;
        _p.update = update;

        return HuePenis;
    }
);
