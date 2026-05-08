import { useEffect, useRef } from 'react';

export default function Confetti({ trigger }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!trigger) return undefined;
        const canvas = canvasRef.current;
        if (!canvas) return undefined;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const resize = () => {
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            ctx.scale(dpr, dpr);
        };
        resize();
        window.addEventListener('resize', resize);

        const colors = ['#ff3e6c', '#ff85a0', '#8b5cf6', '#fbbf24', '#10b981', '#22c1c3'];
        const particles = Array.from({ length: 140 }, () => ({
            x: window.innerWidth / 2 + (Math.random() - 0.5) * 120,
            y: window.innerHeight / 2 + (Math.random() - 0.5) * 60,
            vx: (Math.random() - 0.5) * 14,
            vy: -Math.random() * 14 - 6,
            size: Math.random() * 8 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            rot: Math.random() * Math.PI,
            vr: (Math.random() - 0.5) * 0.3,
            shape: Math.random() > 0.5 ? 'rect' : 'heart',
        }));

        let frame = 0;
        let raf;
        const draw = () => {
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            particles.forEach((p) => {
                p.vy += 0.32;
                p.x += p.vx;
                p.y += p.vy;
                p.rot += p.vr;
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rot);
                ctx.fillStyle = p.color;
                if (p.shape === 'rect') {
                    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
                } else {
                    const s = p.size / 10;
                    ctx.beginPath();
                    ctx.moveTo(0, 3 * s);
                    ctx.bezierCurveTo(0, 0, -5 * s, 0, -5 * s, -3 * s);
                    ctx.bezierCurveTo(-5 * s, -6 * s, 0, -6 * s, 0, -3 * s);
                    ctx.bezierCurveTo(0, -6 * s, 5 * s, -6 * s, 5 * s, -3 * s);
                    ctx.bezierCurveTo(5 * s, 0, 0, 0, 0, 3 * s);
                    ctx.fill();
                }
                ctx.restore();
            });
            frame++;
            if (frame < 180) {
                raf = requestAnimationFrame(draw);
            } else {
                ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            }
        };
        raf = requestAnimationFrame(draw);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', resize);
        };
    }, [trigger]);

    return <canvas ref={canvasRef} className="confetti-canvas" aria-hidden="true" />;
}
