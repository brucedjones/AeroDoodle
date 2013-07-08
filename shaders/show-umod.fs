precision highp float;
precision highp int;

varying vec2 vTextureCoord;

uniform highp sampler2D uSampler0, uSampler1, uSampler2, uSampler3;

uniform int drawIntended;

void main(void)
{
    float ux = color2U(texture2D(uSampler0, vTextureCoord));
    float uy = color2U(texture2D(uSampler1, vTextureCoord));
    float obst = texture2D(uSampler2, vTextureCoord).r;
    float obst_intended = texture2D(uSampler3, vTextureCoord).r;
    float uMod = length(vec2(ux, uy));

    float fourValue = 20.0 * uMod;
    //float fourValue = 10.0 * uMod;
    float red   = min(fourValue - 1.5, -fourValue + 4.5);
    float green = min(fourValue - 0.5, -fourValue + 3.5);
    float blue  = min(fourValue + 0.5, -fourValue + 2.5);
    
    if(obst>0.0)
    {
        red = 0.6;
        green = 0.05;
        blue = 0.05;
        }
        
    if(drawIntended == 1)
    {
        if(obst_intended>0.0)
        {
            if(obst>0.0)
            {
                red = 0.4;
                green = 0.05;
                blue = 0.05;
            } else {
            red = 1.0-(0.0003/(uMod*uMod*uMod)-obst_intended);
            //red = 1.0-obst_intended;
            blue = 0.2;
            green = 0.2;
            }
        }
    }
    
    
    
	gl_FragColor = vec4(clamp( vec3(red, green, blue), 0.0, 1.0 ) , 1.0);
        
}