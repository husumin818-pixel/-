import { LAND_MASK_BASE64, LAND_MASK_HEIGHT, LAND_MASK_WIDTH } from "./landMask.js?v=50466bc";

export const cityNodes = [
  { name: "New York", lat: 40.7128, lon: -74.006, size: 1.2 },
  { name: "London", lat: 51.5072, lon: -0.1276, size: 1.1 },
  { name: "Paris", lat: 48.8566, lon: 2.3522, size: 0.9 },
  { name: "Dubai", lat: 25.2048, lon: 55.2708, size: 0.9 },
  { name: "Singapore", lat: 1.3521, lon: 103.8198, size: 1 },
  { name: "Tokyo", lat: 35.6762, lon: 139.6503, size: 1.1 },
  { name: "Shanghai", lat: 31.2304, lon: 121.4737, size: 1.1 },
  { name: "Sydney", lat: -33.8688, lon: 151.2093, size: 0.85 },
  { name: "Sao Paulo", lat: -23.5558, lon: -46.6396, size: 0.9 },
  { name: "San Francisco", lat: 37.7749, lon: -122.4194, size: 1 }
];

export const dataLinks = [
  ["New York", "London"],
  ["London", "Dubai"],
  ["Dubai", "Singapore"],
  ["Singapore", "Shanghai"],
  ["Shanghai", "Tokyo"],
  ["Tokyo", "San Francisco"],
  ["San Francisco", "New York"],
  ["Singapore", "Sydney"],
  ["London", "Paris"],
  ["New York", "Sao Paulo"]
];

export function latLonToVector3(lat, lon, radius = 1) {
  const phi = (90 - lat) * Math.PI / 180;
  const theta = (lon + 180) * Math.PI / 180;
  return {
    x: -(radius * Math.sin(phi) * Math.cos(theta)),
    y: radius * Math.cos(phi),
    z: radius * Math.sin(phi) * Math.sin(theta)
  };
}

const landMask = decodeMask(LAND_MASK_BASE64);

export function landIntensity(lat, lon) {
  const normalizedLon = wrapLon(lon);
  const land = sampleLandMask(lat, normalizedLon);
  const seam = datelineContextIntensity(lat, normalizedLon);
  const bering = beringLandIntensity(lat, normalizedLon);
  if (!land && !nearLand(lat, normalizedLon, 1) && seam <= 0 && bering <= 0) return 0;
  const coast = coastFactor(lat, normalizedLon);
  const terrainNoise =
    Math.sin(lat * 0.74 + normalizedLon * 0.31) *
    Math.sin(normalizedLon * 0.53 - lat * 0.17) *
    0.12;

  if (land) return Math.max(0.48, Math.min(1, 0.68 + coast * 0.22 + terrainNoise));
  return Math.max(bering, Math.max(seam, Math.max(0, Math.min(0.26, coast * 0.24))));
}

export function oceanHeight(lat, lon) {
  const normalizedLon = wrapLon(lon);
  const swell =
    Math.sin(normalizedLon * 0.08 + lat * 0.17) * 0.5 +
    Math.sin(normalizedLon * 0.21 - lat * 0.11) * 0.3 +
    Math.sin((normalizedLon + lat) * 0.37) * 0.2;
  const nearCoastLift = coastFactor(lat, normalizedLon) * 0.35;
  return Math.max(0, Math.min(1, 0.5 + swell * 0.28 + nearCoastLift));
}

