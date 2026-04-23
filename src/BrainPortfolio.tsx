import { Suspense, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ExternalLink,
  Github,
  GraduationCap,
  Linkedin,
  Mail,
  MoveRight,
  Sparkles as SparklesIcon,
  Cpu,
  Brain,
} from "lucide-react";
import {
  Environment,
  Float,
  Html,
  MeshTransmissionMaterial,
  QuadraticBezierLine,
  Sparkles,
  useGLTF,
} from "@react-three/drei";
import * as THREE from "three";

// ─── Types ───────────────────────────────────────────────────────────────────

type SectionId = "hero" | "about" | "projects" | "involvement" | "contact";

type Wire = {
  start: [number, number, number];
  end: [number, number, number];
  mid: [number, number, number];
  colorToken: string;
};

type Project = {
  title: string;
  status: string;
  description: string;
  stack: string[];
  links?: Array<{ label: string; href: string }>;
};

type Involvement = {
  name: string;
  role: string;
  detail: string;
  href?: string;
};

type BrainSection = {
  id: SectionId;
  kicker: string;
  title: string;
  subtitle: string;
  body: string;
  region: string;
  wireLabel: string;
  accentToken: string;
  glowToken: string;
  cameraPosition: [number, number, number];
  lookAt: [number, number, number];
  stats?: string[];
  wires: Wire[];
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const sections: BrainSection[] = [
  {
    id: "hero",
    kicker: "Electrical & Computer Engineering · Neuroscience",
    title: "Ridhima Jain",
    subtitle: "Building neurotechnology where biological intelligence meets engineered systems.",
    body: "A 4.0 GPA engineer-neuroscientist focused on AI, neural prosthetics, brain-computer interfaces, and robotics that improve human life.",
    region: "Whole brain · Frontal cortex prominent",
    wireLabel: "Establishing shot",
    accentToken: "#7fd3ff",
    glowToken: "#7fd3ff",
    cameraPosition: [0, 0.55, 6.2],
    lookAt: [0, 0.15, 0],
    stats: ["4.0 GPA", "AI + Neurotech", "Embedded + Robotics"],
    wires: [],
  },
  {
    id: "about",
    kicker: "About Me",
    title: "About Me",
    subtitle: "Where biology meets engineering.",
    body: "I'm most energized by problems where circuits, computation, and living systems intersect. My work is guided by curiosity, systems thinking, and a belief that engineering should restore function and expand possibility.",
    region: "Temporal lobe",
    wireLabel: "Memory · Identity · Learning",
    accentToken: "#b95eff",
    glowToken: "#b95eff",
    cameraPosition: [-5.2, 1.05, 3.4],
    lookAt: [-0.95, 0.12, 0.18],
    stats: ["Systems-first", "Interdisciplinary", "Human-centered"],
    wires: [
      { start: [-2.8, -0.2, 0.2], end: [-0.8, 0.9, 0.3], mid: [-2.3, 1.4, 1.2], colorToken: "#b95eff" },
    ],
  },
  {
    id: "projects",
    kicker: "Featured Work",
    title: "Featured Work",
    subtitle: "Projects in robotics, AI, and intelligent systems.",
    body: "From autonomous robots and behavioral ML to AI agents and telemetry systems, I'm drawn to ambitious builds that combine robust architecture with real-world impact.",
    region: "Frontal lobe",
    wireLabel: "Problem Solver · Innovative · Analytical · Creative",
    accentToken: "#67dfff",
    glowToken: "#67dfff",
    cameraPosition: [0.3, 5.8, 1.8],
    lookAt: [0.2, 1.1, 0.2],
    stats: ["Robotics", "AI Systems", "Machine Learning"],
    wires: [
      { start: [-2.5, 0.6, 0.4], end: [-0.3, 1.5, 0.2], mid: [-1.7, 2.3, 1.4], colorToken: "#67dfff" },
      { start: [-0.8, 0.8, -0.4], end: [0.1, 1.55, 0.25], mid: [0.3, 2.35, 1.2], colorToken: "#b95eff" },
      { start: [0.6, 0.6, 0.3], end: [0.38, 1.45, 0.15], mid: [1.1, 2.3, 1.1], colorToken: "#6ea8ff" },
      { start: [2.2, 0.5, -0.2], end: [0.75, 1.35, 0.05], mid: [1.75, 2.2, 1.2], colorToken: "#ff70c7" },
    ],
  },
  {
    id: "involvement",
    kicker: "Involvement",
    title: "Campus Involvement",
    subtitle: "Leadership, community, and the spaces I help build.",
    body: "Leadership, teaching, fundraising, and student community-building sharpen how I collaborate. I care about translating complex systems clearly and building spaces where others can grow.",
    region: "Parietal lobe",
    wireLabel: "Integration · Awareness · Connection",
    accentToken: "#86f58d",
    glowToken: "#86f58d",
    cameraPosition: [4.5, 1.15, -4],
    lookAt: [0.92, 0.7, -0.55],
    stats: ["Community", "Teaching", "Leadership"],
    wires: [
      { start: [2.8, -0.1, -0.5], end: [1.2, 0.8, -0.35], mid: [2.2, 1.55, -1.6], colorToken: "#86f58d" },
    ],
  },
  {
    id: "contact",
    kicker: "Connect",
    title: "Let's Connect",
    subtitle: "All signals converge here.",
    body: "If you're working on neurotech, AI in healthcare, neural prosthetics, or robotics, I'd love to connect and explore what we can build together.",
    region: "Brain stem",
    wireLabel: "All signals converge",
    accentToken: "#ffd465",
    glowToken: "#ffd465",
    cameraPosition: [0, 0.45, -5.8],
    lookAt: [0, -0.55, -0.35],
    stats: ["Neurotech", "Healthcare AI", "Robotics"],
    wires: [
      { start: [-2.2, 0.8, 0.8], end: [0, -0.65, -0.25], mid: [-1.1, 1.7, -1.3], colorToken: "#b95eff" },
      { start: [-0.8, 1.1, 0.5], end: [0, -0.65, -0.25], mid: [-0.2, 1.9, -1.2], colorToken: "#67dfff" },
      { start: [0.7, 0.8, 0.55], end: [0, -0.65, -0.25], mid: [0.2, 1.75, -1.3], colorToken: "#6ea8ff" },
      { start: [2.1, 0.65, 0.2], end: [0, -0.65, -0.25], mid: [1.25, 1.55, -1.3], colorToken: "#ff70c7" },
      { start: [2.8, 0.2, -0.45], end: [0, -0.65, -0.25], mid: [1.7, 1.2, -1.55], colorToken: "#86f58d" },
    ],
  },
];

const projects: Project[] = [
  {
    title: "Autonomous Exploration & Mapping Robot (V2)",
    status: "Featured",
    description:
      "Designed a research-grade autonomous mobile robot that performs real-time environment mapping, path planning, and adaptive obstacle avoidance using sensor fusion, embedded control, and algorithmic decision-making.",
    stack: ["ROS2", "Python", "C++", "SLAM", "Sensor Fusion", "Path Planning", "Embedded Systems"],
  },
  {
    title: "Routine AI",
    status: "🏆 Top 10 — Agents for Impact Hackathon",
    description:
      "An AI assistant that reduces decision fatigue by optimizing your daily schedule. Transcribes and structures your day, analyzes photos (gym exercises for time estimates, skincare products for compatibility), tracks task completion history, and builds reports on productivity patterns.",
    stack: ["NVIDIA Nemotron", "OCR", "ASR", "Computer Vision", "AI Agents", "Next.js"],
    links: [
      { label: "Live Demo", href: "https://v0-routine-ai-app.vercel.app/" },
      { label: "Code", href: "https://github.com/yareva/routine-ai-app" },
      { label: "Hackathon Post", href: "https://www.linkedin.com/posts/rjscorner_nvidiagt-agentsforimpact-nemotron-activity-7439761271064907776-FXfK" },
    ],
  },
  {
    title: "Robot That Detects Human Intent — Without Vision",
    status: "In Progress",
    description:
      "Building a behavioral ML system that understands human intent through motion and proximity patterns alone — no camera, no face detection. The robot learns to distinguish approach vs passing by, blocking intentionally vs accidentally, and predicts future motion trajectories.",
    stack: ["Machine Learning", "Python", "Behavioral Analysis", "Sensor Arrays", "Pattern Recognition", "Motion Prediction"],
  },
  {
    title: "Streaming Platform Test Automation & Telemetry System",
    status: "Automation",
    description:
      "Designed a Python-based automation framework to simulate user interactions and system workflows, inspired by high-traffic streaming platforms. Built logging and telemetry pipelines to capture performance metrics, error states, and system behavior during automated test runs. Visualized system performance data using Matplotlib to identify bottlenecks and reliability issues.",
    stack: ["Python", "Automation", "Telemetry", "Matplotlib", "Testing Frameworks", "Agile Development"],
  },
];

const involvement: Involvement[] = [
  {
    name: "Robotics Club",
    role: "ROS2 Team",
    detail: "Working with Robot Operating System 2 to develop autonomous systems and collaborative robotics projects.",
  },
  {
    name: "AWS Club — Warrior Bot",
    role: "Member",
    detail: "Developing cloud-integrated robotics solutions using AWS infrastructure and services.",
  },
  {
    name: "Computer Science Association",
    role: "Founder & External Relations Chair",
    detail: "Founded and lead the CS Association, building a community for computer science students around connection, visibility, and collaboration.",
    href: "https://wsucsa.org",
  },
  {
    name: "Wayne Women in Tech",
    role: "Professional Chair",
    detail: "Organizing professional development events and empowering women in technology.",
    href: "https://www.instagram.com/waynewomenintech/",
  },
  {
    name: "Indian Student Association",
    role: "Fundraising Chair",
    detail: "Leading fundraising initiatives and fostering cultural exchange within the community.",
    href: "https://www.instagram.com/waynestateisa/",
  },
];

// ─── Scroll velocity hook ─────────────────────────────────────────────────────

function useScrollVelocity() {
  const velRef = useRef(0);
  const lastYRef = useRef(0);
  const lastTRef = useRef(0);
  const decayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const onScroll = () => {
      const now = performance.now();
      const dy = window.scrollY - lastYRef.current;
      const dt = Math.max(now - lastTRef.current, 1);
      velRef.current = dy / dt; // px/ms
      lastYRef.current = window.scrollY;
      lastTRef.current = now;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // Decay velocity over time when not scrolling
    decayRef.current = setInterval(() => {
      velRef.current *= 0.88;
    }, 16);

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (decayRef.current) clearInterval(decayRef.current);
    };
  }, []);

  return velRef;
}

