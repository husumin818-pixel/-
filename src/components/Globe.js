import React, { useEffect, useRef } from "https://esm.sh/react@18.3.1";
import * as THREE from "https://esm.sh/three@0.165.0";
import { createGlobeScene, createStarField } from "../globe/createGlobe.js";
import { createGlobeInteraction } from "../globe/interaction.js";

const h = React.createElement;

export function Globe() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.03);

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 80);
    camera.position.set(0.1, -0.62, 6.15);
    camera.lookAt(0, -0.62, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const keyLight = new THREE.DirectionalLight(0x8aa7ff, 2.1);
    keyLight.position.set(-3.5, 2.5, 4);
    const rimLight = new THREE.DirectionalLight(0x264dff, 3.2);
    rimLight.position.set(3, 1.2, -2);
    const ambient = new THREE.AmbientLight(0x0b123d, 1.8);
    scene.add(keyLight, rimLight, ambient);

    const { group: globe, particleMaterial, oceanMaterial, oceanParticleMaterial, atmosphereMaterial } = createGlobeScene();
    globe.rotation.set(0, -0.58, 0.02);
    globe.position.y = -1.08;
    scene.add(globe);

    const interaction = createGlobeInteraction({
      canvas: renderer.domElement,
      camera,
      globe,
      particleMaterial
    });

    let frameId = 0;
    const clock = new THREE.Clock();

    function resize() {
      const rect = mount.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.fov = 32;
      camera.position.set(0.1, -0.62, 6.15);
      camera.lookAt(0, -0.62, 0);
      camera.updateProjectionMatrix();
    }

    function animate() {
      const elapsed = clock.getElapsedTime();
      particleMaterial.uniforms.uTime.value = elapsed;
      oceanMaterial.uniforms.uTime.value = elapsed;
      oceanParticleMaterial.uniforms.uTime.value = elapsed;
      atmosphereMaterial.uniforms.uTime.value = elapsed;
      interaction.update();
      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    }

    resize();
    animate();
    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      interaction.dispose();
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
          else object.material.dispose();
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return h("div", { className: "globe-stage", ref: mountRef, "aria-hidden": "true" });
}
