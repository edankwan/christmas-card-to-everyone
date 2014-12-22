precision mediump float;

varying float v_size;
varying float v_alpha;
varying float v_midLevel;

void main() {
    float len = length(gl_PointCoord.xy - .5) * 2.0;
    float radialAlpha = pow(clamp(1.0 - len, 0.0, 1.0), 4.8);

    float alpha = v_alpha * radialAlpha;

    gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);

}
