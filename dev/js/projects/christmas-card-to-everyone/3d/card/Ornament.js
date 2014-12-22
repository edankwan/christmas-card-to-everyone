define([
        'exports',
        'settings',
        '3d/stage3d',
        './CardItem',
        'edankwan/loader/quickLoader',
        'THREE',
        'mout/object/mixIn'
    ],
    function(exports, settings, stage3d, CardItem, quickLoader, THREE, mixIn) {

        var undef;

        function Ornament() {}

        var _super = CardItem.prototype;
        var _p = Ornament.prototype = new CardItem();
        _p.constructor = Ornament;

        var _geometry;

        var DEFAULT_CONFIG = {
            sizeX: 100,
            sizeY: 100,
            sizeZ: 100,
            textureImages: {
                'noiseNormal' : 'noise_normal'
            },
            overridedMaterials: {
                ball: {
                    shininess: 6,
                    shading: THREE.FlatShading,
                    color: 0x7d5721,
                    emissive: 0x7d5721,
                    useShadow : true
                }
            },
            side: 0,
            color: 0xe53071
        };

        function preInit(cfg) {
            cfg = mixIn({}, DEFAULT_CONFIG, cfg);
            if(settings.pervertMode) {
                cfg.modelId = 'ball';
            }
            _super.preInit.call(this, cfg);
        }

        function _initSeeds() {
            if(!settings.pervertMode) {
                if(!_geometry) {
                    _geometry = new THREE.SphereGeometry( this.sizeX / 2, 32, 32 );
                    var vertices = _geometry.vertices;
                    var offsetZ = this.sizeX / 2 + 0.1;
                    for(var i = 0, len = vertices.length; i < len; i++) {
                        vertices[i].z += offsetZ;
                    }
                    _geometry.verticesNeedUpdate = true;
                }
            } else {
                _super._initSeeds.call(this);
            }
        }

        function _createModel() {
            if(!settings.pervertMode) {
                var texture = CardItem.textures[this.textureId];
                var material = new THREE.MeshPhongMaterial({
                    // map: texture
                });
                material.color.setHex(this.color);
                material.specular.copy(material.color).addScalar(0.2);
                material.emissive.copy(material.color).multiplyScalar(0.7);
                material.shininess = 6;
                var normalMap = material.normalMap = CardItem.textures['noiseNormal'].clone();
                normalMap.needsUpdate = true;
                normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
                this.mesh = new THREE.Mesh(_geometry, material);
                this.mesh.castShadow = true;
                this.mesh.receiveShadow = true;

                this.metalPart = this._createMetalPart();
                this.mesh.add(this.metalPart);
            } else {
                _super._createModel.call(this);
                // this.mesh.rotation.y = -Math.PI / 2;
                this.mesh.scale.set(50, 50, 50);
                if(this.side > 0) {
                    var mS = (new THREE.Matrix4()).identity();
                    mS.elements[0] = -1;
                    this.mesh.traverse(function(child){
                        if (child.geometry !== undef) {
                            if (child instanceof THREE.Mesh) {
                                child.geometry = child.geometry.clone();
                                child.geometry.applyMatrix(mS);
                                child.geometry.verticesNeedUpdate = true;
                                child.geometry.normalsNeedUpdate = true;
                                child.geometry.computeVertexNormals();
                                child.geometry.computeBoundingSphere();
                                child.geometry.computeFaceNormals();
                                child.geometry.computeVertexNormals();
                                child.material.side = THREE.BackSide;
                            }
                        }
                  });
                }
            }
        }

        function _createMetalPart() {
            var geometry = new THREE.CylinderGeometry(10, 10, 20, 16, 1 );
            var material = new THREE.MeshPhongMaterial({
                color: 0x878787,
                specular: 0xeeefff,
                emissive: 0x323258
            });
            var mesh = new THREE.Mesh(geometry, material);
            mesh.position.y = this.sizeY * 0.5;
            mesh.position.z = this.sizeX / 2 + 0.1;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            return mesh;
        }

        function render() {
            _super.render.call(this);
            if(!settings.pervertMode) {
                this.mesh.material.normalMap.offset.x += 0.001;
            }
        }

        _p.preInit = preInit;
        _p._initSeeds = _initSeeds;
        _p._createModel = _createModel;
        _p._createMetalPart = _createMetalPart;
        _p.render = render;

        return Ornament;

    }
);
