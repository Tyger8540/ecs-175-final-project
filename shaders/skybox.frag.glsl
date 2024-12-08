#version 300 es

precision mediump float;

in vec3 o_color;
in vec3 o_vertexPosition;

out vec4 o_fragColor;

void main() {
    vec3 pixel_color = vec3(0.2, 0.1, 0.6) * (1.0 - o_vertexPosition.y);
    pixel_color += vec3(0.3, 0.6, 1.0) * o_vertexPosition.y;
    o_fragColor = vec4(pixel_color, 1.0);
}