precision highp float;
precision highp int;

uniform highp sampler2D uSampler0, uSampler1, uSampler2, uSampler3, uSampler4;
uniform int uI;
uniform float uVel;
uniform float uOmega;

varying vec2 vTextureCoord;

void main(void)
{
    vec2 offset = vec2(0.0, 0.0);
    
    if ((uI == 1) || (uI == 2) || (uI == 8))
        offset.x = -1.0 / Nx;
    else if ((uI >= 4) && (uI <= 6))
        offset.x = 1.0 / Nx;
    if ((uI >= 2) && (uI <= 4))
        offset.y = -1.0 / Ny;
    else if (uI >= 6)
        offset.y = 1.0 / Ny;

    float rho = color2Rho(texture2D(uSampler0, vTextureCoord + offset));
    float ux = color2U(texture2D(uSampler1, vTextureCoord + offset));
    float uy = color2U(texture2D(uSampler2, vTextureCoord + offset));
    float obst = texture2D(uSampler4, vTextureCoord + offset).r;

    float f = color2Float(texture2D(uSampler3, vTextureCoord + offset)) * (1.0 - uOmega) +
        getFEq(rho, vec2(ux, uy), uI) * uOmega;

    if (vTextureCoord.y < 1.0/Ny)
        f = getFEq(1.0, vec2(uVel, 0.0), uI);
    if (vTextureCoord.y > (Ny-1.0)/Ny)
        f = getFEq(1.0, vec2(uVel, 0.0), uI);
    if (vTextureCoord.x < 1.0/Nx)
        f = getFEq(1.0, vec2(uVel, 0.0), uI);
    if (vTextureCoord.x > (Nx-1.0)/Nx)
        f = getFEq(1.0, vec2(ux, uy), uI);
    if (obst != 0.0)
        f = getFEq(rho, vec2(0.0, 0.0), uI);
        
    gl_FragColor = float2Color(f);
}