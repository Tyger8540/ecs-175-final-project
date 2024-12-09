#version 300 es

in vec3 a_position;
in vec3 a_color;
in vec3 a_normal;

// transformation matrices
uniform mat4x4 u_m;
uniform mat4x4 u_v;
uniform mat4x4 u_p;

out vec3 o_color;
out vec3 o_normal;
out vec3 o_position;

void main() {
    gl_Position = u_p * u_v * u_m * vec4(a_position, 1.0);
    o_position = vec3(u_m * vec4(a_position, 1.0));

    o_color = a_color;
    o_normal = (vec4(a_normal, 1.0)).xyz;
    //o_faceId = a_faceId;
}
