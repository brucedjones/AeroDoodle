precision highp float;

uniform int uRhoUxUy;

void main(void)
{
    if (uRhoUxUy == 0)
        gl_FragColor = rho2Color(1.0);
    else if (uRhoUxUy == 1)
        gl_FragColor = u2Color(VEL);
    else
        gl_FragColor = u2Color(0.0);
}