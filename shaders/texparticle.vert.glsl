#version 300 es


in vec3 a_position;

uniform vec3 u_displacement;
uniform vec3 u_normal;
uniform mat4x4 u_v;
uniform mat4x4 u_p;

void main() {
    gl_Position = u_p * u_v * vec4(a_position + u_displacement, 1.0);
}