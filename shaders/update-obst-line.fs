precision highp float;
precision highp int;

uniform highp sampler2D uSampler0;
uniform float uPointX1, uPointY1, uPointX2, uPointY2, uPointX3, uPointY3, uPointX4, uPointY4;
uniform int uClear;
uniform int uAdd;

varying vec2 vTextureCoord;

void main(void)
{
    vec4 baseColor;

    if(uAdd != 0)
        baseColor = texture2D(uSampler0, vTextureCoord);
    else
        baseColor = vec4(0.0, 0.0, 0.0, 1.0);
        
    vec4 opColor;
    vec2 p1 = vec2(float(uPointX1)/Nx, float(uPointY1)/Ny);
    vec2 p2 = vec2(float(uPointX2)/Nx, float(uPointY2)/Ny);
    vec2 p3 = vec2(float(uPointX3)/Nx, float(uPointY3)/Ny);
    vec2 p4 = vec2(float(uPointX4)/Nx, float(uPointY4)/Ny);
    
    if (uClear != 0)
        opColor = vec4(0.0, 0.0, 0.0, 1.0);
    else
        opColor = vec4(0.1, 0.0, 0.0, 1.0);
        
    if (uAdd == 0)
        opColor = vec4(10.1, 0.0, 0.0, 1.0);
       
    if ((triangleArea(p1,p2,vTextureCoord)>0.0 && triangleArea(p2,p3,vTextureCoord)>0.0 && triangleArea(p3,p4,vTextureCoord)>0.0 && triangleArea(p4,p1,vTextureCoord)>0.0) == false)
        opColor = baseColor;
    
    // Force drawing to build area
    if(vTextureCoord.x<BL || vTextureCoord.x>BR || vTextureCoord.y>BB || vTextureCoord.y<BT) 
        opColor = vec4(0.0,0.0,0.0,1.0);
        
    gl_FragColor = opColor;
}