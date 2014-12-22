precision mediump float;

uniform sampler2D u_texture;

varying float v_alpha;
varying float v_index;
varying float v_rotation;

<%=THREE.ShaderChunk['fog_pars_fragment']%>

void main() {

    vec2 coord =  gl_PointCoord.xy;
    coord = vec2(
        clamp(cos(v_rotation) * (coord.x - 0.5) + sin(v_rotation) * (coord.y - 0.5) + 0.5, 0.0, 1.0),
        clamp(cos(v_rotation) * (coord.y - 0.5) - sin(v_rotation) * (coord.x - 0.5) + 0.5, 0.0, 1.0)
    );

    float index = floor(v_index + 0.5);

    coord.y = - coord.y + 4.0;
    coord.x += (index - floor(index / 4.0) * 4.0);
    coord.y -= floor(index / 4.0);

    coord *= 0.25;

    // should I get rid of the texture??

    vec4 color = texture2D(u_texture, coord);

    color.a *= pow(v_alpha, 2.0);

    gl_FragColor = color;

<%=THREE.ShaderChunk['fog_fragment']%>

}
