var canvas;

var Nx;
var Ny;

var Lx = 1.0;
var Ly = 0.125;
var dx;

var vport      = {'left':-1.0,'right':1.0,'bottom':-1.0,'top':1.0,'near':1.0,'far':-1.0};

var bLeft;
var bRight;
var bBottom;
var bTop;
var bWidth;
var bHeight;

var horOffset;
var verOffset;

var lowQuality = false;

var buildVport;

function ortho(vport) {
  return   [2.0/(vport.right- vport.left), 0.0, 0.0, 0.0,
                0.0, 2.0/(vport.top-vport.bottom), 0.0, 0.0,
                0.0, 0.0, -2.0/(vport.far-vport.near), 0.0,
                -(vport.right+vport.left)/(vport.right-vport.left), -(vport.top+vport.bottom)/(vport.top-vport.bottom), -(vport.far+vport.near)/(vport.far-vport.near), 1.0];
} 

var inDraw          = true;
var fromV;
var toV;
var frameProgress   = 200;

var MVPMat;

var mouseDown       = false;
var obstPoint1      = [-1, -1];
var obstPoint2      = [-1, -1];
var square1         = [-1, -1];
var square2         = [-1, -1];
var square_p1       = [-1, -1];
var square_p2       = [-1, -1];
var square_p3       = [-1, -1];
var square_p4       = [-1, -1];
var clear           = false;
var addSquare       = false;
var drawIntended    = true;
var addCircle       = false;
var addLine         = false;
var brush_radius;
var circle_radius;
var omega           = 1.9;
var u               = 0.15;

var square_a1       = [-1.0, -1.0];
var square_a2       = [-1.0, -1.0];
var square_b1       = [-1.0, -1.0];
var square_b2       = [-1.0, -1.0];

var MAKE_SEL_MODE   = 1;
var ACTIVE_SEL_MODE = 2;
var sel_mode        = MAKE_SEL_MODE;

var BRUSH_MODE      = 0;
var SQUARE_MODE     = 1;
var CIRCLE_MODE     = 2;
var LINE_MODE       = 3;
var SELECT_MODE     = 4;
var mode            = BRUSH_MODE;

var clearObst       = false;

//var square_p4 = ;
var PROGS_DESC;

var TEXTURES_DESC;

var BUFFERS_DESC = {
    'quadVB': {
        'type': 'v',
        'data': [
            -1.0, -1.0,  1.0,
             1.0, -1.0,  1.0,
             1.0,  1.0,  1.0,
            -1.0,  1.0,  1.0
        ]
    },
    'quadTB': {
        'type': 't',
        'data': [
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0
        ]
    },
    'quadIB': {
        'type': 'i',
        'data': [0, 1, 2, 0, 2, 3]
    }
};

var gl;
function initGL(canvas) {
    // requestAnimFrame with fallback
    // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    window.requestAnimFrame = (function(){
          return  window.requestAnimationFrame       || 
                  window.webkitRequestAnimationFrame || 
                  window.mozRequestAnimationFrame    || 
                  window.oRequestAnimationFrame      || 
                  window.msRequestAnimationFrame     || 
                  function(/* function */ callback, /* DOMElement */ element){
                    window.setTimeout(callback, 1000 / 60);
                  };
        })();

    gl = canvas.getContext("experimental-webgl");
    gl.viewport(0, 0, canvas.width, canvas.height);
    //gl.viewport(0, 0, Nx,Ny);
}

function getSourceSynch(url) {
  var req = new XMLHttpRequest();
  req.open("GET", url, false);
  req.send(null);
  return (req.status == 200) ? req.responseText : null;
}

function getShader(ids, type) {
    var shader;
    if (type === 'fs') {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (type === 'vs') {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }
    
    if (!ids.pop) {
        ids = [ids];
    }
    
    var shaderTexts = [];
    for (var i = 0; i < ids.length; i++) {
        //var shaderElem = document.getElementById(ids[i]);
        var shaderElem = getSourceSynch(ids[i]);
        //shaderTexts.push(shaderElem.textContent);
        shaderTexts.push(shaderElem)
    }
     gl.shaderSource(shader, shaderTexts.join('\n'));

    gl.compileShader(shader);

    return shader;
}

var progs = {};
function initShaders() {
    for (var id in PROGS_DESC) {
        progs[id] = gl.createProgram();
        gl.attachShader(progs[id], getShader(PROGS_DESC[id].vs, 'vs'));
        gl.attachShader(progs[id], getShader(PROGS_DESC[id].fs, 'fs'));
        gl.linkProgram(progs[id]);
        
        for (var i = 0; i < PROGS_DESC[id].attribs.length; i++) {
            progs[id][PROGS_DESC[id].attribs[i]] = gl.getAttribLocation(progs[id], PROGS_DESC[id].attribs[i]);
            gl.enableVertexAttribArray(progs[id][PROGS_DESC[id].attribs[i]]);
        }
        
        for (var i = 0; i < PROGS_DESC[id].uniforms.length; i++) {
            progs[id][PROGS_DESC[id].uniforms[i]] = gl.getUniformLocation(progs[id], PROGS_DESC[id].uniforms[i]);
        }
    }
}

function createTexture(nx, ny, linear) {
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    if (!linear) {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    } else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT );
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, nx, ny, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return tex;
}

var textures = {};
var framebuffer;
function initTexturesFramebuffer() {
    for (var id in TEXTURES_DESC) {
        textures[id] = createTexture(Nx,Ny,false);//TEXTURES_DESC[id]);
    }
    textures.display = createTexture(Nx, Ny, false);
    framebuffer = gl.createFramebuffer();
}

function createBuffer(desc) {
    var glBufType = gl[{
        'v': 'ARRAY_BUFFER',
        't': 'ARRAY_BUFFER',
        'i': 'ELEMENT_ARRAY_BUFFER'
    }[desc.type]];
    var glArrType = {
        'v': Float32Array,
        't': Float32Array,
        'i': Uint16Array
    }[desc.type];
    var glItemSize = {
        'v': 3,
        't': 2,
        'i': 1
    }[desc.type];
    
    var buffer = gl.createBuffer();
    gl.bindBuffer(glBufType, buffer);
    gl.bufferData(glBufType, new glArrType(desc.data), gl.STATIC_DRAW);
    gl.bindBuffer(glBufType, null);
    
    buffer.itemSize = glItemSize;
    buffer.numItems = Math.floor(desc.data.length / glItemSize);
    
    return buffer;
}

var buffers = {};
function initBuffers() {
    for (var id in BUFFERS_DESC) {
        buffers[id] = createBuffer(BUFFERS_DESC[id]);
    }
}