export function elevationAt(lat, lon) {
  const normalizedLon = wrapLon(lon);
  if (landIntensity(lat, normalizedLon) <= 0.08) return 0;

  let elevation = 0.12;
  elevation = Math.max(elevation, ridge(lat, normalizedLon, 31, 82, 18, 5, 1.0)); // Himalaya/Tibet
  elevation = Math.max(elevation, ridge(lat, normalizedLon, -16, -72, 38, 4, 0.92)); // Andes
  elevation = Math.max(elevation, ridge(lat, normalizedLon, 45, -112, 34, 7, 0.72)); // Rockies
  elevation = Math.max(elevation, ridge(lat, normalizedLon, 34, 48, 34, 7, 0.58)); // Iran/Caucasus
  elevation = Math.max(elevation, ridge(lat, normalizedLon, 46, 10, 15, 4, 0.5)); // Alps
  elevation = Math.max(elevation, ridge(lat, normalizedLon, 8, 38, 26, 6, 0.56)); // East Africa
  elevation = Math.max(elevation, ridge(lat, normalizedLon, -3, 138, 18, 5, 0.5)); // New Guinea
  elevation = Math.max(elevation, plateau(lat, normalizedLon, -20, 24, 30, 22, 0.38)); // Southern Africa
  elevation = Math.max(elevation, plateau(lat, normalizedLon, -14, -48, 24, 20, 0.34)); // Brazil highlands
  elevation = Math.max(elevation, plateau(lat, normalizedLon, 68, -42, 26, 16, 0.32)); // Greenland
  elevation = Math.max(elevation, plateau(lat, normalizedLon, -76, 30, 120, 14, 0.42)); // Antarctica
  elevation = Math.max(elevation, plateau(lat, normalizedLon, -25, 134, 36, 17, 0.22)); // Australia
  elevation += Math.sin(lat * 0.41 + normalizedLon * 0.19) * 0.035;
  return Math.max(0, Math.min(1, elevation));
}

export function pacificSeamSignal(lat, lon) {
  const normalizedLon = Math.abs(wrapLon(lon));
  const seamBand = smoothstep(142, 178, normalizedLon);
  const northPacific = smoothstep(18, 54, lat) * (1 - smoothstep(70, 78, lat));
  const southPacific = smoothstep(-44, -18, lat) * (1 - smoothstep(-8, 8, lat)) * 0.38;
  const islandNoise =
    Math.sin(lon * 0.31 + lat * 0.82) *
    Math.sin(lon * 0.17 - lat * 0.39);
  return Math.max(0, seamBand * (northPacific + southPacific) * (0.55 + islandNoise * 0.28));
}

function datelineContextIntensity(lat, lon) {
  let value = 0;
  value = Math.max(value, beringLandIntensity(lat, lon) * 0.95);
  value = Math.max(value, islandChain(lat, lon, 52, 171, 28, 2.2, 0.46));
  value = Math.max(value, islandChain(lat, lon, 53, -166, 25, 2.4, 0.5));
  value = Math.max(value, islandChain(lat, lon, 57, 164, 18, 4.2, 0.34));
  value = Math.max(value, islandChain(lat, lon, 58, -154, 23, 5.5, 0.32));
  value = Math.max(value, islandChain(lat, lon, 46, 150, 20, 2.8, 0.28));
  value = Math.max(value, pacificSeamSignal(lat, lon) * 0.12);
  return Math.max(0, Math.min(0.42, value));
}

function beringLandIntensity(lat, lon) {
  let value = 0;
  value = Math.max(value, lobe(lat, lon, 66, 170, 24, 9, 0.72)); // Chukotka / far-east Russia
  value = Math.max(value, lobe(lat, lon, 63, -161, 26, 11, 0.78)); // Western Alaska
  value = Math.max(value, lobe(lat, lon, 71, -150, 28, 7, 0.52)); // Northern Alaska edge
  value = Math.max(value, lobe(lat, lon, 59, -137, 20, 8, 0.5)); // Alaska panhandle shoulder
  value = Math.max(value, islandChain(lat, lon, 52, 176, 30, 2.6, 0.62)); // Aleutian islands west
  value = Math.max(value, islandChain(lat, lon, 53, -166, 30, 2.7, 0.66)); // Aleutian islands east
  value = Math.max(value, islandChain(lat, lon, 64, -171, 9, 2.2, 0.44)); // Bering strait islands
  return Math.max(0, Math.min(0.78, value));
}

