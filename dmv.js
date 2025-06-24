let correctAnswer = null;

function generatePuzzle() {
  const questionEl = document.querySelector("#puzzle-section p");
  const levels = ["easy", "medium", "hard", "insane"];
  const level = levels[Math.floor(Math.random() * levels.length)];
  let question = "";
  let answer = 0;

  if (level === "easy") {
    const a = Math.floor(Math.random() * 10);
    const b = Math.floor(Math.random() * 10);
    question = `What is ${a} + ${b}?`;
    answer = a + b;
  } else if (level === "medium") {
    const a = Math.floor(Math.random() * 20);
    const b = Math.floor(Math.random() * 10 + 1);
    const c = Math.floor(Math.random() * 10);
    question = `What is ${a} × ${b} - ${c}?`;
    answer = a * b - c;
  } else if (level === "hard") {
    const a = Math.floor(Math.random() * 50 + 10);
    question = `What is the square root of ${a * a}?`;
    answer = a;
  } else {
    // INSANE MODE 🧠💥
    const a = Math.floor(Math.random() * 30 + 1);
    const b = Math.floor(Math.random() * 30 + 1);
    const c = Math.floor(Math.random() * 20 + 1);
    //cosnt c = math.floor(math.r
    question = `Solve: (${a}² + ${b}² - ${c}) ÷ ${c}`;
    answer = (a * a + b * b - c) / c;
  }

  correctAnswer = answer;
  questionEl.textContent = `Solve this to continue: ${question}`;
}

function checkPuzzle() {
  const input = document.getElementById("puzzle-answer").value.trim();
  const feedback = document.getElementById("puzzle-feedback");
  const submitBtn = document.querySelector("#puzzle-section button");

  // Allow floats and parse as number
  if (parseFloat(input) === correctAnswer) {
    document.getElementById("puzzle-section").classList.add("hidden");
    document.getElementById("ticket-section").classList.remove("hidden");

    // Confetti 🎉
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });
  } else {
    feedback.textContent = "Nope! Try again.";
    submitBtn.classList.add("shake");
    setTimeout(() => submitBtn.classList.remove("shake"), 500);
  }
}

  
  function generateZip() {
    const ticketInput = document.getElementById("ticket-number").value.trim();
    const result = document.getElementById("zip-result");
  
    const validTickets = Array.from({ length: 24 }, (_, i) => `#${String(i + 1).padStart(4, '0')}`);
  
    if (validTickets.includes(ticketInput)) {
      const zip = Math.floor(10000 + Math.random() * 89999); // 5-digit random ZIP
      const mon = Math.floor(10 + Math.random() * 899)
      result.innerHTML = "";
      let i = 0;
      const zipStr = `Write this ZIP code on your ticket: ${zip}, you owe the DMV: $${mon}`;

      const interval = setInterval(() => {
        result.innerHTML += zipStr.charAt(i); 


        //the money 
        i++;
        if (i === zipStr.length) clearInterval(interval);
      }, 40); // Typing effect
    } else {
      result.textContent = "Invalid ticket number. Please enter one from #0001 to #0024.";
    }
  }
  

  // Initialize puzzle on page load
window.onload = generatePuzzle;
