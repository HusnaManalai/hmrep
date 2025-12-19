import { DIM, daily } from './generate.mjs'

// Keeps track of selected cards and their animations
const CARDS_SELECTED = new Set();
function onCardClicked(cardNum, cardEl) {
  cardEl.classList.toggle("selected");
  // animate icons once on click
  cardEl.querySelectorAll(".icon").forEach(i => {
    i.classList.remove("fa-bounce");   // reset if already there
    //void i.offsetWidth;              // force reflow so it can restart
    requestAnimationFrame(() => i.classList.add("fa-bounce"));
  });

  // remove it so it doesn’t keep looping
  setTimeout(() => {
    cardEl.querySelectorAll(".icon").forEach(i => i.classList.remove("fa-bounce"));
  }, 700);

  if (CARDS_SELECTED.delete(cardNum))
    return;

  // Adding a card
  CARDS_SELECTED.add(cardNum);

  if (CARDS_SELECTED.size == 4) {
    // Need to call Array.from to freeze the collection of elements
    const cardEls = Array.from(document.getElementsByClassName("card selected"));

    const four = Array.from(CARDS_SELECTED);
    const key = quadKey(four);
    // Immediately clear CARDS_SELECTED and remove .selected
    CARDS_SELECTED.clear();
    cardEls.forEach(e => {
      e.classList.remove("selected");
      // .animating prevents click events on them
      e.classList.add("animating");
    });

    // Three cases:
    // * new quad
    //   -> green, "pop", add to found quads
    // * quad already found
    //   -> gray? blue?
    // * not a quad
    //   -> red, shake
    // => all cases: deselect

    if (four.reduce((a, b) => a ^ b) == 0) {
      // Correct quad
      if (!progress.includes(key)) {
        // New quad
        // Animate
        cardEls.forEach(x => x.classList.add("correct"));
        // Save the found quad
        progress.push(key);
        saveProgress();
        // Check if all quads have been found
        if (progress.length == PUZZLE.n) {
          // Stop the timer
          finish_time = Date.now();
          localStorage.setItem("finish_time", finish_time);
          // Also maybe play a "finished" animation?
          setTimeout(() => document.body.classList.add("finished"), 500);
        }
        // Wait a little bit for the animation, and then put the found quad in the sidebar
        setTimeout(() => {
          createDomQuad(four);
          applyFinalFoundLayout();
        }, 250);
      }
      else {
        // Previously found quad
        cardEls.forEach(x => x.classList.add("already-found"));
        // Highlight it on the side
        const prev = document.getElementById(key);
        prev.classList.add("highlight");
        prev.addEventListener("animationend", () => prev.classList.remove("highlight"), { once: true });
      }

    } else {
      // Not a quad
      cardEls.forEach(x => x.classList.add("incorrect"));
    }

    // Remove any styles that we added here once the animation we chose ends
    cardEls[0].addEventListener("animationend", () =>
      cardEls.forEach(x => x.classList.remove("animating", "incorrect", "correct", "already-found")),
      { once: true })

  }

}

function applyFinalFoundLayout() {
  const fs = document.getElementById("found-scroll");
  if (!fs) return;

  fs.classList.remove("final-5", "final-7");

  if (progress.length === PUZZLE.n) {
    fs.classList.add(PUZZLE.n === 5 ? "final-5" : "final-7");
  }
}

// Stores found quads in localstorage
var progress = [];
var finish_time = 0;
function saveProgress() {
  localStorage.setItem("progress_quads", JSON.stringify(progress));
}

// Helper function to split a binary card into an array of attributes
function binToTup(card) {
  let res = [];
  for (let i = 0; i < Math.ceil(DIM / 2); i++)
    res.push((card >> (2 * i)) & 3);
  return res;
}
// Computes a string key from a quad
function quadKey(quad) {
  return Array.from(quad).sort().join();
}
function deQuadKey(key) {
  return key.split(",").map(t => parseInt(t));
}

// Creates a card element and styles it
function createDomCard(card) {

  const SHAPES = [
    ["fa-solid", "fa-heart"],
    ["fa-solid", "fa-square"],
    ["fa-solid", "fa-star"],
    ["fa-solid", "fa-circle"]
  ];

  // Convert to a base 4 array
  const attrs = binToTup(card);
  const color = attrs[0];
  const number = attrs[1];
  const shape = attrs[2];

  let cardEl = document.createElement("div");
  cardEl.classList.add("card");

  let cardElInner = document.createElement("div");
  cardElInner.classList.add("card-inner");
  cardEl.appendChild(cardElInner);

  const count = number + 1;                 // number is 0–3 → count is 1–4
  cardElInner.classList.add(`count-${count}`);

  // Set attributes
  cardEl.classList.add(`color-${color}`);

  // Add icons
  for (let n = 0; n <= number; n++) {
    let icon = document.createElement("i");
    icon.classList.add(...SHAPES[shape], "icon");

    cardElInner.appendChild(icon);
  }

  return cardEl;
}

// Adds a found or recalled quad to the sidebar, and sets the number on the sidebar
function createDomQuad(quad) {
  let container = document.createElement("div");
  container.classList.add("found-quad");
  container.id = quadKey(quad);

  quad.forEach(q => container.appendChild(createDomCard(q)));
  document.getElementById("found-scroll").appendChild(container);

  // Update the count
  document.getElementById("nfound").textContent = progress.length;

  return container;
}

