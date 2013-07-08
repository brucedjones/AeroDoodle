precision highp float;
precision highp int;

uniform int uRhoUxUy;

varying vec2 vTextureCoord;

void main(void)
{
    if (uRhoUxUy == 0)
        gl_FragColor = rho2Color(1.0);
    else if (uRhoUxUy == 1)
        gl_FragColor = u2Color(VEL);
    else
        gl_FragColor = u2Color(0.0);
}