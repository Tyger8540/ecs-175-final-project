#version 300 es

precision mediump float;

in vec4 o_color;

out vec4 o_fragColor;

void main() {
    o_fragColor = o_color;
}