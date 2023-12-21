import { useEffect, useRef, useState } from 'react';
import { Button, Select, Switch } from 'antd';
import styles from './ParticlesPage.module.css';
import { Particle } from './particles';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

interface PhysicsNormal {
  x: number;
  y: number;
}

function ParticlesPage() {
  const navigate = useNavigate();
  const [gravity, setGravity] = useState(false);
  const [collisions, setCollisions] = useState(true);
  const [numOrbs, setNumOrbs] = useState(30);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [screenWidth, setScreenWidth] = useState(0);
  const [screenHeight, setScreenHeight] = useState(0);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      draw(ctx, particles, screenHeight, screenWidth, gravity, collisions);
    }, 16);

    return () => clearInterval(interval);
  }, [ctx, particles, screenHeight, screenWidth, gravity, collisions]);

  useEffect(() => {
    window.addEventListener('resize', () => setupCanvas(canvasRef, canvasWrapperRef, setCtx, setScreenWidth, setScreenHeight, setParticles, numOrbs));

    setupCanvas(canvasRef, canvasWrapperRef, setCtx, setScreenWidth, setScreenHeight, setParticles, numOrbs);

    return () => window.removeEventListener('resize', () => setupCanvas(canvasRef, canvasWrapperRef, setCtx, setScreenWidth, setScreenHeight, setParticles, numOrbs));
  }, [numOrbs]);

  return (
    <div className={styles.page}>
      <div className={styles.controls}>
        <div className={styles.back}>
          <Button shape="circle" icon={<ArrowLeftOutlined />} onClick={() => navigate('/home')}/>
        </div>
        <div className={styles.control}>
          <Switch className={styles.switch} defaultChecked={gravity} onChange={() => setGravity(!gravity)}/> Gravity
        </div>
        <div className={styles.control}>
          <Switch className={styles.switch} defaultChecked={collisions} onChange={() => setCollisions(!collisions)}/> Collisions
        </div>
        <Select
          defaultValue={numOrbs.toString()}
          className={styles.control}
          onChange={(value: string) => setNumOrbs(parseInt(value))}
        >
          <Select.Option value="10">10 Orbs</Select.Option>
          <Select.Option value="20">20 Orbs</Select.Option>
          <Select.Option value="30">30 Orbs</Select.Option>
          <Select.Option value="40">40 Orbs</Select.Option>
          <Select.Option value="50">50 Orbs</Select.Option>
        </Select>
      </div>

      <div className={styles.canvasWrapper} ref={canvasWrapperRef}>
        <canvas className={styles.canvas} ref={canvasRef}>
        </canvas>
      </div>
    </div>
  );
}

function setupCanvas(canvasRef: any, canvasWrapperRef: any, setCtx: any, setScreenWidth: any, setScreenHeight: any, setParticles: any, numOrbs: number) {
  if (canvasRef.current && canvasWrapperRef.current) {
    const canvasCtx = canvasRef.current.getContext('2d');
    setCtx(canvasCtx);

    const screenWidth = canvasWrapperRef.current.offsetWidth;
    const screenHeight = canvasWrapperRef.current.offsetHeight;
    setScreenWidth(screenWidth);
    setScreenHeight(screenHeight);
    canvasRef.current.width = screenWidth;
    canvasRef.current.height = screenHeight;

    initParticles(numOrbs, setParticles, screenWidth, screenHeight);
  }
}

function initParticles(numParticles: number, setParticles: any, screenWidth: number, screenHeight: number) {
  const particles = [];
  for (let i = 0; i < numParticles; i++) {
    particles.push(new Particle(screenWidth, screenHeight));
  }
  setParticles(particles);
}

function draw(ctx: CanvasRenderingContext2D | null, particles: Particle[], screenHeight: number, screenWidth: number, gravity: boolean, collisions: boolean) {
  if (!ctx || !particles.length) return;
      
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, 0, screenWidth, screenHeight);
  ctx.globalCompositeOperation = 'lighter';

  particles.forEach((particle) => {
    particle.draw(ctx, gravity);
  });

  if (collisions) {
    calculateCollisions(particles);
  }
}

function calculateCollisions(particles: Particle[]) {
  particles.forEach((particleA, index) => {
    for (let i = index + 1; i < particles.length; i++) {
      const particleB = particles[i];

      if (particleA.isCollided(particleB)) {
        const distance = Math.sqrt(Math.pow(particleA.x - particleB.x, 2) + Math.pow(particleA.y - particleB.y, 2));

        const collisionNormal: PhysicsNormal = {
          x: (particleA.x - particleB.x) / distance,
          y: (particleA.y - particleB.y) / distance
        };

        // Decompose particleA velocity into parallel and orthogonal part
        const particleADot = collisionNormal.x * particleA.vx + collisionNormal.y * particleA.vy;
        const particleACollide: PhysicsNormal = {
          x: collisionNormal.x * particleADot,
          y: collisionNormal.y * particleADot
        };
        const particleARemainder: PhysicsNormal = {
          x: particleA.vx - particleACollide.x,
          y: particleA.vy - particleACollide.y
        };

        // Decompose particleB velocity into parallel and orthogonal part
        const particleBDot = collisionNormal.x * particleB.vx + collisionNormal.y * particleB.vy;
        const particleBCollide: PhysicsNormal = {
          x: collisionNormal.x * particleBDot,
          y: collisionNormal.y * particleBDot
        };
        const particleBRemainder: PhysicsNormal = {
          x: particleB.vx - particleBCollide.x,
          y: particleB.vy - particleBCollide.y
        };

        // calculate changes in velocity perpendicular to collision plane, conservation of momentum
        const newVelX1 = (particleACollide.x * (particleA.mass - particleB.mass) + (2 * particleB.mass * particleBCollide.x)) / (particleA.mass + particleB.mass);
        const newVelY1 = (particleACollide.y * (particleA.mass - particleB.mass) + (2 * particleB.mass * particleBCollide.y)) / (particleA.mass + particleB.mass);
        const newVelX2 = (particleBCollide.x * (particleB.mass - particleA.mass) + (2 * particleA.mass * particleACollide.x)) / (particleA.mass + particleB.mass);
        const newVelY2 = (particleBCollide.y * (particleB.mass - particleA.mass) + (2 * particleA.mass * particleACollide.y)) / (particleA.mass + particleB.mass);

        // add collision result to remaining parallel velocities
        particleA.vx = newVelX1 + particleARemainder.x;
        particleA.vy = newVelY1 + particleARemainder.y;
        particleB.vx = newVelX2 + particleBRemainder.x;
        particleB.vy = newVelY2 + particleBRemainder.y;
      }
    }
  });
}

export default ParticlesPage;
