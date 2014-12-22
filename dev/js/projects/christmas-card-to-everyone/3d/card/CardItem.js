define([
        'settings',
        '3d/stage3d',
        './card',
        'edankwan/loader/quickLoader',
        'three/loaders/OBJMTLLoader',
        'THREE',
        'mout/object/mixIn',
        'mout/object/get',
        'mout/math/clamp',
        'EKTweener'
    ],
    function(settings, stage3d, card, quickLoader, OBJMTLLoader, THREE, mixIn, get, clamp, EKTweener) {

        function CardItem() {}

        var _p = CardItem.prototype;

        CardItem.boundBoxes = [];

        var modelLoaderItems = CardItem.modelLoaderItems = {};
        var modelSeeds = CardItem.modelSeeds = {};
        var textureImages = CardItem.textureImages = {};
        var textures = CardItem.textures = {};

        var itemCount = 0;

        var DEFAULT_CONFIG = {
            modelId: null,
            textureImages: null,
            sizeX: 100,
            sizeY: 100,
            sizeZ: 100,

            x: 0,
            y: 0,
            tX: 0,
            tY: 0,
            r: 0,
            tR: 0,
            offsetX: 0,
            offsetY: 0,
            offsetR: 0,
            ease: 0.3
        };

        function preInit(cfg) {
            mixIn(this, DEFAULT_CONFIG, cfg);

            var filename;
            var id = this.modelId;
            if(id) {
                if(!modelLoaderItems[id]) {
                    modelLoaderItems[id] = quickLoader.addSingle(settings.MODELS_PATH + id, 'any', {loadFunc: function(url, cb) {
                        (new OBJMTLLoader()).load(url + '.obj', url + '.mtl', cb);
                    }});
                }
            }

            for(id in this.textureImages) {
                if(!textureImages[id]) {
                    filename = this.textureImages[id];
                    textureImages[id] = quickLoader.addSingle(settings.IMAGES_PATH + filename, 'image').content;
                }
            }
        }

        function init() {
            this.container = new THREE.Object3D();
            this._initSeeds();
            this._initTextures();

            this._addBoundBox();
            this._createModel();
            this.container.add(this.mesh);
            itemCount++;
        }

        function _initSeeds() {
            var id = this.modelId;
            if(id) {
                if(!modelSeeds[id]) {
                    modelSeeds[id] = modelLoaderItems[id].content;
                }
                this.seed = modelSeeds[id];
            }
        }

        function _initTextures() {
            for(var id in this.textureImages) {
                if(!textures[id]) {
                    textures[id] = new THREE.Texture(textureImages[id]);
                    textures[id].needsUpdate = true;
                }
            }
        }

        function _createModel() {
            var id = this.modelId;
            if(this.modelId) {
                this.mesh = this._createMesh(this.seed);
            }
        }

        function _createMesh(ref, parent) {
            var obj, i;
            if(!ref.material) {
                obj = new THREE.Group();
            } else {
                var geometry = ref.geometry;
                var material = ref.material.clone();
                var overridedMaterials = this.overridedMaterials;
                var overridedMaterial = overridedMaterials[material.name] || {};
                var useShadow = false;

                for(i in overridedMaterial) {
                    if(i == 'color') {
                        material.color.setHex(overridedMaterial.color);
                    } else if(i == 'emissive') {
                        material.emissive.setHex(overridedMaterial.emissive);
                    } else if(i == 'specular') {
                        material.specular.setHex(overridedMaterial.specular);
                    } else if(i == 'emissiveScalar') {
                        material.emissive.copy(material.color).multiplyScalar(overridedMaterial.emissiveScalar);
                    } else if(i == 'specularScalar') {
                        material.specular.copy(material.color).addScalar(overridedMaterial.specularScalar);
                    } else if(i == 'useShadow') {
                        useShadow = overridedMaterial.useShadow;
                    } else {
                        material[i] = overridedMaterial[i];
                    }
                }
                if(material.shading == THREE.SmoothShading && !geometry.hasComputedNormals) {
                    geometry.hasComputedNormals = true;
                    geometry.computeVertexNormals();
                }
                obj = new THREE.Mesh(geometry, material);
                if(useShadow) {
                    obj.castShadow = true;
                    obj.receiveShadow = true;
                }
            }
            if(parent) {
                parent.add(obj);
            }
            i = ref.children.length;
            while(i--) {
                this._createMesh(ref.children[i], obj);
            }
            return obj;
        }

        function flatten() {
            // add flatten here
        }

        function pop() {
            // add pop here
        }

        function _addBoundBox() {
            var mesh = this.boundBoxMesh = new THREE.Mesh(
                new THREE.BoxGeometry(this.sizeX, this.sizeY, this.sizeZ),
                new THREE.MeshPhongMaterial({
                    transparent: true,
                    color: 0x00fcff,
                    emissive: 0x157778,
                    specular: 0xffffff,
                    // side: THREE.DoubleSide,
                    opacity: 0,
                    depthTest: false
                })
            );
            mesh.item = this;
            mesh.position.z = this.sizeZ / 2 + 1 + itemCount * 0.1;

            this.boundBox = new THREE.Object3D();
            this.boundBox.add(mesh);

            this.container.add(this.boundBox);

            CardItem.boundBoxes.push(this.boundBox);
        }

        function drag() {
            EKTweener.to(this.container.position, 0.3, {z: 50});
        }

        function release() {
            EKTweener.to(this.container.position, 0.3, {z: 0});
        }

        function rollover() {
            EKTweener.to(this.boundBoxMesh.material, 0.18, {opacity: 0.4});
        }

        function rollout() {
            EKTweener.to(this.boundBoxMesh.material, 0.18, {opacity: 0});
        }

        function render() {
            var pos = this.container.position;
            this.x += (this.tX - this.x) * this.ease;
            this.y += (this.tY - this.y) * this.ease;
            this.tR *= (1 - this.ease);
            this.r += (this.tR - this.r) * this.ease;

            pos.x = (this.x = clamp(this.x, -card.HALF_WIDTH, card.HALF_WIDTH)) + this.offsetX;
            pos.y = (this.y = clamp(this.y, -card.HALF_HEIGHT, card.HALF_HEIGHT)) + this.offsetY;
            this.container.rotation.z = (this.r = clamp(this.r, -0.4, 0.4)) + this.offsetR;
        }

        function reset(x, y, r) {
            this.x = this.tX = x;
            this.y = this.tY = y;
            this.r = this.tR = r || 0;
            this.render();
        }

        _p.preInit = preInit;
        _p.init = init;
        _p._initSeeds = _initSeeds;
        _p._initTextures = _initTextures;
        _p._addBoundBox = _addBoundBox;
        _p._createModel = _createModel;
        _p._createMesh = _createMesh;

        _p.flatten = flatten;
        _p.pop = pop;

        _p.drag = drag;
        _p.release = release;
        _p.rollover = rollover;
        _p.rollout = rollout;
        _p.render = render;
        _p.reset = reset;

        return CardItem;

    }
);
