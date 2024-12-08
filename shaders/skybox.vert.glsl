#version 300 es

const float size_multiplier = 400.0;

in vec3 a_position;

uniform vec3 u_displacement;
uniform mat4x4 u_v;
uniform mat4x4 u_p;

out vec3 o_color;
out vec3 o_vertexPosition;

void main() {
    vec3 projected_position = a_position * size_multiplier;
    gl_Position = u_p * u_v * (vec4(projected_position + u_displacement, 1.0));
    o_color = vec3(1.0) * a_position.y;
    o_vertexPosition = a_position - 0.2;
    if (o_vertexPosition.y > 1.0) {
        o_vertexPosition.y = 1.0;
    } else if (o_vertexPosition.y < 0.0) {
        o_vertexPosition.y = 0.0;
    }
}