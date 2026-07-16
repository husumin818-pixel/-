import * as THREE from "../../vendor/three.mjs";
import { createAtmosphereMaterial, createOceanMaterial, createParticleMaterial } from "./materials.js?v=__BUILD_VERSION__";
import { cityNodes, dataLinks, elevationAt, landIntensity, latLonToVector3, oceanHeight, pacificSeamSignal } from "./geoData.js?v=__BUILD_VERSION__";

export function createGlobeScene() {
  const group = new THREE.Group();
  const particleMaterial = createParticleMaterial();
  const oceanMaterial = createOceanMaterial();
  const oceanParticleMaterial = createOceanParticleMaterial();
  const atmosphereMaterial = createAtmosphereMaterial();

  group.add(createCoreSphere(oceanMaterial));
  group.add(createOceanHeightLayer(oceanParticleMaterial));
  group.add(createParticleGlobe(particleMaterial));
  group.add(createAtmosphere(atmosphereMaterial));
  group.add(createCityLayer());
  group.add(createDataLinks());

  return { group, particleMaterial, oceanMaterial, oceanParticleMaterial, atmosphereMaterial };
}

function createCoreSphere(material) {
  const geometry = new THREE.SphereGeometry(1.88, 160, 160);
  return new THREE.Mesh(geometry, material);
}

