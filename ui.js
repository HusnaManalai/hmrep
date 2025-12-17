import {CARDS, DIM, daily} from './generate.mjs'

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
        
        if ( four.reduce((a, b) => a^b) == 0 ) {
            // Correct quad
            if ( !progress.includes(key) ) {
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
    for (let i = 0; i < Math.ceil(DIM/2); i++)
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
      ["fa-solid", "fa-worm"]
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
    timestamp.toLocaleDateString("default", {
        "timeZone": "UTC",
        "day": "numeric",
        "month": "long",
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

    // Set up the timer
    const time_container = document.getElementById("timer");
    var start_time = Date.now();
    let updateTimer = () => {

        let ms = Date.now() - start_time;

        if (finish_time > 0) {
            // This is the last update.
            ms = finish_time - start_time;
            // The green text will have already been added
        } else {
            // Figure out when we need to next update the timer.
            // We do this first to keep the timer accurate
            let ms_to_next_update = (Math.ceil(ms/1000) * 1000) - ms;
            // Set a timeout for the next update
            setTimeout(() => requestAnimationFrame(updateTimer), ms_to_next_update);
        }

        // Now update the actual timer text
        // Get ISO time in hours, as the time elapsed can never be more than 24 hrs.
        time_container.textContent = (new Date(ms)).toISOString().substr(11, 8)

    }
    // We want the timer to only update when the browser is rendering.
    // We also want it to update once per second!
    requestAnimationFrame(updateTimer)

    // Populate found-quads display
    // Create dummy quad so that the width of the quads display will be correct
    createDomQuad([0, 0, 0, 0]).classList.add("dummy");
    // Check progress in localstorage
    if (!(localStorage.getItem("progress_day") >= day)) {
        // No progress or progress is outdated
        localStorage.setItem("progress_day", day);
        localStorage.setItem("start_time", start_time);
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

    // Set a random congratulation message
    const messages = ["YOU FOUND ALL QUADS ᯓ★ ₊˚⊹ ", "GOOD JOB  ◝(ᵔᗜᵔ)◜ ", " ₊˚⊹♡ ₍ᐢ. .ᐢ₎   AWSOME YOU FOUND THEM ALL   ₍ᐢ. .ᐢ₎ ₊˚⊹♡ ", "  ݁ ˖ ݁𖥔 . NICE JOB FINDING ALL QUADS . ݁𖥔 ݁ ˖ ݁ ", "˗ˏˋ ★ ˎˊ˗  YAY YOU DID IT  ˗ˏˋ ★ ˎˊ˗", "★  ALL DONE  ★"];
    document.getElementById("congrats").textContent = messages[Math.floor(Math.random() * messages.length)];

// -------- Reset puzzle (timer + found quads) --------
    document.getElementById("reset-all").addEventListener("click", () => {
    // Optional confirmation (recommended)
        if (!confirm("Reset today’s puzzle? This will clear all found quads and reset the timer.")) return;

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

    // Clear sidebar quads, then recreate the dummy sizing quad
        const foundScroll = document.getElementById("found-scroll");
        foundScroll.innerHTML = "";
        createDomQuad([0, 0, 0, 0]).classList.add("dummy");
        applyFinalFoundLayout();

    // IMPORTANT: restart timer baseline used by updateTimer()
        start_time = newStart;
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

  // Must match .container width/height in CSS
  const BOARD_W = 1100;
  const BOARD_H = 820;


  let scale = Math.min(vw / BOARD_W, vh / BOARD_H);

 // Detect phones / small screens
  if (vw < 700) {
    scale *= 1.15;
} 

// Safety clamp (never overflow screen)
scale = Math.min(scale, 1);

container.style.transform = `translate(-50%, -50%) scale(${scale})`;

}




// Check the day
const timestamp = new Date();
const day = Math.floor(timestamp.getTime() / (1000 * 60 * 60 * 24));
// Start generating puzzle even before DOM content is ready
const PUZZLE = daily(day);

// Once DOM is ready, populate the page
if (document.readyState === "complete" ||
 (document.readyState !== "loading" && !document.documentElement.doScroll) )
    createListeners();
else
    document.addEventListener("DOMContentLoaded", createListeners);
