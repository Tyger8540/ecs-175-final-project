#version 300 es


in vec3 a_position;

uniform sampler2D map_tex;

uniform vec3 u_color;
uniform vec3 u_displacement;
uniform vec3 u_normal;
uniform mat4x4 u_r;
uniform mat4x4 u_v;
uniform mat4x4 u_p;

out vec4 o_color;

void main() {
    vec4 position = u_r * vec4(a_position, 1.0);
    gl_Position = u_p * u_v * vec4(vec3(position) + u_displacement, 1.0);
    o_color = vec4(u_color, 1.0);
}