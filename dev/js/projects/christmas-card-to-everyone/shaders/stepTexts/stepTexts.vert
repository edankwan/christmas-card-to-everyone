precision mediump float;

attribute float a_random;
attribute vec3 a_offset_x;
attribute vec3 a_offset_y;

uniform float u_step;
uniform float u_time;
uniform vec2 u_center;

varying float v_alpha;
varying float v_size;
varying float v_midLevel;

<%=snoise2D%>
<%=powInOut%>
<%=clampNorm%>


const float PI = 3.1415926535897932384626433832795;

void main() {
    vec4 pos = vec4( 0.0, 0.0, 0.0, 1.0 );
    vec2 co = vec2(
        a_offset_x.x + a_offset_x.y + a_offset_x.z,
        a_offset_y.y + a_offset_y.y + a_offset_y.z
    );


    // 0.0 <= fractStep <= 1
    float fractStep = fract(u_step) + step(4.0, u_step);

    // add delay
    float delayedFractStep = clampNorm(fractStep, a_random * 0.3, 0.7 + a_random * 0.3);

    float endPointEasedFract = powInOut(delayedFractStep, 1.0 + a_random * 2.0);
    float easedFract = powInOut(delayedFractStep, 1.0 + a_random * 5.0);

    float isStep01 = 1.0 - step(1.0, u_step);
    float isStep12 = step(1.0, u_step) * (1.0 - step(2.0, u_step));
    float isStep23 = step(2.0, u_step) * (1.0 - step(3.0, u_step));
    float isStep34 = step(3.0, u_step);

    float noiseX = snoise(co * 2.0 + u_time * 0.0001);
    float noiseY =  snoise(co * 3.0 + u_time * 0.0001 + 20.0);
    float noiseZ =  snoise(co * 0.03 + u_time * 0.0001 + 15.0);
    float midLevel = pow(1.0 - abs(delayedFractStep - 0.5) * 2.0, 3.0);
    float endPointRatio = max(isStep01 * (1.0 - delayedFractStep), isStep34 * delayedFractStep);
    float noiseLevel = midLevel * (1.0 + a_random) + powInOut(endPointRatio, 1.5) * 50.0;


    float x = mix(u_center.x, a_offset_x.x, endPointEasedFract) * isStep01 +
                  mix(a_offset_x.x, a_offset_x.y, easedFract) * isStep12 +
                  mix(a_offset_x.y, a_offset_x.z, easedFract) * isStep23 +
                  mix(a_offset_x.z, u_center.x, endPointEasedFract) * isStep34;
    x += noiseX * noiseLevel * 30.0;
    pos.x = x;

    float y = mix(u_center.y, a_offset_y.x, endPointEasedFract) * isStep01 +
                  mix(a_offset_y.x, a_offset_y.y, easedFract) * isStep12 +
                  mix(a_offset_y.y, a_offset_y.z, easedFract) * isStep23 +
                  mix(a_offset_y.z, u_center.y, endPointEasedFract) * isStep34;
    y += noiseY * noiseLevel  * 30.0;
    pos.y = y;

    float endPointExtra = sin(endPointRatio * PI);
    pos.x += endPointExtra * sin(a_random * PI * 2.0 - u_time * 0.08) * 500.0;
    pos.y += endPointExtra * cos(a_random * PI * 2.0 - u_time * 0.08) * 500.0;

    pos.z = noiseZ * noiseLevel * 15.0 + (1.0 - endPointRatio);

    v_alpha = (mix(15.0, position.x, endPointEasedFract) * isStep01 +
                  mix(position.x, position.y, easedFract) * isStep12 +
                  mix(position.y, position.z, easedFract) * isStep23 +
                  mix(position.z, 15.0, endPointEasedFract) * isStep34) / 255.0;

    v_midLevel = midLevel;

    gl_PointSize = 3.0 + pos.z + (1.0 - abs((clampNorm(clampNorm(fractStep, 0.0, 1.0 - a_random * 0.18), 0.92 + isStep01 * 0.04, 1.0) - 0.5) * 2.0)) * 9.0;

    v_size = gl_PointSize;

    gl_Position = projectionMatrix * modelViewMatrix * pos;
}
