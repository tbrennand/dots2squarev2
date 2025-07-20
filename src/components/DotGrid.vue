<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useBoardStore } from '@/store/boardStore';

const emit = defineEmits(['line-added']);

const props = defineProps<{
  rows: number;
  cols: number;
  lines: Map<string, string>;
  squares: Map<string, string>;
  playerColors: Record<string, string>;
}>();
const canvas = ref<HTMLCanvasElement | null>(null);

const dotRadius = 8;
const spacing = 60;
const lineWidth = 6;
const hoverColor = 'rgba(255, 255, 255, 0.3)';
const lineColor = '#4A5568'; // A darker, less prominent line color

const hoveredLine = ref<string | null>(null);

const canvasWidth = computed(() => props.cols * spacing);
const canvasHeight = computed(() => props.rows * spacing);

function getLineId(r1: number, c1: number, r2: number, c2: number): string {
  // Canonical line ID to avoid duplicates (e.g., 0,0-0,1 is same as 0,1-0,0)
  if (r1 > r2 || (r1 === r2 && c1 > c2)) {
    [r1, c1, r2, c2] = [r2, c2, r1, c1];
  }
  return `${r1},${c1}-${r2},${c2}`;
}

function draw() {
  const ctx = canvas.value?.getContext('2d');
  if (!ctx || !canvas.value) return;

  ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value);

  // Draw dots
  for (let r = 0; r < props.rows; r++) {
    for (let c = 0; c < props.cols; c++) {
      const x = c * spacing + spacing / 2;
      const y = r * spacing + spacing / 2;
      // Outer ring for a softer look
      ctx.fillStyle = '#4A5568'; // gray-600
      ctx.beginPath();
      ctx.arc(x, y, dotRadius, 0, 2 * Math.PI);
      ctx.fill();
      // Inner dot
      ctx.fillStyle = '#1A202C'; // gray-900
      ctx.beginPath();
      ctx.arc(x, y, dotRadius / 2, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  // Draw lines from props
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  props.lines.forEach((playerId, lineId) => {
    const color = props.playerColors[playerId] || lineColor;
    ctx.strokeStyle = color;
    const [p1, p2] = lineId.split('-').map(p => p.split(',').map(Number));
    ctx.beginPath();
    ctx.moveTo(p1[1] * spacing + spacing / 2, p1[0] * spacing + spacing / 2);
    ctx.lineTo(p2[1] * spacing + spacing / 2, p2[0] * spacing + spacing / 2);
    ctx.stroke();
  });

  // Draw completed squares
  props.squares.forEach((playerId, squareId) => {
    const [r, c] = squareId.split(',').map(Number);
    const playerColor = props.playerColors[playerId];
    if (playerColor) {
      // Make the fill slightly transparent
      const color = playerColor + '40'; // Add 25% alpha for a subtler fill
      ctx.fillStyle = color;
      ctx.fillRect(
        c * spacing + spacing / 2 + lineWidth / 2,
        r * spacing + spacing / 2 + lineWidth / 2,
        spacing - lineWidth,
        spacing - lineWidth
      );
    }
  });

  // Draw hovered line
  if (hoveredLine.value && !props.lines.has(hoveredLine.value)) {
    ctx.strokeStyle = hoverColor;
    const [p1, p2] = hoveredLine.value.split('-').map(p => p.split(',').map(Number));
    ctx.beginPath();
    ctx.moveTo(p1[1] * spacing + spacing / 2, p1[0] * spacing + spacing / 2);
    ctx.lineTo(p2[1] * spacing + spacing / 2, p2[0] * spacing + spacing / 2);
    ctx.stroke();
  }
}

function getMousePos(event: MouseEvent) {
  const rect = canvas.value!.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}

function handleMouseMove(event: MouseEvent) {
  const { x, y } = getMousePos(event);
  const clickThreshold = 10;
  let closestLine: string | null = null;
  let minDistance = Infinity;

  // Check horizontal lines
  for (let r = 0; r < props.rows; r++) {
    for (let c = 0; c < props.cols - 1; c++) {
      const y1 = r * spacing + spacing / 2;
      const x1 = c * spacing + spacing / 2;
      const x2 = (c + 1) * spacing + spacing / 2;
      if (x > x1 && x < x2 && Math.abs(y - y1) < clickThreshold) {
        const distance = Math.abs(y - y1);
        if (distance < minDistance) {
          minDistance = distance;
          closestLine = getLineId(r, c, r, c + 1);
        }
      }
    }
  }

  // Check vertical lines
  for (let r = 0; r < props.rows - 1; r++) {
    for (let c = 0; c < props.cols; c++) {
      const x1 = c * spacing + spacing / 2;
      const y1 = r * spacing + spacing / 2;
      const y2 = (r + 1) * spacing + spacing / 2;
      if (y > y1 && y < y2 && Math.abs(x - x1) < clickThreshold) {
        const distance = Math.abs(x - x1);
        if (distance < minDistance) {
          minDistance = distance;
          closestLine = getLineId(r, c, r + 1, c);
        }
      }
    }
  }

  if (hoveredLine.value !== closestLine) {
    hoveredLine.value = closestLine;
    draw();
  }
}

function handleClick() {
  if (hoveredLine.value && !props.lines.has(hoveredLine.value)) {
    emit('line-added', hoveredLine.value);
  }
}

watch([() => props.rows, () => props.cols], () => {
  if (canvas.value) {
    canvas.value.width = canvasWidth.value;
    canvas.value.height = canvasHeight.value;
    draw();
  }
});

onMounted(() => {
  if (!canvas.value) return;
  canvas.value.width = canvasWidth.value;
  canvas.value.height = canvasHeight.value;

  canvas.value.addEventListener('mousemove', handleMouseMove);
  canvas.value.addEventListener('click', handleClick);
  canvas.value.addEventListener('mouseout', () => {
      hoveredLine.value = null;
      draw();
  });

  draw();
});

// Redraw canvas whenever lines or squares change
watch([() => props.lines, () => props.squares], () => {
    draw();
}, { deep: true });

</script>

<template>
  <canvas ref="canvas" class="bg-gray-900 rounded-lg cursor-pointer"></canvas>
</template>
