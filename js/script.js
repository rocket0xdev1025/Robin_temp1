/* ============================================================
   $BLUE — Robinhood's office Doge, circa 2015
   Falling leaves, scroll reveals, count-up numbers,
   arrow flyby, copy CA, mobile nav.
   ============================================================ */

(function () {
  "use strict";

  var reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------- Falling leaves canvas ---------- */
  var canvas = document.getElementById("leaves");
  var ctx = canvas.getContext("2d");
  var leaves = [];
  var LEAF_COLORS = ["#c8e600", "#8fbf3f", "#4a6b2f", "#d8f818", "#6b8f3a"];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function makeLeaf(startAnywhere) {
    return {
      x: Math.random() * canvas.width,
      y: startAnywhere ? Math.random() * canvas.height : -20,
      size: 5 + Math.random() * 9,
      speedY: 0.5 + Math.random() * 1.3,
      drift: 0.3 + Math.random() * 0.8,
      driftPhase: Math.random() * Math.PI * 2,
      spin: Math.random() * Math.PI * 2,
      spinSpeed: (Math.random() - 0.5) * 0.04,
      color: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
      opacity: 0.35 + Math.random() * 0.45,
    };
  }

  function initLeaves() {
    var count = Math.min(38, Math.floor(window.innerWidth / 36));
    leaves = [];
    for (var i = 0; i < count; i++) leaves.push(makeLeaf(true));
  }

  function drawLeaf(l) {
    ctx.save();
    ctx.translate(l.x, l.y);
    ctx.rotate(l.spin);
    ctx.globalAlpha = l.opacity;
    ctx.fillStyle = l.color;
    // simple leaf: two quadratic arcs
    ctx.beginPath();
    ctx.moveTo(0, -l.size);
    ctx.quadraticCurveTo(l.size, 0, 0, l.size);
    ctx.quadraticCurveTo(-l.size, 0, 0, -l.size);
    ctx.fill();
    ctx.restore();
  }

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < leaves.length; i++) {
      var l = leaves[i];
      l.y += l.speedY;
      l.driftPhase += 0.015;
      l.x += Math.sin(l.driftPhase) * l.drift;
      l.spin += l.spinSpeed;
      if (l.y > canvas.height + 24) leaves[i] = makeLeaf(false);
      drawLeaf(l);
    }
    requestAnimationFrame(tick);
  }

  if (!reducedMotion) {
    resize();
    initLeaves();
    tick();
    window.addEventListener("resize", function () {
      resize();
      initLeaves();
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  var revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealEls.forEach(function (el) {
    revealObserver.observe(el);
  });

  /* ---------- Count-up numbers ---------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var duration = 1400;
    var start = null;

    function frame(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  var countEls = document.querySelectorAll("[data-count]");
  var countObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  countEls.forEach(function (el) {
    countObserver.observe(el);
  });

  /* ---------- Arrow flyby on section change ---------- */
  var arrow = document.getElementById("arrow");
  var lastFly = 0;

  function flyArrow() {
    var now = Date.now();
    if (now - lastFly < 6000 || reducedMotion) return;
    lastFly = now;
    arrow.style.top = 18 + Math.random() * 40 + "vh";
    arrow.classList.remove("fly");
    // force reflow to restart animation
    void arrow.offsetWidth;
    arrow.classList.add("fly");
  }

  var sections = document.querySelectorAll(".section");
  var sectionObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) flyArrow();
      });
    },
    { threshold: 0.3 }
  );
  sections.forEach(function (s) {
    sectionObserver.observe(s);
  });

  /* ---------- Copy contract address ---------- */
  var caBox = document.getElementById("caBox");
  var caValue = document.getElementById("caValue");
  var toast = document.getElementById("toast");
  var toastTimer;

  caBox.addEventListener("click", function () {
    var text = caValue.textContent.trim();
    function showToast(msg) {
      toast.textContent = msg;
      toast.classList.add("show");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () {
        toast.classList.remove("show");
      }, 2200);
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function () {
        showToast("Copied to collar! 🐕");
      });
    } else {
      showToast("CA coming soon! 🐕");
    }
  });

  /* ---------- Mobile nav ---------- */
  var burger = document.getElementById("burger");
  var navMobile = document.getElementById("navMobile");

  burger.addEventListener("click", function () {
    burger.classList.toggle("open");
    navMobile.classList.toggle("open");
  });

  navMobile.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      burger.classList.remove("open");
      navMobile.classList.remove("open");
    });
  });
})();
