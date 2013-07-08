precision highp float;
precision highp int;

uniform highp sampler2D uSampler0, uSampler1, uSampler2, uSampler3, uSampler4, uSampler5, uSampler6;
// f2 f3 f4 f6 f7 f8 obst
varying vec2 vTextureCoord;

void main(void)
{
    float f, f_opp, obst;
    vec2 offset = vec2(0.0, 0.0);
    float Fy = 0.0;

    
    obst = texture2D(uSampler6, vTextureCoord).r;
    
    if(obst != 0.0)
    { 
      // Direction 2
      offset.x = -1.0 / Nx;
      offset.y = -1.0 / Ny;
      obst = texture2D(uSampler6, vTextureCoord + offset).r;
      
      if(obst == 0.0)
      {
        f = color2Float(texture2D(uSampler0, vTextureCoord + offset));
        f_opp = color2Float(texture2D(uSampler3, vTextureCoord));
        Fy = Fy + (f+f_opp);
      }
      
      // Direction 3
      offset.x = 0.0;
      offset.y = -1.0 / Ny;
      obst = texture2D(uSampler6, vTextureCoord + offset).r;
      if(obst == 0.0)
      {
        f = color2Float(texture2D(uSampler1, vTextureCoord + offset));
        f_opp = color2Float(texture2D(uSampler4, vTextureCoord));
        Fy = Fy + (f+f_opp);
      }
        
      // Direction 4
      offset.x = 1.0 / Nx;
      offset.y = -1.0 / Ny;
      obst = texture2D(uSampler6, vTextureCoord + offset).r;
      if(obst == 0.0)
      {
        f = color2Float(texture2D(uSampler2, vTextureCoord + offset));
        f_opp = color2Float(texture2D(uSampler5, vTextureCoord));
        Fy = Fy + (f+f_opp);
      }
       
      // Direction 6
      offset.x = 1.0 / Nx;
      offset.y = 1.0 / Ny;
      obst = texture2D(uSampler6, vTextureCoord + offset).r;
      if(obst == 0.0)
      {
        f = color2Float(texture2D(uSampler3, vTextureCoord + offset));
        f_opp = color2Float(texture2D(uSampler0, vTextureCoord));
        Fy = Fy - (f+f_opp);
      }
      
      // Direction 7
      offset.x = 0.0;
      offset.y = 1.0 / Ny;
      obst = texture2D(uSampler6, vTextureCoord + offset).r;
      if(obst == 0.0)
      {
        f = color2Float(texture2D(uSampler4, vTextureCoord + offset));
        f_opp = color2Float(texture2D(uSampler1, vTextureCoord));
        Fy = Fy - (f+f_opp);
      }
      
      // Direction 8
      offset.x = -1.0 / Nx;
      offset.y = 1.0 / Ny;
      obst = texture2D(uSampler6, vTextureCoord + offset).r;
      if(obst == 0.0)
      {
        f = color2Float(texture2D(uSampler5, vTextureCoord + offset));
        f_opp = color2Float(texture2D(uSampler2, vTextureCoord));
        Fy = Fy - (f+f_opp);
      }
    
    }
            
    gl_FragColor = u2Color(Fy);
}