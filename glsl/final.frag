#version 300 es

precision highp float;

in vec3 v_position;
in vec2 v_texcoord;
in vec3 v_normal;

out vec4 color;

uniform sampler2D diffuseMap;

uniform float ambientStrength;
uniform vec3 u_lightColor;
uniform vec3 u_lightPosition;
uniform float diffuseIntensity;
uniform vec3 u_difflightColor;
uniform vec3 u_estaticdiffColor;
uniform float infinitediffIntensity;


void main() {
	// ambient light
	vec3 ambient = ambientStrength * u_lightColor;

	// diffuse light
	vec3 norm = normalize(v_normal);
	vec3 objectColorDir = normalize(u_lightPosition - v_position);
	float diff = max(dot(norm, objectColorDir), 0.0);
	vec3 diffuse = diff * u_estaticdiffColor * diffuseIntensity;

	// infinite diffuse light
	vec3 lightDir = vec3(0.3, 0.3, 0.3);
	vec3 norm2 = normalize(v_normal);
	vec3 objectColorDir2 = normalize(lightDir);
	float diff2 = max(dot(norm2, objectColorDir2), 0.0);
	vec3 diffuse2 = diff2 * u_difflightColor * infinitediffIntensity;
	

	vec4 result = vec4(ambient + diffuse + diffuse2, 1.0);
	color = texture(diffuseMap, v_texcoord) * result;
}