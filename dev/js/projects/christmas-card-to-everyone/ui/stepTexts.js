define([
        'exports',
        'settings',
        '3d/stage3d',
        'inputController',
        'edankwan/loader/quickLoader',
        'project/controllers/uiController',
        'ldsh!project/templates/ui/stepTexts',
        'text!project/shaders/stepTexts/stepTexts.vert',
        'text!project/shaders/stepTexts/stepTexts.frag',
        'tools/shaderTool',
        'utils/domUtils',
        'THREE',
        'EKTweener'
    ],
    function(exports, settings, stage3d, inputController, quickLoader, uiController, tmpl, vs, fs, shaderTool, domUtils, THREE, EKTweener) {

        var container = exports.container = null;
        var particlesUniforms = exports.particlesUniforms = null;

        exports.isActive = false;

        var _containerStyle;

        var _textDoms = [];
        var _pixelInfos = [];
        var _maxPixelAmount = 0;
        var _containerTop = 0;

        var _particles;

        var STEP_COUNT = 3;
        var STEP_HEIGHT = 30;
        var STEP_OFFSET_Y = 80;
        var NAME_OFFSET_X = 40;
        var TITLE_OFFSET_X = 90;
        var HEIGHT = (STEP_COUNT - 1) * STEP_OFFSET_Y + STEP_HEIGHT;

        var _buddyChristImage;

        function preInit () {
            _buddyChristImage = quickLoader.addSingle(settings.IMAGES_PATH + 'buddy_christ.png').content;
        }

        function init () {
            container = exports.container = domUtils.createElement(tmpl(settings.locale));
            _containerStyle = container.style;

            var textDom, pixelInfo;
            for(var i = 0; i < STEP_COUNT; i++) {

                textDom = _createTextDom(i);
                pixelInfo = _getPixelInfo(textDom);

                container.appendChild(textDom);
                textDom.style.top = (i * STEP_OFFSET_Y) + 'px';
                _maxPixelAmount = Math.max(_maxPixelAmount, pixelInfo.amount);

                _textDoms.push(textDom);
                _pixelInfos.push(pixelInfo);
            }

            _createParticles();

        }

        function _createParticles() {
            var geometry = new THREE.BufferGeometry();
            var pixelsXY, x, y, a, i, j;
            var offsetXData = new Float32Array( _maxPixelAmount * 3 );
            var offsetYData = new Float32Array( _maxPixelAmount * 3 );
            var alphaData = new Float32Array( _maxPixelAmount * 3 );
            var randomData = new Float32Array( _maxPixelAmount );
            var offset = 0;
            for(i = 0; i < STEP_COUNT; i++) {
                pixelsXY = _pixelInfos[i].pixelsXY;
                for(j = 0; j < _maxPixelAmount; j++) {
                    offset = j * 3 + i;
                    if(pixelsXY[j * 3]) {
                        x = pixelsXY[j * 3 + 0];
                        y = pixelsXY[j * 3 + 1];
                        a = pixelsXY[j * 3 + 2];
                    } else {
                        a = 0;
                    }
                    randomData[offset] = Math.random();
                    offsetXData[offset] = x;
                    offsetYData[offset] = -(y + STEP_OFFSET_Y * i);
                    alphaData[offset] = a;
                }
            }
            geometry.addAttribute( 'a_offset_x', new THREE.BufferAttribute( offsetXData, 3 ) );
            geometry.addAttribute( 'a_offset_y', new THREE.BufferAttribute( offsetYData, 3 ) );
            geometry.addAttribute( 'a_random', new THREE.BufferAttribute( randomData, 1 ) );
            geometry.addAttribute( 'position', new THREE.BufferAttribute( alphaData, 3 ) );
            geometry.computeBoundingSphere();

            particlesUniforms = exports.particlesUniforms = {
                u_center: { type: 'v2', value: {x: 0, y: 0}},
                u_time: { type: 'f', value: 0 },
                u_step: { type: 'f', value: 0 },
                u_dpi: { type: 'f', value: window.devicePixelRatio || 1 }
            };
            var material =  new THREE.ShaderMaterial({
                attributes: {
                    a_random: { type: 'f', value: randomData },
                    a_offset_x: { type: 'v3', value: offsetXData },
                    a_offset_y: { type: 'v3', value: offsetYData }
                },
                uniforms: particlesUniforms,
                vertexShader : shaderTool.compile(vs),
                fragmentShader : shaderTool.compile(fs),
                blending: THREE.AdditiveBlending,
                transparent: true,
                depthTest: false
            });

            _particles = new THREE.PointCloud(geometry, material);

            stage3d.uiScene.add(_particles);

            stage3d.beforeRendered.add(_afterRender);
        }

        function _createTextDom(stepIndex) {
            var stepLocale = settings.locale['step' + (stepIndex + 1)];
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            _setFont(ctx, true, 14);

            var titleLines = stepLocale.title.split('\n');
            var maxWidth = 0;
            for(var i = 0, len = titleLines.length; i < len; ++i) {
                maxWidth = Math.max(maxWidth, ctx.measureText(titleLines[i]).width);
            }
            maxWidth += TITLE_OFFSET_X;
            canvas.width = maxWidth;
            canvas.height = STEP_HEIGHT;
            ctx.fillStyle = '#fff';
            _setFont(ctx, false, 24);
            ctx.fillText(stepLocale.name, 0, 17);
            _setFont(ctx, true, 14);
            for(i = 0, len = titleLines.length; i < len; ++i) {
                ctx.fillText(titleLines[i], TITLE_OFFSET_X, 10 + (i * 17));
            }
            return canvas;
        }

        function _getPixelInfo(canvas) {
            var width = canvas.width;
            var height = canvas.height;
            var ctx = canvas.getContext('2d');
            var imageData = ctx.getImageData(0, 0, width, height);
            var data = imageData.data;
            var dataLength = data.length;
            // var rgb;
            var pixelsXY = [];
            for(var i = 0; i < dataLength; i+=4 ) {
                if(data[i + 3] > 0) {
                    // if(!rgb) {
                    //     rgb = [data[i], data[i + 1], data[i + 2]];
                    // }
                    pixelsXY.push(
                        ((i / 4) % width), // x
                        ((i / 4) / width | 0), // y
                        data[i + 3] // alpha
                    );
                }
            }
            return {
                width: width,
                height: height,
                // rgb: rgb,
                amount: pixelsXY.length / 3,
                pixelsXY: pixelsXY
            };
        }

        function _setFont(ctx, isBold, size) {
            ctx.font = size + 'px ' + (isBold ? 'quicksand-bold' : 'quicksand-regular');
        }

        function _afterRender() {
            _particles.position.copy(stage3d.camera.position);
            _particles.rotation.copy(stage3d.camera.rotation);
            _particles.translateZ(-1 / stage3d.fixedScaleFactor);

            _particles.lookAt(stage3d.camera.position);
            _particles.translateX(-(stage3d.width / 2 - NAME_OFFSET_X));
            _particles.translateY(-uiController.viewportCenterYOffset + HEIGHT / 2);

            particlesUniforms.u_time.value++;
            particlesUniforms.u_center.value.x = stage3d.width / 2 - NAME_OFFSET_X;
            particlesUniforms.u_center.value.y = stage3d.height / 2 - _containerTop;
        }

        function onResize() {
            _containerTop = uiController.viewportCenterY - HEIGHT / 2;
            _containerStyle.top = _containerTop + 'px';
        }

        function show() {
            if(!exports.isActive) {
                exports.isActive = true;
                for(var i = 0; i < STEP_COUNT; i++) {
                    EKTweener.fromTo(_textDoms[i], 1.5 + i * 0.4, {
                        opacity: 0,
                        transform3d: 'translate3d(-50px,0,0)'
                    },{
                        opacity: 0.2,
                        transform3d: 'translate3d(0,0,0)',
                        ease: 'easeOutElastic'
                    });
                }
            }
        }

        function hide() {
            if(exports.isActive) {
                exports.isActive = false;
                for(var i = 0; i < STEP_COUNT; i++) {
                    EKTweener.to(_textDoms[i], 1.5 + i * 0.4, {
                        opacity: 0,
                        transform3d: 'translate3d(-50px,0,0)'
                    });
                }
            }
        }

        exports.preInit = preInit;
        exports.init = init;
        exports.onResize = onResize;
        exports.show = show;
        exports.hide = hide;

    }
);
