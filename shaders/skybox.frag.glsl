#version 300 es

precision mediump float;

const float gradient_center = 0.5;
const float gradient_range = 0.4;

in vec3 o_color;
in vec3 o_vertexPosition;

out vec4 o_fragColor;

void main() {
    float gradient_strength = ((o_vertexPosition.y - gradient_center + gradient_range) / (2.0 * gradient_range));

    if (gradient_strength > 1.0) {
        gradient_strength = 1.0;
    } else if (gradient_strength < 0.0) {
        gradient_strength = 0.0;
    }
    
    vec3 pixel_color = vec3(0.2, 0.1, 0.6) * (1.0 - gradient_strength);
    pixel_color += vec3(0.3, 0.6, 1.0) * gradient_strength;
    o_fragColor = vec4(pixel_color, 1.0);

    
}