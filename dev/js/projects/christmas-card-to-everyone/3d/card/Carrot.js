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

        function Carrot() {}

        var _super = CardItem.prototype;
        var _p = Carrot.prototype = new CardItem();
        _p.constructor = Carrot;

        var DEFAULT_CONFIG = {
            modelId: 'carrot',
            sizeX: 120,
            sizeY: 200,
            sizeZ: 100,
            textureImages: {
                'noiseNormal' : 'noise_normal'
            },
            overridedMaterials: {
                orange: {
                    shininess: 6,
                    shading: THREE.SmoothShading,
                    emissiveScalar: 0.8,
                    specularScalar: 0.2,
                    useShadow : true
                },
                grass: {
                    shininess: 6,
                    shading: THREE.FlatShading,
                    emissiveScalar: 0.3,
                    useShadow : true
                },
                dickhead: {
                    shininess: 17,
                    shading: THREE.FlatShading,
                    emissive: 0xdc3733,
                    useShadow : true
                },
                penis: {
                    shininess: 6,
                    shading: THREE.FlatShading,
                    color: 0x7d5721,
                    emissive: 0x7d5721,
                    useShadow : true
                }
            }
        };

        function preInit(cfg) {
            cfg = mixIn({}, DEFAULT_CONFIG, cfg);
            if(settings.pervertMode) {
                cfg.modelId = 'penis';
            }
            _super.preInit.call(this, cfg);
        }

        function _createModel() {
            _super._createModel.call(this);
            if(settings.pervertMode) {
                this.mesh.rotation.y = Math.PI;
                this.mesh.scale.set(50, 50, 50);
            } else {
                this.mesh.rotation.y = -Math.PI / 2;
                this.mesh.scale.set(70, 70, 70);
            }
        }

        _p.preInit = preInit;
        _p._createModel = _createModel;

        return Carrot;

    }
);
