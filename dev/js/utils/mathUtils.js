define([
        'exports',
        'mout/math/clamp',
        'mout/math/norm'
    ],
    function(exports, clamp, norm) {

        function clampNorm(val, min, max) {
            return norm(clamp(val, min, max), min, max);
        }

        function powerTwoCeiling(val) {
            val = Math.pow(2, Math.ceil(Math.log2(Math.sqrt(val))));
            return val * val;
        }

        exports.clampNorm = clampNorm;
        exports.powerTwoCeiling = powerTwoCeiling;

    }
);
