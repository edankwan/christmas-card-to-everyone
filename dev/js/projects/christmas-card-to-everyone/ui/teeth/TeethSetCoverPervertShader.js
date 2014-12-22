define([
        'PIXI',
        'text!project/shaders/teethSetCoverPervert.frag'
    ],
    function(PIXI, fs) {

        function TeethSetCoverPervertShader(gl) {
            _super.constructor.call(this, gl);
        }

        var _super = PIXI.StripShader.prototype;
        var _p = TeethSetCoverPervertShader.prototype = Object.create( _super );
        _p.constructor = TeethSetCoverPervertShader;

        function init() {
            // console.log(this.fragmentSrc);
            this.fragmentSrc = fs.split('\n');
            _super.init.apply(this, arguments);
            this.ulColorRatio = this.gl.getUniformLocation(this.program, 'u_color_ratio');
        }

        _p.init = init;

        return TeethSetCoverPervertShader;
    }
);