// ─── Active section hook ──────────────────────────────────────────────────────

function useActiveSection(ids: SectionId[]): SectionId {
  const [active, setActive] = useState<SectionId>(ids[0]);

  useEffect(() => {
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id as SectionId);
      },
      { threshold: [0.3, 0.5, 0.7], rootMargin: "-5% 0px -25% 0px" }
    );

    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [ids]);

  return active;
}

// ─── Camera + Brain Scene ─────────────────────────────────────────────────────

function OrbitCamera({ section }: { section: BrainSection }) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(...section.cameraPosition));
  const targetLook = useRef(new THREE.Vector3(...section.lookAt));

  useEffect(() => {
    targetPos.current.set(...section.cameraPosition);
    targetLook.current.set(...section.lookAt);
  }, [section]);

  useFrame((_, delta) => {
    const s = 1 - Math.exp(-delta * 2.3);
    camera.position.lerp(targetPos.current, s);
    camera.lookAt(targetLook.current.clone().lerp(new THREE.Vector3(...section.lookAt), s));
  });

  return null;
}

function NeuralWires({ wires, active }: { wires: Wire[]; active: boolean }) {
  if (!wires.length) return null;
  return (
    <group>
      {wires.map((wire, i) => (
        <group key={i}>
          <QuadraticBezierLine
            start={wire.start}
            end={wire.end}
            mid={wire.mid}
            lineWidth={active ? 2.2 : 1.1}
            color={wire.colorToken}
            transparent
            opacity={active ? 0.95 : 0.35}
          />
          <mesh position={wire.end} scale={active ? 0.08 : 0.05}>
            <sphereGeometry args={[1, 18, 18]} />
            <meshBasicMaterial color={wire.colorToken} transparent opacity={active ? 0.9 : 0.3} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function BrainModel({
  section,
  scrollVelRef,
}: {
  section: BrainSection;
  scrollVelRef: React.MutableRefObject<number>;
}) {
  const modelRef = useRef<THREE.Group>(null);
  const glowColor = useMemo(() => new THREE.Color(section.glowToken), [section.glowToken]);
  const data = useGLTF("./brain-model/brain.glb");

  const { model, fitScale, fitPosition } = useMemo(() => {
    const cloned = data.scene.clone(true);
    cloned.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      child.castShadow = true;
      child.receiveShadow = true;
      child.material = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#d0cbc7"),
        roughness: 0.48,
        metalness: 0.02,
        clearcoat: 0.75,
        clearcoatRoughness: 0.28,
        transparent: true,
        opacity: 0.94,
        emissive: new THREE.Color(section.glowToken),
        emissiveIntensity: 0.4,
      });
    });
    const bounds = new THREE.Box3().setFromObject(cloned);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const maxAxis = Math.max(size.x, size.y, size.z, 0.001);
    const s = 3.1 / maxAxis;
    return { model: cloned, fitScale: s * 0.78, fitPosition: center.multiplyScalar(-s) };
  }, [data.scene]);

  // Update emissive colour on section change
  useEffect(() => {
    model.traverse((child) => {
      if (!(child instanceof THREE.Mesh) || !(child.material instanceof THREE.MeshPhysicalMaterial)) return;
      child.material.emissive.copy(glowColor);
    });
  }, [glowColor, model]);

  useFrame((state, delta) => {
    if (!modelRef.current) return;

    // Emissive intensity lerp
    const targetIntensity = section.id === "hero" ? 0.32 : 0.72;
    model.traverse((child) => {
      if (!(child instanceof THREE.Mesh) || !(child.material instanceof THREE.MeshPhysicalMaterial)) return;
      child.material.emissiveIntensity = THREE.MathUtils.lerp(
        child.material.emissiveIntensity,
        targetIntensity,
        1 - Math.exp(-delta * 3)
      );
    });

    // ── Scroll-driven rotation ──
    // scrollVelRef.current is px/ms. Map it to rotation speed.
    const vel = scrollVelRef.current; // can be negative or positive
    const rotSpeed = vel * 0.004; // tuning factor
    modelRef.current.rotation.y += rotSpeed;

    // Gentle idle sway when not scrolling
    const idleSway = delta * 0.06;
    if (Math.abs(vel) < 0.05) {
      modelRef.current.rotation.y += idleSway;
    }

    // Subtle tilt based on scroll direction
    const targetTiltX = Math.sin(state.clock.elapsedTime * 0.3) * 0.04 - 0.15;
    modelRef.current.rotation.x = THREE.MathUtils.lerp(
      modelRef.current.rotation.x,
      targetTiltX,
      1 - Math.exp(-delta * 2)
    );
  });

  return (
    <Float speed={1.1} rotationIntensity={0.12} floatIntensity={0.28}>
      <group ref={modelRef} position={[0, -0.3, 0]} scale={1.45}>
        <primitive object={model} position={fitPosition} scale={fitScale} />
        {/* Glowing base disc */}
        <mesh position={[0, -0.7, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={2.6}>
          <circleGeometry args={[1.4, 48]} />
          <MeshTransmissionMaterial
            samples={2}
            resolution={128}
            thickness={0.55}
            roughness={0.9}
            transmission={0.5}
            ior={1.08}
            chromaticAberration={0.03}
            color={section.accentToken}
            transparent
            opacity={0.14}
          />
        </mesh>
      </group>
    </Float>
  );
}

function SceneFallback() {
  return (
    <Html center>
      <div
        style={{
          background: "oklch(0.17 0.015 255 / 0.85)",
          border: "1px solid oklch(0.28 0.02 255 / 0.75)",
          borderRadius: "0.5rem",
          padding: "0.5rem 1rem",
          fontSize: "0.85rem",
          color: "oklch(0.73 0.02 245)",
          fontFamily: "Rajdhani, sans-serif",
        }}
      >
        Loading neural model…
      </div>
    </Html>
  );
}

function BrainScene({
  section,
  scrollVelRef,
}: {
  section: BrainSection;
  scrollVelRef: React.MutableRefObject<number>;
}) {
  return (
    <div style={{ position: "absolute", inset: "0 0 0 46%", display: "none" }} className="brain-canvas-wrap">
      <Canvas camera={{ position: sections[0].cameraPosition as [number, number, number], fov: 28 }} dpr={[1, 2]}>
        <color attach="background" args={["#000000"]} />
        <fog attach="fog" args={["#050816", 5.5, 10.5]} />
        <ambientLight intensity={0.85} />
        <directionalLight position={[4, 5, 5]} intensity={1.45} color={section.accentToken} />
        <pointLight position={[0, 0.5, 2.6]} intensity={2.1} color={section.accentToken} />
        <pointLight position={[0, -1.2, -2.8]} intensity={1.1} color="#8fdcff" />
        <Suspense fallback={<SceneFallback />}>
          <Environment preset="city" />
          <OrbitCamera section={section} />
          <NeuralWires wires={section.wires} active />
          <BrainModel section={section} scrollVelRef={scrollVelRef} />
          <Sparkles
            count={section.id === "projects" ? 32 : 14}
            scale={4.5}
            size={2.4}
            speed={0.28}
            color={section.accentToken}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

// CSS-only fallback visual when canvas is hidden on mobile
function BrainFallbackVisual({ section }: { section: BrainSection }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: "0 0 0 46%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      className="brain-fallback"
      aria-hidden
    >
      <div
        style={{
          position: "relative",
          aspectRatio: "1",
          width: "min(26vw, 22rem)",
          minWidth: "12rem",
          borderRadius: "50%",
          border: "1px solid oklch(0.28 0.02 255 / 0.4)",
          background: `radial-gradient(circle at 40% 35%, color-mix(in oklab, ${section.accentToken} 42%, white) 0%, transparent 24%), radial-gradient(circle at 58% 52%, color-mix(in oklab, ${section.glowToken} 24%, transparent) 0%, transparent 52%), oklch(0.17 0.015 255 / 0.72)`,
          boxShadow: `0 0 80px color-mix(in oklab, ${section.accentToken} 18%, transparent)`,
          transform: "translateX(26%) scale(0.72)",
          transition: "all 0.8s ease",
        }}
      />
    </div>
  );
}

// Hybrid component: shows canvas on desktop, fallback on mobile
function ClientBrainScene({
  section,
  scrollVelRef,
}: {
  section: BrainSection;
  scrollVelRef: React.MutableRefObject<number>;
}) {
  const [isLg, setIsLg] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsLg(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsLg(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (!isLg) return null;

  return (
    <div style={{ position: "absolute", inset: "0 0 0 46%" }}>
      <Canvas camera={{ position: sections[0].cameraPosition as [number, number, number], fov: 28 }} dpr={[1, 2]}>
        <color attach="background" args={["#000000"]} />
        <fog attach="fog" args={["#050816", 5.5, 10.5]} />
        <ambientLight intensity={0.85} />
        <directionalLight position={[4, 5, 5]} intensity={1.45} color={section.accentToken} />
        <pointLight position={[0, 0.5, 2.6]} intensity={2.1} color={section.accentToken} />
        <pointLight position={[0, -1.2, -2.8]} intensity={1.1} color="#8fdcff" />
        <Suspense fallback={<SceneFallback />}>
          <Environment preset="city" />
          <OrbitCamera section={section} />
          <NeuralWires wires={section.wires} active />
          <BrainModel section={section} scrollVelRef={scrollVelRef} />
          <Sparkles
            count={section.id === "projects" ? 32 : 14}
            scale={4.5}
            size={2.4}
            speed={0.28}
            color={section.accentToken}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

// ─── UI Pieces ────────────────────────────────────────────────────────────────

function HeroMetrics({ stats }: { stats: string[] }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
      {stats.map((s) => (
        <div
          key={s}
          className="neuro-panel"
          style={{ borderRadius: "9999px", padding: "0.4rem 1rem", fontSize: "0.85rem", color: "var(--foreground)" }}
        >
          {s}
        </div>
      ))}
    </div>
  );
}

function ProjectScrollGrid() {
  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      {projects.map((p) => (
        <article
          key={p.title}
          className="neuro-panel"
          style={{ borderRadius: "1.15rem", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div>
              <p className="neuro-label">{p.status}</p>
              <h3
                style={{
                  marginTop: "0.5rem",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "var(--foreground)",
                  lineHeight: 1.3,
                }}
              >
                {p.title}
              </h3>
            </div>
            <p style={{ fontSize: "0.9rem", lineHeight: 1.8, color: "var(--muted-foreground)" }}>{p.description}</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {p.stack.map((tag) => (
                <span
                  key={tag}
                  style={{
                    borderRadius: "9999px",
                    border: "1px solid var(--border)",
                    background: "var(--secondary)",
                    padding: "0.2rem 0.75rem",
                    fontSize: "0.75rem",
                    color: "var(--secondary-foreground)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
            {p.links && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                {p.links.map((lk) => (
                  <a
                    key={lk.href}
                    href={lk.href}
                    target="_blank"
                    rel="noreferrer"
                    className="neuro-link"
                    style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.875rem" }}
                  >
                    {lk.label}
                    <ExternalLink size={14} />
                  </a>
                ))}
              </div>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

function InvolvementList() {
  return (
    <div style={{ display: "grid", gap: "0.75rem" }}>
      {involvement.map((item) => {
        const inner = (
          <article
            className="neuro-panel"
            style={{
              borderRadius: "1.1rem",
              padding: "1.25rem 1.4rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "1rem",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
              <p className="neuro-label">{item.role}</p>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--foreground)" }}>{item.name}</h3>
              <p style={{ fontSize: "0.875rem", lineHeight: 1.7, color: "var(--muted-foreground)" }}>{item.detail}</p>
            </div>
            {item.href && (
              <MoveRight
                size={18}
                style={{ flexShrink: 0, marginTop: "0.2rem", color: "var(--muted-foreground)", opacity: 0.6 }}
              />
            )}
          </article>
        );

        return item.href ? (
          <a key={item.name} href={item.href} target="_blank" rel="noreferrer" style={{ display: "block", textDecoration: "none" }}>
            {inner}
          </a>
        ) : (
          <div key={item.name}>{inner}</div>
        );
      })}
    </div>
  );
}

function AboutContent() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Profile card */}
      <div
        className="neuro-panel"
        style={{ borderRadius: "1rem", padding: "1.25rem 1.4rem", display: "flex", alignItems: "center", gap: "1.25rem" }}
      >
        <div
          style={{
            flexShrink: 0,
            width: 96,
            height: 96,
            borderRadius: "0.85rem",
            border: "1px solid var(--border)",
            background: "var(--elevated)",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src="./profile.jpeg"
            alt="Ridhima Jain"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => {
              const el = e.target as HTMLImageElement;
              el.style.display = "none";
              if (el.parentElement) {
                el.parentElement.style.fontSize = "2.5rem";
                el.parentElement.textContent = "👤";
              }
            }}
          />
        </div>
        <div>
          <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--foreground)" }}>Ridhima Jain</p>
          <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>ECE + Neuroscience · Wayne State University</p>
          <p style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", marginTop: "0.2rem", opacity: 0.75 }}>4.0 GPA</p>
        </div>
      </div>

      {/* Bio */}
      <div
        className="neuro-panel"
        style={{ borderRadius: "1rem", padding: "1.4rem", display: "flex", flexDirection: "column", gap: "0.85rem", fontSize: "0.9rem", lineHeight: 1.85, color: "var(--muted-foreground)" }}
      >
        <p>
          I'm a 4.0 GPA student double majoring in{" "}
          <strong style={{ color: "var(--foreground)", fontWeight: 600 }}>Electrical & Computer Engineering</strong> and{" "}
          <strong style={{ color: "var(--foreground)", fontWeight: 600 }}>Neuroscience</strong>, passionate about AI,
          neurotechnology, and neural prosthetics that bridge the gap between biological and engineered systems.
        </p>
        <p style={{ color: "oklch(0.92 0.01 240)", fontStyle: "italic", opacity: 0.9, fontWeight: 500 }}>
          How can we build intelligent systems that understand and improve human life?
        </p>
        <p>
          I love building hardware and software, but I'm most excited when engineering meets biology. Whether that's neural
          prosthetics, brain-computer interfaces, or AI-driven neurotech, I'm drawn to problems where circuits and computation
          interact with living systems.
        </p>

        {/* The Why */}
        <p style={{ fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, color: "var(--primary)", marginTop: "0.5rem", fontStyle: "normal" }}>
          The Why
        </p>
        <p>
          The brain is the most sophisticated computing system we know. Neural prosthetics translate thought into action. AI
          enables adaptive, responsive medical technology. I'm fascinated by the intersection of these fields — my goal is to
          help design technologies that restore function, enhance capability, and genuinely improve quality of life.
        </p>

        {/* How I Work */}
        <p style={{ fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, color: "var(--primary)", marginTop: "0.5rem", fontStyle: "normal" }}>
          How I Work
        </p>
        <p>
          I approach problems analytically, but I build with intention. I care about clean architecture, thoughtful design, and
          meaningful impact. Being immersed in both engineering and neuroscience has shaped how I think: systems-first,
          interdisciplinary, and always curious.
        </p>

        {/* Outside the Classroom */}
        <p style={{ fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, color: "var(--primary)", marginTop: "0.5rem", fontStyle: "normal" }}>
          Outside the Classroom
        </p>
        <p>
          I've led fundraising initiatives, collaborated on community projects, and taught coding and STEM to students across
          different age groups. Teaching has strengthened my ability to break down complex systems — and build them better.
        </p>
      </div>

      {/* Focus cards */}
      <div style={{ display: "grid", gap: "0.85rem", gridTemplateColumns: "repeat(3, 1fr)" }}>
        {[
          { icon: GraduationCap, title: "Engineering", detail: "Embedded systems, signal processing, circuit design, and hardware-software integration." },
          { icon: SparklesIcon, title: "AI & ML", detail: "Neural networks, adaptive algorithms, and real-time pattern recognition." },
          { icon: Brain, title: "Neurotech", detail: "Brain-computer interfaces, neural prosthetics, and computational neuroscience." },
        ].map(({ icon: Icon, title, detail }) => (
          <article
            key={title}
            className="neuro-panel"
            style={{ borderRadius: "1rem", padding: "1.1rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}
          >
            <Icon size={18} style={{ color: "var(--primary)" }} />
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--foreground)" }}>{title}</h3>
            <p style={{ fontSize: "0.8rem", lineHeight: 1.7, color: "var(--muted-foreground)" }}>{detail}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function ContactContent() {
  const links = [
    { icon: Mail, label: "Email", value: "ridhimajain048@gmail.com", href: "mailto:ridhimajain048@gmail.com" },
    { icon: Linkedin, label: "LinkedIn", value: "ridhima-jain-09b0b1349", href: "https://www.linkedin.com/in/ridhima-jain-09b0b1349" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
      {links.map(({ icon: Icon, label, value, href }) => (
        <a
          key={label}
          href={href}
          target={href.startsWith("mailto") ? undefined : "_blank"}
          rel="noreferrer"
          className="neuro-panel"
          style={{ borderRadius: "1.1rem", padding: "1.4rem", textDecoration: "none", display: "flex", flexDirection: "column", gap: "0.75rem", transition: "box-shadow 0.2s" }}
        >
          <Icon size={20} style={{ color: "var(--primary)" }} />
          <div>
            <p className="neuro-label">{label}</p>
            <p style={{ marginTop: "0.35rem", fontSize: "1rem", fontWeight: 600, color: "var(--foreground)", wordBreak: "break-all" }}>{value}</p>
          </div>
        </a>
      ))}
    </div>
  );
}

// ─── Section Copy ─────────────────────────────────────────────────────────────

function SectionCopy({ section, active }: { section: BrainSection; active: boolean }) {
  return (
    <div
      style={{
        margin: "0 auto",
        display: "flex",
        minHeight: "100vh",
        width: "100%",
        maxWidth: "80rem",
        alignItems: "flex-start",
        padding: "6rem 1.25rem 5rem",
        opacity: active ? 1 : 0.7,
        transition: "opacity 0.5s ease",
      }}
    >
      <div
        style={{
          display: "grid",
          width: "100%",
          gap: "2.5rem",
        }}
        className="section-grid"
      >
        {/* Left sticky copy */}
        <div
          className="neuro-panel"
          style={{
            position: "sticky",
            top: "7rem",
            maxHeight: "calc(100vh - 9rem)",
            overflowY: "auto",
            borderRadius: "1.75rem",
            padding: "1.75rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            zIndex: 20,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            <p className="neuro-label">{section.kicker}</p>
            {section.id === "hero" ? (
              <h1
                style={{
                  fontSize: "clamp(2.8rem, 5.5vw, 4.8rem)",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  color: "var(--foreground)",
                  lineHeight: 1.1,
                  fontFamily: "'Orbitron', sans-serif",
                }}
              >
                {section.title}
              </h1>
            ) : (
              <h2
                style={{
                  fontSize: "clamp(2rem, 4vw, 3.2rem)",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  color: "var(--foreground)",
                  lineHeight: 1.15,
                }}
              >
                {section.title}
              </h2>
            )}
            <p style={{ fontSize: "1.2rem", lineHeight: 1.6, color: "oklch(0.92 0.01 240 / 0.9)" }}>{section.subtitle}</p>
            <p style={{ fontSize: "1rem", lineHeight: 1.75, color: "var(--muted-foreground)" }}>{section.body}</p>
          </div>

          {/* Region / wire label */}
          <div
            className="neuro-panel neuro-wire"
            style={{ borderRadius: "1rem", padding: "0.9rem 1.1rem", color: section.accentToken }}
          >
            <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--foreground)" }}>{section.region}</p>
            <p style={{ marginTop: "0.2rem", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>{section.wireLabel}</p>
          </div>

          {section.stats && <HeroMetrics stats={section.stats} />}

          {section.id === "hero" && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
              <a href="#projects" className="btn-neuro">Featured work</a>
              <a href="#contact" className="btn-neuro-ghost" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                Connect <Mail size={16} />
              </a>
            </div>
          )}
        </div>

        {/* Right content */}
        <div style={{ paddingTop: "1rem" }}>
          {section.id === "about" && <AboutContent />}
          {section.id === "projects" && <ProjectScrollGrid />}
          {section.id === "involvement" && <InvolvementList />}
          {section.id === "contact" && <ContactContent />}
        </div>
      </div>
    </div>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────

function SectionNav({ activeId }: { activeId: SectionId }) {
  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <nav
      className="neuro-panel"
      style={{
        position: "fixed",
        left: "50%",
        top: "1.25rem",
        zIndex: 30,
        display: "flex",
        width: "min(92vw, 58rem)",
        transform: "translateX(-50%)",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: "9999px",
        padding: "0.5rem 0.75rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0 0.5rem" }}>
        <div
          className="neuro-panel"
          style={{ width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <Cpu size={16} style={{ color: "var(--primary)" }} />
        </div>
        <div>
          <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--foreground)" }}>Ridhima Jain</p>
          <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}>Neurotech Portfolio</p>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
        {sections
          .filter((s) => s.id !== "hero")
          .map((s) => {
            const isActive = s.id === activeId;
            return (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                style={{
                  borderRadius: "9999px",
                  padding: "0.5rem 0.85rem",
                  fontSize: "0.82rem",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontWeight: 500,
                  transition: "all 0.2s",
                  background: isActive ? "var(--primary)" : "transparent",
                  color: isActive ? "var(--primary-foreground)" : "var(--muted-foreground)",
                }}
              >
                {s.kicker}
              </button>
            );
          })}
      </div>
    </nav>
  );
}

// ─── Hero name fade overlay ───────────────────────────────────────────────────

function HeroNameOverlay() {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const onScroll = () => {
      const o = Math.max(0, 1 - (window.scrollY - 40) / 120);
      setOpacity(o);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (opacity === 0) return null;

  return (
    <div
      aria-hidden
      style={{
        pointerEvents: "none",
        position: "fixed",
        insetInline: 0,
        zIndex: 25,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        top: "50vh",
        transform: "translateY(-50%)",
        opacity,
        transition: "opacity 60ms linear",
      }}
    >
      <h1
        style={{
          fontFamily: "'Orbitron', 'Rajdhani', sans-serif",
          fontSize: "clamp(2.4rem, 5.5vw, 4.8rem)",
          fontWeight: 900,
          letterSpacing: "0.1em",
          background: "linear-gradient(135deg, #7fd3ff 0%, #b95eff 50%, #67dfff 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          filter: "drop-shadow(0 0 28px rgba(127,211,255,0.5))",
          textAlign: "center",
          lineHeight: 1.1,
          userSelect: "none",
        }}
      >
        RIDHIMA JAIN
      </h1>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export function BrainPortfolio() {
  const sectionIds = useMemo(() => sections.map((s) => s.id), []);
  const activeId = useActiveSection(sectionIds);
  const activeSection = sections.find((s) => s.id === activeId) ?? sections[0];
  const scrollVelRef = useScrollVelocity();

  return (
    <main
      className="neuro-shell"
      style={{ position: "relative", overflowX: "clip" }}
    >
      <SectionNav activeId={activeId} />
      <HeroNameOverlay />

      {/* Grid bg */}
      <div aria-hidden className="neuro-grid" style={{ pointerEvents: "none", position: "fixed", inset: 0, zIndex: 0, opacity: 0.4 }} />

      {/* Edge fade */}
      <div aria-hidden style={{ pointerEvents: "none", position: "fixed", inset: 0, zIndex: 10 }}>
        <div style={{ position: "absolute", insetInline: 0, top: 0, height: "10rem", background: "linear-gradient(to bottom, var(--background), transparent)" }} />
        <div style={{ position: "absolute", insetInline: 0, bottom: 0, height: "12rem", background: "linear-gradient(to top, var(--background), transparent)" }} />
      </div>

      {/* 3D Brain — fixed right half */}
      <div
        aria-hidden
        style={{ pointerEvents: "none", position: "fixed", inset: 0, zIndex: 20 }}
      >
        <ClientBrainScene section={activeSection} scrollVelRef={scrollVelRef} />
      </div>

      {/* Scrollable content */}
      <div style={{ position: "relative", zIndex: 10 }}>
        {sections.map((s) => (
          <section key={s.id} id={s.id}>
            <SectionCopy section={s} active={s.id === activeId} />
          </section>
        ))}
      </div>

      {/* Responsive grid styles */}
      <style>{`
        .section-grid {
          grid-template-columns: minmax(0, 32rem) minmax(0, 1fr);
          gap: 3rem;
        }
        @media (max-width: 1024px) {
          .section-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 1024px) {
          .section-grid > div:first-child {
            position: static !important;
            max-height: none !important;
          }
        }
      `}</style>
    </main>
  );
}

// Preload the GLB
if (typeof window !== "undefined") {
  useGLTF.preload("./brain-model/brain.glb");
}
