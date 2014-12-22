define([
        'PIXI',
        'mout/object/mixIn',
        './Tooth',
        './TeethSetCover',
        'stageReference'
    ],
    function(PIXI, mixIn, Tooth, TeethSetCover, stageReference) {

        function TeethSet() {}

        var _p = TeethSet.prototype;

        function init(cfg) {
            mixIn(this, {
                direction: 1
            }, cfg);
            this.container = new PIXI.DisplayObjectContainer();
            this.gum = new PIXI.Graphics();
            this.teeth = [];

            if(this.direction < 0) {
                this.container.pivot.y = Tooth.DISTANCE;
                this.container.scale.y = -1;
            }
        }

        function resize(width, height) {
            var teeth = this.teeth;
            for(var i = 0, len = teeth.length; i < len; i++) {
                this.container.removeChild(teeth[i]);
                Tooth.poolRelease(teeth[i]);
            }
            teeth = this.teeth = [];
            var amount = Math.ceil(width / Tooth.DISTANCE);// + 2;
            var baseX = this.baseX = (width - (amount - 1) * Tooth.DISTANCE) / 2;
            var tooth;
            for(i = 0; i < amount; i++) {
                tooth = Tooth.poolGet();
                if(Tooth.poolWasCreated) {
                    tooth.init();
                }
                this.container.addChild(tooth);
                tooth.position.x = baseX + i * Tooth.DISTANCE;
                teeth.push(tooth);
            }

            if(this.gum.parent) {
                this.container.removeChild(this.gum);
            }

            this.container.addChild(this.gum);
            var g = this.gum;
            g.clear();
            g.beginFill(TeethSetCover.BASE_COLOR, 1);
            g.drawRect(0, TeethSetCover.WHITE_HEIGHT, width, Tooth.DISTANCE - TeethSetCover.WHITE_HEIGHT);
            g.endFill();
            g.beginFill(TeethSetCover.GUM_COLOR, 1);
            g.drawRect(0, TeethSetCover.WHITE_HEIGHT, width, TeethSetCover.GUM_HEIGHT);
            g.endFill();
        }

        function update(x, y, dt) {
            var teeth = this.teeth;
            var tooth, angle;
            for(var i = 0, len = teeth.length; i < len; i++) {
                tooth = teeth[i];
                tooth.update(x - tooth.position.x, y, dt);
                this._z = Math.abs(x - tooth.position.x);
            }
        }

        // function _zSortFunc(a, b) {
        //     if (a._z > b._z) {
        //         return -1;
        //     }
        //     if (a._z < b._z) {
        //         return 1;
        //     }
        //     return 0;
        // }

        _p.init = init;
        _p.resize = resize;
        _p.update = update;

        return TeethSet;
    }
);
