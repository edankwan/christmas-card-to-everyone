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

        function Carrot() {}

        var _super = CardItem.prototype;
        var _p = Carrot.prototype = new CardItem();
        _p.constructor = Carrot;

        var DEFAULT_CONFIG = {
            modelId: 'wreath',
            sizeX: 150,
            sizeY: 150,
            sizeZ: 80,
            overridedMaterials: {
                ribbon: {
                    shininess: 6,
                    shading: THREE.FlatShading,
                    emissiveScalar: 0.2,
                    specularScalar: 0.3,
                    side: THREE.DoubleSide,
                    useShadow : true
                },
                grass: {
                    shininess: 6,
                    shading: THREE.FlatShading,
                    emissiveScalar: 0.3,
                    useShadow : true
                }
            }
        };

        function preInit(cfg) {
            cfg = mixIn({}, DEFAULT_CONFIG, cfg);
            if(settings.pervertMode) {
                cfg.overridedMaterials.grass.color = 0x333333;
                cfg.overridedMaterials.grass.emissive = 0x000000;
                cfg.overridedMaterials.grass.specular = 0x444444;
                cfg.overridedMaterials.grass.shininess = 20;
            }
            _super.preInit.call(this, cfg);
        }

        function _createModel() {
            _super._createModel.call(this);
            this.mesh.scale.set(70, 70, 70);
        }

        _p.preInit = preInit;
        _p._createModel = _createModel;

        return Carrot;

    }
);
