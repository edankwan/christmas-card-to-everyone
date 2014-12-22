precision mediump float;

uniform sampler2D tDiffuse;
uniform float u_brightness;
uniform float u_time;
uniform float u_pervert;

varying vec2 vUv;

<%=rand%>

void main() {

    vec4 color = texture2D(tDiffuse, vUv);

    float statics = rand(vUv + fract(u_time * 0.01));

    color.rgb += (statics - 0.5) * 0.1;

    color = color * (1.0 + u_brightness) + u_brightness * (0.65 + u_pervert * 0.25);
    gl_FragColor = color;
}
