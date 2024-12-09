#version 300 es

// Fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default. It means "medium precision".
precision mediump float;

const int MAX_LIGHTS = 4;

// struct definitions
struct AmbientLight {
    vec3 color;
    float intensity;
};

struct DirectionalLight {
    vec3 direction;
    vec3 color;
    float intensity;
};

struct PointLight {
    vec3 position;
    vec3 color;
    float intensity;
};


uniform vec3 u_eye;
// lights and materials
uniform AmbientLight u_lights_ambient[MAX_LIGHTS];
uniform DirectionalLight u_lights_directional[MAX_LIGHTS];
uniform PointLight u_lights_point[MAX_LIGHTS];

in vec3 o_color;
in vec3 o_normal;
in vec3 o_position;

// with webgl 2, we now have to define an out that will be the color of the fragment
out vec4 o_fragColor;


// Shades an ambient light and returns this light's contribution
vec3 shadeAmbientLight(vec3 color, AmbientLight light) {
    if (light.intensity == 0.0)
        return vec3(0);

    return light.color * light.intensity * color;
}

// Shades a directional light and returns its contribution
vec3 shadeDirectionalLight(vec3 color, DirectionalLight light, vec3 normal, vec3 vertex_position) {
    vec3 result = vec3(0);
    if (light.intensity == 0.0)
        return result;

    vec3 N = normalize(normal);
    vec3 L = -normalize(light.direction);
    vec3 V = normalize(vertex_position - u_eye);

    // Diffuse
    float LN = max(dot(L, N), 0.0);
    result += LN * light.color * light.intensity * color;

    // Specular
    vec3 R = reflect(L, N);
    result += pow( max(dot(R, V), 0.0), 9.0) * light.color * 0.3 * light.intensity * (color + 0.1);


    return result;
}

// Shades a point light and returns its contribution
vec3 shadePointLight(vec3 color, PointLight light, vec3 normal, vec3 vertex_position) {
    vec3 result = vec3(0);
    if (light.intensity == 0.0)
        return result;

    vec3 N = normalize(normal);
    float D = distance(light.position, vertex_position);
    vec3 L = normalize(light.position - vertex_position);

    // Diffuse
    float LN = max(dot(L, N), 0.0);
    result += LN * light.color * light.intensity * color;

    // Attenuation
    result *= 1.0 / (D*D+1.0);

    return result;
}



void main() {
    vec3 color = o_color;
    vec3 shading = vec3(0.0);

    for (int i = 0; i < MAX_LIGHTS; i++) {
        shading += shadeAmbientLight(color, u_lights_ambient[i]);
        shading += shadeDirectionalLight(color, u_lights_directional[i], o_normal, o_position);
    }

    o_fragColor = vec4(shading, 1.0);

}
