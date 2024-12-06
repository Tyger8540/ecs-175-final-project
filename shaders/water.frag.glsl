#version 300 es

// Fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default. It means "medium precision".
precision mediump float;

// with webgl 2, we now have to define an out that will be the color of the fragment
out vec4 o_fragColor;

void main() {
    // blue color to represent water layer
    o_fragColor = vec4(0.0, 0.0, 255, 1.0);
}