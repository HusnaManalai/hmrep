document.addEventListener("DOMContentLoaded", () => {
  const homeScreen = document.getElementById("home-screen");
  const gameScreen = document.getElementById("game-screen");
  const winScreen = document.getElementById("win-screen");
  const loseScreen = document.getElementById("lose-screen");
  const singlePlayerBtn = document.getElementById("single-player-btn");
  const nextLevelBtn = document.getElementById("next-level-btn");
  const gameBoard = document.getElementById("game-board");
  const levelDisplay = document.getElementById("level");
  const timerDisplay = document.getElementById("time-left");
  const winMessage = document.getElementById("win-message");
    const singlePlayerScore = document.getElementById("score"); // inside "score-display"

    let level = 1;
    let timer;
    let matches = 0;
    let timeLeft = 80;

    /*
    Make card deck a global variable
    Make a card class

    startGame
    resetGame
    winScreen
    nextLevel

    startTimer
    createCards
    */

    //In progress: not used yet
    function winGame(){
      winScreen.classList.remove("hidden");
    }
    
    function showScreen(screen) {
      [homeScreen, gameScreen, winScreen, loseScreen].forEach(s => s.classList.add("hidden"));
      screen.classList.remove("hidden");
      if (screen === winScreen) {
        if (winMessage.innerText.includes("Failed")) {
          nextLevelBtn.style.display = "none";
        } else {
          nextLevelBtn.style.display = "block";
        }
      }
    }
    
    // Reset game state and clear timer
    function resetGame() {
      clearInterval(timer);
      level = 1;
      singlePlayerScore.textContent = 0;
      levelDisplay.textContent = 1;
      timerDisplay.textContent = 80;
      gameBoard.innerHTML = "";

    }
    
    // Start countdown timer
    function startTimer() {
      timeLeft = 80;
      timerDisplay.textContent = timeLeft;
      clearInterval(timer);
      timer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;

        if (timeLeft <= 0) {

          nextLevelBtn.style.display = "none";
          showScreen(loseScreen);
        }
      }, 1000);
    }
    
    function generateCards(level) {
      matches = 0;
      const numCards = (level + 2) * 3;
      const cardValues = [];
      for (let i = 0; i < numCards / 3; i++) {
        cardValues.push(i, i, i);
      }
      // Shuffle cards
      shuffle(cardValues);
      gameBoard.innerHTML = "";
      gameBoard.style.gridTemplateColumns = `repeat(${Math.ceil(numCards / 4)}, 1fr)`;

      cardValues.forEach(value => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.dataset.value = value;
        card.innerHTML = `<img src="images/bg.png" alt="Card Back">`;
        
        card.addEventListener("click", function() {
          if (
            !this.classList.contains("flipped") &&
            gameBoard.querySelectorAll(".flipped").length < 3
            ) {
            this.classList.add("flipped");
          this.innerHTML = `<img src="images/${this.dataset.value}.png" alt="Card Face">`;

          const flippedCards = gameBoard.querySelectorAll(".flipped");
          if (flippedCards.length === 3) {
            setTimeout(() => {
              checkMatch(Array.from(flippedCards));
              flippedCards.forEach(card => {
                card.classList.remove("flipped");
                if (card.style.visibility !== "hidden") {
                  card.innerHTML = `<img src="images/bg.png" alt="Card Back">`;
                }
              });
            }, 600);
          }
        }
      });
        
        gameBoard.appendChild(card);
      });
    }
    
    function checkMatch(cards) {
      const [card1, card2, card3] = cards;
      if (
        card1.dataset.value === card2.dataset.value &&
        card2.dataset.value === card3.dataset.value
        ) {
        matches++;
      cards.forEach(card => (card.style.visibility = "hidden"));
      updateScore();
      checkWinCondition();
    } else {
      cards.forEach(card => {
        card.classList.remove("flipped");
        card.innerHTML = `<img src="images/bg.png" alt="Card Back">`;
      });
    }
  }


  function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}


  function updateScore() {
    let currentScore = parseInt(singlePlayerScore.textContent);
    singlePlayerScore.textContent = currentScore + 1;
  }


  function checkWinCondition() {
    if (matches >= (level + 2)) {

      winMessage.innerText = "WIN!";
      showScreen(winScreen);
    }
  }

    //changed from startGame
  function startLevel() {
    levelDisplay.textContent = level;
    generateCards(level);
    startTimer();
    showScreen(gameScreen);
  }


  singlePlayerBtn.addEventListener("click", () => {
    resetGame();
    startLevel();
  });



  document.querySelectorAll(".home-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      resetGame();
      showScreen(homeScreen);
    });
  });




  nextLevelBtn.addEventListener("click", () => {
    if (level < 5) {
      level++;
      levelDisplay.textContent = level;
      generateCards(level);
      startTimer();
      showScreen(gameScreen);
    } else {
      winMessage.innerText = "All levels completed";
      nextLevelBtn.style.display = "none";
      showScreen(winScreen);
    }
  });
});
