document.addEventListener("DOMContentLoaded", () => {
    const homeScreen = document.getElementById("home-screen");
    const gameScreen = document.getElementById("game-screen");
    const winScreen = document.getElementById("win-screen");
    const loseScreen = document.getElementById("lose-screen");
    const singlePlayerBtn = document.getElementById("single-player-btn");
    const homeBtn = document.getElementById("home-btn");
    const nextLevelBtn = document.getElementById("next-level-btn");
    const gameBoard = document.getElementById("game-board");
    const levelDisplay = document.getElementById("level");
    const timerDisplay = document.getElementById("time-left");
    const winMessage = document.getElementById("win-message");
    const singlePlayerScore = document.getElementById("score"); // inside "score-display"

    let level = 1;
    let matches = 0;
    let timer;
    let timeLeft = 60;
    
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
      level = 1;
      matches = 0;
      singlePlayerScore.textContent = "0";
      levelDisplay.textContent = "1";
      clearInterval(timer);
    }
    
    // Start countdown timer
    function startTimer() {
      clearInterval(timer);
      timeLeft = 80;
      timerDisplay.textContent = timeLeft;
      
      timer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
    
        if (timeLeft <= 0) {
          clearInterval(timer);
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
      cardValues.sort(() => Math.random() - 0.5);
      gameBoard.innerHTML = "";
      gameBoard.style.gridTemplateColumns = `repeat(${Math.ceil(numCards / 3)}, 1fr)`;
    
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
          card.innerHTML = `<img src="images/card-back.png" alt="Card Back">`;
        });
      }
    }
    

    function updateScore() {
        let currentScore = parseInt(singlePlayerScore.textContent);
        singlePlayerScore.textContent = currentScore + 1;
    }
    

    function checkWinCondition() {
      if (matches >= (level + 2)) {
        clearInterval(timer);
        winMessage.innerText = "WIN!";
        showScreen(winScreen);
      }
    }
    
    function startGame() {
      levelDisplay.textContent = level;
      generateCards(level);
      startTimer();
      showScreen(gameScreen);
    }
    
    
    singlePlayerBtn.addEventListener("click", () => {
      resetGame();
      startGame();
    });
    


document.querySelectorAll(".home-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      resetGame();
      showScreen(homeScreen);
    });
  });
    
    

    nextLevelBtn.addEventListener("click", () => {
      if (level < 3) {
        level++;
        levelDisplay.textContent = level;
        generateCards(level);
        startTimer();
        showScreen(gameScreen);
      } else {
        clearInterval(timer);
        winMessage.innerText = "All three levels completed";
        nextLevelBtn.style.display = "none";
        showScreen(winScreen);
      }
    });
  });
  