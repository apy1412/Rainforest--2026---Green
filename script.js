(function () {
  document.documentElement.classList.remove("no-js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Menu overlay */
  var menu = document.querySelector(".menu");
  var openers = document.querySelectorAll("[data-menu-open]");
  var closer = document.querySelector("[data-menu-close]");
  function setMenu(open) {
    if (!menu) return;
    menu.classList.toggle("open", open);
    menu.setAttribute("aria-hidden", open ? "false" : "true");
    openers.forEach(function (b) { b.setAttribute("aria-expanded", open ? "true" : "false"); });
    document.body.style.overflow = open ? "hidden" : "";
    if (open) { var first = menu.querySelector("a"); first && first.focus(); }
  }
  openers.forEach(function (b) { b.addEventListener("click", function () { setMenu(true); }); });
  closer && closer.addEventListener("click", function () { setMenu(false); openers[0] && openers[0].focus(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && menu && menu.classList.contains("open")) setMenu(false); });

  /* Fit giant words to their container width */
  var fits = document.querySelectorAll("[data-fit]");
  function fit() {
    fits.forEach(function (el) {
      var parent = el.parentElement;
      var w = parent.clientWidth - parseFloat(getComputedStyle(parent).paddingLeft) - parseFloat(getComputedStyle(parent).paddingRight);
      el.style.fontSize = "100px";
      var ratio = w / el.scrollWidth;
      el.style.fontSize = Math.floor(100 * ratio * 0.995) + "px";
    });
  }
  if (fits.length) {
    fit();
    document.fonts && document.fonts.ready.then(fit);
    var t; window.addEventListener("resize", function () { clearTimeout(t); t = setTimeout(fit, 80); });
  }

  /* Scroll reveals */
  var items = document.querySelectorAll(".reveal, .split-line");
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* Stat counters */
  var stats = document.querySelectorAll("[data-count]");
  function count(el) {
    var end = parseInt(el.getAttribute("data-count"), 10);
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduce) { el.textContent = end + suffix; return; }
    var start = performance.now(), dur = 1400;
    (function step(now) {
      var p = Math.min(1, (now - start) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(end * e) + suffix;
      if (p < 1) requestAnimationFrame(step);
    })(start);
  }
  if (stats.length && "IntersectionObserver" in window) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { count(en.target); so.unobserve(en.target); } });
    }, { threshold: 0.4 });
    stats.forEach(function (s) { so.observe(s); });
  }

  /* Contact form — front-end only. Wire to a real endpoint before launch. */
  var form = document.querySelector("#enquiry");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      form.classList.add("hide");
      var ok = document.querySelector(".form-success");
      ok.classList.add("show");
      ok.setAttribute("tabindex", "-1");
      ok.focus();
    });
  }

  /* Header tone: dark text over light sections, light text over dark ones */
  var header = document.querySelector(".site-header");
  function bgAt(y) {
    var els = document.elementsFromPoint(window.innerWidth / 2, y);
    for (var i = 0; i < els.length; i++) {
      if (header.contains(els[i])) continue;
      for (var el = els[i]; el && el !== document.documentElement; el = el.parentElement) {
        if (el.classList.contains("hero")) return [10, 40, 28];
        var c = getComputedStyle(el).backgroundColor.match(/[\d.]+/g);
        if (c && (c.length < 4 || parseFloat(c[3]) > 0.5)) return c;
      }
    }
    return getComputedStyle(document.body).backgroundColor.match(/[\d.]+/g);
  }
  function tone() {
    if (!header) return;
    var c = bgAt(header.offsetHeight / 2 + 8);
    var lum = (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) / 255;
    header.setAttribute("data-tone", lum > 0.55 ? "light" : "dark");
  }
  /* Hide on scroll down, return with a solid bar on scroll up */
  var lastY = window.scrollY, ticking = false;
  function onScroll() {
    var y = window.scrollY;
    if (header) {
      header.classList.toggle("scrolled", y > 80);
      if (!document.querySelector(".menu.open")) header.classList.toggle("hidden", y > lastY && y > 200);
    }
    lastY = y;
    tone();
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(onScroll);
  }, { passive: true });
  window.addEventListener("resize", tone);
  tone();

  /* Our Approach: stage tiles jump to their stage and highlight it */
  var tiles = document.querySelectorAll(".track a");
  function flash(id) {
    var target = document.getElementById(id);
    if (!target) return;
    target.classList.remove("flash");
    void target.offsetWidth;
    target.classList.add("flash");
    tiles.forEach(function (t) { t.classList.toggle("active", t.getAttribute("href") === "#" + id); });
  }
  tiles.forEach(function (t) {
    t.addEventListener("click", function () { flash(t.getAttribute("href").slice(1)); });
  });
  if (location.hash.indexOf("#stage-") === 0) flash(location.hash.slice(1));

  /* Year */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
