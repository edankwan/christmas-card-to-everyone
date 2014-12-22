precision mediump float;
varying vec2 vTextureCoord;
varying vec4 vColor;
uniform vec4 dimensions;
uniform sampler2D uSampler;
uniform float u_time;

float M_PI = 3.14159265358;

<%=snoise2D%>

void main(void) {
    vec2 coord = vTextureCoord;

    coord += vec2(
        snoise(coord * 17.3 + u_time * 0.1) - 0.6,
        snoise(coord * 12.3 - u_time * 0.1 + 3.0) - 0.6
    ) * 0.002 * coord.x / coord.y;




    vec4 color = texture2D(uSampler, coord);

    float delta = length(coord - vTextureCoord);

    color.rgb *= 1.0 + (sin(u_time * 0.1) + 2.0) * 20.0 * color.a * delta;

    gl_FragColor = color;
}
