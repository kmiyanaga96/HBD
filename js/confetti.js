/* シンプルな紙吹雪(黄色×水色) */
(function () {
  const canvas = document.getElementById("confetti-canvas");
  const ctx = canvas.getContext("2d");
  const COLORS = ["#ffd94a", "#f5b800", "#7dd8f0", "#38b6dd", "#fffdf7", "#ffb3c7"];
  let pieces = [];
  let running = false;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  function makePiece(burst) {
    const angle = Math.random() * Math.PI * 2;
    const speed = burst ? 4 + Math.random() * 7 : 0;
    return {
      x: burst ? canvas.width / 2 : Math.random() * canvas.width,
      y: burst ? canvas.height * 0.4 : -20,
      vx: burst ? Math.cos(angle) * speed : (Math.random() - 0.5) * 1.5,
      vy: burst ? Math.sin(angle) * speed - 3 : 1 + Math.random() * 2.5,
      size: 6 + Math.random() * 7,
      color: COLORS[(Math.random() * COLORS.length) | 0],
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.25,
      shape: Math.random() < 0.3 ? "circle" : "rect",
    };
  }

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach((p) => {
      p.vy += 0.08;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.shape === "circle") {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      }
      ctx.restore();
    });
    pieces = pieces.filter((p) => p.y < canvas.height + 30);
    if (pieces.length > 0) {
      requestAnimationFrame(tick);
    } else {
      running = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  function start() {
    if (!running) {
      running = true;
      requestAnimationFrame(tick);
    }
  }

  /** 中央からドバッと */
  window.confettiBurst = function (count = 120) {
    for (let i = 0; i < count; i++) pieces.push(makePiece(true));
    start();
  };

  /** 上からひらひら降らせる */
  window.confettiRain = function (count = 80, duration = 2500) {
    const t0 = Date.now();
    const timer = setInterval(() => {
      for (let i = 0; i < 4; i++) pieces.push(makePiece(false));
      start();
      if (Date.now() - t0 > duration) clearInterval(timer);
    }, 90);
  };
})();
