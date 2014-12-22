precision mediump float;
varying vec2 vTextureCoord;
varying vec4 vColor;
uniform vec4 dimensions;
uniform sampler2D uSampler;
uniform float u_color_ratio;

float M_PI = 3.14159265358;

const vec3 PINK_COLOR = vec3(1.0,0.5,0.69);
const vec3 BASE_COLOR = vec3(1.0,0.76,0.56);

void main(void) {
    vec2 coord = vTextureCoord;

    vec4 color = texture2D(uSampler, coord);

    float level = (color.b - 0.22) / 0.78;

    gl_FragColor = mix(color, vec4(mix(BASE_COLOR, PINK_COLOR, level + 1.0 - color.a), 1.0), step(0.01,color.a) * u_color_ratio);
}
