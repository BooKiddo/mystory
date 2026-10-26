/* =========================================================
   EDIT YOUR CONTENT HERE
   ========================================================= */
const ROLES = [
  "fast, useful web apps",
  "playful interfaces",
  "tools people love to use",
  "ideas that move",
];

// category: used for filter chips. emoji + colors make the card thumbnail.
const PROJECTS = [
  { title: "Project One", desc: "Short description of what it does and why it matters.", category: "Web App", tags: ["Flask", "SQL", "Bootstrap"], emoji: "📊", colors: ["#8b5cf6", "#06b6d4"], url: "#" },
  { title: "Project Two", desc: "A real-time experience with live updates between users.", category: "Web App", tags: ["C#", ".NET", "SignalR"], emoji: "💬", colors: ["#06b6d4", "#34d399"], url: "#" },
  { title: "Project Three", desc: "A polished, animated landing page with great typography.", category: "Creative", tags: ["HTML", "CSS", "JS"], emoji: "🎨", colors: ["#f472b6", "#8b5cf6"], url: "#" },
  { title: "Project Four", desc: "An interactive invitation with personalised links and RSVP.", category: "Creative", tags: ["JavaScript", "PHP"], emoji: "💌", colors: ["#fb923c", "#f472b6"], url: "#" },
  { title: "Project Five", desc: "A small utility that automates a repetitive task.", category: "Tool", tags: ["Python", "Automation"], emoji: "⚙️", colors: ["#22d3ee", "#6366f1"], url: "#" },
  { title: "Project Six", desc: "Dashboard for tracking inventory and spotting trends.", category: "Tool", tags: ["PHP", "MySQL", "Charts"], emoji: "📦", colors: ["#a78bfa", "#f472b6"], url: "#" },
];

/* =========================================================
   Helpers
   ========================================================= */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* =========================================================
   Theme toggle (dark default, remembered per visitor)
   ========================================================= */
(function theme() {
  const root = document.documentElement;
  const btn = $("#themeToggle");
  const meta = $('meta[name="theme-color"]');
  const apply = (t) => {
    root.setAttribute("data-theme", t);
    if (meta) meta.setAttribute("content", t === "dark" ? "#07070c" : "#f7f7fb");
  };
  apply(root.getAttribute("data-theme") || "dark");
  btn.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    apply(next);
    try { localStorage.setItem("theme", next); } catch (e) {}
  });
})();

/* =========================================================
   Nav: scrolled state, mobile menu, active link
   ========================================================= */
(function nav() {
  const header = $("#nav");
  const menu = $("#menu");
  const burger = $("#burger");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 20);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  burger.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    burger.setAttribute("aria-expanded", String(open));
  });
  $$("a", menu).forEach((a) =>
    a.addEventListener("click", () => {
      menu.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    })
  );

  const links = $$("a", menu);
  const sections = links.map((a) => $(a.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => io.observe(s));
  }
})();

/* =========================================================
   Typing effect
   ========================================================= */
(function typing() {
  const el = $("#typed");
  if (reduceMotion) { el.textContent = ROLES[0]; return; }
  let i = 0, j = 0, deleting = false;
  const tick = () => {
    const word = ROLES[i];
    el.textContent = word.slice(0, j);
    let delay = deleting ? 35 : 75;
    if (!deleting && j === word.length) { deleting = true; delay = 1600; }
    else if (deleting && j === 0) { deleting = false; i = (i + 1) % ROLES.length; delay = 350; }
    j += deleting ? -1 : 1;
    setTimeout(tick, delay);
  };
  tick();
})();

/* =========================================================
   Projects: render, filter by category, search
   ========================================================= */
