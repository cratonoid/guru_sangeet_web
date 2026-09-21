/* =============================================================
   Shree Guru Sangeet Vidyalaya — site behaviour
   ============================================================= */
(function () {
  "use strict";

  /* ---------------------------------------------------------------
     CONFIGURATION

     Paste the Google Apps Script Web app URL here after deploying
     apps-script/Code.gs. It must be the /exec URL, not /dev.

     Until this is filled in, the form tells the visitor to contact
     the institute directly instead of silently losing the lead.
     --------------------------------------------------------------- */
  var LEAD_ENDPOINT = "https://script.google.com/macros/s/AKfycbyQT1DUVcD1Je20mZNfLPlZqIjIzUPeP_ef3JrH8jLSWTqYsGvfxX01WOl7bDIunhcxVg/exec";

  /* ---------------------------------------------------------------
     Mobile navigation
     --------------------------------------------------------------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    // Close the menu after tapping a link
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  /* ---------------------------------------------------------------
     FAQ accordion
     --------------------------------------------------------------- */
  document.querySelectorAll(".faq-item__q").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".faq-item");
      var open = item.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(open));
    });
  });

  /* ---------------------------------------------------------------
     Reveal sections as they scroll into view
     --------------------------------------------------------------- */
  var revealables = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && revealables.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });

    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------------------------------------------------------------
     Showcase slideshow

     Crossfades the photographs above the hero. Autoplay pauses on
     hover, on keyboard focus and while the tab is hidden, and is
     skipped entirely for visitors who prefer reduced motion.
     --------------------------------------------------------------- */
  var showcase = document.querySelector(".showcase");

  if (showcase) {
    var slides = showcase.querySelectorAll(".showcase__slide");
    var dotWrap = showcase.querySelector(".showcase__dots");
    var stage = showcase.querySelector(".showcase__stage");
    var INTERVAL = 5500;
    var current = 0;
    var timer = null;
    var paused = false;
    var calm = window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)")
      : { matches: false };

    if (slides.length > 1) {
      var dots = [];

      // Dots are built here so the markup stays a plain list of figures.
      slides.forEach(function (slide, i) {
        var dot = document.createElement("button");
        dot.type = "button";
        dot.className = "showcase__dot" + (i === 0 ? " is-active" : "");
        dot.setAttribute("role", "tab");
        dot.setAttribute("aria-label", "Photograph " + (i + 1));
        dot.setAttribute("aria-selected", String(i === 0));
        dot.addEventListener("click", function () { show(i); restart(); });
        dotWrap.appendChild(dot);
        dots.push(dot);
      });

      function show(next) {
        current = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === current);
          dot.setAttribute("aria-selected", String(i === current));
        });
      }

      function advance(step) { show(current + step); }

      function restart() {
        window.clearInterval(timer);
        timer = null;
        if (calm.matches || paused) return;
        timer = window.setInterval(function () { advance(1); }, INTERVAL);
      }

      showcase.querySelector(".showcase__arrow--prev")
        .addEventListener("click", function () { advance(-1); restart(); });
      showcase.querySelector(".showcase__arrow--next")
        .addEventListener("click", function () { advance(1); restart(); });

      // Pause while the visitor is looking at or interacting with it
      ["mouseenter", "focusin"].forEach(function (evt) {
        showcase.addEventListener(evt, function () { paused = true; restart(); });
      });
      ["mouseleave", "focusout"].forEach(function (evt) {
        showcase.addEventListener(evt, function () { paused = false; restart(); });
      });

      document.addEventListener("visibilitychange", function () {
        paused = document.hidden;
        restart();
      });

      // Arrow keys once the carousel has keyboard focus
      showcase.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft") { advance(-1); restart(); }
        else if (e.key === "ArrowRight") { advance(1); restart(); }
      });

      // Swipe on touch devices
      var touchX = null;
      stage.addEventListener("touchstart", function (e) {
        touchX = e.changedTouches[0].clientX;
      }, { passive: true });
      stage.addEventListener("touchend", function (e) {
        if (touchX === null) return;
        var dx = e.changedTouches[0].clientX - touchX;
        if (Math.abs(dx) > 45) { advance(dx < 0 ? 1 : -1); restart(); }
        touchX = null;
      }, { passive: true });

      if (calm.addEventListener) calm.addEventListener("change", restart);
      restart();
    }
  }

  /* ---------------------------------------------------------------
     Highlight the section currently in view (home page nav)
     --------------------------------------------------------------- */
  var sectionLinks = Array.prototype.filter.call(
    document.querySelectorAll(".nav a[href^='#']"),
    function (a) { return a.getAttribute("href").length > 1; }
  );

  if (sectionLinks.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        sectionLinks.forEach(function (a) {
          a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    sectionLinks.forEach(function (a) {
      var target = document.querySelector(a.getAttribute("href"));
      if (target) spy.observe(target);
    });
  }

  /* ---------------------------------------------------------------
     Lead form → Google Sheet

     Submissions are posted to a Google Apps Script web app, which
     appends them as a row in the institute's spreadsheet. See
     apps-script/Code.gs for the receiving end and the setup steps.

     The body is sent as FormData so the browser treats it as a
     "simple" request: no CORS preflight, which Apps Script cannot
     answer.
     --------------------------------------------------------------- */
  var form = document.getElementById("lead-form");

  if (form) {
    var submitBtn = document.getElementById("lead-submit");
    var successBox = document.getElementById("form-success");
    var errorBox = document.getElementById("form-error");
    var errorDetail = document.getElementById("form-error-detail");

    // Record which page the enquiry came from
    var sourceField = form.querySelector("input[name='source']");
    if (sourceField) {
      sourceField.value = document.title.split("|")[0].trim() + " page";
    }

    /* -- Pre-select a course ------------------------------------- */

    function selectCourse(value) {
      var field = form.querySelector("#course");
      if (!field || !value) return;
      Array.prototype.forEach.call(field.options, function (opt) {
        if (opt.value.toLowerCase() === value.toLowerCase()) field.value = opt.value;
      });
    }

    // …from the URL, e.g. courses.html?course=Tabla
    selectCourse(new URLSearchParams(window.location.search).get("course"));

    // …or from an "Enquire for <course>" button
    document.querySelectorAll("a[data-course]").forEach(function (link) {
      link.addEventListener("click", function () {
        selectCourse(link.getAttribute("data-course"));
      });
    });

    /* -- Submission ---------------------------------------------- */

    function setBusy(busy) {
      if (!submitBtn) return;
      submitBtn.setAttribute("aria-busy", String(busy));
      submitBtn.textContent = busy ? "Submitting…" : "Submit Enquiry";
    }

    function showResult(box, message) {
      [successBox, errorBox].forEach(function (el) { if (el) el.hidden = true; });
      if (!box) return;
      if (message && errorDetail && box === errorBox) errorDetail.textContent = message;
      box.hidden = false;
      box.setAttribute("tabindex", "-1");
      box.focus();
      box.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!form.reportValidity()) return;

      // Honeypot filled in means a bot; pretend all is well and drop it.
      var honeypot = form.querySelector("input[name='website']");
      if (honeypot && honeypot.value) {
        showResult(successBox);
        form.reset();
        return;
      }

      if (LEAD_ENDPOINT.indexOf("http") !== 0) {
        showResult(errorBox, "The enquiry form is not connected yet.");
        return;
      }

      setBusy(true);

      fetch(LEAD_ENDPOINT, { method: "POST", body: new FormData(form) })
        .then(function (response) { return response.json(); })
        .then(function (data) {
          if (!data || data.result !== "success") {
            throw new Error((data && data.message) || "The enquiry could not be saved.");
          }
          showResult(successBox);
          form.reset();
        })
        .catch(function (err) {
          // Details go to the console and to Apps Script → Executions;
          // the visitor gets a message they can act on.
          console.error("Lead form submission failed:", err);
          showResult(errorBox, "Please check your internet connection and try again.");
        })
        .then(function () { setBusy(false); });
    });
  }

  /* ---------------------------------------------------------------
     Footer year
     --------------------------------------------------------------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
