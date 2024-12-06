#version 300 es

in vec3 a_position;
in vec3 a_color;

// transformation matrices
uniform mat4x4 u_m;
uniform mat4x4 u_v;
uniform mat4x4 u_p;

out vec3 o_color;

void main() {
    // transform a vertex from object space directly to screen space
    // the full chain of transformations is:
    // object space -{model}-> world space -{view}-> view space -{projection}-> clip space
    gl_Position = u_p * u_v * u_m * vec4(a_position, 1.0);

    o_color = a_color;
}
