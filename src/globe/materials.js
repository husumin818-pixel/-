import * as THREE from "https://esm.sh/three@0.165.0";

export function createParticleMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector3(0, 0, 1) },
      uMouseStrength: { value: 0 },
      uRipplePoint: { value: new THREE.Vector3(0, 0, 1) },
      uRippleTime: { value: -10 }
    },
    vertexShader: `
      attribute float aSeed;
      attribute float aLand;
      attribute float aElevation;
      attribute float aSize;
      varying float vLand;
      varying float vElevation;
      varying float vRim;
      varying float vRipple;
      varying float vSeed;
      varying float vShade;
      uniform float uTime;
      uniform vec3 uMouse;
      uniform float uMouseStrength;
      uniform vec3 uRipplePoint;
      uniform float uRippleTime;

      void main() {
        vec3 normal = normalize(position);
        float floatWave = sin(uTime * 1.15 + aSeed * 8.0) * 0.004;
        float mouseDistance = distance(normal, normalize(uMouse));
        float repel = smoothstep(0.34, 0.0, mouseDistance) * uMouseStrength;
        float rippleAge = max(0.0, uTime - uRippleTime);
        float rippleRing = 1.0 - smoothstep(0.018, 0.07, abs(distance(normal, normalize(uRipplePoint)) - rippleAge * 0.55));
        rippleRing *= 1.0 - smoothstep(0.0, 2.0, rippleAge);
        vec3 displaced = position + normal * (floatWave + repel * 0.105 + rippleRing * 0.055);
        vec4 modelViewPosition = modelViewMatrix * vec4(displaced, 1.0);
        vRim = pow(1.0 - abs(dot(normalize(normalMatrix * normal), vec3(0.0, 0.0, 1.0))), 1.85);
        vLand = aLand;
        vElevation = aElevation;
        vRipple = rippleRing;
        vSeed = aSeed;
        vShade = clamp(dot(normalize(normalMatrix * normal), normalize(vec3(-0.45, 0.68, 0.58))), 0.0, 1.0);
        gl_PointSize = aSize + rippleRing * 1.35;
        gl_Position = projectionMatrix * modelViewPosition;
      }
    `,
    fragmentShader: `
      varying float vLand;
      varying float vElevation;
      varying float vRim;
      varying float vRipple;
      varying float vSeed;
      varying float vShade;

      void main() {
        vec2 square = abs(gl_PointCoord - 0.5);
        float edge = max(square.x, square.y);
        float shape = 1.0 - smoothstep(0.46, 0.5, edge);
        float inner = 1.0 - smoothstep(0.125, 0.225, edge);
        float hot = step(0.985, fract(sin(vSeed * 937.13) * 43758.5453));
        vec3 base = vec3(0.045, 0.035, 0.34);
        vec3 mid = vec3(0.12, 0.09, 0.82);
        vec3 bright = vec3(0.42, 0.48, 1.0);
        vec3 whiteHot = vec3(0.92, 0.96, 1.0);
        float lightMix = clamp(vShade * 0.72 + vRim * 0.26 + vElevation * 0.24, 0.0, 1.0);
        vec3 color = mix(base, mid, smoothstep(0.12, 0.86, vLand));
        color = mix(color, bright, lightMix * 0.52 + inner * 0.13);
        color = mix(color, whiteHot, hot * (0.55 + vElevation * 0.35));
        color += bright * (vRipple * 1.05);
        float alpha = shape * (0.46 + vLand * 0.36 + vShade * 0.15 + vElevation * 0.12 + vRim * 0.08 + hot * 0.22 + vRipple);
        gl_FragColor = vec4(color, alpha);
      }
    `
  });
}

export function createOceanMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 }
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vWorld;
      varying float vWave;
      uniform float uTime;

      float waveNoise(vec3 p) {
        float w1 = sin(p.x * 18.0 + p.y * 7.0 + uTime * 0.55);
        float w2 = sin(p.z * 22.0 - p.y * 11.0 - uTime * 0.38);
        float w3 = sin((p.x + p.z) * 34.0 + uTime * 0.22);
        return (w1 * 0.46 + w2 * 0.34 + w3 * 0.2);
      }

      void main() {
        vec3 n = normalize(position);
        vWave = waveNoise(n);
        vec3 displaced = position + n * (vWave * 0.012);
        vNormal = normalize(normalMatrix * n);
        vec4 worldPosition = modelMatrix * vec4(displaced, 1.0);
        vWorld = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      varying vec3 vWorld;
      varying float vWave;

      void main() {
        vec3 viewDir = normalize(cameraPosition - vWorld);
        float facing = clamp(dot(normalize(vNormal), viewDir), 0.0, 1.0);
        float rim = pow(1.0 - facing, 2.1);
        float latitudeLight = smoothstep(-0.65, 0.95, normalize(vWorld).y);
        float waveLine = smoothstep(0.62, 0.92, abs(vWave));
        float dataBands =
          smoothstep(0.965, 1.0, abs(sin(vWorld.x * 12.0 + vWorld.y * 5.0))) * 0.18 +
          smoothstep(0.985, 1.0, abs(sin(vWorld.z * 18.0 - vWorld.y * 7.0))) * 0.14;
        vec3 deep = vec3(0.006, 0.014, 0.075);
        vec3 lit = vec3(0.045, 0.08, 0.32);
        vec3 glow = vec3(0.13, 0.2, 0.95);
        vec3 color = mix(deep, lit, 0.34 + latitudeLight * 0.34 + waveLine * 0.28 + dataBands);
        color += glow * (rim * 0.7 + waveLine * 0.14 + dataBands * 0.36);
        float alpha = 0.5 + rim * 0.24 + waveLine * 0.08 + dataBands * 0.16;
        gl_FragColor = vec4(color, alpha);
      }
    `
  });
}

export function createAtmosphereMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.FrontSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 }
    },
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      uniform float uTime;
      void main() {
        float facing = clamp(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0, 1.0);
        float rim = pow(1.0 - facing, 4.2);
        float pulse = sin(uTime * 0.8) * 0.08 + 0.92;
        gl_FragColor = vec4(0.08, 0.18, 1.0, rim * 0.28 * pulse);
      }
    `
  });
}
