precision highp float;
precision highp int;

uniform int uRhoUxUy;
uniform highp sampler2D uSampler0, uSampler1, uSampler2, uSampler3, uSampler4, uSampler5, uSampler6, uSampler7, uSampler8;

varying vec2 vTextureCoord;

void main(void)
{
    float f0 = color2Float(texture2D(uSampler0, vTextureCoord));
    float f1 = color2Float(texture2D(uSampler1, vTextureCoord));
    float f2 = color2Float(texture2D(uSampler2, vTextureCoord));
    float f3 = color2Float(texture2D(uSampler3, vTextureCoord));
    float f4 = color2Float(texture2D(uSampler4, vTextureCoord));
    float f5 = color2Float(texture2D(uSampler5, vTextureCoord));
    float f6 = color2Float(texture2D(uSampler6, vTextureCoord));
    float f7 = color2Float(texture2D(uSampler7, vTextureCoord));
    float f8 = color2Float(texture2D(uSampler8, vTextureCoord));
    
    float rho = f0 + f1 + f2 + f3 + f4 + f5 + f6 + f7 + f8;
    
    if (uRhoUxUy == 0)
    {
        gl_FragColor = rho2Color(rho);
    }
    else if (uRhoUxUy == 1)
    {
        float ux = (f1 + f2 + f8 - f4 - f5 - f6) / rho;
        gl_FragColor = u2Color(ux);
    }
    else
    {
        float uy = (f2 + f3 + f4 - f6 - f7 - f8) / rho;
        gl_FragColor = u2Color(uy);
    }
}