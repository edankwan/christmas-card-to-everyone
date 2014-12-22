precision mediump float;

uniform float u_time;
uniform vec2 u_bound;
uniform float u_scale_x;

varying float v_alpha;
varying float v_index;
varying float v_rotation;

const float PI = 3.1415926535897932384626433832795;

vec3 getPosOffset(float ratio, float thershold) {
    return vec3(
        cos((ratio * 80.0 + 10.0) * thershold) * 30.0 * thershold,
        (sin((ratio * 90.0 + 30.0) * thershold) + 1.0) * -10.0 * thershold + mix(u_bound.x, u_bound.y, ratio / thershold),
        sin((ratio * 70.0 + 20.0) * thershold) * 30.0 * thershold
    );
}

void main() {
    float thershold = 0.7 + position.y * 0.3;
    float ratio = mod(u_time - position.y * 2.0, thershold);
    float prevRatio = mod(u_time - 0.0005 - position.y * 2.0, thershold);


    vec3 offsetPos = getPosOffset(ratio, thershold);
    vec3 prevOffsetPos = getPosOffset(prevRatio, thershold);
    vec3 pos = position;
    pos.x *= (u_scale_x - pos.z);
    pos += offsetPos;

    float delta = length(offsetPos.xy - prevOffsetPos.xy);

    // fake the motion blur...
    v_index = floor(pow(clamp(delta, 0.0, 2.0) / 2.0, 3.0) * 15.99);
    v_rotation = atan((offsetPos.x - prevOffsetPos.x) / (offsetPos.y - prevOffsetPos.y));

    v_alpha = 1.0 - clamp(abs(pos.x / u_scale_x) * 2.0, 0.0, 1.0);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

    gl_PointSize = (pos.z + 800.0) / 1000.0 * 24.0;
}
