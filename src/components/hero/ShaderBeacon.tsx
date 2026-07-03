import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import type { MotionValue } from "motion/react";

// WebGL beacon: a full-screen fragment shader draws the volumetric beam + lens flare on black,
// real bloom is applied, and the whole canvas is screen-composited over the planet plate (screen
// drops the black, keeps the light). The flare anchor is passed in (where the logo's flare lands).

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const fragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform vec2  uResolution;
  uniform vec2  uAnchor;   // normalized, y-up
  uniform float uProgress;
  uniform float uTime;

  void main() {
    float aspect = uResolution.x / uResolution.y;
    vec2 p = vec2((vUv.x - uAnchor.x) * aspect, vUv.y - uAnchor.y); // 1 unit = viewport height
    float up = max(p.y, 0.0);
    float hx = abs(p.x);
    float r  = length(p);
    float prog = clamp(uProgress, 0.0, 1.0);

    // Sampled straight from the logo: white core → icy blue → deep royal blue (#0034a0).
    vec3 cCore = vec3(1.00, 0.99, 0.98);
    vec3 cIcy  = vec3(0.62, 0.86, 1.00);
    vec3 cBlue = vec3(0.09, 0.42, 1.00);
    vec3 cDeep = vec3(0.00, 0.20, 0.63);

    // ---- FLARE: ignites once the planet is held in position; slow blossom outward ----
    float fb = smoothstep(0.26, 0.50, prog);          // flare build 0..1 (slow)
    float hot   = exp(-(r * r) / (2.0 * 0.0045 * 0.0045)) * smoothstep(0.24, 0.34, prog);
    float inner = exp(-r / (0.012 + 0.022 * fb)) * fb; // halo expands as it builds
    float halo  = exp(-r / (0.03  + 0.07  * fb)) * fb * 0.45;
    float streak = exp(-(p.y * p.y) / (2.0 * 0.0032 * 0.0032)) * exp(-hx / (0.03 + 0.16 * fb)) * fb; // widens
    float ang = atan(p.y, p.x);
    float rays = pow(max(0.0, abs(sin(ang * 8.0))), 14.0) * exp(-r / (0.02 + 0.045 * fb)) * fb * 0.55;
    vec3 flare = cCore * hot                 // small white-hot centre only
               + cIcy  * inner * 0.9
               + cDeep * halo * 1.6           // deep royal-blue body around it
               + cIcy  * streak * 0.7
               + cBlue * rays;

    // ---- BEAM: rises out of the flare once it's lit ----
    float beamGrow = smoothstep(0.44, 0.62, prog);
    float beamLen  = 0.66 * beamGrow;
    // Brightest at the flare, fading up — masked below the flare so it doesn't run full-height.
    // NOTE: smoothstep(beamLen, 0.0, up) is UNDEFINED in GLSL when beamLen == 0 (div-by-zero);
    // many GPUs return 1 there, which painted the beam full-height on the very first frame
    // before any scroll. This explicit hermite is identical for beamLen > 0 and hard-zero otherwise.
    float bt    = clamp(1.0 - up / max(beamLen, 1e-4), 0.0, 1.0);
    float vfade = bt * bt * (3.0 - 2.0 * bt) * smoothstep(0.0, 0.006, p.y);
    float flick    = 0.94 + 0.06 * sin(uTime * 2.5 + p.y * 30.0);
    float coreI  = exp(-(hx * hx) / (2.0 * 0.0016 * 0.0016)) * vfade * flick;
    float glowI  = exp(-(hx * hx) / (2.0 * 0.010  * 0.010 )) * vfade * 0.65;
    float outerI = exp(-(hx * hx) / (2.0 * 0.028  * 0.028 )) * vfade * 0.32;
    vec3 beam = cCore * coreI + cIcy * glowI + cDeep * outerI;

    // Dissolve the shader as the crisp vector symbol takes over (crossfade).
    float fade = 1.0 - smoothstep(0.60, 0.76, prog);
    vec3 col = (flare + beam) * fade;
    gl_FragColor = vec4(col, 1.0);
  }
`;

function BeaconQuad({ progress, anchor }: { progress: MotionValue<number>; anchor: { x: number; y: number } }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uAnchor: { value: new THREE.Vector2(0.5, 0.5) },
      uProgress: { value: 0 },
    }),
    []
  );

  useFrame((state) => {
    const m = mat.current;
    if (!m) return;
    m.uniforms.uResolution.value.set(state.size.width, state.size.height);
    m.uniforms.uAnchor.value.set(anchor.x, anchor.y); // flare point (where the logo's flare lands)
    m.uniforms.uProgress.value = progress.get();
    m.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={mat}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

export function ShaderBeacon({ progress, anchor }: { progress: MotionValue<number>; anchor: { x: number; y: number } }) {
  return (
    <div className="pointer-events-none absolute inset-0" style={{ mixBlendMode: "screen" }}>
      <Canvas
        gl={{ alpha: false, antialias: true, powerPreference: "high-performance" }}
        dpr={[1, 2]}
        frameloop="always"
      >
        <color attach="background" args={["#000000"]} />
        <BeaconQuad progress={progress} anchor={anchor} />
        <EffectComposer disableNormalPass>
          <Bloom intensity={1.1} luminanceThreshold={0.15} luminanceSmoothing={0.9} mipmapBlur radius={0.7} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
