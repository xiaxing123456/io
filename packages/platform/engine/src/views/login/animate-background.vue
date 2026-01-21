<template>
    <canvas ref="canvasRef" class="fixed inset-0 z-0 pointer-events-none"></canvas>
</template>
<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue';

const canvasRef = ref();

let animationFrameId: number;
let particles: Array<{
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    color: string;
}> = [];

/** 背景画布尺寸 */
const resize = () => {
    if (!canvasRef.value) return;
    canvasRef.value.width = window.innerWidth;
    canvasRef.value.height = window.innerHeight;
};

/** 绘制背景 */
const createParticles = () => {
    particles = [];
    const particleCount = 100;
    const colors = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b'];

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvasRef.value.width,
            y: Math.random() * canvasRef.value.height,
            size: Math.random() * 2 + 0.5,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            color: colors[Math.floor(Math.random() * colors.length)],
        });
    }
};

const animate = () => {
    console.log('animate');
    const ctx = canvasRef.value.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);

    // Draw static glowing grid
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.05)';
    ctx.lineWidth = 1;
    const gridSize = 50;
    for (let x = 0; x < canvasRef.value.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasRef.value.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvasRef.value.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasRef.value.width, y);
        ctx.stroke();
    }

    // Update and draw particles
    particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = canvasRef.value.width;
        if (p.x > canvasRef.value.width) p.x = 0;
        if (p.y < 0) p.y = canvasRef.value.height;
        if (p.y > canvasRef.value.height) p.y = 0;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });

    animationFrameId = requestAnimationFrame(animate);
};

onMounted(() => {
    window.addEventListener('resize', resize);
    resize();
    createParticles();
    animate();
});

/** 销毁 */
onUnmounted(() => {
    window.removeEventListener('resize', resize);
    cancelAnimationFrame(animationFrameId);
});
</script>

<style lang="scss" scoped></style>