// Populates the page content
function createListeners() {
  document.getElementById("date").textContent =
    timestamp.toLocaleDateString("en-US", {
      "timeZone": "America/New_York",
      "day": "numeric",
      "month": "numeric",
      "year": "numeric"
    })

  document.getElementById("nquads").textContent = PUZZLE.n;
  document.getElementById("nquads2").textContent = PUZZLE.n;

  // Populate the card display
  const card_container = document.getElementById("cards");
  PUZZLE.cards.forEach(c => {
    let el = createDomCard(c);
    el.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      el.setPointerCapture?.(e.pointerId);
      onCardClicked(c, el);
    });
    card_container.appendChild(el)
  });

  // ---------------- Timer (fixed) ----------------
  const time_container = document.getElementById("timer");

  // start_time is updated when we load localStorage / reset
  var start_time = Date.now();

  // Keep timer handles so we can stop/restart cleanly
  let timerTimeoutId = null;
  let timerRafId = null;

  function stopTimerLoop() {
    if (timerTimeoutId !== null) {
      clearTimeout(timerTimeoutId);
      timerTimeoutId = null;
    }
    if (timerRafId !== null) {
      cancelAnimationFrame(timerRafId);
      timerRafId = null;
    }
  }

  function formatHHMMSS(ms) {
    // show true elapsed hours (not modulo 24)
    const totalSeconds = Math.floor(ms / 1000);
    const s = totalSeconds % 60;
    const m = Math.floor(totalSeconds / 60) % 60;
    const h = Math.floor(totalSeconds / 3600);

    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }

  function startTimerLoop() {
    stopTimerLoop();

    const updateTimer = () => {
      let ms = Date.now() - start_time;

      if (finish_time > 0) {
        // Freeze at the finish time and STOP looping
        ms = finish_time - start_time;
        time_container.textContent = formatHHMMSS(ms);
        stopTimerLoop();
        return;
      }

      time_container.textContent = formatHHMMSS(ms);

      // schedule next update close to the next second boundary
      const remainder = ms % 1000;
      let ms_to_next_update = 1000 - remainder;

      // never spam 0ms timeouts (can cause "crash" / overload)
      if (ms_to_next_update < 16) ms_to_next_update = 16;

      timerTimeoutId = setTimeout(() => {
        timerRafId = requestAnimationFrame(updateTimer);
      }, ms_to_next_update);
    };

    timerRafId = requestAnimationFrame(updateTimer);
  }
  // ------------------------------------------------

  // Populate found-quads display
  // Check progress in localstorage
  if (!(localStorage.getItem("progress_day") >= day)) {
    // No progress or progress is outdated
    localStorage.setItem("progress_day", day);
    localStorage.setItem("start_time", start_time);
    localStorage.removeItem("finish_time");
    progress = [];
    saveProgress();
  }
  else {
    // Load progress
    progress = JSON.parse(localStorage.getItem("progress_quads")) || [];
    // Set the timer correctly
    start_time = parseInt(localStorage.getItem("start_time") || Date.now()); // If localstorage got messed up, reset the start time
    finish_time = parseInt(localStorage.getItem("finish_time") || 0);
    // Populate the sidebar
    // Don't animate these quads
    progress.forEach(q => createDomQuad(deQuadKey(q)));
    applyFinalFoundLayout();
    // Set the finished class if we're done
    if (progress.length == PUZZLE.n)
      document.body.classList.add("finished");
  }

  // Start (or freeze) the timer after we load localStorage state
  startTimerLoop();


  // -------- Reset puzzle (timer + found quads) --------
  document.getElementById("reset-all").addEventListener("click", () => {
    // Optional confirmation (recommended)
    if (!confirm("ARE YOU SURE??")) return;

    // Reset in-memory state
    progress = [];
    CARDS_SELECTED.clear();
    finish_time = 0;

    // Reset storage for TODAY
    localStorage.setItem("progress_day", String(day));
    localStorage.setItem("progress_quads", JSON.stringify(progress));

    const newStart = Date.now();
    localStorage.setItem("start_time", String(newStart));
    localStorage.removeItem("finish_time");

    // Reset UI: count + timer + finished banner
    document.getElementById("nfound").textContent = "0";
    document.getElementById("timer").textContent = "00:00:00";
    document.body.classList.remove("finished");

    // Clear sidebar quads
    const foundScroll = document.getElementById("found-scroll");
    foundScroll.innerHTML = "";
    applyFinalFoundLayout();

    // IMPORTANT: restart timer baseline used by updateTimer()
    start_time = newStart;
    startTimerLoop();
  });

  // Fit board to screen (scale only; layout stays the same)
  fitToScreen();
  window.addEventListener("resize", fitToScreen);
  window.addEventListener("fullscreenchange", fitToScreen);
  setTimeout(fitToScreen, 0);

}

function fitToScreen() {
  const container = document.querySelector(".container");
  const viewport = document.querySelector(".viewport");

  const vw = viewport ? viewport.clientWidth : window.innerWidth;
  const vh = viewport ? viewport.clientHeight : window.innerHeight;

  // Must match .container size in CSS
  const BOARD_W = 1100;
  const BOARD_H = 820;

  // Small safety margin so shadows don’t get clipped
  const SAFE = 12;

  const scale = Math.min(
    (vw - SAFE) / BOARD_W,
    (vh - SAFE) / BOARD_H,
    1
  );

  container.style.transform =
    `translate(-50%, -50%) scale(${scale})`;
}

function nyDayKey() {
  // "12/17/2025" in NY time
  const ny = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const [mm, dd, yyyy] = ny.split("/");
  return Number(`${yyyy}${mm}${dd}`); // 20251217
}

// Check the day
const timestamp = new Date();
const day = nyDayKey();
// Start generating puzzle even before DOM content is ready
const PUZZLE = daily(day);

// Once DOM is ready, populate the page
if (document.readyState === "complete" ||
  (document.readyState !== "loading" && !document.documentElement.doScroll))
  createListeners();
else
  document.addEventListener("DOMContentLoaded", createListeners);
