#version 300 es

// Fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default. It means "medium precision".
precision mediump float;

uniform float u_shading[6];

in vec3 o_color;

// with webgl 2, we now have to define an out that will be the color of the fragment
out vec4 o_fragColor;

void main() {
    vec3 color = o_color;
    o_fragColor = vec4(color, 1.0);
}
