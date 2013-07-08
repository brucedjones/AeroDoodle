precision highp float;
precision highp int;

uniform highp sampler2D uSampler0;
uniform float uPointX1, uPointY1, uPointX2, uPointY2;
uniform int uClear;
uniform int uAdd;

varying vec2 vTextureCoord;

void main(void)
{
    vec4 opColor;
    vec4 baseColor;
    
    if(uAdd != 0)
        baseColor = texture2D(uSampler0, vTextureCoord);
    else
        baseColor = vec4(0.0, 0.0, 0.0, 1.0);   
    
    vec2 p1 = vec2(float(uPointX1)/Nx, float(uPointY1)/Ny);
    vec2 p2 = vec2(float(uPointX2)/Nx, float(uPointY2)/Ny);
    
    if (uClear != 0)
        opColor = vec4(0.0, 0.0, 0.0, 1.0);
    else
        opColor = vec4(0.1, 0.0, 0.0, 1.0);
        
    if (uAdd == 0)
        opColor = vec4(0.1, 0.0, 0.0, 1.0);
       
    if(vTextureCoord.x<p1.x || vTextureCoord.x>p2.x || vTextureCoord.y>p1.y || vTextureCoord.y<p2.y)
        opColor = baseColor;
        
    // Force drawing to build area
    if(vTextureCoord.x<BL || vTextureCoord.x>BR || vTextureCoord.y>BB || vTextureCoord.y<BT) 
        opColor = vec4(0.0,0.0,0.0,1.0);
        
    gl_FragColor = opColor;
}