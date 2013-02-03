var N = 512;

var obstPoint1 = [-1, -1];
var obstPoint2 = [-1, -1];
var square1 = [-1, -1];
var square2 = [-1, -1];
var square_p1 = [-1, -1];
var square_p2 = [-1, -1];
var square_p3 = [-1, -1];
var square_p4 = [-1, -1];
var clear = false;
var addSquare = false;
var drawIntended = true;
var addCircle = false;
var addLine = false;
var copySelection = false;
var brush_radius = 0.01;
var circle_radius = brush_radius;
var omega = 1.9;
var u = 0.05;

var MAKE_SEL_MODE = 1;
var ACTIVE_SEL_MODE = 2;
var sel_mode = MAKE_SEL_MODE;

var BRUSH_MODE = 0;
var SQUARE_MODE = 1;
var CIRCLE_MODE = 2;
var LINE_MODE = 3;
var SELECT_MODE = 4;
var mode = BRUSH_MODE;
//var square_p4 = ;
var PROGS_DESC = {
    'init-accum': {
        'vs': ['shader-vs'],
        'fs': ['shader-fs-utils', 'shader-fs-init-accum'],
        'attribs': ['aVertexPosition', 'aTextureCoord'],
        'uniforms': ['uRhoUxUy']
    },
    'init-f': {
        'vs': ['shader-vs'],
        'fs': ['shader-fs-utils', 'shader-fs-init-f'],
        'attribs': ['aVertexPosition', 'aTextureCoord'],
        'uniforms': ['uSampler0', 'uSampler1', 'uSampler2', 'uI']
    },
    'init-obst': {
        'vs': ['shader-vs'],
        'fs': ['shader-fs-utils', 'shader-fs-init-obst'],
        'attribs': ['aVertexPosition', 'aTextureCoord'],
        'uniforms': []
    },
    'init-display': {
        'vs': ['shader-vs'],
        'fs': ['shader-fs-utils', 'shader-fs-init-display'],
        'attribs': ['aVertexPosition', 'aTextureCoord'],
        'uniforms': []
    },
    'update-f': {
        'vs': ['shader-vs'],
        'fs': ['shader-fs-utils', 'shader-fs-update-f'],
        'attribs': ['aVertexPosition', 'aTextureCoord'],
        'uniforms': ['uSampler0', 'uSampler1', 'uSampler2', 'uSampler3', 'uSampler4', 'uI', 'uOmega', 'uVel']
    },
    'update-display': {
        'vs': ['shader-vs'],
        'fs': ['shader-fs-utils', 'shader-fs-update-display'],
        'attribs': ['aVertexPosition', 'aTextureCoord'],
        'uniforms': ['uSampler0', 'uSampler1', 'uSampler2']
    },
    'update-obst-circle': {
        'vs': ['shader-vs'],
        'fs': ['shader-fs-utils', 'shader-fs-update-obst-circle'],
        'attribs': ['aVertexPosition', 'aTextureCoord'],
        'uniforms': ['uSampler0', 'uPointX', 'uPointY', 'uRadius', 'uClear', 'uAdd']
    },
    'update-obst-square': {
        'vs': ['shader-vs'],
        'fs': ['shader-fs-utils', 'shader-fs-update-obst-square'],
        'attribs': ['aVertexPosition', 'aTextureCoord'],
        'uniforms': ['uSampler0', 'uPointX1', 'uPointY1', 'uPointX2', 'uPointY2', 'uClear', 'uAdd']
    },
    'update-obst-line': {
        'vs': ['shader-vs'],
        'fs': ['shader-fs-utils', 'shader-fs-update-obst-line'],
        'attribs': ['aVertexPosition', 'aTextureCoord'],
        'uniforms': ['uSampler0', 'uPointX1', 'uPointY1', 'uPointX2', 'uPointY2', 'uPointX3', 'uPointY3', 'uPointX4', 'uPointY4', 'uClear', 'uAdd']
    },
    'update-obst-square-copy': {
        'vs': ['shader-vs'],
        'fs': ['shader-fs-utils', 'shader-fs-update-obst-square'],
        'attribs': ['aVertexPosition', 'aTextureCoord'],
        'uniforms': ['uSampler0', 'uSampler1', 'uPointX1', 'uPointY1', 'uPointX2', 'uPointY2', 'uPointX3', 'uPointY3', 'uClear', 'uAdd']
    },
    'f-to-accum': {
        'vs': ['shader-vs'],
        'fs': ['shader-fs-utils', 'shader-fs-f-to-accum'],
        'attribs': ['aVertexPosition', 'aTextureCoord'],
        'uniforms': ['uSampler0', 'uSampler1', 'uSampler2', 'uSampler3', 'uSampler4', 'uSampler5', 'uSampler6', 'uSampler7', 'uSampler8', 'uRhoUxUy']
    },
    'threshold': {
        'vs': ['shader-vs'],
        'fs': ['shader-fs-utils', 'shader-fs-threshold'],
        'attribs': ['aVertexPosition', 'aTextureCoord'],
        'uniforms': ['uSampler0']
    },
    'show': {
        'vs': ['shader-vs'],
        'fs': ['shader-fs-show'],
        'attribs': ['aVertexPosition', 'aTextureCoord'],
        'uniforms': ['uSampler0']
    },
    'show-umod': {
        'vs': ['shader-vs'],
        'fs': ['shader-fs-utils', 'shader-fs-show-umod'],
        'attribs': ['aVertexPosition', 'aTextureCoord'],
        'uniforms': ['uSampler0', 'uSampler1', 'uSampler2', 'uSampler3','drawIntended']
    }
};

