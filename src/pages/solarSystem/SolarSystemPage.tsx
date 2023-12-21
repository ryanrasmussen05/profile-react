import { useEffect, useRef } from 'react';
import { Button } from 'antd';
import styles from './SolarSystemPage.module.css';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

let Physics: any = require('physicsjs/dist/physicsjs-full.js');

function SolarSystemPage() {
  const navigate = useNavigate();
  const physicsContext = useRef<any>({});
  const canvasWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleResize() {
      if (physicsContext.current.world) {
        physicsContext.current.world.destroy();
      }
      draw(canvasWrapperRef.current, physicsContext.current);
    }
  
    window.addEventListener('resize', handleResize);
  
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (physicsContext.current.world) {
      physicsContext.current.world.destroy();
    }
    draw(canvasWrapperRef.current, physicsContext.current);

    return () => {
      if (physicsContext.current.world) {
        // eslint-disable-next-line
        physicsContext.current.world.destroy();
      }
    }
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.backButton}>
        <Button shape="circle" icon={<ArrowLeftOutlined />} onClick={() => navigate('/home')}/>
      </div>
      <div id="physics" className={styles.canvasWrapper} ref={canvasWrapperRef}>
      </div>
    </div>
  );
}

function draw(canvasWrapper: any, physicsContext: any) {
  if (!canvasWrapper) return;

  const width = canvasWrapper.offsetWidth;
  const height = canvasWrapper.offsetHeight;
  const xMin = (width / 2) - (height / 2);
  const xMax = (width / 2) + (height / 2);
  const gravityStrength = 0.01;

  physicsContext.world = Physics({sleepDisabled: true});

  const renderer: any = Physics.renderer('canvas', {
    el: 'physics'
  });
  physicsContext.world.add(renderer);

  physicsContext.world.on('step', function () {
    physicsContext.world.render();
  });

  const sun = Physics.body('circle', {
    x: width / 2,
    y: height / 2,
    mass: 333,
    radius: 20,
    treatment: 'static',
    sun: true,
    styles: {
      fillStyle: '#f4d142'
    }
  });
  physicsContext.world.add(sun);

  const circles = [];

  for (let counter = 0; counter < 200; counter++) {
    const circle = Physics.body('circle', {
      x: random(xMin, xMax),
      y: random(0, height),
      mass: 0.1,
      restitution: 0,
      cof: 1,
      radius: 2,
      styles: {
        fillStyle: '#FFFFFF'
      }
    });

    if (width / 2 - 15 < circle.state.pos.x && circle.state.pos.x < width / 2 + 15) {
      circle.state.pos.x = circle.state.pos.x + 30;
    }
    if (height / 2 - 15 < circle.state.pos.y && circle.state.pos.y < height / 2 + 15) {
      circle.state.pos.y = circle.state.pos.y + 30;
    }

    const vector = Physics.vector(circle.state.pos.x - width / 2, circle.state.pos.y - height / 2);
    const orbitRadius = vector.norm();
    vector.perp(true);
    vector.normalize();

    const orbitSpeed = Math.sqrt(gravityStrength * 333 / orbitRadius);

    circle.state.vel = vector.mult(orbitSpeed);

    circles.push(circle);
  }

  physicsContext.world.add(circles);

  physicsContext.world.add([
    Physics.behavior('newtonian', {strength: gravityStrength}),
    Physics.behavior('sweep-prune'),
    Physics.behavior('body-collision-detection', {checkAll: false})
  ]);

  physicsContext.world.on('collisions:detected', function (data: any) {
    const behavior = Physics.behavior('body-impulse-response');

    // apply default impulse first
    behavior.respond(data);

    // combine bodies
    for (let i = 0; i < data.collisions.length; i++) {
      const bodyA = data.collisions[i].bodyA;
      const bodyB = data.collisions[i].bodyB;

      if (bodyA.sun) {
        physicsContext.world.remove(bodyB);
      } else if (bodyB.sun) {
        physicsContext.world.remove(bodyA);
      } else {
        const newBodyVolume = (4 / 3 * Math.PI * Math.pow(bodyA.radius, 3)) + (4 / 3 * Math.PI * Math.pow(bodyB.radius, 3));
        const newBodyRadius = Math.pow(((3 / (4 * Math.PI)) * newBodyVolume), 1 / 3);

        const centerOfMass = Physics.body.getCOM([bodyA, bodyB]);

        const centerOfMassVelocity: any = {};
        centerOfMassVelocity.x = ((bodyA.mass * bodyA.state.vel.x) + (bodyB.mass * bodyB.state.vel.x)) / (bodyA.mass + bodyB.mass);
        centerOfMassVelocity.y = ((bodyA.mass * bodyA.state.vel.y) + (bodyB.mass * bodyB.state.vel.y)) / (bodyA.mass + bodyB.mass);

        const newBody = Physics.body('circle', {
          x: centerOfMass.x,
          y: centerOfMass.y,
          vx: centerOfMassVelocity.x,
          vy: centerOfMassVelocity.y,
          mass: bodyA.mass + bodyB.mass,
          radius: newBodyRadius,
          styles: {
              fillStyle: '#FFFFFF'
          }
        });

        physicsContext.world.add(newBody);
        physicsContext.world.remove(bodyA);
        physicsContext.world.remove(bodyB);
      }
    }
  });

  Physics.util.ticker.on(function (time: any) {
    physicsContext.world.step(time);
  });

  Physics.util.ticker.start();
}

function random(min: number, max: number): number {
  return (Math.random() * (max - min)) + min;
}

export default SolarSystemPage;
