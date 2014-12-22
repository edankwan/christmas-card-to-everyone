define([
        'PIXI',
        'mout/object/mixIn',
        'tools/poolTool',
        'stageReference'
    ],
    function(PIXI, mixIn, poolTool, stageReference) {

        function Tooth() {}

        Tooth.toothCanvas = null;
        Tooth.toothTexture = null;

        var _super = PIXI.Strip.prototype;
        var _p = Tooth.prototype = Object.create( _super );
        _p.constructor = Tooth;

        poolTool.create(Tooth);

        var RADIUS = Tooth.RADIUS = 36;
        var DISTANCE = Tooth.DISTANCE = 64;
        var CENTER = Tooth.CENTER = DISTANCE / 2;
        var SEGMENTS = Tooth.SEGMENTS = 5;
        var SEGMENTS_1 = Tooth.SEGMENTS_1 = SEGMENTS + 1;
        var SHADOW_OFFSET_X = -6;
        var SHADOW_OFFSET_Y = 6;

        var MOUSE_RADIUS = 120;

        // to add more details for animation
        var TEXTURE_SCALE = Tooth.TEXTURE_SCALE = 2;

        var PI = Math.PI;
        var PI_2 = Math.PI * 2;
        var PI_HALF = Math.PI / 2;
        var MAX_ANGLE = PI_HALF * 0.6;

        function __drawTeethShape() {
            if(!Tooth.toothTexture) {
                var canvas = Tooth.toothCanvas = document.createElement('canvas');
                canvas.width = DISTANCE * TEXTURE_SCALE;
                canvas.height = DISTANCE * TEXTURE_SCALE;
                var ctx = canvas.getContext('2d');
                ctx.scale(TEXTURE_SCALE, TEXTURE_SCALE);
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(DISTANCE / 2, RADIUS, RADIUS, 0, Math.PI * 2);
                ctx.rect(0, RADIUS, DISTANCE, DISTANCE - RADIUS);
                ctx.closePath();
                ctx.fill();

                Tooth.toothTexture = new PIXI.Texture(new PIXI.BaseTexture(canvas));
            }
        }
        __drawTeethShape();

        function init(cfg) {

            mixIn(this, {
            }, cfg);

            this.angle = 0;
            this.vAngle = 0;
            this.yRatio = 1;

            _super.constructor.call(this, Tooth.toothTexture);

            this.refresh();
        }


        // base on Pixi.Rope
        function refresh() {

            this.vertices = new PIXI.Float32Array(SEGMENTS_1 * 4);
            this.uvs = new PIXI.Float32Array(SEGMENTS_1 * 4);
            this.colors = new PIXI.Float32Array(SEGMENTS_1 * 2);
            this.indices = new PIXI.Uint16Array(SEGMENTS_1 * 2);
            this.segHeights = new PIXI.Uint16Array(SEGMENTS);

            var vertices = this.vertices;
            var uvs = this.uvs;
            var indices = this.indices;
            var colors = this.colors;
            var segHeights = this.segHeights;
            var y, py, index;

            var segWidth = (DISTANCE - RADIUS) / (SEGMENTS - 1);
            for (var i = 0; i < SEGMENTS_1; ++i) {
                index = i * 4;
                y = i ? RADIUS + segWidth * (i - 1) : 0;

                vertices[index] = - CENTER;
                vertices[index+1] = y;
                vertices[index+2] = CENTER;
                vertices[index+3] = y;

                uvs[index] = 0;
                uvs[index + 1] = y / DISTANCE;
                uvs[index + 2] = 1;
                uvs[index + 3] = y / DISTANCE;

                index = i * 2;
                colors[index] = 1;
                colors[index+1] = 1;
                indices[index] = index;
                indices[index + 1] = index + 1;

                if(i > 0) {
                    segHeights[i - 1] = y - py;
                }
                py = y;
            }

        }

        function update(dx, dy, dt) {

            // TODO: optimization

            mouseForce = Math.pow((MOUSE_RADIUS - Math.sqrt(dx * dx + dy * dy)) / MOUSE_RADIUS, 0.5);

            var angle = this.angle += this.vAngle;
            if(mouseForce > 0) {
                this.vAngle = mouseForce * (dx > 0 ? -1 : 1) * PI_HALF * 0.2;
                this.yRatio += ( 1 + mouseForce * 0.3 - this.yRatio) * 0.3;
            } else {
                this.vAngle = (-this.angle * 1.9) % PI_2;
                this.yRatio += (1 - this.yRatio) * 0.05;
            }

            if(this.angle < -MAX_ANGLE) {
                this.angle = -MAX_ANGLE;
            } else if(this.angle > MAX_ANGLE) {
                this.angle = MAX_ANGLE;
            }

            var yRatio = this.yRatio;
            var finalAngle = this.angle;
            var segHeights = this.segHeights;
            var vertices = this.vertices;
            var ratio, tmpAngle;

            var i = SEGMENTS;
            var x = 0;
            var y = DISTANCE;
            var radius, sinAngle, cosAngle;
            var sumHeight = 0;
            while(i--) {
                index = i * 4;
                sumHeight += segHeights[i];
                ratio = Math.pow(sumHeight / DISTANCE, 0.4);
                tmpAngle = angle * ratio;
                radius = segHeights[i] * Math.pow(yRatio, 1.5);
                sinAngle = Math.sin(tmpAngle);
                cosAngle = Math.cos(tmpAngle);
                x += sinAngle * radius;
                y -= cosAngle * radius;

                vertices[index] = x - cosAngle * CENTER;
                vertices[index+1] = y - sinAngle * CENTER;
                vertices[index+2] = x + cosAngle * CENTER;
                vertices[index+3] = y + sinAngle * CENTER;

                if(vertices[index+1] > DISTANCE) vertices[index+1] = DISTANCE;
                if(vertices[index+3] > DISTANCE) vertices[index+3] = DISTANCE;
            }

        }

        _p.refresh = refresh;
        _p.init = init;
        _p.update = update;

        return Tooth;
    }
);
