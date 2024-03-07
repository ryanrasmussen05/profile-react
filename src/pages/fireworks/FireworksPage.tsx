import { useEffect, useRef, useState } from 'react';
import { Button } from 'antd';
import styles from './FireworksPage.module.css';
import { Particle } from './particle';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Firework } from './firework';

function FireworksPage() {
  const navigate = useNavigate();
  const animationSettings = useRef({});
  const [screenWidth, setScreenWidth] = useState(0);
  const [screenHeight, setScreenHeight] = useState(0);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      draw(ctx, screenHeight, screenWidth, animationSettings.current);
    }, 25);

    return () => clearInterval(interval);
  }, [ctx, animationSettings, screenHeight, screenWidth]);

  useEffect(() => {
    window.addEventListener('resize', () =>
      setupCanvas(canvasRef, canvasWrapperRef, setCtx, setScreenWidth, setScreenHeight, animationSettings.current)
    );
    window.addEventListener('mousemove', (e) => setupMouseMove(e, animationSettings.current, canvasRef.current));
    window.addEventListener('mousedown', (e) => setupMouseDown(e, animationSettings.current));
    window.addEventListener('mouseup', (e) => setupMouseUp(e, animationSettings.current));

    setupCanvas(canvasRef, canvasWrapperRef, setCtx, setScreenWidth, setScreenHeight, animationSettings.current);

    return () => {
      window.removeEventListener('resize', () =>
        setupCanvas(canvasRef, canvasWrapperRef, setCtx, setScreenWidth, setScreenHeight, animationSettings.current)
      );
      // eslint-disable-next-line
      window.removeEventListener('mousemove', (e) => setupMouseMove(e, animationSettings, canvasRef.current));
      window.removeEventListener('mousedown', (e) => setupMouseDown(e, animationSettings.current));
      // eslint-disable-next-line
      window.removeEventListener('mouseup', (e) => setupMouseUp(e, animationSettings.current));
    };
  }, [animationSettings]);

  return (
    <div className={styles.page}>
      <div className={styles.backButton}>
        <Button shape="circle" icon={<ArrowLeftOutlined />} onClick={() => navigate('/home')} />
      </div>
      <div className={styles.canvasWrapper} ref={canvasWrapperRef}>
        <canvas className={styles.canvas} ref={canvasRef}></canvas>
      </div>
    </div>
  );
}

function setupCanvas(
  canvasRef: any,
  canvasWrapperRef: any,
  setCtx: any,
  setScreenWidth: any,
  setScreenHeight: any,
  animationSettings: any
) {
  if (canvasRef.current && canvasWrapperRef.current) {
    const canvasCtx = canvasRef.current.getContext('2d');
    setCtx(canvasCtx);

    const screenWidth = canvasWrapperRef.current.offsetWidth;
    const screenHeight = canvasWrapperRef.current.offsetHeight;
    setScreenWidth(screenWidth);
    setScreenHeight(screenHeight);
    canvasRef.current.width = screenWidth;
    canvasRef.current.height = screenHeight;

    animationSettings.fireworks = [];
    animationSettings.particles = [];
    animationSettings.hue = 120;
    animationSettings.timer = { timerTick: 0, timerTotal: 30, limiterTick: 0, limiterTotal: 5 };
    animationSettings.mouseDown = false;
    animationSettings.mouseX = 0;
    animationSettings.mouseY = 0;
  }
}

function draw(ctx: CanvasRenderingContext2D | null, screenHeight: number, screenWidth: number, animationSettings: any) {
  if (!ctx) return;

  animationSettings.hue += 0.5;

  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fillRect(0, 0, screenWidth, screenHeight);
  ctx.globalCompositeOperation = 'lighter';

  const fireworksToRemove: number[] = [];
  const particlesToRemove: number[] = [];

  animationSettings.fireworks.forEach((firework: Firework, index: number) => {
    firework.draw(ctx, animationSettings.hue);
    const exploded: boolean = firework.update();

    if (exploded) {
      createParticles(firework.x, firework.y, animationSettings);
      fireworksToRemove.unshift(index);
    }
  });

  animationSettings.particles.forEach((particle: Particle, index: number) => {
    particle.draw(ctx);
    const faded: boolean = particle.update();

    if (faded) {
      particlesToRemove.unshift(index);
    }
  });

  for (const index of fireworksToRemove) {
    animationSettings.fireworks.splice(index, 1);
  }

  for (const index of particlesToRemove) {
    animationSettings.particles.splice(index, 1);
  }

  if (animationSettings.timer.timerTick >= animationSettings.timer.timerTotal) {
    if (!animationSettings.mouseDown) {
      animationSettings.fireworks.push(
        new Firework(
          screenWidth / 2,
          screenHeight,
          getRange(screenWidth / 3, (2 * screenWidth) / 3),
          getRange(0, screenHeight / 2),
          screenWidth
        )
      );
      animationSettings.timer.timerTick = 0;
    }
  } else {
    animationSettings.timer.timerTick++;
  }

  if (animationSettings.timer.limiterTick >= animationSettings.timer.limiterTotal) {
    if (animationSettings.mouseDown) {
      animationSettings.fireworks.push(
        new Firework(screenWidth / 2, screenHeight, animationSettings.mouseX, animationSettings.mouseY, screenWidth)
      );
      animationSettings.timer.limiterTick = 0;
    }
  } else {
    animationSettings.timer.limiterTick++;
  }
}

function createParticles(x: number, y: number, animationSettings: any) {
  for (let i = 0; i < 50; i++) {
    animationSettings.particles.push(new Particle(x, y, animationSettings.hue));
  }
}

function getRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function setupMouseMove(e: any, animationSettings: any, canvas: any) {
  if (!canvas) return;
  animationSettings.mouseX = e.pageX - canvas?.offsetLeft;
  animationSettings.mouseY = e.pageY - canvas?.offsetTop;
}

function setupMouseDown(e: any, animationSettings: any) {
  e.preventDefault();
  animationSettings.mouseDown = true;
}

function setupMouseUp(e: any, animationSettings: any) {
  e.preventDefault();
  animationSettings.mouseDown = false;
}

export default FireworksPage;
