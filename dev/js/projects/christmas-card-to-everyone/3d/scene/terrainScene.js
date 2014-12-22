define([
        'exports',
        'settings',
        '3d/stage3d',
        'project/3d/snow',
        'project/ui/mouth',
        'project/controllers/stage3dController',
        'edankwan/loader/quickLoader',
        'three/loaders/OBJMTLLoader',
        'text!project/shaders/terrain/postprocessing.vert',
        'text!project/shaders/terrain/postprocessing.frag',
        'tools/shaderTool',
        'mout/math/clamp',
        'THREE'
    ],
    function(exports, settings, stage3d, snow, mouth, stage3dController, quickLoader, OBJMTLLoader, pvs, pfs, shaderTool, clamp, THREE) {

        exports.postprocessing = null;
        exports.postprocessingUniforms = null;

        var _terrainLoadItem;
        var _terrain;
        var _skyboxLoadItem;
        var _skyBox;
        var _treeLoadItem;
        var _trees = [];

        var _floor;
        var _snowmanLoadItem;
        var snowmanContainer = exports.snowmanContainer = null;
        var _snowman;
        var _snowmanShadow;

        var scene = exports.scene = null;
        var container = exports.container = null;

        var TREE_AMOUNT = 50;

        var _time = 0;

        function preInit() {

            _terrainLoadItem = quickLoader.addSingle(settings.MODELS_PATH + 'terrain', 'any', {loadFunc: function(url, cb) {
                (new OBJMTLLoader()).load(url + '.obj', url + '.mtl', cb);
            }});

            _skyboxLoadItem = quickLoader.addSingle(settings.MODELS_PATH + 'skybox', 'any', {loadFunc: function(url, cb) {
                (new OBJMTLLoader()).load(url + '.obj', url + '.mtl', cb);
            }});

            _treeLoadItem = quickLoader.addSingle(settings.MODELS_PATH + 'christmas_tree', 'any', {loadFunc: function(url, cb) {
                (new OBJMTLLoader()).load(url + '.obj', url + '.mtl', cb);
            }});

            _snowmanLoadItem = quickLoader.addSingle(settings.MODELS_PATH + 'snowman', 'any', {loadFunc: function(url, cb) {
                (new OBJMTLLoader()).load(url + '.obj', url + '.mtl', cb);
            }});

            snow.preInit();

        }

        function init() {
            scene = exports.scene = stage3d.scene;
            container = exports.container = new THREE.Object3D();
            container.position.y = -350;
            container.position.z = -1000;

            _addTerrain();
            _addSkyBox();
            _addTrees();
            _addSnowMan();
            _createShader();

            snow.init();

            scene.add(container);
            scene.add(snow.container);

            stage3dController.addLightSetToScene(scene);

            stage3d.beforeRendered.add(_beforeRender);
            stage3d.afterResized.add(_resize);
        }

        function _addTerrain() {
            _terrain = _terrainLoadItem.content.children[0];
            _terrain.scale.x = 180;
            _terrain.scale.y = 180;
            _terrain.scale.z = 180;
            _terrain.position.z = -400;
            container.add(_terrain);

            var mat = new THREE.MeshBasicMaterial({color: 0xffffff});
            var geometry = new THREE.PlaneBufferGeometry(8000, 8000);
            var _floor = new THREE.Mesh(geometry, _terrain.children[2].material);
            _floor.rotation.x = -Math.PI / 2;
            container.add(_floor);
        }

        function _addSkyBox() {
            _skyBox = _skyboxLoadItem.content.children[0];
            _skyBox.scale.x = 3000;
            _skyBox.scale.y = 3000;
            _skyBox.scale.z = 3000;
            container.add(_skyBox);
            stage3d.beforeRendered.add(function(){
                // _skyBox.rotation.y += 0.01;
            });
        }

        function _addTrees() {
            var tree, sin, cos;
            var ratioBase = 1 / (TREE_AMOUNT - 1) * Math.PI / 2;
            var children = _treeLoadItem.content.children[0].children;
            for(var i = 0, len = children.length; i < len; i++) {
                refPart = children[i];
                refPart.material.shininess = 5;
            }
            for(i = 0; i < TREE_AMOUNT; i++) {
                if(i == Math.floor(TREE_AMOUNT / 2)) {
                    ratioBase += Math.PI;
                }
                tree = _cloneTree();
                sin = Math.sin(i * ratioBase + 0.55);
                cos = Math.cos(i * ratioBase + 0.55);
                tree.position.x = tree._x = -200 + sin * 1200 + Math.sin(i * 33.312) * 300;
                tree.position.z = tree._z = -400 + cos * 1200 + Math.cos(i * 33.21) * 300;
                tree.scale.x = tree.scale.y = tree.scale.z *= 0.5 + Math.random() * 0.5;
                container.add(tree);
                _trees.push(tree);
            }
        }

        function _cloneTree() {
            var children = _treeLoadItem.content.children[0].children;
            var part, refPart;
            var tree = new THREE.Object3D();
            for(var i = 0, len = children.length; i < len; i++) {
                refPart = children[i];
                part = new THREE.Mesh( refPart.geometry, refPart.material );
                tree.add(part);
            }
            tree.scale.x = 60;
            tree.scale.y = 60;
            tree.scale.z = 60;
            return tree;
        }

        function _addSnowMan() {
            snowmanContainer = exports.snowmanContainer = new THREE.Object3D();
            _snowman = _snowmanLoadItem.content;

            // dont get the JSONLoader to work... so use dirty update :/
            // hands
            var material;
            _snowman.children[0].children[2].material.emissive.setRGB(1,0,0);
            // scraf
            _snowman.children[3].children[0].material.emissive.setRGB(0.8,0,0);
            // scraf
            _snowman.children[5].children[0].material.emissive.setRGB(1,0.2,0);
            // body
            _snowman.children[6].children[2].material.emissive.setRGB(0.7,0.7,0.7);
            // hat
            _snowman.children[6].children[0].material.side = THREE.DoubleSide;

            var tmp;
            for(var i = 0, iLen = _snowman.children.length; i < iLen; i++) {
                tmp = _snowman.children[i];
                for(var j = 0, jLen = tmp.children.length; j < jLen; j++) {
                    if(tmp.children[j].material) tmp.children[j].material.shininess = 6;
                }
            }

            // create fake shadow
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            canvas.width = 128;
            canvas.height = 128;
            var gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
            gradient.addColorStop(0.4, 'rgba(46, 100, 100, 1)');
            gradient.addColorStop(1, 'rgba(46, 100, 100, 0)');
            ctx.fillStyle = gradient;
            // ctx.fillStyle = '#f00';
            ctx.fillRect(0, 0, 128, 128);
            var texture = new THREE.Texture(canvas);
            texture.needsUpdate = true;
            _snowmanShadow = new THREE.Mesh(new THREE.PlaneGeometry( 2, 2, 1 ), new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true
            }));
            _snowmanShadow.position.y = 0.3;
            _snowmanShadow.rotation.x = -Math.PI / 2;

            snowmanContainer.position.x = 1000;
            snowmanContainer.rotation.y = -0.8;
            snowmanContainer.scale.x = 100;
            snowmanContainer.scale.y = 100;
            snowmanContainer.scale.z = 100;

            snowmanContainer.add(_snowman);
            snowmanContainer.add(_snowmanShadow);
            container.add(snowmanContainer);
        }

        function _createShader() {
            exports.postprocessing = new THREE.ShaderPass({
                vertexShader : shaderTool.compile(pvs),
                fragmentShader : shaderTool.compile(pfs),
                uniforms : {
                    u_brightness:  { type: 'f', value: 0 },
                    u_pervert:  { type: 'f', value: 0 },
                    u_time:  { type: 'f', value: 0 }
                }
            });
            exports.postprocessingUniforms = exports.postprocessing.uniforms;

        }


        function _beforeRender(dt) {
            var showRatio = mouth.mouseDragRatio * 0.8 + mouth.openRatio * 0.2;
            container.position.z = -1000 - showRatio * 1000;
            exports.postprocessingUniforms.u_brightness.value = 1 - showRatio;
            exports.postprocessingUniforms.u_pervert.value = settings.pervertMode ? 1 : 0;
            exports.postprocessingUniforms.u_time.value = _time;

            var ratio = Math.abs(Math.sin(_time * 0.07));
            _snowman.position.y = ratio;
            _snowman.rotation.x = ratio * -0.3;
            _snowman.scale.y = 0.90 + ratio * 0.2;
            _snowmanShadow.material.opacity = 0.8 - ratio * 0.4;
            _snowmanShadow.scale.x = _snowmanShadow.scale.y = 0.4 + ratio * 0.8;

            var sin = Math.sin(_time * 0.01);
            var cos = Math.cos(_time * 0.01);
            var x = snowmanContainer.position.x = -200 + sin * 1200;
            var z = snowmanContainer.position.z =  -400 + cos * 1200;
            snowmanContainer.rotation.y = _time * 0.01 + Math.PI * 0.5;

            var ratio, dx, dz;
            for(var i = 0; i < TREE_AMOUNT; i++) {
                tree = _trees[i];
                dx = tree._x - x;
                dz = tree._z - z;
                ratio = easeOutBounce(Math.pow(1 - Math.min(Math.sqrt(dx * dx + dz * dz), 300) / 300, 2));
                tree.rotation.x = sin * dx / 300 * ratio * 2;
                tree.rotation.z = cos * dz / 300 * ratio * 2;
            }
            snow.render(dt);

            _time ++;
        }

        function easeOutBounce (t) {
            if(t <(1/2.75)) {
                    return 7.5625*t*t;
            } else if(t <2/2.75) {
                    return 7.5625*(t-=(1.5/2.75))*t + .75 ;
            } else if(t <2.5/2.75) {
                    return 7.5625*(t-=(2.25/2.75))*t + .9375 ;
            } else {
                    return 7.5625*(t-=(2.625/2.75))*t + .984375;
            }
        }

        function _resize(width, height) {
            snow.resize(width, height);
        }

        exports.preInit = preInit;
        exports.init = init;

    }
);