function is_int(value){ 
  if((parseFloat(value) == parseInt(value)) && !isNaN(value)){
      return true;
  } else { 
      return false;
  } 
}

function doRenderOp(tgtTexName, srcTexNames, progName, uniformAssignments) {
    var prog = progs[progName];
    gl.useProgram(prog);
    
    for (var uniformVarName in uniformAssignments) {
        if(uniformVarName == 'MVPMat') {
          gl.uniformMatrix4fv(prog[uniformVarName], false, uniformAssignments[uniformVarName]);
        } else {
          if(is_int(uniformAssignments[uniformVarName])) {
              gl.uniform1i(prog[uniformVarName], uniformAssignments[uniformVarName]);
          } else {
              gl.uniform1f(prog[uniformVarName], uniformAssignments[uniformVarName]);
          }
        }
    }
    
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.quadVB);
    gl.vertexAttribPointer(prog.aVertexPosition, buffers.quadVB.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.quadTB);
    gl.vertexAttribPointer(prog.aTextureCoord, buffers.quadTB.itemSize, gl.FLOAT, false, 0, 0);
    
    for (var i = 0; i < srcTexNames.length; i++) {
        gl.activeTexture(gl.TEXTURE0 + i);
        gl.bindTexture(gl.TEXTURE_2D, textures[srcTexNames[i]]);
        gl.uniform1i(prog['uSampler' + i], i);
    }
    
    if (tgtTexName !== null) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textures[tgtTexName], 0);
    } else {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.quadIB);
    gl.drawElements(gl.TRIANGLES, buffers.quadIB.numItems, gl.UNSIGNED_SHORT, 0);
}

function swapTextures(tex1Name, tex2Name) {
    var t = textures[tex1Name];
    textures[tex1Name] = textures[tex2Name];
    textures[tex2Name] = t;
}

function initState() {
    doRenderOp('rho', [], 'init-accum', {'uRhoUxUy': 0});
    doRenderOp('ux', [], 'init-accum', {'uRhoUxUy': 1});
    doRenderOp('uy', [], 'init-accum', {'uRhoUxUy': 2});
    doRenderOp('f0', ['rho', 'ux', 'uy'], 'init-f', {'uI': 0});
    doRenderOp('f1', ['rho', 'ux', 'uy'], 'init-f', {'uI': 1});
    doRenderOp('f2', ['rho', 'ux', 'uy'], 'init-f', {'uI': 2});
    doRenderOp('f3', ['rho', 'ux', 'uy'], 'init-f', {'uI': 3});
    doRenderOp('f4', ['rho', 'ux', 'uy'], 'init-f', {'uI': 4});
    doRenderOp('f5', ['rho', 'ux', 'uy'], 'init-f', {'uI': 5});
    doRenderOp('f6', ['rho', 'ux', 'uy'], 'init-f', {'uI': 6});
    doRenderOp('f7', ['rho', 'ux', 'uy'], 'init-f', {'uI': 7});
    doRenderOp('f8', ['rho', 'ux', 'uy'], 'init-f', {'uI': 8});
    doRenderOp('obst', [], 'init-obst', {});
}

var count = 0;

