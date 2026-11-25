/* The Guesthouse by Balinsasayaw: front-end only, no server needed. */
(function () {
  "use strict";

  var CONTACT = {
    email: "theguesthouse.balinsasayaw2026@gmail.com",
    phone: "+639998846076",
    name: "The Guesthouse by Balinsasayaw"
  };
  var DRAFT_KEY = "tgb-booking-draft";

  document.documentElement.classList.add("js");
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Dates ---------- */
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function toISO(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function fromISO(s) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s || "")) return null;
    var p = s.split("-");
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    return isNaN(d) ? null : d;
  }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function nightsBetween(a, b) { return Math.round((b - a) / 86400000); }
  function pretty(d) {
    return d.toLocaleDateString("en-PH", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  }

  var today = new Date(); today.setHours(0, 0, 0, 0);
  var todayISO = toISO(today);

  /* ---------- Room availability (SAMPLE DATA) ----------
     Demo only: no backend. Bookings are offsets in days from today, so the
     calendar always looks lived-in. Ranges are [check-in, check-out): the
     check-out day itself is free. One room per type.
     To use real data later, replace BOOKED with real dates, e.g.
       { room: "Twin Room", from: "2026-12-20", to: "2026-12-27" } */
  var ROOMS = [
    { name: "Twin Room", img: "assets/img/twin-room-sm.jpg" },
    { name: "Double Room", img: "assets/img/double-room-sm.jpg" },
    { name: "Queen Room", img: "assets/img/queen-room-sm.jpg" },
    { name: "Single Room", img: "assets/img/single-room-sm.jpg" }
  ];
  var BOOKED = [
    { room: "Twin Room", from: 2, to: 5 },
    { room: "Twin Room", from: 12, to: 15 },
    { room: "Double Room", from: 0, to: 3 },
    { room: "Double Room", from: 9, to: 11 },
    { room: "Queen Room", from: 5, to: 8 },
    { room: "Queen Room", from: 20, to: 24 },
    { room: "Single Room", from: 1, to: 2 },
    { room: "Single Room", from: 14, to: 18 }
  ].map(function (b) {
    var f = typeof b.from === "number" ? addDays(today, b.from) : fromISO(b.from);
    var t = typeof b.to === "number" ? addDays(today, b.to) : fromISO(b.to);
    return { room: b.room, from: f, to: t };
  });

  function isNightBooked(room, day) {
    for (var i = 0; i < BOOKED.length; i++) {
      var b = BOOKED[i];
      if (b.room === room && day >= b.from && day < b.to) return true;
    }
    return false;
  }
  function isFree(room, a, b) {
    for (var d = new Date(a); d < b; d = addDays(d, 1)) if (isNightBooked(room, d)) return false;
    return true;
  }
  function nextFree(room, a, nights) {
    for (var i = 1; i <= 120; i++) {
      var s = addDays(a, i);
      if (isFree(room, s, addDays(s, nights))) return s;
    }
    return null;
  }
  function short(d) { return d.toLocaleDateString("en-PH", { month: "short", day: "numeric" }); }

  var todayEl = $("#today");
  if (todayEl) {
    todayEl.textContent = today.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    todayEl.setAttribute("datetime", todayISO);
  }
  var yearEl = $("#year");
  if (yearEl) yearEl.textContent = today.getFullYear();

  /* ---------- Toast ---------- */
  var toastEl = $("#toast"), toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("is-on"); }, 2600);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", "");
      ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy") ? resolve() : reject(); } catch (e) { reject(e); }
      document.body.removeChild(ta);
    });
  }

  /* ---------- Header ---------- */
  var header = $(".site-header");
  var mobileBook = $(".mobile-book");
  var bookSection = $("#book");
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle("is-solid", y > 40 || nav.classList.contains("is-open"));
    if (mobileBook && bookSection) {
      var r = bookSection.getBoundingClientRect();
      var inBooking = r.top < window.innerHeight && r.bottom > 0;
      mobileBook.classList.toggle("is-on", y > window.innerHeight * 0.55 && !inBooking);
    }
  }

  var nav = $("#site-nav");
  var toggle = $(".menu-toggle");
  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    onScroll();
  }
  toggle.addEventListener("click", function () { setMenu(!nav.classList.contains("is-open")); });
  $$("a", nav).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("is-open")) { setMenu(false); toggle.focus(); }
  });
  document.addEventListener("click", function (e) {
    if (nav.classList.contains("is-open") && !nav.contains(e.target) && !toggle.contains(e.target)) setMenu(false);
  });
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Highlight the nav link of the section in view
  if ("IntersectionObserver" in window) {
    var links = $$("a[href^='#']", nav);
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (l) {
          if (l.getAttribute("href") === "#" + en.target.id) l.setAttribute("aria-current", "true");
          else l.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    links.forEach(function (l) { var t = $(l.getAttribute("href")); if (t) spy.observe(t); });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealTargets = $$(".statement, .amenities li, .room, .dining-photo, .dining-copy, .booking-card, .map, .contact-links");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); ro.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    revealTargets.forEach(function (el, i) {
      // stagger siblings in the same row
      var idx = Array.prototype.indexOf.call(el.parentNode.children, el);
      el.style.transitionDelay = (Math.min(idx, 4) * 70) + "ms";
      el.classList.add("reveal");
      ro.observe(el);
    });
  }

  /* ---------- Booking form ---------- */
  var form = $("#book-form");
  var fIn = $("#f-in"), fOut = $("#f-out"), fRoom = $("#f-room");
  var fAdults = $("#f-adults"), fKids = $("#f-kids");
  var fName = $("#f-name"), fPhone = $("#f-phone"), fEmail = $("#f-email");
  var fArrival = $("#f-arrival"), fNotes = $("#f-notes");
  var nightsEl = $("#nights"), formError = $("#form-error");
  var summary = $("#summary"), modal = $("#summary-modal");

  [fIn, $("#qb-in")].forEach(function (el) { el.min = todayISO; });
  [fOut, $("#qb-out")].forEach(function (el) { el.min = toISO(addDays(today, 1)); });

  function syncOutMin(inEl, outEl) {
    var a = fromISO(inEl.value);
    if (!a) return;
    var minOut = addDays(a, 1);
    outEl.min = toISO(minOut);
    var b = fromISO(outEl.value);
    if (!b || b <= a) outEl.value = toISO(minOut);
  }

  var availTitle = $("#avail-title"), availList = $("#avail-list");

  function stayRange() {
    var a = fromISO(fIn.value), b = fromISO(fOut.value);
    if (a && b && b > a && a >= today) return { a: a, b: b, chosen: true };
    return { a: today, b: addDays(today, 1), chosen: false };
  }

  function updateAvailability() {
    var r = stayRange(), n = nightsBetween(r.a, r.b);
    availTitle.textContent = r.chosen
      ? "Availability for " + short(r.a) + " to " + short(addDays(r.b, 0)) + " (" + n + " night" + (n === 1 ? "" : "s") + ")"
      : "Available tonight";
    var stripLen = Math.min(Math.max(n + 2, 7), 10);
    availList.innerHTML = "";
    ROOMS.forEach(function (room) {
      var free = isFree(room.name, r.a, r.b);
      var li = document.createElement("li");
      li.className = "avail-item " + (free ? "is-free" : "is-booked") + (fRoom.value === room.name ? " is-picked" : "");
      var days = "";
      for (var i = 0; i < stripLen; i++) {
        var d = addDays(r.a, i), booked = isNightBooked(room.name, d);
        days += '<span class="' + (booked ? "is-booked" : "") + (d < r.b ? " in-range" : "") + '" title="' +
          pretty(d) + (booked ? ": booked" : ": free") + '">' + d.getDate() + "</span>";
      }
      var status;
      if (free) status = r.chosen ? "Available for your dates" : "Available tonight";
      else {
        var nf = nextFree(room.name, r.a, n);
        status = "Booked" + (nf ? " · free from " + short(nf) : "");
      }
      li.innerHTML =
        '<img src="' + room.img + '" alt="" width="56" height="56" loading="lazy">' +
        '<div class="ai-main"><span class="ai-name">' + room.name + '</span>' +
        '<span class="ai-status">' + status + "</span>" +
        '<div class="ai-days" aria-hidden="true">' + days + "</div></div>" +
        '<button type="button" class="btn ' + (fRoom.value === room.name ? "btn-ink" : "btn-line") + '" data-pick="' + room.name + '"' +
        (free ? "" : " disabled") + ">" + (free ? (fRoom.value === room.name ? "Selected" : "Select") : "Unavailable") + "</button>";
      availList.appendChild(li);
    });

    // keep the dropdown honest
    $$("option", fRoom).forEach(function (o) {
      var room = ROOMS.filter(function (x) { return x.name === o.value; })[0];
      if (!room) return;
      var free = isFree(room.name, r.a, r.b);
      o.disabled = !free;
      o.textContent = room.name + (free ? "" : " (booked)");
    });
    if (fRoom.value && fRoom.selectedOptions[0] && fRoom.selectedOptions[0].disabled) {
      var was = fRoom.value;
      fRoom.value = "";
      toast(was + " is booked for those dates. Please choose another room.");
    }

    // badges on the room cards
    $$(".room").forEach(function (card) {
      var btn = card.querySelector("[data-room]");
      if (!btn) return;
      var name = btn.getAttribute("data-room");
      var free = isFree(name, r.a, r.b);
      var meta = card.querySelector(".room-photo");
      var badge = meta.querySelector(".room-status");
      if (!badge) { badge = document.createElement("span"); meta.insertBefore(badge, meta.firstChild); }
      badge.className = "room-status " + (free ? "is-free" : "is-booked");
      badge.textContent = free ? (r.chosen ? "Free on your dates" : "Free tonight") : (r.chosen ? "Booked on your dates" : "Booked tonight");
    });
  }

  (function heroLive() {
    var el = $("#qb-live");
    if (!el) return;
    var free = ROOMS.filter(function (r) { return isFree(r.name, today, addDays(today, 1)); }).length;
    el.textContent = free
      ? free + " of " + ROOMS.length + " rooms free tonight"
      : "Fully booked tonight. Check other dates";
  })();

  availList.addEventListener("click", function (e) {
    var b = e.target.closest("[data-pick]");
    if (!b || b.disabled) return;
    fRoom.value = b.getAttribute("data-pick");
    setError(fRoom, "");
    saveDraft();
    updateAvailability();
  });
  fRoom.addEventListener("change", function () { updateAvailability(); });

  function updateNights() {
    updateAvailability();
    var a = fromISO(fIn.value), b = fromISO(fOut.value);
    if (a && b && b > a) {
      var n = nightsBetween(a, b);
      nightsEl.innerHTML = "<strong>" + n + " night" + (n === 1 ? "" : "s") + "</strong> · " + pretty(a) + " to " + pretty(b);
    } else {
      nightsEl.textContent = "Pick your dates to see the number of nights.";
    }
  }

  fIn.addEventListener("change", function () { syncOutMin(fIn, fOut); updateNights(); saveDraft(); });
  fOut.addEventListener("change", function () { updateNights(); saveDraft(); });

  // Draft persistence (per browser, optional)
  function saveDraft() {
    try {
      var data = {};
      $$("input, select, textarea", form).forEach(function (el) { data[el.name] = el.value; });
      localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    } catch (e) { /* storage unavailable: fine */ }
  }
  function loadDraft() {
    try {
      var data = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
      if (!data) return;
      $$("input, select, textarea", form).forEach(function (el) {
        if (data[el.name] != null && data[el.name] !== "") el.value = data[el.name];
      });
      // drop stale past dates
      var a = fromISO(fIn.value);
      if (a && a < today) { fIn.value = ""; fOut.value = ""; }
    } catch (e) { /* ignore */ }
  }
  loadDraft();
  updateNights();
  form.addEventListener("input", saveDraft);

  // Field errors
  function setError(el, msg) {
    var wrap = el.closest(".field");
    var m = wrap.querySelector(".field-msg");
    if (msg) {
      el.setAttribute("aria-invalid", "true");
      if (!m) {
        m = document.createElement("span");
        m.className = "field-msg";
        m.id = el.id + "-msg";
        wrap.appendChild(m);
      }
      m.textContent = msg;
      el.setAttribute("aria-describedby", m.id);
    } else {
      el.removeAttribute("aria-invalid");
      el.removeAttribute("aria-describedby");
      if (m) m.remove();
    }
  }
  $$("input, select, textarea", form).forEach(function (el) {
    el.addEventListener("input", function () { if (el.getAttribute("aria-invalid")) setError(el, ""); });
    el.addEventListener("change", function () { if (el.getAttribute("aria-invalid")) setError(el, ""); });
  });

  function phoneOk(v) {
    var digits = v.replace(/[^\d+]/g, "");
    return /^(\+?63|0)9\d{9}$/.test(digits) || /^\+\d{8,15}$/.test(digits);
  }

  function validate() {
    var errs = [];
    var a = fromISO(fIn.value), b = fromISO(fOut.value);
    $$("[aria-invalid]", form).forEach(function (el) { setError(el, ""); });

    if (!a) errs.push([fIn, "Choose a check-in date."]);
    else if (a < today) errs.push([fIn, "Check-in can't be in the past."]);
    if (!b) errs.push([fOut, "Choose a check-out date."]);
    else if (a && b <= a) errs.push([fOut, "Check-out must be after check-in."]);
    else if (a && nightsBetween(a, b) > 60) errs.push([fOut, "For stays over 60 nights, please call us."]);
    if (!fRoom.value) errs.push([fRoom, "Choose a room, or pick “Not sure yet”."]);
    else if (a && b && b > a && ROOMS.some(function (x) { return x.name === fRoom.value; }) && !isFree(fRoom.value, a, b))
      errs.push([fRoom, fRoom.value + " is booked for these dates. Choose another room or change your dates."]);
    var ad = parseInt(fAdults.value, 10);
    if (!(ad >= 1 && ad <= 20)) errs.push([fAdults, "At least 1 adult."]);
    var kd = fKids.value === "" ? 0 : parseInt(fKids.value, 10);
    if (!(kd >= 0 && kd <= 20)) errs.push([fKids, "Enter 0 to 20."]);
    if (fName.value.trim().length < 2) errs.push([fName, "Enter your full name."]);
    if (!phoneOk(fPhone.value)) errs.push([fPhone, "Enter a mobile number, e.g. 0917 123 4567."]);
    if (fEmail.value.trim() && !fEmail.checkValidity()) errs.push([fEmail, "Check the email address."]);

    errs.forEach(function (e) { setError(e[0], e[1]); });
    return errs;
  }

  function makeRef(a) {
    var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", s = "";
    var rnd = window.crypto && crypto.getRandomValues ? crypto.getRandomValues(new Uint32Array(4)) : [1, 2, 3, 4].map(function () { return Math.random() * 1e9; });
    for (var i = 0; i < 4; i++) s += chars[rnd[i] % chars.length];
    return "TGB-" + toISO(a).replace(/-/g, "").slice(2) + "-" + s;
  }

  var current = null;

  function buildRequest() {
    var a = fromISO(fIn.value), b = fromISO(fOut.value);
    var n = nightsBetween(a, b);
    var kids = fKids.value === "" ? 0 : parseInt(fKids.value, 10);
    var rows = [
      ["Check-in", pretty(a)],
      ["Check-out", pretty(b)],
      ["Nights", String(n)],
      ["Room", fRoom.value],
      ["Guests", fAdults.value + " adult" + (+fAdults.value === 1 ? "" : "s") + (kids ? ", " + kids + " child" + (kids === 1 ? "" : "ren") : "")],
      ["Name", fName.value.trim()],
      ["Mobile", fPhone.value.trim()]
    ];
    if (fEmail.value.trim()) rows.push(["Email", fEmail.value.trim()]);
    if (fArrival.value) rows.push(["Arrival time", fArrival.value]);
    if (fNotes.value.trim()) rows.push(["Requests", fNotes.value.trim()]);
    return { ref: makeRef(a), rows: rows, checkin: a };
  }

  function requestText(req) {
    var lines = [
      "Hello " + CONTACT.name + ",",
      "",
      "I'd like to request a booking:",
      "",
      "Reference: " + req.ref
    ];
    req.rows.forEach(function (r) { lines.push(r[0] + ": " + r[1]); });
    lines.push("", "Please confirm availability and the rate. Thank you!");
    return lines.join("\n");
  }

  function smsText(req) {
    var get = function (k) { for (var i = 0; i < req.rows.length; i++) if (req.rows[i][0] === k) return req.rows[i][1]; return ""; };
    return "Booking request " + req.ref + ": " + get("Room") + ", " + get("Check-in") + " to " + get("Check-out") +
      " (" + get("Nights") + " night/s), " + get("Guests") + ". Name: " + get("Name") + ", " + get("Mobile") + "." +
      (get("Requests") ? " Notes: " + get("Requests") : "");
  }

  function smsHref(body) {
    // iOS uses "&body=", most others "?body="
    var ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    return "sms:" + CONTACT.phone + (ios ? "&" : "?") + "body=" + encodeURIComponent(body);
  }

  function showSummary(req) {
    current = req;
    $("#s-ref").textContent = req.ref;
    var dl = $("#summary-list");
    dl.innerHTML = "";
    req.rows.forEach(function (r) {
      var wrap = document.createElement("div");
      var dt = document.createElement("dt"); dt.textContent = r[0];
      var dd = document.createElement("dd"); dd.textContent = r[1];
      wrap.appendChild(dt); wrap.appendChild(dd); dl.appendChild(wrap);
    });
    var subject = "Booking request " + req.ref + " (" + req.rows[0][1] + ")";
    $("#send-email").href = "mailto:" + CONTACT.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(requestText(req));
    $("#send-sms").href = smsHref(smsText(req));

    if (typeof modal.showModal === "function") modal.showModal(); else modal.setAttribute("open", "");
    document.body.style.overflow = "hidden";
    $(".modal-body", modal).scrollTop = 0;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var errs = validate();
    if (errs.length) {
      formError.textContent = errs.length === 1 ? "Please fix the highlighted field." : "Please fix the " + errs.length + " highlighted fields.";
      errs[0][0].focus();
      return;
    }
    formError.textContent = "";
    showSummary(buildRequest());
  });

  function closeModal() {
    if (modal.open && typeof modal.close === "function") modal.close(); else modal.removeAttribute("open");
  }
  modal.addEventListener("close", function () { document.body.style.overflow = ""; });
  $(".modal-close", modal).addEventListener("click", closeModal);
  modal.addEventListener("click", function (e) {
    // click on the dimmed backdrop closes
    var r = modal.getBoundingClientRect();
    if (e.target === modal && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) closeModal();
  });
  $("#edit-req").addEventListener("click", function () {
    closeModal();
    fIn.focus({ preventScroll: true });
    $(".booking-card").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  $("#copy-req").addEventListener("click", function () {
    if (!current) return;
    var label = this.querySelector("span");
    copyText(requestText(current) + "\n\nSend to: " + CONTACT.email + " / 0999 884 6076").then(function () {
      label.textContent = "Copied";
      toast("Request copied. Paste it in Messenger, Viber or email.");
      setTimeout(function () { label.textContent = "Copy details"; }, 2200);
    }, function () { toast("Couldn't copy. Please select the text manually."); });
  });

  $("#send-email").addEventListener("click", function () {
    toast("Opening your email app…");
  });

  /* ---------- Quick book (hero) ---------- */
  var qb = $("#quickbook"), qbIn = $("#qb-in"), qbOut = $("#qb-out"), qbErr = $("#qb-error");
  qbIn.addEventListener("change", function () { syncOutMin(qbIn, qbOut); qbErr.textContent = ""; });
  qbOut.addEventListener("change", function () { qbErr.textContent = ""; });
  // Carry any saved draft dates into the hero bar
  if (fIn.value) qbIn.value = fIn.value;
  if (fOut.value) qbOut.value = fOut.value;

  qb.addEventListener("submit", function (e) {
    e.preventDefault();
    var a = fromISO(qbIn.value), b = fromISO(qbOut.value);
    if (!a) { qbErr.textContent = "Choose a check-in date."; qbIn.focus(); return; }
    if (a < today) { qbErr.textContent = "Check-in can't be in the past."; qbIn.focus(); return; }
    if (!b || b <= a) { qbErr.textContent = "Check-out must be after check-in."; qbOut.focus(); return; }
    qbErr.textContent = "";
    fIn.value = qbIn.value;
    fOut.min = toISO(addDays(a, 1));
    fOut.value = qbOut.value;
    var g = parseInt($("#qb-guests").value, 10);
    fAdults.value = String(g);
    updateNights(); saveDraft();
    closeModal();
    bookSection.scrollIntoView({ behavior: "smooth" });
    setUrl("book", true);
    setTimeout(function () { (fRoom.value ? fName : fRoom).focus({ preventScroll: true }); }, 700);
  });

  /* ---------- "Book this room" buttons ---------- */
  $$("[data-room]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      fRoom.value = btn.getAttribute("data-room");
      setError(fRoom, "");
      updateAvailability();
      saveDraft();
      closeModal();
      bookSection.scrollIntoView({ behavior: "smooth" });
      setUrl("book", true);
      setTimeout(function () { (fIn.value ? fName : fIn).focus({ preventScroll: true }); }, 700);
      if (fRoom.value) toast(fRoom.value + " selected");
    });
  });

  /* ---------- Copy address ---------- */
  $("#copy-address").addEventListener("click", function () {
    copyText("PEO Road, Bancao-Bancao, Puerto Princesa City, Palawan 5300, Philippines")
      .then(function () { toast("Address copied"); }, function () { toast("Couldn't copy the address"); });
  });

  /* ---------- Gallery + lightbox ---------- */
  var PHOTOS = [
    { src: "assets/img/hero-balinsasayaw.jpg", cap: "Balinsasayaw: nipa huts over the water" },
    { src: "assets/img/twin-room.jpg", cap: "Twin Room" },
    { src: "assets/img/double-room.jpg", cap: "Double Room" },
    { src: "assets/img/queen-room.jpg", cap: "Queen Room" },
    { src: "assets/img/twin-room-lamps.jpg", cap: "Twin Room with rattan lamps" },
    { src: "assets/img/single-room.jpg", cap: "Single Room" },
    { src: "assets/img/twin-room-2.jpg", cap: "Twin Room, side view" }
  ];
  var ROOM_SETS = { twin: [1, 4, 6], double: [2], queen: [3], single: [5] };

  var lb = $("#lightbox"), lbImg = $("#lb-img"), lbCap = $("#lb-cap");
  var set = [], pos = 0, lastFocus = null;

  function render() {
    var p = PHOTOS[set[pos]];
    lbImg.src = p.src;
    lbImg.alt = p.cap;
    lbCap.textContent = p.cap + (set.length > 1 ? "  ·  " + (pos + 1) + " / " + set.length : "");
    $(".lb-prev", lb).hidden = $(".lb-next", lb).hidden = set.length < 2;
  }
  function openLB(indices, start) {
    set = indices; pos = start || 0; lastFocus = document.activeElement;
    render();
    if (typeof lb.showModal === "function") lb.showModal(); else lb.setAttribute("open", "");
    document.body.style.overflow = "hidden";
  }
  function closeLB() {
    if (lb.open && typeof lb.close === "function") lb.close(); else lb.removeAttribute("open");
  }
  lb.addEventListener("close", function () {
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  });
  function step(d) { pos = (pos + d + set.length) % set.length; render(); }

  $(".lb-close", lb).addEventListener("click", closeLB);
  $(".lb-prev", lb).addEventListener("click", function () { step(-1); });
  $(".lb-next", lb).addEventListener("click", function () { step(1); });
  lb.addEventListener("click", function (e) { if (e.target === lb || e.target.tagName === "FIGURE") closeLB(); });
  lb.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") step(1);
    if (e.key === "ArrowLeft") step(-1);
  });
  // swipe
  var sx = null;
  lb.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", function (e) {
    if (sx == null) return;
    var dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
    sx = null;
  });

  var all = PHOTOS.map(function (_, i) { return i; });
  $$(".g-item").forEach(function (b) {
    b.addEventListener("click", function () { openLB(all, +b.getAttribute("data-index")); });
  });
  $$("[data-gallery]").forEach(function (b) {
    b.addEventListener("click", function () { openLB(ROOM_SETS[b.getAttribute("data-gallery")] || [0], 0); });
  });

  /* ---------- Gallery: scroll-driven strip ---------- */
  var gallery = $("#gallery"), track = $("#gallery-track"), viewport = $("#gallery-viewport");
  var gpNow = $("#gp-now"), gpFill = $("#gp-fill");
  var items = $$(".g-item", track);
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var travel = 0, ticking = false;

  function pinned() { return gallery.classList.contains("is-pinned"); }

  function measure() {
    if (reduce.matches || window.innerWidth < 720) {
      gallery.classList.remove("is-pinned");
      gallery.style.height = "";
      track.style.transform = "";
      return;
    }
    gallery.classList.add("is-pinned");
    travel = Math.max(0, track.scrollWidth - window.innerWidth);
    gallery.style.height = (window.innerHeight + travel) + "px";
    update();
  }

  function update() {
    ticking = false;
    if (!pinned()) return;
    var top = gallery.getBoundingClientRect().top;
    var p = travel ? Math.min(1, Math.max(0, -top / travel)) : 0;
    track.style.transform = "translate3d(" + (-p * travel).toFixed(1) + "px,0,0)";
    gpFill.style.transform = "scaleX(" + p.toFixed(4) + ")";
    var vw = window.innerWidth, best = 0, bestD = Infinity;
    items.forEach(function (it, i) {
      var r = it.getBoundingClientRect();
      var c = (r.left + r.width / 2 - vw / 2) / vw; // distance from centre, about -1..1
      var img = it.firstElementChild;
      img.style.setProperty("--px", (c * -6).toFixed(2) + "%");
      img.style.setProperty("--sc", (1 + Math.min(Math.abs(c), 1) * 0.06).toFixed(3));
      if (Math.abs(c) < bestD) { bestD = Math.abs(c); best = i; }
    });
    gpNow.textContent = (best < 9 ? "0" : "") + (best + 1);
  }

  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  viewport.addEventListener("scroll", function () {
    var max = viewport.scrollWidth - viewport.clientWidth;
    var p = max > 0 ? viewport.scrollLeft / max : 0;
    gpFill.style.transform = "scaleX(" + p.toFixed(4) + ")";
    gpNow.textContent = "0" + (Math.round(p * (items.length - 1)) + 1);
  }, { passive: true });
  window.addEventListener("resize", measure);
  if (reduce.addEventListener) reduce.addEventListener("change", measure);
  $$("img", track).forEach(function (im) { if (!im.complete) im.addEventListener("load", measure); });
  measure();

  // Keyboard: focusing a photo scrolls the page so that photo slides into view
  items.forEach(function (it, i) {
    it.addEventListener("focus", function () {
      if (!pinned() || items.length < 2) return;
      var y = gallery.offsetTop + travel * (i / (items.length - 1));
      window.scrollTo({ top: y, behavior: "smooth" });
    });
  });

  // Reduced-motion fallback: arrow buttons scroll the strip sideways
  $$("[data-scroll]").forEach(function (b) {
    b.addEventListener("click", function () {
      viewport.scrollBy({ left: +b.getAttribute("data-scroll") * viewport.clientWidth * 0.8, behavior: "smooth" });
    });
  });

  /* ---------- Clean URLs (no #hash) ----------
     On the live site: yourdomain.com/rooms, /book, /gallery ...
     (.htaccess serves index.html for these paths).
     Opened from disk (file://): links scroll without adding #. */
  var SECTIONS = ["about", "rooms", "dining", "gallery", "book", "location", "contact"];
  var isHttp = /^https?:$/.test(location.protocol);

  function scrollToSection(id, smooth) {
    var behavior = smooth && !reduce.matches ? "smooth" : "auto";
    if (id === "top") { window.scrollTo({ top: 0, behavior: behavior }); return; }
    var el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: behavior, block: "start" });
  }

  function setUrl(id, push) {
    if (isHttp) {
      var path = id === "top" ? "/" : "/" + id;
      if (location.pathname !== path) history[push ? "pushState" : "replaceState"]({ id: id }, "", path + location.search);
    } else if (location.hash) {
      history.replaceState(null, "", location.pathname + location.search);
    }
  }

  function idFromLocation() {
    var seg = location.pathname.replace(/\/+$/, "").split("/").pop();
    if (SECTIONS.indexOf(seg) > -1) return seg;
    var h = location.hash.slice(1);
    if (h === "top" || SECTIONS.indexOf(h) > -1) return h;
    return null;
  }

  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute("href").slice(1);
    if (!id || (id !== "top" && !document.getElementById(id))) return;
    e.preventDefault();
    scrollToSection(id, true);
    setUrl(id, true);
    if (a.classList.contains("skip")) { var f = $("#f-in"); if (f) f.focus({ preventScroll: true }); }
  });

  window.addEventListener("popstate", function () {
    scrollToSection(idFromLocation() || "top", true);
  });

  // Deep link on first load (/rooms, /book, or an old #hash link)
  var startId = idFromLocation();
  if (startId) {
    setUrl(startId, false);
    window.addEventListener("load", function () { scrollToSection(startId, false); });
  } else if (isHttp && /\/index\.html$/.test(location.pathname)) {
    history.replaceState(null, "", location.pathname.replace(/index\.html$/, "") + location.search);
  }
})();