(function projects() {
  const grid = $("#cards");
  const chipsEl = $("#chips");
  const search = $("#search");
  const empty = $("#empty");
  const categories = ["All", ...new Set(PROJECTS.map((p) => p.category))];
  let active = "All";

  chipsEl.innerHTML = categories
    .map((c) => `<button class="chip" type="button" aria-pressed="${c === "All"}" data-cat="${esc(c)}">${esc(c)}</button>`)
    .join("");

  const highlight = (text, q) => {
    const safe = esc(text);
    if (!q) return safe;
    const re = new RegExp("(" + q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig");
    return safe.replace(re, "<mark>$1</mark>");
  };

  function render() {
    const q = search.value.trim();
    const needle = q.toLowerCase();
    const list = PROJECTS.filter((p) => {
      const inCat = active === "All" || p.category === active;
      const hay = (p.title + " " + p.desc + " " + p.category + " " + p.tags.join(" ")).toLowerCase();
      return inCat && (!needle || hay.includes(needle));
    });
    grid.innerHTML = list
      .map(
        (p, i) => `
      <article class="card tilt" style="animation-delay:${i * 60}ms">
        <div class="thumb" style="background:linear-gradient(135deg,${p.colors[0]},${p.colors[1]})" aria-hidden="true">${p.emoji}</div>
        <div class="body">
          <div class="tags">${p.tags.map((t) => `<span class="tag">${highlight(t, q)}</span>`).join("")}</div>
          <h3>${highlight(p.title, q)}</h3>
          <p>${highlight(p.desc, q)}</p>
          <a class="link" href="${esc(p.url)}">View project <span aria-hidden="true">→</span></a>
        </div>
      </article>`
      )
      .join("");
    empty.hidden = list.length > 0;
    bindTilt();
  }

  chipsEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    active = btn.dataset.cat;
    $$(".chip", chipsEl).forEach((c) => c.setAttribute("aria-pressed", String(c === btn)));
    render();
  });
  search.addEventListener("input", render);

  function bindTilt() {
    if (reduceMotion || window.matchMedia("(hover: none)").matches) return;
    $$(".tilt", grid).forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`;
      });
      card.addEventListener("mouseleave", () => (card.style.transform = ""));
    });
  }

  render();
})();

/* =========================================================
   Scroll reveal + counters
   ========================================================= */
(function reveal() {
  const items = $$(".reveal");
  items.forEach((el, i) => el.style.setProperty("--d", (i % 4) * 0.08 + "s"));

  const countUp = (el) => {
    const target = +el.dataset.count;
    if (reduceMotion) { el.textContent = target; return; }
    const start = performance.now(), dur = 1200;
    const step = (t) => {
      const p = Math.min((t - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("in"));
    $$("[data-count]").forEach(countUp);
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        $$("[data-count]", e.target).forEach(countUp);
        io.unobserve(e.target);
      });
    },
    { threshold: 0.12 }
  );
  items.forEach((el) => io.observe(el));
})();

/* =========================================================
   Cursor glow
   ========================================================= */
(function glow() {
  if (reduceMotion || window.matchMedia("(hover: none)").matches) return;
  const root = document.documentElement;
  let raf = 0, x = 0, y = 0;
  window.addEventListener("mousemove", (e) => {
    x = e.clientX; y = e.clientY;
    if (!raf) raf = requestAnimationFrame(() => {
      root.style.setProperty("--mx", x + "px");
      root.style.setProperty("--my", y + "px");
      raf = 0;
    });
  }, { passive: true });
})();

/* =========================================================
   Contact form (Formspree or any endpoint in the form's action)
   ========================================================= */
(function contact() {
  const form = $("#contactForm");
  const status = $("#formStatus");
  const btn = $("#sendBtn");
  const setStatus = (msg, cls) => { status.textContent = msg; status.className = "status " + (cls || ""); };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fields = $$("input[name], textarea[name]", form).filter((f) => f.name !== "_gotcha");
    let valid = true;
    fields.forEach((f) => {
      const ok = f.checkValidity() && f.value.trim() !== "";
      f.classList.toggle("invalid", !ok);
      if (!ok) valid = false;
    });
    if (!valid) { setStatus("Please fill in all fields with a valid email.", "err"); return; }

    if (form.action.includes("YOUR_FORM_ID")) {
      setStatus("Form isn't connected yet. Set your Formspree ID in index.html.", "err");
      return;
    }
    btn.disabled = true;
    btn.textContent = "Sending…";
    setStatus("");
    try {
      const res = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Request failed");
      form.reset();
      setStatus("Thanks! Your message was sent.", "ok");
    } catch (err) {
      setStatus("Something went wrong. Please try again or email me directly.", "err");
    } finally {
      btn.disabled = false;
      btn.textContent = "Send message";
    }
  });
  $$("input, textarea", form).forEach((f) => f.addEventListener("input", () => f.classList.remove("invalid")));
})();

/* Footer year */
$("#year").textContent = new Date().getFullYear();
