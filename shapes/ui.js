import { DIM, daily } from './generate.mjs';

const SHAPES = [
  "fa-heart",
  "fa-circle",
  "fa-star",
  "fa-square"
];

const CARDS_SELECTED = new Set();
let progress = [];
let finish_time = 0;

/* helpers */
function binToTup(card) {
  let res = [];
  for (let i = 0; i < Math.ceil(DIM / 2); i++)
    res.push((card >> (2 * i)) & 3);
  return res;
}

function quadKey(quad) {
  return [...quad].sort().join();
}

/* create card */
function createDomCard(card) {
  const attrs = binToTup(card);
  const number = attrs[1];
  const shape = attrs[2];

  const cardEl = document.createElement("div");
  cardEl.className = "card";

  const inner = document.createElement("div");
  inner.className = `card-inner count-${number + 1}`;

  for (let i = 0; i <= number; i++) {
    const icon = document.createElement("i");
    icon.classList.add("fas", SHAPES[shape]);
    inner.appendChild(icon);
  }

  cardEl.appendChild(inner);
  return cardEl;
}

/* click logic */
function onCardClicked(cardNum, el) {
  el.classList.toggle("selected");

  if (CARDS_SELECTED.delete(cardNum)) return;
  CARDS_SELECTED.add(cardNum);

  if (CARDS_SELECTED.size === 4) {
    CARDS_SELECTED.clear();
    document.querySelectorAll(".card.selected")
      .forEach(c => c.classList.remove("selected"));
  }
}

/* setup */
function init() {
  const timestamp = new Date();
  const PUZZLE = daily(Math.floor(timestamp.getTime() / 86400000));

  document.getElementById("date").textContent =
    timestamp.toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric"
    });

  document.getElementById("nquads").textContent = PUZZLE.n;
  document.getElementById("nquads2").textContent = PUZZLE.n;

  const cardsEl = document.getElementById("cards");
  PUZZLE.cards.forEach(c => {
    const el = createDomCard(c);
    el.addEventListener("click", () => onCardClicked(c, el));
    cardsEl.appendChild(el);
  });

  document.getElementById("congrats").textContent =
    ["Well done!", "Awesome!", "You did it!"][Math.floor(Math.random() * 3)];
}

document.addEventListener("DOMContentLoaded", init);
