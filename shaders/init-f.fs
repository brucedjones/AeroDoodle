precision highp float;
precision highp int;

uniform int uI;
uniform highp sampler2D uSampler0, uSampler1, uSampler2;

varying vec2 vTextureCoord;

void main(void)
{
    float rho = color2Rho(texture2D(uSampler0, vTextureCoord));
    float ux = color2U(texture2D(uSampler1, vTextureCoord));
    float uy = color2U(texture2D(uSampler2, vTextureCoord));
    
    float fEq = getFEq(rho, vec2(ux, uy), uI);

    gl_FragColor = float2Color(fEq);
}