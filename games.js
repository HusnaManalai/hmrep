document.addEventListener("DOMContentLoaded", () => {
    const homeScreen = document.getElementById("home-screen");
    const gameScreen = document.getElementById("game-screen");
    const winScreen = document.getElementById("win-screen");
    const gameBoard = document.getElementById("game-board");
    const singlePlayerBtn = document.getElementById("single-player-btn");
    const multiplayerBtn = document.getElementById("multiplayer-btn");
    const homeBtn = document.getElementById("home-btn");
    const backHomeBtn = document.getElementById("back-home-btn");
    const nextLevelBtn = document.getElementById("next-level-btn");
    const levelDisplay = document.getElementById("level");
    const scoreDisplay = document.getElementById("score-display");
    const multiplayerScore = document.getElementById("multiplayer-score");
    const player1ScoreDisplay = document.getElementById("player1-score");
    const player2ScoreDisplay = document.getElementById("player2-score");
    const timerDisplay = document.getElementById("time-left");
    const winMessage = document.getElementById("win-message");
  
    let level = 1;
    let currentCards = [];
    let matches = 0;
    let isMultiplayer = false;
    let currentPlayer = 1;
    let player1Score = 0;
    let player2Score = 0;
    let timer;
    let timeLeft = 60;
  
    function showScreen(screen) {
      homeScreen.classList.add("hidden");
      gameScreen.classList.add("hidden");
      winScreen.classList.add("hidden");
      screen.classList.remove("hidden");
    }
  
    function startTimer() {
      clearInterval(timer);
      timeLeft = 60;
      timerDisplay.textContent = timeLeft;
      timer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        if (timeLeft <= 0) {
          clearInterval(timer);
          winMessage.innerText = "⏳ Time's Up! You Failed!";
          showScreen(winScreen);
        }
      }, 1000);
    }

    function checkMatch() {
        const [card1, card2, card3] = currentCards;
        if (card1.dataset.value === card2.dataset.value && card2.dataset.value === card3.dataset.value) {
          matches++;
          currentCards.forEach(card => card.style.visibility = "hidden"); // Hide matched cards
          checkWinCondition(); // Check if the game is won
        } else {
          currentCards.forEach(card => {
            card.classList.remove("flipped");
            card.textContent = "?";
          });
        }
        currentCards = [];
      }
      
    function generateCards(level) {
        const numCards = 9 + (level - 1) * 3; // Increase number of cards as levels go up
        const cardValues = [];
        
        for (let i = 0; i < numCards / 3; i++) {
          cardValues.push(i, i, i); // Creating sets of 3 matching cards
        }
      
        cardValues.sort(() => Math.random() - 0.5); // Shuffle cards
      
        gameBoard.innerHTML = ""; // Clear previous board
      
        const columns = Math.ceil(Math.sqrt(numCards)); // Calculate dynamic grid size
        gameBoard.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
      
        cardValues.forEach((value) => {
          const card = document.createElement("div");
          card.classList.add("card");
          card.dataset.value = value;
          card.textContent = "?"; // Placeholder text so cards are visible initially
          card.addEventListener("click", flipCard);
          gameBoard.appendChild(card);
        });
      
        adjustCardSize(); // Ensure the cards resize dynamically
      }

      function flipCard() {
        if (this.classList.contains("flipped") || currentCards.length === 3) return;
        
        this.classList.add("flipped");
        this.textContent = this.dataset.value; // Show actual card value
        currentCards.push(this);
      
        if (currentCards.length === 3) {
          setTimeout(checkMatch, 500);
        }
      }
      
      
      /* Function to Adjust Card Size */
      function adjustCardSize() {
        const gameBoardWidth = gameBoard.clientWidth;
        const numColumns = gameBoard.style.gridTemplateColumns.split(" ").length;
        const cardSize = Math.min(gameBoardWidth / numColumns - 10, 100); // Ensure reasonable card size
      
        document.querySelectorAll(".card").forEach(card => {
          card.style.width = `${cardSize}px`;
          card.style.height = `${cardSize * 1.5}px`; // Keep 2:3 aspect ratio
        });
      }
      
      window.addEventListener("resize", adjustCardSize); // Resize dynamically when the screen resizes
      
  
    function checkWinCondition() {
      if (matches === level + 2) {
        clearInterval(timer);
        if (isMultiplayer) {
          winMessage.innerText = player1Score > player2Score ? "🏆 Player 1 Wins!" : "🏆 Player 2 Wins!";
        } else {
          winMessage.innerText = "🎉 Yay! You Win! 🎉";
        }
        showScreen(winScreen);
      }
    }
  
    singlePlayerBtn.addEventListener("click", () => {
        isMultiplayer = false;
        multiplayerScore.classList.add("hidden");
        showScreen(gameScreen);
        startTimer();
        generateCards(level); // Ensure cards are generated on start
      });
      
      multiplayerBtn.addEventListener("click", () => {
        isMultiplayer = true;
        multiplayerScore.classList.remove("hidden");
        showScreen(gameScreen);
        startTimer();
        generateCards(level);
      });
      
  
    homeBtn.addEventListener("click", () => showScreen(homeScreen));
    backHomeBtn.addEventListener("click", () => showScreen(homeScreen));
    nextLevelBtn.addEventListener("click", () => generateCards(++level));
  });
  