define([
        'THREE',
        'text!shaders/snoise2D.glsl',
        'text!shaders/powInOut.glsl',
        'text!shaders/clampNorm.glsl',
        'text!shaders/rand.glsl'
    ],
    function(THREE, snoise2D, powInOut, clampNorm, rand){

        return {

            snoise2D: snoise2D,
            powInOut: powInOut,
            clampNorm: clampNorm,
            rand: rand,

            // can access the THREE.ShaderChunk and THREE.ShaderLib
            THREE: THREE
        };

    }
);
