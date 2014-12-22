define([
        'exports',
        'settings',
        '3d/stage3d',
        'edankwan/loader/quickLoader',
        'text!project/shaders/snow/snow.vert',
        'text!project/shaders/snow/snow.frag',
        'tools/shaderTool',
        'THREE'
    ],
    function(exports, settings, stage3d, quickLoader, vs, fs, shaderTool, THREE) {

        var container = exports.container = null;
        var uniforms = exports.uniforms = null;

        var _snowImage;

        var AMOUNT = 2000;

        function preInit() {
            _snowImage = quickLoader.addSingle(settings.IMAGES_PATH + 'snow.png').content;
        }

        function init() {
            var geometry = new THREE.BufferGeometry();
            var posData = new Float32Array( AMOUNT * 3 );

            var index = 0;
            for(var i = 0; i < AMOUNT; i++) {
                posData[index++] = (Math.random() * 2 - 1) * 0.5;
                posData[index++] = i / AMOUNT;
                posData[index++] = (Math.random() * 2 - 1) * 1000 - 800;
                // posData[index++] = 0;
                // posData[index++] = 0;
                // posData[index++] = 0;
            }

            geometry.addAttribute( 'position', new THREE.BufferAttribute( posData, 3 ) );
            geometry.computeBoundingSphere();

            var texture = new THREE.Texture(_snowImage);
            texture.needsUpdate = true;

            uniforms = exports.uniforms = {
                // fog
                fogColor: { type: 'c', value: new THREE.Color(0x000000)},
                fogDensity: { type: 'f', value: 0.025 },
                fogFar: { type: 'f', value: 2000 },
                fogNear: { type: 'f', value: 1 },

                u_time: { type: 'f', value: 0 },
                u_bound: { type: 'v2', value: {x: 1000, y: -300}},
                u_scale_x: { type: 'f', value: 0 },
                u_texture: { type: 't', value: texture},
            };

            var material =  new THREE.ShaderMaterial({
                // attributes: {
                // },
                uniforms: uniforms,
                vertexShader : shaderTool.compile(vs),
                fragmentShader : shaderTool.compile(fs),
                blending: THREE.AdditiveBlending,
                transparent: true,
                depthTest: false,
                fog: true
            });

            container = exports.container = new THREE.PointCloud(geometry, material);
            resize(stage3d.width, stage3d.height);
        }

        var _time = 0;

        function render(dt) {
            uniforms.u_time.value = _time;
            _time += dt * 0.00003;
        }

        function resize(width, height) {
            uniforms.u_scale_x.value = width;
        }

        exports.preInit = preInit;
        exports.init = init;
        exports.render = render;
        exports.resize = resize;

    }
);