function createParticleGlobe(material) {
  const positions = [];
  const seeds = [];
  const lands = [];
  const elevations = [];
  const sizes = [];
  const radius = 1.93;
  const latStep = 1.15;
  const lonStep = 1.15;

  for (let lat = -78; lat <= 78; lat += latStep) {
    const rowOffset = Math.sin(lat * 12.9898) * 0.9;
    for (let lon = -180; lon < 180; lon += lonStep) {
      const jitterLat = lat + Math.sin((lon + lat) * 0.31) * 0.22;
      const jitterLon = lon + rowOffset + Math.cos((lon - lat) * 0.19) * 0.3;
      const land = landIntensity(jitterLat, jitterLon);
      const seam = pacificSeamSignal(jitterLat, jitterLon);
      const beringZone = Math.abs(jitterLon) > 135 && jitterLat > 45 && jitterLat < 74;
      const sparseCoast = land > 0.16 && Math.random() > (beringZone ? 0.18 : 0.46);
      const seamDetail = seam > 0.08 && Math.random() > (beringZone ? 0.18 : 0.54);
      const keep = land > 0.32 || sparseCoast || seamDetail;
      if (!keep) continue;
      const elevation = elevationAt(jitterLat, jitterLon);
      const vector = latLonToVector3(jitterLat, jitterLon, radius + elevation * 0.075 + Math.random() * 0.004);
      positions.push(vector.x, vector.y, vector.z);
      seeds.push(Math.random());
      lands.push(Math.max(land, seam * (beringZone ? 0.68 : 0.42)));
      elevations.push(elevation);
      sizes.push(5.35 + Math.random() * 0.62 + elevation * 0.62);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("aSeed", new THREE.Float32BufferAttribute(seeds, 1));
  geometry.setAttribute("aLand", new THREE.Float32BufferAttribute(lands, 1));
  geometry.setAttribute("aElevation", new THREE.Float32BufferAttribute(elevations, 1));
  geometry.setAttribute("aSize", new THREE.Float32BufferAttribute(sizes, 1));
  return new THREE.Points(geometry, material);
}

function createOceanHeightLayer(material) {
  const positions = [];
  const seeds = [];
  const lands = [];
  const sizes = [];
  const radius = 1.91;
  const latStep = 1.25;
  const lonStep = 1.25;

  for (let lat = -76; lat <= 76; lat += latStep) {
    for (let lon = -180; lon < 180; lon += lonStep) {
      const land = landIntensity(lat, lon);
      const seam = pacificSeamSignal(lat, lon);
      if (land > 0.08 && seam < 0.1 && Math.random() > 0.18) continue;
      const height = oceanHeight(lat, lon);
      const vector = latLonToVector3(lat, lon, radius + height * 0.026 + seam * 0.015);
      positions.push(vector.x, vector.y, vector.z);
      seeds.push(Math.random());
      lands.push(Math.min(1, height + seam * 0.42));
      sizes.push(1.55 + height * 0.38 + seam * 0.45);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("aSeed", new THREE.Float32BufferAttribute(seeds, 1));
  geometry.setAttribute("aLand", new THREE.Float32BufferAttribute(lands, 1));
  geometry.setAttribute("aSize", new THREE.Float32BufferAttribute(sizes, 1));
  return new THREE.Points(geometry, material);
}

function createOceanParticleMaterial() {
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
    vertexShader: createOceanParticleVertexShader(),
    fragmentShader: createOceanParticleFragmentShader()
  });
}

function createOceanParticleVertexShader() {
  return `
    attribute float aSeed;
    attribute float aLand;
    attribute float aSize;
    varying float vWave;
    varying float vRim;
    uniform float uTime;

    void main() {
      vec3 normal = normalize(position);
      float wave = aLand + sin(uTime * 0.65 + aSeed * 19.0) * 0.12;
      vec3 displaced = position + normal * (wave * 0.018);
      vec4 modelViewPosition = modelViewMatrix * vec4(displaced, 1.0);
      vWave = wave;
      vRim = pow(1.0 - abs(dot(normalize(normalMatrix * normal), vec3(0.0, 0.0, 1.0))), 2.25);
      gl_PointSize = aSize;
      gl_Position = projectionMatrix * modelViewPosition;
    }
  `;
}

function createOceanParticleFragmentShader() {
  return `
    varying float vWave;
    varying float vRim;

    void main() {
      vec2 d = gl_PointCoord - 0.5;
      float shape = 1.0 - smoothstep(0.14, 0.5, length(d));
      vec3 color = mix(vec3(0.018, 0.035, 0.16), vec3(0.11, 0.16, 0.55), vWave);
      color += vec3(0.16, 0.25, 1.0) * vRim * 0.42;
      float alpha = shape * (0.11 + vWave * 0.13 + vRim * 0.13);
      gl_FragColor = vec4(color, alpha);
    }
  `;
}

function createAtmosphere(material) {
  const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(2.05, 96, 96), material);
  atmosphere.scale.setScalar(1.02);
  return atmosphere;
}

function createCityLayer() {
  const layer = new THREE.Group();
  const nodeMaterial = new THREE.MeshBasicMaterial({
    color: 0xf8fbff,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending
  });
  const haloMaterial = new THREE.MeshBasicMaterial({
    color: 0x4568ff,
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  for (const city of cityNodes) {
    const position = latLonToVector3(city.lat, city.lon, 2.015);
    const node = new THREE.Mesh(new THREE.SphereGeometry(0.012 * city.size, 12, 12), nodeMaterial);
    node.position.set(position.x, position.y, position.z);
    const halo = new THREE.Mesh(new THREE.SphereGeometry(0.04 * city.size, 16, 16), haloMaterial);
    halo.position.copy(node.position);
    layer.add(node, halo);
  }

  return layer;
}

function createDataLinks() {
  const layer = new THREE.Group();
  const material = new THREE.LineBasicMaterial({
    color: 0x617cff,
    transparent: true,
    opacity: 0.24,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const cityByName = new Map(cityNodes.map((city) => [city.name, city]));

  for (const [fromName, toName] of dataLinks) {
    const from = cityByName.get(fromName);
    const to = cityByName.get(toName);
    if (!from || !to) continue;
    const curve = createArc(from, to);
    const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(42));
    layer.add(new THREE.Line(geometry, material));
  }

  return layer;
}

function createArc(from, to) {
  const start = new THREE.Vector3(...Object.values(latLonToVector3(from.lat, from.lon, 2.02)));
  const end = new THREE.Vector3(...Object.values(latLonToVector3(to.lat, to.lon, 2.02)));
  const mid = start.clone().add(end).normalize().multiplyScalar(2.28 + start.distanceTo(end) * 0.08);
  return new THREE.QuadraticBezierCurve3(start, mid, end);
}

export function createStarField() {
  const positions = [];
  const colors = [];
  for (let i = 0; i < 1200; i += 1) {
    const radius = 9 + Math.random() * 12;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    positions.push(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
    const blue = 0.45 + Math.random() * 0.55;
    colors.push(blue * 0.55, blue * 0.68, blue);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({
    size: 0.018,
    vertexColors: true,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  return new THREE.Points(geometry, material);
}
