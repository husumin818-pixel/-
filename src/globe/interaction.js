import * as THREE from "../../vendor/three.mjs";

export function createGlobeInteraction({ canvas, camera, globe, particleMaterial }) {
  const minTilt = -0.56;
  const maxTilt = 0.54;
  const restingTilt = globe.rotation.x;
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2(10, 10);
  const sphere = new THREE.Sphere(globe.position.clone(), 2.06);
  const hitPoint = new THREE.Vector3();
  const localHit = new THREE.Vector3();
  const previous = { x: 0, y: 0 };
  const velocity = { x: 0.00022, y: 0 };
  const hoverVelocity = { x: 0, y: 0 };
  const gyro = { x: 0, y: 0 };
  let dragging = false;
  let hoverStrength = 0;
  let hovering = false;
  let pointerActive = false;
  let gyroReady = false;

  function setPointer(event) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
  }

  function updateHover() {
    sphere.center.copy(globe.position);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.ray.intersectSphere(sphere, hitPoint);
    if (hit) {
      hovering = true;
      globe.worldToLocal(localHit.copy(hit).normalize());
      particleMaterial.uniforms.uMouse.value.copy(localHit.normalize());
      hoverStrength += (1 - hoverStrength) * 0.12;
    } else {
      hovering = false;
      hoverStrength += (0 - hoverStrength) * 0.08;
    }
    particleMaterial.uniforms.uMouseStrength.value = hoverStrength;
  }

  function requestGyro() {
    if (gyroReady || typeof window.DeviceOrientationEvent === "undefined") return;
    gyroReady = true;
    const eventType = window.DeviceOrientationEvent;
    if (typeof eventType.requestPermission === "function") {
      eventType.requestPermission().then((state) => {
        if (state === "granted") window.addEventListener("deviceorientation", onOrientation, true);
      }).catch(() => {});
    } else {
      window.addEventListener("deviceorientation", onOrientation, true);
    }
  }

  function onOrientation(event) {
    gyro.x = THREE.MathUtils.clamp((event.gamma || 0) / 45, -1, 1) * 0.0022;
    gyro.y = THREE.MathUtils.clamp((event.beta || 0) / 65, -1, 1) * 0.0012;
  }

  function onPointerMove(event) {
    pointerActive = true;
    setPointer(event);
    if (!dragging) return;
    const dx = event.clientX - previous.x;
    const dy = event.clientY - previous.y;
    previous.x = event.clientX;
    previous.y = event.clientY;
    velocity.x = dx * 0.0035;
    velocity.y = dy * 0.0018;
    globe.rotation.y += velocity.x;
    globe.rotation.x += velocity.y;
    globe.rotation.x = THREE.MathUtils.clamp(globe.rotation.x, minTilt, maxTilt);
  }

  function onPointerDown(event) {
    pointerActive = true;
    requestGyro();
    dragging = true;
    previous.x = event.clientX;
    previous.y = event.clientY;
    setPointer(event);
    canvas.setPointerCapture?.(event.pointerId);
  }

  function onPointerUp(event) {
    dragging = false;
    canvas.releasePointerCapture?.(event.pointerId);
  }

  function onPointerEnter(event) {
    pointerActive = true;
    setPointer(event);
  }

  function onPointerLeave() {
    pointerActive = false;
    hovering = false;
  }

  function onClick(event, time) {
    setPointer(event);
    sphere.center.copy(globe.position);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.ray.intersectSphere(sphere, hitPoint);
    if (!hit) return;
    globe.worldToLocal(localHit.copy(hit).normalize());
    particleMaterial.uniforms.uRipplePoint.value.copy(localHit.normalize());
    particleMaterial.uniforms.uRippleTime.value = time;
  }

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointerenter", onPointerEnter);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerleave", onPointerLeave);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);
  canvas.addEventListener("click", (event) => onClick(event, performance.now() * 0.001));

  return {
    update() {
      updateHover();
      if (!dragging) {
        const active = pointerActive || hovering;
        const targetHoverX = active ? pointer.x * 0.011 : 0;
        const targetTilt = active ? restingTilt - pointer.y * 0.18 : restingTilt;
        hoverVelocity.x += (targetHoverX - hoverVelocity.x) * 0.08;
        velocity.x += (0.00022 - velocity.x) * 0.015;
        velocity.y *= 0.86;
        globe.rotation.y += velocity.x + hoverVelocity.x + gyro.x;
        globe.rotation.x += velocity.y + gyro.y;
        globe.rotation.x += (targetTilt - globe.rotation.x) * 0.045;
        globe.rotation.x = THREE.MathUtils.clamp(globe.rotation.x, minTilt, maxTilt);
      }
    },
    dispose() {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerenter", onPointerEnter);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("deviceorientation", onOrientation, true);
    }
  };
}
