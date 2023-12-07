import { useEffect } from 'react';


const Cursor = () => {

    
  useEffect(() => {
    const canvas = document.getElementById('cursor-canvas') as HTMLCanvasElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');

    const params = {
        pointsNumber: 40,
        widthFactor: .2,
        mouseThreshold: .6,
        spring: .4,
        friction: .5
    };

    const pointer = {
        x: window.innerWidth * 0.5,
        y: window.innerHeight * 0.5
    };

    const trail = new Array(params.pointsNumber);
    for (let i = 0; i < params.pointsNumber; i++) {
        trail[i] = {
            x: pointer.x,
            y: pointer.y,
            dx: 0,
            dy: 0,
        }
    }

    const mouseMoveHandler = (e: MouseEvent) => {
        updateMousePosition(e.pageX, e.pageY);
    };

    
    window.addEventListener('mousemove', mouseMoveHandler);

    const handleResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    function updateMousePosition(eX: number, eY: number) {
        pointer.x = eX;
        pointer.y = eY;
    }

    function animate() {
        if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "rgb(29, 185, 84)";
        trail.forEach((p, pIdx) => {
            const prev = pIdx === 0 ? pointer : trail[pIdx - 1];
            const spring = pIdx === 0 ? 0.4 * params.spring : params.spring;

            p.dx += (prev.x - p.x) * spring;
            p.dy += (prev.y - p.y) * spring;
            p.dx *= params.friction;
            p.dy *= params.friction;
            p.x += p.dx;
            p.y += p.dy;
        });

        ctx.beginPath();
        ctx.moveTo(trail[0].x, trail[0].y);

        for (let i = 1; i < trail.length - 1; i++) {
            const xc = .5 * (trail[i].x + trail[i + 1].x);
            const yc = .5 * (trail[i].y + trail[i + 1].y);
            ctx.quadraticCurveTo(trail[i].x, trail[i].y, xc, yc);
            ctx.lineWidth = params.widthFactor * (params.pointsNumber - i);
            ctx.stroke();
        }
        ctx.lineTo(trail[trail.length - 1].x, trail[trail.length - 1].y);
        ctx.stroke();

        window.requestAnimationFrame(animate);
    }
    }

      window.requestAnimationFrame(animate);

    return () => {
        window.removeEventListener('mousemove', mouseMoveHandler);
    }

  });

  return (
      <canvas id="cursor-canvas" className="cursorTrail"></canvas>
      );
};

export default Cursor;