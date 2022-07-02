"use strict";

import * as cg from "./cg.js";
import * as m4 from "./glmjs/mat4.js";
import * as twgl from "./twgl-full.module.js";
import * as v3 from "./glmjs/vec3.js";

async function main() {
  const ambientLight = document.querySelector("#ambient");
  const ambientLigthR = document.querySelector("#ambientR");
  const ambientLigthG = document.querySelector("#ambientG");
  const ambientLigthB = document.querySelector("#ambientB");
  const diffuseLight = document.querySelector("#diffuse");
  const diffuseLigthR = document.querySelector("#diffuseR");
  const diffuseLigthG = document.querySelector("#diffuseG");
  const diffuseLigthB = document.querySelector("#diffuseB");
  const lampara = document.querySelector("#lampara");
  const lamparaR = document.querySelector("#lamparaR");
  const lamparaG = document.querySelector("#lamparaG");
  const lamparaB = document.querySelector("#lamparaB");
  const canvitas = document.querySelector("#canvitas");
  const gl = canvitas.getContext("webgl2");
  if (!gl) return undefined !== console.log("WebGL 2.0 not supported");

  twgl.setDefaults({ attribPrefix: "a_" });
  const vertSrc = await fetch("glsl/final.vert").then((r) => r.text());
  const fragSrc = await fetch("glsl/final.frag").then((r) => r.text());
  const meshProgramInfo = twgl.createProgramInfo(gl, [vertSrc, fragSrc]);
  const cubex = await cg.loadObj(
    "models/cubito/diamante.obj",
    gl,
    meshProgramInfo,
  );
  const cubex2 = await cg.loadObj(
    "models/cubito/oro.obj",
    gl,
    meshProgramInfo,
  );
  const vertSrcLS = await fetch("glsl/ls.vert").then((r) => r.text());
  const fragSrcLS = await fetch("glsl/ls.frag").then((r) => r.text());
  const lsProgramInfo = twgl.createProgramInfo(gl, [vertSrcLS, fragSrcLS]);
  const lightSource = await cg.loadObj(
    "models/crate/crate.obj",
    gl,
    lsProgramInfo,
  );
  const cratevertSrc = await fetch("glsl/final_specular.vert").then((r) => r.text());
  const cratefragSrc = await fetch("glsl/final_specular.frag").then((r) => r.text());
  const crateProgramInfo = twgl.createProgramInfo(gl, [cratevertSrc, cratefragSrc]);
  const cubex3 = await cg.loadObj(
    "models/crate/crate.obj",
    gl,
    crateProgramInfo,
  );

  const cpos = [0, -5, 25];
  const w = 500;
  const l = 500;
  let c = 0;
  const numInstances = w * l;
  const transforms = new Float32Array(numInstances * 16);
  const infoInstances = new Array(numInstances);
  for (let i = -w; i < w; i=i+2){
    for (let j = -l; j < l; j=j+2){
      infoInstances[c] = { transform: transforms.subarray(c*16, c*16+16) };
      m4.identity(infoInstances[c].transform);
      m4.translate(
        infoInstances[c].transform,
        infoInstances[c].transform,
        [i, -20, j],
      )
      c++;
    }
  }
  const floorvertSrc = await fetch("glsl/instance.vert").then((r) => r.text());
  const floorfragSrc = await fetch("glsl/instance.frag").then((r) => r.text());
  const floorProgramInfo = twgl.createProgramInfo(gl, [floorvertSrc, floorfragSrc]);
  const floor = await cg.loadObj(
    "models/cubito/arena.obj",
    gl,
    floorProgramInfo,
    transforms,
  );
  const cam = new cg.Cam(cpos, 10);

  let aspect = 1;
  let deltaTime = 0;
  let lastTime = 0;

  let camx = cam.pos[0];
  let camz = cam.pos[2];

  const numObjs = 7;
  const numObjs2 = 5;
  const numObjs3 = 3;
  const positions = new Array(numObjs);
  const delta = new Array(numObjs);
  const positions2 = new Array(numObjs2);
  const delta2 = new Array(numObjs2);
  const positions3 = new Array(numObjs3);
  const delta3 = new Array(numObjs3);
  const rndb = (a, b) => Math.random() * (b - a) + a;
  for (let i = 0; i < numObjs; i++) {
    positions[i] = [
      rndb(-18.0, 18.0),
      rndb(-18.0, 18.0),
      rndb(-18.0, 18.0),
    ];
    delta[i] = [rndb(-5.1, 5.1), rndb(-5.1, 5.1), rndb(-5.1, 5.1)];
  }

  for (let i = 0; i < numObjs2; i++) {
    positions2[i] = [
      rndb(-18.0, 18.0),
      rndb(-18.0, 18.0),
      rndb(-18.0, 18.0),
    ];
    delta2[i] = [rndb(-5.1, 5.1), rndb(-5.1, 5.1), rndb(-5.1, 5.1)];
  }
  for (let i = 0; i < numObjs3; i++) {
    positions3[i] = [
      rndb(-18.0, 18.0),
      rndb(-18.0, 18.0),
      rndb(-18.0, 18.0),
    ];
    delta3[i] = [rndb(-5.1, 5.1), rndb(-5.1, 5.1), rndb(-5.1, 5.1)];
  }
  const floorUniforms = {
    u_ambientLight: new Float32Array([1.0, 1.0, 1.0]),
    u_lightPosition: new Float32Array([0.0, -100.0, 0.0]),
    u_viewPosition: cam.pos,
  }
  const uniforms = {
    u_world: m4.create(),
    u_projection: m4.create(),
    u_view: cam.viewM4,
  };

  const fragUniforms = {
    ambientStrength: 0,
    u_lightColor: new Float32Array([1, 1, 1]),
    u_difflightColor: new Float32Array([1,1,1]),
    u_lightPosition: new Float32Array([0, 0, 0]),
    diffuseIntensity: 0,
    u_estaticdiffColor: new Float32Array([1, 1, 1]),
    infinitediffIntensity: 0, 
  }

  const crateLightUniforms = {
    u_ambientLight: new Float32Array([0.1, 0.1, 0.1]),
    u_lightPosition: new Float32Array([5.0, 0.0, 0.0]),
    u_viewPosition: cam.pos,
  };

  const lightRotAxis = new Float32Array([0.0, 0.0, 0.0]);
  const lightRotSource = new Float32Array([5.0, 0.0, 0.0]);

  const lsScale = new Float32Array([0.1, 0.1, 0.1]);

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);

  const floorwidth = 100;
  const floorlarge = 100;

  function intersection(pos1, pos2) {
    return (pos1[0] <= pos2[0] + 2 && pos1[0] +2 >= pos2[0]) &&
            (pos1[1] <= pos2[1] + 2 && pos1[1] +2 >= pos2[1]) &&
            (pos1[2] <= pos2[2] + 2 && pos1[2] +2 >= pos2[2]);
  }

  let theta = 0;

  function render(elapsedTime) {
    elapsedTime *= 1e-3;
    deltaTime = elapsedTime - lastTime;
    lastTime = elapsedTime;

    if (twgl.resizeCanvasToDisplaySize(gl.canvas)) {
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      aspect = gl.canvas.width / gl.canvas.height;
    }
    gl.clearColor(0.1, 0.1, 0.1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    theta = elapsedTime;

    m4.identity(uniforms.u_projection);
    m4.perspective(uniforms.u_projection, cam.zoom, aspect, 0.1, 100);
  
    gl.useProgram(lsProgramInfo.program);
    m4.identity(uniforms.u_world);
    m4.translate(
      uniforms.u_world,
      uniforms.u_world,
      fragUniforms.u_lightPosition,
    );
    m4.scale(uniforms.u_world, uniforms.u_world, lsScale);
    twgl.setUniforms(lsProgramInfo, uniforms);
    twgl.setUniforms(lsProgramInfo, fragUniforms);

    for (const { bufferInfo, vao, material } of lightSource) {
      gl.bindVertexArray(vao);
      twgl.setUniforms(lsProgramInfo, {}, material);
      twgl.drawBufferInfo(gl, bufferInfo);
    }

    gl.useProgram(lsProgramInfo.program);
    m4.identity(uniforms.u_world);
    m4.translate(
      uniforms.u_world,
      uniforms.u_world,
      crateLightUniforms.u_lightPosition,
    );
    m4.scale(uniforms.u_world, uniforms.u_world, lsScale);
    twgl.setUniforms(lsProgramInfo, uniforms);
    twgl.setUniforms(lsProgramInfo, crateLightUniforms);

    for (const { bufferInfo, vao, material } of lightSource) {
      gl.bindVertexArray(vao);
      twgl.setUniforms(lsProgramInfo, {}, material);
      twgl.drawBufferInfo(gl, bufferInfo);
    }


    gl.useProgram(meshProgramInfo.program);
    v3.rotateY(
      crateLightUniforms.u_lightPosition,
      lightRotSource,
      lightRotAxis,
      -theta,
    );

/*     let camactualx = cam.pos[0]
    let camactualz = cam.pos[2]

    if (camactualx - camx >= 1){
      camx = camactualx;
    }
    else if(camactualx - camx <= -1){
      camx = camactualx;
    }

    if (camactualz - camz >= 1){
      camz = camactualz;
    }
    else if(camactualz - camz <= -1){
      camz = camactualz;
    }

    for (let i = -floorwidth; i < floorwidth; i += 2) {
      for (let j = -floorlarge; j < floorlarge; j += 2) {
        m4.identity(uniforms.u_world);
        m4.translate(uniforms.u_world, uniforms.u_world, [i + camx, -20, j + camz]);
        twgl.setUniforms(meshProgramInfo, uniforms);
        twgl.setUniforms(meshProgramInfo, fragUniforms);
      }
    }
    for (const { bufferInfo, vertexArrayInfo, vao, material } of floor) {
      gl.bindVertexArray(vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.a_transform.buffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, transforms);
      twgl.setUniforms(meshProgramInfo, {}, material);
      twgl.drawBufferInfo(
        gl, 
        vertexArrayInfo, 
        gl.TRIANGLES, 
        vertexArrayInfo.numElements,
        0,
        numInstances);
    } */     
    for (let i = 0; i < numObjs; i++) {
      m4.identity(uniforms.u_world);
      m4.translate(uniforms.u_world, uniforms.u_world, positions[i]);
      twgl.setUniforms(meshProgramInfo, uniforms);
      twgl.setUniforms(meshProgramInfo, fragUniforms);

      for (const { bufferInfo, vao, material } of cubex) {
        gl.bindVertexArray(vao);
        twgl.setUniforms(meshProgramInfo, {}, material);
        twgl.drawBufferInfo(gl, bufferInfo);
      }

      // Update position
      for (let j = 0; j < 3; j++) {
        positions[i][j] += delta[i][j] * deltaTime;
        if (positions[i][j] >= 18.0) {
          positions[i][j] = 18.0;
          delta[i][j] = -delta[i][j];
        } else if (positions[i][j] <= -18.0) {
          positions[i][j] = -18.0;
          delta[i][j] = -delta[i][j];
        }
      }

      //Collision
      for (let j = 0; j < numObjs; j++) {
        if (i != j) {
          if (intersection(positions[i], positions[j])) {
            delta[i][0] = -delta[i][0];
            delta[i][1] = -delta[i][1];
            delta[i][2] = -delta[i][2];
            delta[j][0] = -delta[j][0];
            delta[j][1] = -delta[j][1];
            delta[j][2] = -delta[j][2];
            }
        }
      }
      for (let j = 0; j < numObjs2; j++) {
        if (intersection(positions[i], positions2[j])) {
          delta[i][0] = -delta[i][0];
          delta[i][1] = -delta[i][1];
          delta[i][2] = -delta[i][2];
          delta2[j][0] = -delta2[j][0];
          delta2[j][1] = -delta2[j][1];
          delta2[j][2] = -delta2[j][2];
          }
      }
      for (let j = 0; j < numObjs3; j++) {
        if (intersection(positions[i], positions3[j])) {
          delta[i][0] = -delta[i][0];
          delta[i][1] = -delta[i][1];
          delta[i][2] = -delta[i][2];
          delta3[j][0] = -delta3[j][0];
          delta3[j][1] = -delta3[j][1];
          delta3[j][2] = -delta3[j][2];
          }
      }

      
    }

    for (let i = 0; i < numObjs2; i++) {
      m4.identity(uniforms.u_world);
      m4.translate(uniforms.u_world, uniforms.u_world, positions2[i]);
      twgl.setUniforms(meshProgramInfo, uniforms);
      twgl.setUniforms(meshProgramInfo, fragUniforms);

      for (const { bufferInfo, vao, material } of cubex2) {
        gl.bindVertexArray(vao);
        twgl.setUniforms(meshProgramInfo, {}, material);
        twgl.drawBufferInfo(gl, bufferInfo);
      }

      // Update position
      for (let j = 0; j < 3; j++) {
        positions2[i][j] += delta2[i][j] * deltaTime;
        if (positions2[i][j] >= 18.0) {
          positions2[i][j] = 18.0;
          delta2[i][j] = -delta2[i][j];
        } else if (positions2[i][j] <= -18.0) {
          positions2[i][j] = -18.0;
          delta2[i][j] = -delta2[i][j];
        }
      }

      //Collision
      for (let j = 0; j < numObjs2; j++) {
        if (i != j) {
          if (intersection(positions2[i], positions2[j])) {
            delta2[i][0] = -delta2[i][0];
            delta2[i][1] = -delta2[i][1];
            delta2[i][2] = -delta2[i][2];
            delta2[j][0] = -delta2[j][0];
            delta2[j][1] = -delta2[j][1];
            delta2[j][2] = -delta[j][2];
            }
        }
      }
      for (let j = 0; j < numObjs3; j++) {
        if (intersection(positions2[i], positions3[j])) {
          delta2[i][0] = -delta2[i][0];
          delta2[i][1] = -delta2[i][1];
          delta2[i][2] = -delta2[i][2];
          delta3[j][0] = -delta3[j][0];
          delta3[j][1] = -delta3[j][1];
          delta3[j][2] = -delta3[j][2];
          }
      }
    }

    gl.useProgram(crateProgramInfo.program);
    for (let i = 0; i < numObjs3; i++) {
      m4.identity(uniforms.u_world);
      m4.translate(uniforms.u_world, uniforms.u_world, positions3[i]);
      twgl.setUniforms(crateProgramInfo, uniforms);
      twgl.setUniforms(crateProgramInfo, crateLightUniforms);

      for (const { bufferInfo, vao, material } of cubex3) {
        gl.bindVertexArray(vao);
        twgl.setUniforms(crateProgramInfo, {}, material);
        twgl.drawBufferInfo(gl, bufferInfo);
      }
      // Update position
      for (let j = 0; j < 3; j++) {
        positions3[i][j] += delta3[i][j] * deltaTime;
        if (positions3[i][j] >= 18.0) {
          positions3[i][j] = 18.0;
          delta3[i][j] = -delta3[i][j];

        } else if (positions3[i][j] <= -18.0) {
          positions3[i][j] = -18.0;
          delta3[i][j] = -delta3[i][j];
        }
      }
      //Collision
      for (let j = 0; j < numObjs3; j++) {
        if (i != j) {
          if (intersection(positions3[i], positions3[j])) {
            delta3[i][0] = -delta3[i][0];
            delta3[i][1] = -delta3[i][1];
            delta3[i][2] = -delta3[i][2];
            delta3[j][0] = -delta3[j][0];
            delta3[j][1] = -delta3[j][1];
            delta3[j][2] = -delta3[j][2];
            }
        }
      }
    }
    gl.useProgram(floorProgramInfo.program);
    m4.identity(uniforms.u_world);
    twgl.setUniforms(floorProgramInfo, uniforms);
    twgl.setUniforms(floorProgramInfo, floorUniforms);
    for (const { bufferInfo, vertexArrayInfo, vao, material } of floor) {
      gl.bindVertexArray(vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, bufferInfo.attribs.a_transform.buffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, transforms);
      twgl.setUniforms(floorProgramInfo, {}, material);
      twgl.drawBufferInfo(
        gl,
        vertexArrayInfo,
        gl.TRIANGLES,
        vertexArrayInfo.numElements,
        0,
        numInstances,
      );
    }
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

  document.addEventListener("keydown", (e) => {
    /**/ if (e.key === "w") cam.processKeyboard(cg.FORWARD, deltaTime);
    else if (e.key === "a") cam.processKeyboard(cg.LEFT, deltaTime);
    else if (e.key === "s") cam.processKeyboard(cg.BACKWARD, deltaTime);
    else if (e.key === "d") cam.processKeyboard(cg.RIGHT, deltaTime);
  });
  canvitas.addEventListener("mousemove", (e) => cam.movePov(e.x, e.y));
  canvitas.addEventListener("mousedown", (e) => cam.startMove(e.x, e.y));
  canvitas.addEventListener("mouseup", () => cam.stopMove());
  canvitas.addEventListener("wheel", (e) => cam.processScroll(e.deltaY));
  ambientLight.addEventListener("change", () => {
    const value = ambientLight.value;
    fragUniforms.ambientStrength = value / 100;
  });
  ambientLigthR.addEventListener("change", () => {
    const value = ambientLigthR.value;
    fragUniforms.u_lightColor[0] = value / 100;
  }
  );
  ambientLigthG.addEventListener("change", () => {
    const value = ambientLigthG.value;
    fragUniforms.u_lightColor[1] = value / 100;
  }
  );
  ambientLigthB.addEventListener("change", () => {
    const value = ambientLigthB.value;
    fragUniforms.u_lightColor[2] = value / 100;
  }
  );
  diffuseLight.addEventListener("change", () => {
    const value = diffuseLight.value;
    fragUniforms.infinitediffIntensity = value / 100;
  }
  );
  diffuseLigthR.addEventListener("change", () => {
    const value = diffuseLigthR.value;
    fragUniforms.u_difflightColor[0] = value / 100;
  }
  );
  diffuseLigthG.addEventListener("change", () => {
    const value = diffuseLigthG.value;
    fragUniforms.u_difflightColor[1] = value / 100;
  }
  );
  diffuseLigthB.addEventListener("change", () => {
    const value = diffuseLigthB.value;
    fragUniforms.u_difflightColor[2] = value / 100;
  }
  );
  lampara.addEventListener("change", () => {
    const value = lampara.value;
    fragUniforms.diffuseIntensity = value / 100;
  }
  );
  lamparaR.addEventListener("change", () => {
    const value = lamparaR.value;
    fragUniforms.u_estaticdiffColor[0] = value / 100;
  }
  );
  lamparaG.addEventListener("change", () => {
    const value = lamparaG.value;
    fragUniforms.u_estaticdiffColor[1] = value / 100;
  }
  );
  lamparaB.addEventListener("change", () => {
    const value = lamparaB.value;
    fragUniforms.u_estaticdiffColor[2] = value / 100;
  }
  );
}

main();
