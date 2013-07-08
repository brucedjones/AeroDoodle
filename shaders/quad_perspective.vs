uniform lowp mat4 MVPMat;

attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = MVPMat*vec4(aVertexPosition.x*1.0,aVertexPosition.y*1.0,aVertexPosition.z, 1.0);
    vTextureCoord = aTextureCoord;
}