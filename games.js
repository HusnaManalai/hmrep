document.addEventListener("DOMContentLoaded", () => {
    const homeScreen = document.getElementById("home-screen");
    const gameScreen = document.getElementById("game-screen");
    const winScreen = document.getElementById("win-screen");
    const loseScreen = document.getElementById("lose-screen");
    const singlePlayerBtn = document.getElementById("single-player-btn");
    const winHomeBtn = document.getElementById("home-btn");
    const loseHomeBtn = document.getElementById("home-btn");
    const nextLevelBtn = document.getElementById("next-level-btn");
    const gameBoard = document.getElementById("game-board");
    const levelDisplay = document.getElementById("level");
    const timerDisplay = document.getElementById("time-left");
    const winMessage = document.getElementById("win-message");
    const singlePlayerScore = document.getElementById("score"); // inside "score-display"
    const musicToggleBtn = document.getElementById("music-toggle-btn");
    const bgMusic = new Audio("images/3.mp3");
    
    bgMusic.loop = true;
    bgMusic.volume = 0.5;
    let isMusicPlaying = false;
    musicToggleBtn.addEventListener("click", () => {
      if (!isMusicPlaying) {
        bgMusic.play();
        musicToggleBtn.innerText = "Music On";
        isMusicPlaying = true;
      } else {
        bgMusic.pause();
        musicToggleBtn.innerText = "Music Off";
        isMusicPlaying = false;
      }
    });
    
    let level = 1;
    let matches = 0;
    let timer;
    let timeLeft = 60;
    
    // Utility: switch visible screen
    function showScreen(screen) {
      // Hide all screens
      [homeScreen, gameScreen, winScreen, loseScreen].forEach(s => s.classList.add("hidden"));
      screen.classList.remove("hidden");
      
      // When showing winScreen, control the Next Level button display:
      if (screen === winScreen) {
        // If winMessage indicates failure, hide the Next Level button.
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
      currentPlayer = 1;
      // Reset scores regardless of mode:
      singlePlayerScore.textContent = "0";
      levelDisplay.textContent = "1";
      clearInterval(timer);
    }
    
    // Start countdown timer
    function startTimer() {
      clearInterval(timer);
      timeLeft = 20;
      timerDisplay.textContent = timeLeft;
      
      timer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
    
        if (timeLeft <= 0) {
          clearInterval(timer);
          // Hide Next Level button on loss
          nextLevelBtn.style.display = "none";
          // Show lose screen instead of win screen
          showScreen(loseScreen);
        }
      }, 1000);
    }
    
    // Generate game cards for the current level
    function generateCards(level) {
      matches = 0;
      const numCards = (level + 2) * 3;
      const cardValues = [];
      
      // Create three copies for each unique value
      for (let i = 0; i < numCards / 3; i++) {
        cardValues.push(i, i, i);
      }
      // Shuffle cards
      cardValues.sort(() => Math.random() - 0.5);


      
      gameBoard.innerHTML = "";
      // Dynamically adjust grid columns:
      gameBoard.style.gridTemplateColumns = `repeat(${Math.ceil(numCards / 3)}, 1fr)`;
    
      cardValues.forEach(value => {
        const card = document.createElement("div");
        card.classList.add("card");
        // Store the card face image value in dataset
        card.dataset.value = value;
        // Initially show card back
        card.innerHTML = `<img src="images/bg.png" alt="Card Back">`;
        
        card.addEventListener("click", function() {
          // Only flip if not already flipped and fewer than 3 cards flipped:
          if (
            !this.classList.contains("flipped") &&
            gameBoard.querySelectorAll(".flipped").length < 3
          ) {
            this.classList.add("flipped");
            // Show card face image when flipped
            this.innerHTML = `<img src="images/${this.dataset.value}.png" alt="Card Face">`;
            
            const flippedCards = gameBoard.querySelectorAll(".flipped");
            if (flippedCards.length === 3) {
              setTimeout(() => {
                checkMatch(Array.from(flippedCards));
                flippedCards.forEach(card => {
                  card.classList.remove("flipped");
                  // Reset card if not matched
                  if (card.style.visibility !== "hidden") {
                    card.innerHTML = `<img src="images/bg.png" alt="Card Back">`;
                  }
                });
              }, 500);
            }
          }
        });
        
        gameBoard.appendChild(card);
      });
    }
    
    // Check if three flipped cards match
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
        winMessage.innerText = "🎉 Win 🎉";
        showScreen(winScreen);
      }
    }
    
    // Start game: generate cards, start timer, and show game screen
    function startGame() {
      levelDisplay.textContent = level;
      generateCards(level);
      startTimer();
      showScreen(gameScreen);
    }
    
    
    // Single-player mode
    singlePlayerBtn.addEventListener("click", () => {
      resetGame();
      startGame();
    });
    


    winHomeBtn.addEventListener("click", () => {
      resetGame();
      showScreen(homeScreen);
    });
    
    loseHomeBtn.addEventListener("click", () => {
      resetGame();
      showScreen(homeScreen);
    });
    
    // Next Level button (only works when player wins)
    nextLevelBtn.addEventListener("click", () => {
      if (level < 5) {
        level++;
        levelDisplay.textContent = level;
        generateCards(level);
        startTimer();
        showScreen(gameScreen);
      } else {
        clearInterval(timer);
        winMessage.innerText = "All five levels completed";
        nextLevelBtn.style.display = "none";
        showScreen(winScreen);
      }
    });
  });
  