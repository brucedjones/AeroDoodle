precision highp float;
precision highp int;

const float OMEGA = 1.9;
const float Nx = 2048.0;
const float Ny = 256.0;
const float PI = 3.1415926535897932384626433832795;
const float VEL = 0.15;

const float RHO_SCALE = 2.0;
const float U_SCALE = 2.0;
const float U_BIAS = 1.0;

const float BL = 0.09765625;
const float BR = 0.34765625;
const float BT = 0.375;
const float BB = 0.625;


// The numbers are encoded using 3 component of a color (RGB). When storing
// 'x' in a component, the persisted value is 'round(x * 255.0) % 256' and 
// the recovered value is obtained doing a floating point division by 255.
// The encoding is a fixed point one, going from 0.000000 to 0.ffffff and 
// storing each pair of hexadecimal digits in a color component.

vec4 float2Color(float f)
{
    f *= 256.0;
    float r = floor(f);
    f -= r;
    f *= 256.0;
    float g = floor(f);
    f -= g;
    f *= 256.0;
    float b = floor(f);
    return vec4(r / 255.0, g / 255.0, b / 255.0, 1.0);
}

float color2Float(vec4 c)
{
    return c.r * 255.0 / 256.0 + c.g * 255.0 / (256.0 * 256.0) + c.b * 255.0 / (256.0 * 256.0 * 256.0);
}

float getFEq(float rho, vec2 u, int i)
{
    float dotProd = 0.0;
    if ((i == 1) || (i == 2) || (i == 8))
        dotProd += u.x;
    else if ((i >= 4) && (i <= 6))
        dotProd -= u.x;
    if ((i >= 2) && (i <= 4))
        dotProd += u.y;
    else if (i >= 6)
        dotProd -= u.y;
    float scD;
    if (i == 0)
        scD = 4.0 / 9.0;
    else
        scD = 1.0 / (36.0 - 27.0 * mod(float(i), 2.0));
    return scD * rho * (1.0 + 3.0 * dotProd + 4.5 * dotProd * dotProd - 1.5 * dot(u, u));
}

vec4 rho2Color(float rho)
{
    return float2Color(rho / RHO_SCALE);
}

float color2Rho(vec4 c)
{
    return color2Float(c) * RHO_SCALE;
}

vec4 u2Color(float u)
{
    return float2Color((u + U_BIAS) / U_SCALE);
}

float color2U(vec4 c)
{
    return color2Float(c) * U_SCALE - U_BIAS;
}

float triangleArea(vec2 p1, vec2 p2, vec2 p3) 
{
			return (p3.x*p2.y-p2.x*p3.y)-(p3.x*p1.y-p1.x*p3.y)+(p2.x*p1.y-p1.x*p2.y);
}