function lobe(lat, lon, centerLat, centerLon, widthLon, widthLat, strength) {
  const dx = wrapLon(lon - centerLon) * Math.cos(centerLat * Math.PI / 180);
  const dy = lat - centerLat;
  const shape = Math.exp(-(dx * dx) / (widthLon * widthLon) - (dy * dy) / (widthLat * widthLat));
  const ragged =
    0.82 +
    Math.sin(dx * 0.55 + dy * 0.27) * 0.1 +
    Math.sin(dx * 0.21 - dy * 0.61) * 0.08;
  return shape * ragged * strength;
}

function islandChain(lat, lon, centerLat, centerLon, length, width, strength) {
  const dx = wrapLon(lon - centerLon) * Math.cos(centerLat * Math.PI / 180);
  const dy = lat - centerLat + Math.sin(dx * 0.22) * 2.8;
  const envelope = Math.exp(-(dx * dx) / (length * length) - (dy * dy) / (width * width));
  const beads = 0.45 + 0.55 * smoothstep(0.1, 0.95, Math.abs(Math.sin(dx * 0.72)));
  return envelope * beads * strength;
}

function ridge(lat, lon, centerLat, centerLon, length, width, strength) {
  const dx = wrapLon(lon - centerLon) * Math.cos(centerLat * Math.PI / 180);
  const dy = lat - centerLat;
  return Math.exp(-(dy * dy) / (width * width) - (dx * dx) / (length * length)) * strength;
}

function plateau(lat, lon, centerLat, centerLon, widthLon, widthLat, strength) {
  const dx = wrapLon(lon - centerLon) * Math.cos(centerLat * Math.PI / 180);
  const dy = lat - centerLat;
  return Math.exp(-(dx * dx) / (widthLon * widthLon) - (dy * dy) / (widthLat * widthLat)) * strength;
}

function smoothstep(edge0, edge1, value) {
  const t = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function decodeMask(base64) {
  const binary = globalThis.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function sampleLandMask(lat, lon) {
  const x = Math.max(0, Math.min(LAND_MASK_WIDTH - 1, Math.floor((wrapLon(lon) + 180) / 360 * LAND_MASK_WIDTH)));
  const y = Math.max(0, Math.min(LAND_MASK_HEIGHT - 1, Math.floor((90 - lat) / 180 * LAND_MASK_HEIGHT)));
  const index = y * LAND_MASK_WIDTH + x;
  return (landMask[index >> 3] & (1 << (index & 7))) !== 0;
}

function nearLand(lat, lon, radius) {
  for (let dy = -radius; dy <= radius; dy += 1) {
    for (let dx = -radius; dx <= radius; dx += 1) {
      if (dx === 0 && dy === 0) continue;
      const sampleLat = lat - dy * 180 / LAND_MASK_HEIGHT;
      const sampleLon = lon + dx * 360 / LAND_MASK_WIDTH;
      if (sampleLandMask(sampleLat, sampleLon)) return true;
    }
  }
  return false;
}

function coastFactor(lat, lon) {
  let waterCount = 0;
  let landCount = 0;
  for (let dy = -3; dy <= 3; dy += 1) {
    for (let dx = -3; dx <= 3; dx += 1) {
      const sampleLat = lat - dy * 180 / LAND_MASK_HEIGHT;
      const sampleLon = lon + dx * 360 / LAND_MASK_WIDTH;
      if (sampleLandMask(sampleLat, sampleLon)) landCount += 1;
      else waterCount += 1;
    }
  }
  const mixed = Math.min(landCount, waterCount) / 24;
  return Math.max(0, Math.min(1, mixed));
}

function wrapLon(value) {
  let lon = value;
  while (lon > 180) lon -= 360;
  while (lon < -180) lon += 360;
  return lon;
}
