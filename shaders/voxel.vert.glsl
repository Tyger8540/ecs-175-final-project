#version 300 es

in vec3 a_position;
in float a_faceId;
in vec3 a_color;

// transformation matrices
uniform mat4x4 u_m;
uniform mat4x4 u_v;
uniform mat4x4 u_p;

flat out float o_faceId;
out vec3 o_color;

void main() {
    gl_Position = u_p * u_v * u_m * vec4(a_position, 1.0);

    o_color = a_color;
    o_faceId = a_faceId;
}
