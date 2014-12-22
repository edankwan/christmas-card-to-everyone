precision mediump float;
varying vec2 vTextureCoord;
varying vec4 vColor;
uniform vec4 dimensions;
uniform sampler2D uSampler;
uniform vec2 u_center;

void main(void) {
    vec2 coord = vTextureCoord;

    float level = pow(coord.x * coord.y, 0.3);

    coord = coord - u_center;
    float d = length(coord);
    float a = atan(coord.y, coord.x) + 5.0 * pow(1.0 - d, 5.0) * (level);
    coord = vec2(cos(a) * d, sin(a) * d) + u_center;

    float delta = length(coord - vTextureCoord);

    vec4 color = texture2D(uSampler, coord);

    color.rgb += delta * sin(a) * 3.0 * color.a; // fake shading


    gl_FragColor = color;
}
