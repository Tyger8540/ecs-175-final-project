#version 300 es

// Fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default. It means "medium precision".
precision mediump float;

in vec3 o_color;

// with webgl 2, we now have to define an out that will be the color of the fragment
out vec4 o_fragColor;

void main() {
    o_fragColor = vec4(o_color, 1);

    // TEMP
    o_fragColor = vec4(1, 0, 1, 1);
}