var TEXTURES_DESC = {
    'rho': N,
    'ux': N,
    'uy': N,
    'f0': N,
    'f1': N,
    'f2': N,
    'f3': N,
    'f4': N,
    'f5': N,
    'f6': N,
    'f7': N,
    'f8': N,
    'tmp': N,
    'obst': N,
    'obst_intended': N
};

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
    //gl.viewport(0, 0, canvas.width, canvas.height);
    gl.viewport(0, 0, N,N);
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
        var shaderElem = document.getElementById(ids[i]);
        shaderTexts.push(shaderElem.textContent);
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

function createTexture(n, linear) {
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
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, n, n, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    tex.n = n;
    return tex;
}

var textures = {};
var framebuffer;
function initTexturesFramebuffer() {
    for (var id in TEXTURES_DESC) {
        textures[id] = createTexture(TEXTURES_DESC[id]);
    }
    textures.display = createTexture(N, true);
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
        if(is_int(uniformAssignments[uniformVarName])) {
            gl.uniform1i(prog[uniformVarName], uniformAssignments[uniformVarName]);
        } else {
            gl.uniform1f(prog[uniformVarName], uniformAssignments[uniformVarName]);
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
    doRenderOp('display', [], 'init-display', {});
}

function stepState() {
    if(mode == SQUARE_MODE){
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
    
    if(mode == BRUSH_MODE){
        doRenderOp('tmp', ['obst_intended'], 'update-obst-circle', {'uPointX': obstPoint2[0], 'uPointY': obstPoint2[1], 'uRadius': circle_radius, 'uClear': clear ? 1 : 0, 'uAdd':0});
        swapTextures('tmp', 'obst_intended');
        if(addCircle) {
            doRenderOp('tmp', ['obst'], 'update-obst-circle', {'uPointX': obstPoint2[0], 'uPointY': obstPoint2[1], 'uRadius': circle_radius, 'uClear': clear ? 1 : 0, 'uAdd':1});
            swapTextures('tmp', 'obst');
            //addCircle = false;
        }
    }
    
    if(mode == CIRCLE_MODE){
        doRenderOp('tmp', ['obst_intended'], 'update-obst-circle', {'uPointX': obstPoint1[0], 'uPointY': obstPoint1[1], 'uRadius': circle_radius, 'uClear': clear ? 1 : 0, 'uAdd':0});
        swapTextures('tmp', 'obst_intended');
        if(addCircleR) {
            doRenderOp('tmp', ['obst'], 'update-obst-circle', {'uPointX': obstPoint1[0], 'uPointY': obstPoint1[1], 'uRadius': circle_radius, 'uClear': clear ? 1 : 0, 'uAdd':1});
            swapTextures('tmp', 'obst');
            addCircleR = false;
        }
    }
    
    if(mode == LINE_MODE){
        var delta = [obstPoint2[0]-obstPoint1[0],obstPoint2[1]-obstPoint1[1]];
        var len = Math.sqrt(delta[0]*delta[0]+delta[1]*delta[1]);
        var theta = Math.asin(delta[0]/len);
        if(obstPoint2[1]<obstPoint1[1]) theta = Math.PI-theta;
        square_p1 = [-circle_radius*N, 0];
        square_p2 = [-circle_radius*N, len];
        square_p3 = [circle_radius*N, len];
        square_p4 = [circle_radius*N, 0];
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
    
    if(mode == SELECT_MODE) {
        
        if(sel_mode == ACTIVE_SEL_MODE){
            doRenderOp('tmp', ['obst_intended', 'obst'], 'update-obst-square-copy', {'uPointX': obstPoint1[0], 'uPointY': obstPoint1[1], 'uRadius': circle_radius, 'uClear': clear ? 1 : 0, 'uAdd':0});
            swapTextures('tmp', 'obst_intended');
            if(addCircleR) {
                doRenderOp('tmp', ['obst_intended', 'obst'], 'update-obst-square-copy', {'uPointX': obstPoint1[0], 'uPointY': obstPoint1[1], 'uRadius': circle_radius, 'uClear': clear ? 1 : 0, 'uAdd':1});
                swapTextures('tmp', 'obst');
                addCircleR = false;
            }
        }

        if(sel_mode == MAKE_SEL_MODE){
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
        }
        
        if(copySelection){}
    }
    //doRenderOp('tmp', ['obst'], 'update-obst', {'uPointX': obstPoint[0], 'uPointY': obstPoint[1], 'uClear': clear ? 1 : 0});
    //swapTextures('tmp', 'obst');
    doRenderOp('rho', ['f0', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8'], 'f-to-accum', {'uRhoUxUy': 0});
    doRenderOp('ux', ['f0', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8'], 'f-to-accum', {'uRhoUxUy': 1});
    doRenderOp('uy', ['f0', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8'], 'f-to-accum', {'uRhoUxUy': 2});
    doRenderOp('tmp', ['rho', 'ux', 'uy', 'f0', 'obst', 'f0'], 'update-f', {'uI': 0, 'uOmega': omega, 'uVel':u});
    swapTextures('tmp', 'f0');
    doRenderOp('tmp', ['rho', 'ux', 'uy', 'f1', 'obst', 'f5'], 'update-f', {'uI': 1, 'uOmega': omega, 'uVel':u});
    swapTextures('tmp', 'f1');
    doRenderOp('tmp', ['rho', 'ux', 'uy', 'f2', 'obst', 'f6'], 'update-f', {'uI': 2, 'uOmega': omega, 'uVel':u});
    swapTextures('tmp', 'f2');
    doRenderOp('tmp', ['rho', 'ux', 'uy', 'f3', 'obst', 'f7'], 'update-f', {'uI': 3, 'uOmega': omega, 'uVel':u});
    swapTextures('tmp', 'f3');
    doRenderOp('tmp', ['rho', 'ux', 'uy', 'f4', 'obst', 'f8'], 'update-f', {'uI': 4, 'uOmega': omega, 'uVel':u});
    swapTextures('tmp', 'f4');
    doRenderOp('tmp', ['rho', 'ux', 'uy', 'f5', 'obst', 'f1'], 'update-f', {'uI': 5, 'uOmega': omega, 'uVel':u});
    swapTextures('tmp', 'f5');
    doRenderOp('tmp', ['rho', 'ux', 'uy', 'f6', 'obst', 'f2'], 'update-f', {'uI': 6, 'uOmega': omega, 'uVel':u});
    swapTextures('tmp', 'f6');
    doRenderOp('tmp', ['rho', 'ux', 'uy', 'f7', 'obst', 'f3'], 'update-f', {'uI': 7, 'uOmega': omega, 'uVel':u});
    swapTextures('tmp', 'f7');
    doRenderOp('tmp', ['rho', 'ux', 'uy', 'f8', 'obst', 'f4'], 'update-f', {'uI': 8, 'uOmega': omega, 'uVel':u});
    swapTextures('tmp', 'f8');
    doRenderOp(null, ['ux', 'uy', 'obst', 'obst_intended'], 'show-umod', {'drawIntended': drawIntended ? 1: 0});
    //[null, ['obst'], 'show', {}]
}

var frameNum = 0;
var frameNumStarted = new Date();
var pos;    //canvas position for mouse interaction
var frameNum2 = 0;
var frameNumStarted2 = new Date();
var canvas;
function step() {
    if(document.getElementById('brush').checked) {
        if(mode != BRUSH_MODE) {
            mode = BRUSH_MODE;
            addCircle = false;
            obstPoint1[0] = -1.0;
            obstPoint1[1] = -1.0;
            obstPoint2[0] = -1.0;
            obstPoint2[1] = -1.0;
            circle_radius = brush_radius;
        }
    }else if(document.getElementById('square').checked) {
        if(mode != SQUARE_MODE) {
            mode = SQUARE_MODE;
            drawIntended = false;
            addSquare = false;
            obstPoint1[0] = -1.0;
            obstPoint1[1] = -1.0;
            obstPoint2[0] = -1.0;
            obstPoint2[1] = -1.0;
        }
    }else if(document.getElementById('circle').checked) {
        if(mode != CIRCLE_MODE) {
            mode = CIRCLE_MODE;
            drawIntended = false;
            addCircleR = false;
            obstPoint1[0] = -1.0;
            obstPoint1[1] = -1.0;
            obstPoint2[0] = -1.0;
            obstPoint2[1] = -1.0;
            circle_radius = 0.0;
        }
    } else if(document.getElementById('line').checked) {
        if(mode != LINE_MODE) {
            mode = LINE_MODE;
            drawIntended = false;
            addLine = false;
            obstPoint1[0] = -1.0;
            obstPoint1[1] = -1.0;
            obstPoint2[0] = -1.0;
            obstPoint2[1] = -1.0;
            circle_radius = brush_radius;
        }
    }else if(document.getElementById('copy').checked) {
        if(mode != SELECT_MODE) {
            mode = SELECT_MODE;
            copySelected = false;
            drawIntended = false;
            obstPoint1[0] = -1.0;
            obstPoint1[1] = -1.0;
            obstPoint2[0] = -1.0;
            obstPoint2[1] = -1.0;
        }
    }
    
    stepState();
    
    // FPS
	frameNum++;
	var now = new Date();
	if (now - frameNumStarted > 1000) {
        document.getElementById('fps').innerText = (1000 / ((now - frameNumStarted) / frameNum)).toFixed(2);
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


function onMouseDown(e) {
    
}

function onMouseUp(e) {
    mouseDown = false;
    addSquare = true;
    //obstPoint = [-1, -1];
}

function onMouseMove(e) {
    if (mouseDown) {
        obstPoint = [256, 256];
    }
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
    pos = findPos(canvas);
    var mouseDown = false;
    canvas.onmousedown = function(e) {
        mouseDown = true;
        var x = e.pageX - pos.x;
        var y = e.pageY - pos.y;
        obstPoint1 = [x*N/canvas.width, (canvas.height-y)*N/canvas.height];
        addCircle = true;
        
        e = e || window.event;
        clear = e.ctrlKey;
        if(mode != LINE_MODE) drawIntended = true;
        
        // SELECT MODE SWITCH
        sel_mode = MAKE_SEL_MODE;
        
        return false;
    };
    canvas.onmouseup = function(e) {
        mouseDown = false;
        if(mode != BRUSH_MODE || mode != SELECT_MODE) drawIntended = false;
        addSquare = true;
        addCircleR = true;
        addLine = true;
        addCircle = false;
        //obstPoint = [-1, -1];
    };
    canvas.onmousemove = function(e) {
        if(mode == BRUSH_MODE) drawIntended = true;
        if(mouseDown)
            {
                if(mode == LINE_MODE) drawIntended = true;
            }
        var x = e.pageX - pos.x;
        var y = e.pageY - pos.y;
        obstPoint2 = [x*N/canvas.width, (canvas.height-y)*N/canvas.height];
        
        var delta = [obstPoint2[0]-obstPoint1[0],obstPoint2[1]-obstPoint1[1]];
        
        if(mode == CIRCLE_MODE) circle_radius = Math.sqrt(delta[0]*delta[0] + delta[1]*delta[1])/N;
    };
    
    initGL(canvas);
    initShaders();
    initBuffers();
    initTexturesFramebuffer();
    initState();
    
    step();
}

function updateBrushSlider(value) {
    brush_radius = value*value/N;
    if(mode == BRUSH_MODE || mode == LINE_MODE)
        circle_radius = brush_radius;
}

function updateTauSlider(value) {
    omega = 1.0/value;
    document.getElementById('slider_tau_val').innerText=value; 
}

function updateUSlider(value) {
    u = value;
    document.getElementById('slider_u_val').innerText=value; 
}

function isInside(p1,p2,p3)
{
    if(p3[0]<p1[0] || p3[0]>p2[0] || p3[1]>p1[1] || p3[1]<p2[1])
        return false;
    else
        return true;
}