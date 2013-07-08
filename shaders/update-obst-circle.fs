precision highp float;
precision highp int;

uniform highp sampler2D uSampler0;
uniform float uPointX, uPointY;
uniform int uClear;
uniform int uAdd;
uniform float uRadius;

varying vec2 vTextureCoord;

void main(void)
{
    vec4 opColor;
    vec4 baseColor;  
    vec2 point = vec2(uPointX, uPointY);
    
    if (uClear != 0)
        opColor = vec4(0.0, 0.0, 0.0, 1.0);
    else
        opColor = vec4(0.1, 0.0, 0.0, 1.0);
        
    if(uAdd != 0)
        baseColor = texture2D(uSampler0, vTextureCoord);
    else
        opColor = vec4(0.1, 0.0, 0.0, 1.0);
    
    float dist_square = (point.x-vTextureCoord.x*Nx)*(point.x-vTextureCoord.x*Nx)+(point.y-vTextureCoord.y*Ny)*(point.y-vTextureCoord.y*Ny);
    

    
    if (((dist_square < uRadius*uRadius) && (uPointX >= 0.0))==false)
        opColor = baseColor;
        
    // Force drawing to build area
    if(vTextureCoord.x<BL || vTextureCoord.x>BR || vTextureCoord.y>BB || vTextureCoord.y<BT) 
        opColor = vec4(0.0,0.0,0.0,1.0);
        
    gl_FragColor = opColor;
}