function stepState() {

    if(mode == SQUARE_MODE && inDraw){
        if(obstPoint1[0]<obstPoint2[0]) {
            square1[0] = obstPoint1[0]
            square2[0] = obstPoint2[0]
        } else {
            square1[0] = obstPoint2[0]
            square2[0] = obstPoint1[0]
        }
        if(obstPoint1[1]>obstPoint2[1]) {
            square1[1] = obstPoint1[1]
            square2[1] = obstPoint2[1]
        } else {
            square1[1] = obstPoint2[1]
            square2[1] = obstPoint1[1]
        }
        doRenderOp('tmp', ['obst_intended'], 'update-obst-square', {'uPointX1': square1[0], 'uPointY1': square1[1], 'uPointX2': square2[0], 'uPointY2': square2[1], 'uClear': clear ? 1 : 0, 'uAdd':0});
        swapTextures('tmp', 'obst_intended');
        if(addSquare) {
            doRenderOp('tmp', ['obst'], 'update-obst-square', {'uPointX1': square1[0], 'uPointY1': square1[1], 'uPointX2': square2[0], 'uPointY2': square2[1], 'uClear': clear ? 1 : 0, 'uAdd':1});
            swapTextures('tmp', 'obst');
            addSquare = false;
        }
    }
    
    if(mode == BRUSH_MODE && inDraw){
        doRenderOp('tmp', ['obst_intended'], 'update-obst-circle', {'uPointX': obstPoint2[0], 'uPointY': obstPoint2[1], 'uRadius': circle_radius, 'uClear': clear ? 1 : 0, 'uAdd':0});
        swapTextures('tmp', 'obst_intended');
        if(addCircle) {
            doRenderOp('tmp', ['obst'], 'update-obst-circle', {'uPointX': obstPoint2[0], 'uPointY': obstPoint2[1], 'uRadius': circle_radius, 'uClear': clear ? 1 : 0, 'uAdd':1});
            swapTextures('tmp', 'obst');
            //addCircle = false;
        }
    }
    
    if(mode == CIRCLE_MODE && inDraw){
        doRenderOp('tmp', ['obst_intended'], 'update-obst-circle', {'uPointX': obstPoint1[0], 'uPointY': obstPoint1[1], 'uRadius': circle_radius, 'uClear': clear ? 1 : 0, 'uAdd':0});
        swapTextures('tmp', 'obst_intended');
        if(addCircleR) {
            doRenderOp('tmp', ['obst'], 'update-obst-circle', {'uPointX': obstPoint1[0], 'uPointY': obstPoint1[1], 'uRadius': circle_radius, 'uClear': clear ? 1 : 0, 'uAdd':1});
            swapTextures('tmp', 'obst');
            addCircleR = false;
        }
    }
    
    if(mode == LINE_MODE && inDraw){
        var delta = [obstPoint2[0]-obstPoint1[0],obstPoint2[1]-obstPoint1[1]];
        var len = Math.sqrt(delta[0]*delta[0]+delta[1]*delta[1]);
        var theta = Math.asin(delta[0]/len);
        if(obstPoint2[1]<obstPoint1[1]) theta = Math.PI-theta;
        square_p1 = [-circle_radius, 0];
        square_p2 = [-circle_radius, len];
        square_p3 = [circle_radius, len];
        square_p4 = [circle_radius, 0];
        var ctheta = Math.cos(theta);
        var stheta = Math.sin(theta);

            square_p1 = [square_p1[0]*ctheta+square_p1[1]*stheta+obstPoint1[0], -square_p1[0]*stheta+square_p1[1]*ctheta+obstPoint1[1]];
            square_p2 = [square_p2[0]*ctheta+square_p2[1]*stheta+obstPoint1[0], -square_p2[0]*stheta+square_p2[1]*ctheta+obstPoint1[1]];
            square_p3 = [square_p3[0]*ctheta+square_p3[1]*stheta+obstPoint1[0], -square_p3[0]*stheta+square_p3[1]*ctheta+obstPoint1[1]];
            square_p4 = [square_p4[0]*ctheta+square_p4[1]*stheta+obstPoint1[0], -square_p4[0]*stheta+square_p4[1]*ctheta+obstPoint1[1]];

        if(len>0.0)
        {
          doRenderOp('tmp', ['obst_intended'], 'update-obst-line', {'uPointX1': square_p1[0], 'uPointY1': square_p1[1], 'uPointX2': square_p2[0], 'uPointY2': square_p2[1], 'uPointX3': square_p3[0], 'uPointY3': square_p3[1], 'uPointX4': square_p4[0], 'uPointY4': square_p4[1], 'uClear': clear ? 1 : 0, 'uAdd':0});
          swapTextures('tmp', 'obst_intended');
              
          if(addLine) {
              // Calculate Square points from line ends
              doRenderOp('tmp', ['obst'], 'update-obst-line', {'uPointX1': square_p1[0], 'uPointY1': square_p1[1], 'uPointX2': square_p2[0], 'uPointY2': square_p2[1], 'uPointX3': square_p3[0], 'uPointY3': square_p3[1], 'uPointX4': square_p4[0], 'uPointY4': square_p4[1], 'uClear': clear ? 1 : 0, 'uAdd':1});
              swapTextures('tmp', 'obst');
              addLine = false;
              obstPoint2 = obstPoint1;
          }
        }
    }
    
    if(clearObst && inDraw)
    {
        doRenderOp('obst', [], 'update-obst-clear', {});
        clearObst = false;    
    }
    
    // Ensure Canvas is scaled with window size
    if(window.innerWidth*0.8<=1024 && window.innerWidth*0.8>=800)
    {
      canvas.width  = window.innerWidth*0.8
    } else if(window.innerWidth*0.8>1024) {
      canvas.width  = 1024;
    } else if(window.innerWidth*0.8<800)
    {
      canvas.width  = 800;
    }
    //canvas.width  = (window.innerWidth*0.8<=1024)?window.innerWidth*0.8:1024;
    canvas.height = canvas.width*(Ny/Nx);
    
    // Update the viewport
    frameProgress+=1;
    updateZoom(fromV, toV);
    
    //doRenderOp('tmp', ['obst'], 'update-obst', {'uPointX': obstPoint[0], 'uPointY': obstPoint[1], 'uClear': clear ? 1 : 0});
    //swapTextures('tmp', 'obst');
    // Calculate Macros
    doRenderOp('rho', ['f0', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8'], 'f-to-accum', {'uRhoUxUy': 0});
    doRenderOp('ux', ['f0', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8'], 'f-to-accum', {'uRhoUxUy': 1});
    doRenderOp('uy', ['f0', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8'], 'f-to-accum', {'uRhoUxUy': 2});
    if(count%10 == 0)
    {
    doRenderOp('fx', ['f1', 'f2', 'f4', 'f5', 'f6', 'f8', 'obst'], 'update-Fx', {});
    doRenderOp('fy', ['f2', 'f3', 'f4', 'f6', 'f7', 'f8', 'obst'], 'update-Fy', {});
    
    computeForce();
    }
    // Stream and collide
    doRenderOp('tmp', ['rho', 'ux', 'uy', 'f0', 'obst'], 'update-f', {'uI': 0, 'uOmega': omega, 'uVel':u});
    swapTextures('tmp', 'f0');
    doRenderOp('tmp', ['rho', 'ux', 'uy', 'f1', 'obst'], 'update-f', {'uI': 1, 'uOmega': omega, 'uVel':u});
    swapTextures('tmp', 'f1');
    doRenderOp('tmp', ['rho', 'ux', 'uy', 'f2', 'obst'], 'update-f', {'uI': 2, 'uOmega': omega, 'uVel':u});
    swapTextures('tmp', 'f2');
    doRenderOp('tmp', ['rho', 'ux', 'uy', 'f3', 'obst'], 'update-f', {'uI': 3, 'uOmega': omega, 'uVel':u});
    swapTextures('tmp', 'f3');
    doRenderOp('tmp', ['rho', 'ux', 'uy', 'f4', 'obst'], 'update-f', {'uI': 4, 'uOmega': omega, 'uVel':u});
    swapTextures('tmp', 'f4');
    doRenderOp('tmp', ['rho', 'ux', 'uy', 'f5', 'obst'], 'update-f', {'uI': 5, 'uOmega': omega, 'uVel':u});
    swapTextures('tmp', 'f5');
    doRenderOp('tmp', ['rho', 'ux', 'uy', 'f6', 'obst'], 'update-f', {'uI': 6, 'uOmega': omega, 'uVel':u});
    swapTextures('tmp', 'f6');
    doRenderOp('tmp', ['rho', 'ux', 'uy', 'f7', 'obst'], 'update-f', {'uI': 7, 'uOmega': omega, 'uVel':u});
    swapTextures('tmp', 'f7');
    doRenderOp('tmp', ['rho', 'ux', 'uy', 'f8', 'obst'], 'update-f', {'uI': 8, 'uOmega': omega, 'uVel':u});
    swapTextures('tmp', 'f8');
    // Render
    if(inDraw)
    {
        doRenderOp(null, ['ux', 'uy', 'obst', 'obst_intended'], 'show-umod', {'drawIntended': drawIntended ? 1: 0, 'MVPMat': MVPMat});
    } else
    {
        doRenderOp(null, ['ux', 'uy', 'obst', null], 'show-umod', {'drawIntended': drawIntended ? 1: 0, 'MVPMat': MVPMat});
    }
    //doRenderOp(null, ['fx', 'fy', 'obst', 'obst_intended'], 'show-umod', {'drawIntended': drawIntended ? 1: 0, 'MVPMat': MVPMat});
    count = count+1;
}

var frameNum = 0;
var frameNumStarted = new Date();
var pos;    //canvas position for mouse interaction
var frameNum2 = 0;
var frameNumStarted2 = new Date();
function step() {
    if(document.getElementById('brush').checked) {
        if(mode != BRUSH_MODE) {
            mode          = BRUSH_MODE;
            addCircle     = false;
            obstPoint1[0] = -1.0;
            obstPoint1[1] = -1.0;
            obstPoint2[0] = -1.0;
            obstPoint2[1] = -1.0;
            circle_radius = brush_radius;
        }
    }else if(document.getElementById('square').checked) {
        if(mode != SQUARE_MODE) {
            mode          = SQUARE_MODE;
            drawIntended  = false;
            addSquare     = false;
            obstPoint1[0] = -1.0;
            obstPoint1[1] = -1.0;
            obstPoint2[0] = -1.0;
            obstPoint2[1] = -1.0;
        }
    }else if(document.getElementById('circle').checked) {
        if(mode != CIRCLE_MODE) {
            mode          = CIRCLE_MODE;
            drawIntended  = false;
            addCircleR    = false;
            obstPoint1[0] = -1.0;
            obstPoint1[1] = -1.0;
            obstPoint2[0] = -1.0;
            obstPoint2[1] = -1.0;
            circle_radius = 0.0;
        }
    } else if(document.getElementById('line').checked) {
        if(mode != LINE_MODE) {
            mode = LINE_MODE;
            drawIntended  = false;
            addLine       = false;
            obstPoint1[0] = -1.0;
            obstPoint1[1] = -1.0;
            obstPoint2[0] = -1.0;
            obstPoint2[1] = -1.0;
            circle_radius = brush_radius;
        }
    }
    
    stepState();
    
    // FPS
	frameNum++;
	var now = new Date();
	if (now - frameNumStarted > 1000) {
        document.getElementById('fps').textContent = (1000 / ((now - frameNumStarted) / frameNum)).toFixed(2);
        frameNum = 0;
        frameNumStarted = now;
        }
        
        // detect canvas position
        frameNum2++;
	if (now - frameNumStarted2 > 100) {
        pos = findPos(canvas);
        frameNum2 = 0;
        frameNumStarted2 = now;
	}
    
    requestAnimFrame(step);
}


function findPos(obj) {
    var curleft = 0, curtop = 0;
    if (obj.offsetParent) {
       do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
        return { x: curleft, y: curtop };
    }
    return undefined;
}

function webGLStart() {
    document.getElementById('brush').checked = true;
    canvas = document.getElementById('main-canvas');
    
    
    canvas.onmousedown = function(e) {
        mouseDown = true;
        pos           = findPos(canvas);
        var cssScaleX = Nx / canvas.width;
        var cssScaleY = Ny / canvas.height;
        var x         = (e.pageX - pos.x)*cssScaleX;
        var y         = (e.pageY - pos.y)*cssScaleY;
        
        if(inDraw) {
          var horRat = (buildVport.right-buildVport.left)/(vport.right-vport.left);
          var verRat = (buildVport.top-buildVport.bottom)/(vport.top-vport.bottom)
          obstPoint1 = [((x)*horRat)+bLeft, (Ny-y)*verRat+bBottom];
        } else {
          obstPoint1 = [x, (Ny-y)];
        }
        
        if(mode == BRUSH_MODE) BrushMouseDown(pos);
        if(mode == SQUARE_MODE) SquareMouseDown(pos);
        if(mode == CIRCLE_MODE) CircleMouseDown(pos);
        if(mode == LINE_MODE) LineMouseDown(pos);
        
        e = e || window.event;
        clear = e.ctrlKey;
        
        return false;
    };
    canvas.onmouseup = function(e) {
        mouseDown = false;
        
        if(mode == BRUSH_MODE) BrushMouseUp(pos);
        if(mode == SQUARE_MODE) SquareMouseUp(pos);
        if(mode == CIRCLE_MODE) CircleMouseUp(pos);
        if(mode == LINE_MODE) LineMouseUp(pos);
        
    };
    canvas.onmousemove = function(e) {
        pos           = findPos(canvas);
        var cssScaleX = Nx / canvas.width;
        var cssScaleY = Ny / canvas.height;
        var x         = (e.pageX - pos.x)*cssScaleX;
        var y         = (e.pageY - pos.y)*cssScaleY;

        if(inDraw) {
          var horRat = (buildVport.right-buildVport.left)/(vport.right-vport.left);
          var verRat = (buildVport.top-buildVport.bottom)/(vport.top-vport.bottom)
          obstPoint2 = [((x)*horRat)+bLeft, (Ny-y)*verRat+bBottom];
        } else {
          obstPoint2 = [x, (Ny-y)];
        }
        
        if(mode == BRUSH_MODE) BrushMouseMove(pos);
        if(mode == SQUARE_MODE) SquareMouseMove(pos);
        if(mode == CIRCLE_MODE) CircleMouseMove(pos);
        if(mode == LINE_MODE) LineMouseMove(pos);
        
    };
    
    initGL(canvas);
    initShaders();
    initBuffers();
    initTexturesFramebuffer();
    initState();
    
    step();
}

function updateBrushSlider(value) {
    if(lowQuality && value < 0.0025) value = 0.0025;
    brush_radius = value/dx;
    if(mode == BRUSH_MODE || mode == LINE_MODE)
        circle_radius = brush_radius;
}

function updateTauSlider(value) {
    omega = 1.0/value;
}

function updateUSlider(value) {
    u = value;
}

function isInside(p1,p2,p3)
{
    if(p3[0]<p1[0] || p3[0]>p2[0] || p3[1]>p1[1] || p3[1]<p2[1])
        return false;
    else
        return true;
}

function BrushMouseDown(pos) {
    drawIntended = true;
    
    addCircle = true;
}

function BrushMouseMove(pos) {
    drawIntended = true;
}

function BrushMouseUp(pos) {
    addCircle = false;
}

function SquareMouseDown(pos) {
    drawIntended = true;
}

function SquareMouseMove(pos) {
    
}

function SquareMouseUp(pos) {
    addSquare = true;
    drawIntended = false;
}

function CircleMouseDown(pos) {
    drawIntended = true;
}

function CircleMouseMove(pos) {
    var delta = [obstPoint2[0]-obstPoint1[0],obstPoint2[1]-obstPoint1[1]];
    circle_radius = Math.sqrt(delta[0]*delta[0] + delta[1]*delta[1]);
}

function CircleMouseUp(pos) {
    addCircleR = true;
    drawIntended = false;
}

function LineMouseDown(pos) {
    drawIntended = true;
}

function LineMouseMove(pos) {
    
}

function LineMouseUp(pos) {
    addLine = true;
    drawIntended = false;
}

var zoomFrameLen = 30;

function updateZoom(fromVport, toVport) {
  if(frameProgress<=zoomFrameLen)
  {
    var interpolent = frameProgress/zoomFrameLen
    var curVport = {
      'left':fromVport.left+interpolent*(toVport.left-fromVport.left),
      'right':fromVport.right+interpolent*(toVport.right-fromVport.right),
      'bottom':fromVport.bottom+interpolent*(toVport.bottom-fromVport.bottom),
      'top':fromVport.top+interpolent*(toVport.top-fromVport.top),
      'near':1.0,'far':-1.0};
      
    MVPMat = ortho(curVport);
  }
  
}

function zoomClick() {
  if(inDraw == true) {
    inDraw = false;
  }else{
    inDraw = true;
  }
  frameProgress = 0;
  var tmp = fromV;
  fromV = toV;
  toV = tmp;
}

var min_coeff = -1;
var max_coeff = 1;
var cl_array  = [];
var cd_array  = [];
var cl_data   = [];
var cd_data   = [];

Array.max = function( array ){
    return Math.max.apply( Math, array );
};
 
Array.min = function( array ){
    return Math.min.apply( Math, array );
};

function computeForce() {

  var forceX = new Uint8Array(bWidth * bHeight * 4);
  var forceY = new Uint8Array(bWidth * bHeight * 4);
  
  // Read X Force
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textures['fx'], 0);
  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE) {
    gl.readPixels(bLeft, bBottom, bWidth, bHeight, gl.RGBA, gl.UNSIGNED_BYTE, forceX);
  }
  
  // Read Y Force
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textures['fy'], 0);
  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE) {
    gl.readPixels(bLeft, bBottom, bWidth, bHeight, gl.RGBA, gl.UNSIGNED_BYTE, forceY);
  }
  
  var forceXVal = 0;
  var forceYVal = 0;
  var count     = 0;
  var minj      = bWidth;
  var maxj      = 0;
  for (var j=0;j<bHeight;j++)
  { 
    for (var i=0;i<bWidth;i++)
    { 
      var r    = forceX[(j*bWidth*4)+(4*i)+0];
      var g    = forceX[(j*bWidth*4)+(4*i)+1]; 
      var b    = forceX[(j*bWidth*4)+(4*i)+2];
      var tmpx = color2Float(r, g, b);
      
      var r    = forceY[(j*bWidth*4)+(4*i)+0];
      var g    = forceY[(j*bWidth*4)+(4*i)+1];
      var b    = forceY[(j*bWidth*4)+(4*i)+2];
      var tmpy = color2Float(r, g, b);
      if(tmpx!=0 || tmpy!=0)
      {
        if(j<minj) minj = j;
        if(j>maxj) maxj = j;
        forceXVal = forceXVal + tmpx;
        forceYVal = forceYVal + tmpy;
        count = count+1;
      }
      
    }
  }
  
  var cd,cl, A = maxj-minj;
  
  if(count>0)
  {
    cd = 2*forceXVal/(u*u*A);
    cl = 2*forceYVal/(u*u*A);
  } else {
    cd = 0;
    cl = 0;
  }
  
  // Add value to plotting data array
  if(cl_array.length>200)
  {
    var ignore = cl_array.shift();
    ignore = cd_array.shift();
  } 
  cl_array.push(cl);
  cd_array.push(cd);
  
  // Adjust plot axis limits
  var min_coeff_cl = Array.min(cl_array);
  var max_coeff_cl = Array.max(cl_array);
  var min_coeff_cd = Array.min(cd_array);
  var max_coeff_cd = Array.max(cd_array);
  min_coeff = (min_coeff_cl<min_coeff_cd) ? min_coeff_cl : min_coeff_cd;
  max_coeff = (max_coeff_cl>max_coeff_cd) ? max_coeff_cl : max_coeff_cd;
  
  var offset = (min_coeff>max_coeff) ? min_coeff*0.2 : max_coeff*0.2;
  min_coeff -= offset;
  max_coeff += offset;
  
  
  document.getElementById('lift').textContent =  cl.toFixed(7);
  document.getElementById('drag').textContent =  cd.toFixed(7);
}

function color2Float(r, g, b)
{    
    return ((r / 256.0 + g / (256.0 * 256.0) + b  / (256.0 * 256.0 * 256.0))*2.0)-1.0;
}
    
    // FLOT PLOTTING

$(function () {

		// Set up the control widget

		//var updateInterval = 30;
		/*$("#updateInterval").val(updateInterval).change(function () {
			var v = $(this).val();
			if (v && !isNaN(+v)) {
				updateInterval = +v;
				if (updateInterval < 1) {
					updateInterval = 1;
				} else if (updateInterval > 2000) {
					updateInterval = 2000;
				}
				$(this).val("" + updateInterval);
			}
		});*/
		var updateInterval = 60;
    $(this).val("" + updateInterval);
		var plot = $.plot("#coeffPlot", [{ label: "Cl", data: cl_data },
			{ label: "Cd", data: cd_data }], {
			series: {
				shadowSize: 5	// Drawing is faster without shadows
			},
			yaxis: {
        axisLabel: 'Coefficient Value',
        axisLabelUseCanvas: true,
        axisLabelFontSizePixels: 20,
        axisLabelFontFamily: 'visitor2'
			},
			xaxis: {
        axisLabel: 'Time',
        axisLabelUseCanvas: true,
        axisLabelFontSizePixels: 20,
        axisLabelFontFamily: 'visitor2',
        font: {
          color: "#ffffff"
          }
			},
			legend: {
        noColumns: 2,
        backgroundOpacity: 0.5
			}
		});

		function update() {

      cl_data = [];
      for (var i = 0; i < cl_array.length; ++i) {
        cl_data.push([i, cl_array[i]]);
      }
      
      cd_data = [];
      for (var i = 0; i < cd_array.length; ++i) {
        cd_data.push([i, cd_array[i]]);
      }
	
			plot.setData([{ label: "Cl", data: cl_data },
        { label: "Cd", data: cd_data }]);
      
      plot.setupGrid();

			plot.draw();
			setTimeout(update, updateInterval);
		}

		update();
	})
	
		// LIQUID SLIDER
	$(function(){
      
      //$('#slider-id').liquidSlider();

      $('#slider-id').liquidSlider({
      
            dynamicTabsAlign:"right",
            autoSlide:false,
            autoHeight:true,
            hideSideArrows:true,
            mobileNavigation:false,
            callbackFunction: function () { 
            // Store the instance in a variable var
             sliderObject = $.data( $('#slider-id')[0], 'liquidSlider'); 
             if ( ((sliderObject).currentTab == 1 || (sliderObject).currentTab == 2) && inDraw )
             {
                zoomClick()
             } else if ((sliderObject).currentTab == 0 && !inDraw)
             {
                zoomClick()
             }
             }
          });


      // If you need to access the internal property or methods, use this:

      var sliderObject = $.data( $('#slider-id')[0], 'liquidSlider');
      console.log(sliderObject);
      

});
    
$(document).ready(function(){
    var fourValue = 20.0 * u;
        var red   = Math.round((Math.min(fourValue - 1.5, -fourValue + 4.5)*255)*0.1+217*0.9);
        var green = Math.round((Math.min(fourValue - 0.5, -fourValue + 3.5)*255)*0.1+217*0.9);
        var blue  = Math.round((Math.min(fourValue + 0.5, -fourValue + 2.5)*255)*0.1+217*0.9);
        $("body").css('background-color', 'rgb('+red+','+green+','+blue+')');
        
    $("#slider_u").change(function() { 
        var fourValue = 20.0 * u;
        var red   = Math.round((Math.min(fourValue - 1.5, -fourValue + 4.5)*255)*0.1+217*0.9);
        var green = Math.round((Math.min(fourValue - 0.5, -fourValue + 3.5)*255)*0.1+217*0.9);
        var blue  = Math.round((Math.min(fourValue + 0.5, -fourValue + 2.5)*255)*0.1+217*0.9);
        $("body").css('background-color', 'rgb('+red+','+green+','+blue+')');
    });
});

// Disable context menu on canvas
function onRightClick()
{
  clearObst = true;
  return false;
}

// Initialise variables for low resolution mode
function init_low()
{
    lowQuality = true;

    Nx = 256.0;
    Ny = 32.0;

    dx = Lx/Nx;

    brush_radius    = 0.01/dx;
    circle_radius   = 0.01/dx;

    bLeft      =  0.09765625*Nx;
    bRight     = 0.34765625*Nx;
    bBottom    = 0.375*Ny;
    bTop       = 0.625*Ny;
    bWidth     = bRight-bLeft;
    bHeight    = bTop-bBottom;

    horOffset  = Nx/2;
    verOffset  = Ny/2;

    buildVport = {'left':(bLeft-horOffset)/horOffset,'right':(bRight-horOffset)/horOffset,
                        'bottom':(bBottom-verOffset)/verOffset,'top':(bTop-verOffset)/verOffset,
                        'near':1.0,'far':-1.0};

    fromV           = vport;
    toV             = buildVport;
    MVPMat          = ortho(buildVport);


    //var square_p4 = ;
    PROGS_DESC = {
        'init-accum': {
            'vs': ['shaders/quad.vs'],
            'fs': ['shaders/utils-low.fs', 'shaders/init-accum.fs'],
            'attribs': ['aVertexPosition', 'aTextureCoord'],
            'uniforms': ['uRhoUxUy']
        },
        'init-f': {
            'vs': ['shaders/quad.vs'],
            'fs': ['shaders/utils-low.fs', 'shaders/init-f.fs'],
            'attribs': ['aVertexPosition', 'aTextureCoord'],
            'uniforms': ['uSampler0', 'uSampler1', 'uSampler2', 'uI']
        },
        'init-obst': {
            'vs': ['shaders/quad.vs'],
            'fs': ['shaders/utils-low.fs', 'shaders/init-obst.fs'],
            'attribs': ['aVertexPosition', 'aTextureCoord'],
            'uniforms': []
        },
        'update-f': {
            'vs': ['shaders/quad.vs'],
            'fs': ['shaders/utils-low.fs', 'shaders/update-f.fs'],
            'attribs': ['aVertexPosition', 'aTextureCoord'],
            'uniforms': ['uSampler0', 'uSampler1', 'uSampler2', 'uSampler3', 'uSampler4', 'uI', 'uOmega', 'uVel']
        },
        'update-Fx': {
            'vs': ['shaders/quad.vs'],
            'fs': ['shaders/utils-low.fs', 'shaders/update-fx.fs'],
            'attribs': ['aVertexPosition', 'aTextureCoord'],
            'uniforms': ['uSampler0', 'uSampler1', 'uSampler2', 'uSampler3', 'uSampler4', 'uSampler5', 'uSampler6' ]
        },
        'update-Fy': {
            'vs': ['shaders/quad.vs'],
            'fs': ['shaders/utils-low.fs', 'shaders/update-fy.fs'],
            'attribs': ['aVertexPosition', 'aTextureCoord'],
            'uniforms': ['uSampler0', 'uSampler1', 'uSampler2', 'uSampler3', 'uSampler4', 'uSampler5', 'uSampler6']
        },
        'update-obst-clear': {
            'vs': ['shaders/quad.vs'],
            'fs': ['shaders/utils-low.fs', 'shaders/update-obst-clear.fs'],
            'attribs': ['aVertexPosition', 'aTextureCoord'],
            'uniforms': []
        },
        'update-obst-circle': {
            'vs': ['shaders/quad.vs'],
            'fs': ['shaders/utils-low.fs', 'shaders/update-obst-circle.fs'],
            'attribs': ['aVertexPosition', 'aTextureCoord'],
            'uniforms': ['uSampler0', 'uPointX', 'uPointY', 'uRadius', 'uClear', 'uAdd']
        },
        'update-obst-square': {
            'vs': ['shaders/quad.vs'],
            'fs': ['shaders/utils-low.fs', 'shaders/update-obst-square.fs'],
            'attribs': ['aVertexPosition', 'aTextureCoord'],
            'uniforms': ['uSampler0', 'uPointX1', 'uPointY1', 'uPointX2', 'uPointY2', 'uClear', 'uAdd']
        },
        'update-obst-line': {
            'vs': ['shaders/quad.vs'],
            'fs': ['shaders/utils-low.fs', 'shaders/update-obst-line.fs'],
            'attribs': ['aVertexPosition', 'aTextureCoord'],
            'uniforms': ['uSampler0', 'uPointX1', 'uPointY1', 'uPointX2', 'uPointY2', 'uPointX3', 'uPointY3', 'uPointX4', 'uPointY4', 'uClear', 'uAdd']
        },
        'f-to-accum': {
            'vs': ['shaders/quad.vs'],
            'fs': ['shaders/utils-low.fs', 'shaders/f-to-accum.fs'],
            'attribs': ['aVertexPosition', 'aTextureCoord'],
            'uniforms': ['uSampler0', 'uSampler1', 'uSampler2', 'uSampler3', 'uSampler4', 'uSampler5', 'uSampler6', 'uSampler7', 'uSampler8', 'uRhoUxUy']
        },
        'show-umod': {
            'vs': ['shaders/quad_perspective.vs'],
            'fs': ['shaders/utils-low.fs', 'shaders/show-umod.fs'],
            'attribs': ['aVertexPosition', 'aTextureCoord'],
            'uniforms': ['uSampler0', 'uSampler1', 'uSampler2', 'uSampler3','drawIntended', 'MVPMat']
        }
    };

    TEXTURES_DESC = {
        'rho': [Nx, Ny],
        'ux': [Nx, Ny],
        'uy': [Nx, Ny],
        'f0': [Nx, Ny],
        'f1': [Nx, Ny],
        'f2': [Nx, Ny],
        'f3': [Nx, Ny],
        'f4': [Nx, Ny],
        'f5': [Nx, Ny],
        'f6': [Nx, Ny],
        'f7': [Nx, Ny],
        'f8': [Nx, Ny],
        'tmp': [Nx, Ny],
        'obst': [Nx, Ny],
        'obst_intended': [Nx, Ny],
        'fx': [Nx, Ny],
        'fy': [Nx, Ny]
    };
}

function init_med()
{
    Nx = 512;
    Ny = 64;

    dx = Lx/Nx;

    brush_radius    = 0.01/dx;
    circle_radius   = 0.01/dx;

    bLeft      =  0.09765625*Nx;
    bRight     = 0.34765625*Nx;
    bBottom    = 0.375*Ny;
    bTop       = 0.625*Ny;
    bWidth     = bRight-bLeft;
    bHeight    = bTop-bBottom;

    horOffset  = Nx/2;
    verOffset  = Ny/2;

    buildVport = {'left':(bLeft-horOffset)/horOffset,'right':(bRight-horOffset)/horOffset,
                        'bottom':(bBottom-verOffset)/verOffset,'top':(bTop-verOffset)/verOffset,
                        'near':1.0,'far':-1.0};

    fromV           = vport;
    toV             = buildVport;
    MVPMat          = ortho(buildVport);


    //var square_p4 = ;
    PROGS_DESC = {
        'init-accum': {
            'vs': ['shaders/quad.vs'],
            'fs': ['shaders/utils-med.fs', 'shaders/init-accum.fs'],
            'attribs': ['aVertexPosition', 'aTextureCoord'],
            'uniforms': ['uRhoUxUy']
        },
        'init-f': {
            'vs': ['shaders/quad.vs'],
            'fs': ['shaders/utils-med.fs', 'shaders/init-f.fs'],
            'attribs': ['aVertexPosition', 'aTextureCoord'],
            'uniforms': ['uSampler0', 'uSampler1', 'uSampler2', 'uI']
        },
        'init-obst': {
            'vs': ['shaders/quad.vs'],
            'fs': ['shaders/utils-med.fs', 'shaders/init-obst.fs'],
            'attribs': ['aVertexPosition', 'aTextureCoord'],
            'uniforms': []
        },
        'update-f': {
            'vs': ['shaders/quad.vs'],
            'fs': ['shaders/utils-med.fs', 'shaders/update-f.fs'],
            'attribs': ['aVertexPosition', 'aTextureCoord'],
            'uniforms': ['uSampler0', 'uSampler1', 'uSampler2', 'uSampler3', 'uSampler4', 'uI', 'uOmega', 'uVel']
        },
        'update-Fx': {
            'vs': ['shaders/quad.vs'],
            'fs': ['shaders/utils-med.fs', 'shaders/update-fx.fs'],
            'attribs': ['aVertexPosition', 'aTextureCoord'],
            'uniforms': ['uSampler0', 'uSampler1', 'uSampler2', 'uSampler3', 'uSampler4', 'uSampler5', 'uSampler6' ]
        },
        'update-Fy': {
            'vs': ['shaders/quad.vs'],
            'fs': ['shaders/utils-med.fs', 'shaders/update-fy.fs'],
            'attribs': ['aVertexPosition', 'aTextureCoord'],
            'uniforms': ['uSampler0', 'uSampler1', 'uSampler2', 'uSampler3', 'uSampler4', 'uSampler5', 'uSampler6']
        },
        'update-obst-clear': {
            'vs': ['shaders/quad.vs'],
            'fs': ['shaders/utils-med.fs', 'shaders/update-obst-clear.fs'],
            'attribs': ['aVertexPosition', 'aTextureCoord'],
            'uniforms': []
        },
        'update-obst-circle': {
            'vs': ['shaders/quad.vs'],
            'fs': ['shaders/utils-med.fs', 'shaders/update-obst-circle.fs'],
            'attribs': ['aVertexPosition', 'aTextureCoord'],
            'uniforms': ['uSampler0', 'uPointX', 'uPointY', 'uRadius', 'uClear', 'uAdd']
        },
        'update-obst-square': {
            'vs': ['shaders/quad.vs'],
            'fs': ['shaders/utils-med.fs', 'shaders/update-obst-square.fs'],
            'attribs': ['aVertexPosition', 'aTextureCoord'],
            'uniforms': ['uSampler0', 'uPointX1', 'uPointY1', 'uPointX2', 'uPointY2', 'uClear', 'uAdd']
        },
        'update-obst-line': {
            'vs': ['shaders/quad.vs'],
            'fs': ['shaders/utils-med.fs', 'shaders/update-obst-line.fs'],
            'attribs': ['aVertexPosition', 'aTextureCoord'],
            'uniforms': ['uSampler0', 'uPointX1', 'uPointY1', 'uPointX2', 'uPointY2', 'uPointX3', 'uPointY3', 'uPointX4', 'uPointY4', 'uClear', 'uAdd']
        },
        'f-to-accum': {
            'vs': ['shaders/quad.vs'],
            'fs': ['shaders/utils-med.fs', 'shaders/f-to-accum.fs'],
            'attribs': ['aVertexPosition', 'aTextureCoord'],
            'uniforms': ['uSampler0', 'uSampler1', 'uSampler2', 'uSampler3', 'uSampler4', 'uSampler5', 'uSampler6', 'uSampler7', 'uSampler8', 'uRhoUxUy']
        },
        'show-umod': {
            'vs': ['shaders/quad_perspective.vs'],
            'fs': ['shaders/utils-med.fs', 'shaders/show-umod.fs'],
            'attribs': ['aVertexPosition', 'aTextureCoord'],
            'uniforms': ['uSampler0', 'uSampler1', 'uSampler2', 'uSampler3','drawIntended', 'MVPMat']
        }
    };

    TEXTURES_DESC = {
        'rho': [Nx, Ny],
        'ux': [Nx, Ny],
        'uy': [Nx, Ny],
        'f0': [Nx, Ny],
        'f1': [Nx, Ny],
        'f2': [Nx, Ny],
        'f3': [Nx, Ny],
        'f4': [Nx, Ny],
        'f5': [Nx, Ny],
        'f6': [Nx, Ny],
        'f7': [Nx, Ny],
        'f8': [Nx, Ny],
        'tmp': [Nx, Ny],
        'obst': [Nx, Ny],
        'obst_intended': [Nx, Ny],
        'fx': [Nx, Ny],
        'fy': [Nx, Ny]
    };
}

function init_high()
{
    Nx = 1024.0;
    Ny = 128.0;

    dx = Lx/Nx;

    brush_radius    = 0.01/dx;
    circle_radius   = 0.01/dx;

    bLeft      =  0.09765625*Nx;
    bRight     = 0.34765625*Nx;
    bBottom    = 0.375*Ny;
    bTop       = 0.625*Ny;
    bWidth     = bRight-bLeft;
    bHeight    = bTop-bBottom;

    horOffset  = Nx/2;
    verOffset  = Ny/2;

    buildVport = {'left':(bLeft-horOffset)/horOffset,'right':(bRight-horOffset)/horOffset,
                        'bottom':(bBottom-verOffset)/verOffset,'top':(bTop-verOffset)/verOffset,
                        'near':1.0,'far':-1.0};

    fromV           = vport;
    toV             = buildVport;
    MVPMat          = ortho(buildVport);


    //var square_p4 = ;
    PROGS_DESC = {
        'init-accum': {
            'vs': ['shaders/quad.vs'],
            'fs': ['shaders/utils-high.fs', 'shaders/init-accum.fs'],
            'attribs': ['aVertexPosition', 'aTextureCoord'],
            'uniforms': ['uRhoUxUy']
        },
        'init-f': {
            'vs': ['shaders/quad.vs'],
            'fs': ['shaders/utils-high.fs', 'shaders/init-f.fs'],
            'attribs': ['aVertexPosition', 'aTextureCoord'],
            'uniforms': ['uSampler0', 'uSampler1', 'uSampler2', 'uI']
        },
        'init-obst': {
            'vs': ['shaders/quad.vs'],
            'fs': ['shaders/utils-high.fs', 'shaders/init-obst.fs'],
            'attribs': ['aVertexPosition', 'aTextureCoord'],
            'uniforms': []
        },
        'update-f': {
            'vs': ['shaders/quad.vs'],
            'fs': ['shaders/utils-high.fs', 'shaders/update-f.fs'],
            'attribs': ['aVertexPosition', 'aTextureCoord'],
            'uniforms': ['uSampler0', 'uSampler1', 'uSampler2', 'uSampler3', 'uSampler4', 'uI', 'uOmega', 'uVel']
        },
        'update-Fx': {
            'vs': ['shaders/quad.vs'],
            'fs': ['shaders/utils-high.fs', 'shaders/update-fx.fs'],
            'attribs': ['aVertexPosition', 'aTextureCoord'],
            'uniforms': ['uSampler0', 'uSampler1', 'uSampler2', 'uSampler3', 'uSampler4', 'uSampler5', 'uSampler6' ]
        },
        'update-Fy': {
            'vs': ['shaders/quad.vs'],
            'fs': ['shaders/utils-high.fs', 'shaders/update-fy.fs'],
            'attribs': ['aVertexPosition', 'aTextureCoord'],
            'uniforms': ['uSampler0', 'uSampler1', 'uSampler2', 'uSampler3', 'uSampler4', 'uSampler5', 'uSampler6']
        },
        'update-obst-clear': {
            'vs': ['shaders/quad.vs'],
            'fs': ['shaders/utils-high.fs', 'shaders/update-obst-clear.fs'],
            'attribs': ['aVertexPosition', 'aTextureCoord'],
            'uniforms': []
        },
        'update-obst-circle': {
            'vs': ['shaders/quad.vs'],
            'fs': ['shaders/utils-high.fs', 'shaders/update-obst-circle.fs'],
            'attribs': ['aVertexPosition', 'aTextureCoord'],
            'uniforms': ['uSampler0', 'uPointX', 'uPointY', 'uRadius', 'uClear', 'uAdd']
        },
        'update-obst-square': {
            'vs': ['shaders/quad.vs'],
            'fs': ['shaders/utils-high.fs', 'shaders/update-obst-square.fs'],
            'attribs': ['aVertexPosition', 'aTextureCoord'],
            'uniforms': ['uSampler0', 'uPointX1', 'uPointY1', 'uPointX2', 'uPointY2', 'uClear', 'uAdd']
        },
        'update-obst-line': {
            'vs': ['shaders/quad.vs'],
            'fs': ['shaders/utils-high.fs', 'shaders/update-obst-line.fs'],
            'attribs': ['aVertexPosition', 'aTextureCoord'],
            'uniforms': ['uSampler0', 'uPointX1', 'uPointY1', 'uPointX2', 'uPointY2', 'uPointX3', 'uPointY3', 'uPointX4', 'uPointY4', 'uClear', 'uAdd']
        },
        'f-to-accum': {
            'vs': ['shaders/quad.vs'],
            'fs': ['shaders/utils-high.fs', 'shaders/f-to-accum.fs'],
            'attribs': ['aVertexPosition', 'aTextureCoord'],
            'uniforms': ['uSampler0', 'uSampler1', 'uSampler2', 'uSampler3', 'uSampler4', 'uSampler5', 'uSampler6', 'uSampler7', 'uSampler8', 'uRhoUxUy']
        },
        'show-umod': {
            'vs': ['shaders/quad_perspective.vs'],
            'fs': ['shaders/utils-high.fs', 'shaders/show-umod.fs'],
            'attribs': ['aVertexPosition', 'aTextureCoord'],
            'uniforms': ['uSampler0', 'uSampler1', 'uSampler2', 'uSampler3','drawIntended', 'MVPMat']
        }
    };

    TEXTURES_DESC = {
        'rho': [Nx, Ny],
        'ux': [Nx, Ny],
        'uy': [Nx, Ny],
        'f0': [Nx, Ny],
        'f1': [Nx, Ny],
        'f2': [Nx, Ny],
        'f3': [Nx, Ny],
        'f4': [Nx, Ny],
        'f5': [Nx, Ny],
        'f6': [Nx, Ny],
        'f7': [Nx, Ny],
        'f8': [Nx, Ny],
        'tmp': [Nx, Ny],
        'obst': [Nx, Ny],
        'obst_intended': [Nx, Ny],
        'fx': [Nx, Ny],
        'fy': [Nx, Ny]
    };
}

// Fix for horizontal scrolling of top bar
$(window).scroll(function(){$('#top_bar').css('left', parseInt(-1*$(window).scrollLeft())+'px');});