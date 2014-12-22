define([
        'exports',
        'settings',
        '2d/stage2d',
        'project/ui/mouth',
        'mout/math/clamp',
        'PIXI',
        'EKTweener',
        'stageReference'
    ],
    function(exports, settings, stage2d, mouth, clamp, PIXI, EKTweener, stageReference) {

        var container = exports.container = null;

        exports.showAnimation = 0;

        var _hairs = [];

        var HAIR_AMOUNT = 100;

        var _time = 0;
        var _width = 0;
        var _height = 0;

        var _lazyOptimizeIndex = 0;
        var LAZY_OPTIMIZE_COUNT = 3;

        function init() {
            var hair, nodeCount, j, points, x, y, vX, vY, shade;
            container = exports.container = new PIXI.DisplayObjectContainer();
            for (var i = 0; i < HAIR_AMOUNT; i++) {
                hair = new PIXI.Graphics();
                nodeCount = 6 + Math.random() * 3 | 0;
                hair._points = points = [];
                vX = (Math.random() - 0.5)* 100;
                vY = 5 + Math.random() * 25;
                x = vX;
                y = vY - 20;
                for(j = 0; j < nodeCount; j++) {
                    points.push(x, y);
                    x += vX + (Math.random() - 0.5) * 50;
                    y += vY + (Math.random() - 0.3) * 30;

                    vX *= 0.8;
                }
                hair._color = 0xcdcdcd + 0x010101 * ~~(Math.random() * 50);
                shade = hair._shade = parseInt(hair._color.toString(16).substr(0, 2), 16);
                // hair._dR = shade - 0xcd;
                hair._dG = 0xcd - 0x8b;
                hair._dB = 0xcd - 0x36;

                //0xcd8b36
                hair._grow = 0;
                hair._growSpeed = 0.4 + Math.random() *0.7;
                hair._thickness = 5 + Math.random() * 8;
                _hairs.push(hair);

                container.addChild(hair);
            }
        }

        function _render() {
            var showAnimation = exports.showAnimation -  + mouth.mouseDownRatio * 0.8;
            var mouthDragRatio = mouth.mouseDragRatio;
            var mouseDownRatio = clamp(mouth.mouseDownRatio, 0, 1);
            var hair, nodeCount, j, points, x, y, px, py, index, floorGrow, fractGrow, nodeRatio, popRatio, color, shade;
            for (i = 0; i < HAIR_AMOUNT; i++) {
                if(i % LAZY_OPTIMIZE_COUNT == _lazyOptimizeIndex) {
                    hair = _hairs[i];
                    points = hair._points;
                    hair.clear();
                    px = points[0];
                    py = points[1];
                    hair.moveTo(px,py);
                    floorGrow = hair._grow | 0;
                    popRatio = (1 - showAnimation) * (0.5 + (i / (HAIR_AMOUNT - 1)) * 0.5);
                    color = hair._color;
                    if(settings.pervertMode) {
                        shade = hair._shade;
                        color = shade * 65536 + (shade - ~~(hair._dG * mouseDownRatio)) * 256 + shade - ~~(hair._dB * mouseDownRatio);
                    }

                    for(j = 1, nodeCount = points.length / 2; j < nodeCount; j++) {
                        nodeRatio = j / (nodeCount - 1);
                        hair.lineStyle(hair._thickness * (1 - nodeRatio) + 1, color);
                        index = j * 2;
                        x = points[index] + Math.sin(_time * 0.005 + nodeRatio * Math.PI + i) * 10 * nodeRatio;
                        y = points[index + 1] + Math.cos(_time * 0.01 + nodeRatio * Math.PI + i) * 15 * nodeRatio;
                        x += (x - px) * popRatio * 0.7;
                        y += (y - py) * popRatio;
                        x *= (1-mouthDragRatio);
                        if(floorGrow > j) {
                            hair.lineTo(x, y);
                        } else if(floorGrow + 1 > j) {
                            fractGrow = hair._grow - floorGrow;
                            if(floorGrow) {
                                hair.lineTo(px + (x - px) * fractGrow, py + (y - py) * fractGrow);
                            } else {
                                hair.lineTo(x * fractGrow, y * fractGrow);
                            }
                        } else {
                            break;
                        }
                        px = x;
                        py = y;
                    }
                    hair._grow += hair._growSpeed * (popRatio + 1);
                    if(hair._grow > nodeCount) {
                        hair._grow = nodeCount;
                    }
                }
            }

            _lazyOptimizeIndex = (++_lazyOptimizeIndex) % LAZY_OPTIMIZE_COUNT;

            container.position.y = -mouthDragRatio * 400;
            _time++;
        }

        function _resize(width, height) {
            _width = width;
            _height = height;
            container.position.x = _width / 2 | 0;
        }

        function show() {
            stage2d.beforeRendered.add(_render);
            stage2d.afterResized.add(_resize);
            EKTweener.to(exports, 1, {showAnimation: 1.3, ease: 'easeOutBounce'});
            _resize(stage2d.width, stage2d.height);
        }

        function hide() {
            stage2d.beforeRendered.remove(_render);
            stage2d.afterResized.remove(_resize);
        }

        exports.init = init;
        exports.show = show;
        exports.hide = hide;

    }
);
