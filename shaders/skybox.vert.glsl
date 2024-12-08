#version 300 es

const float inf = 1.0 / 0.0;

in vec3 a_position;

uniform mat4x4 u_v;
uniform mat4x4 u_p;

out vec3 o_color;

void main() {
    gl_Position = vec4(a_position * inf, 1.0);
}