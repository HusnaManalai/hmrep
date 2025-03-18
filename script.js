

// Add Task Functionality
document.getElementById("add-task-btn").addEventListener("click", function() {
    const taskInput = document.getElementById("task-input");
    const taskList = document.getElementById("task-list");
  
    if (taskInput.value.trim() !== "") {
      const li = document.createElement("li");
      li.textContent = taskInput.value;
  
      // Add remove button
      const removeBtn = document.createElement("button");
      removeBtn.textContent = "x";
      removeBtn.style.marginLeft = "10px";
      removeBtn.onclick = () => taskList.removeChild(li);
  
      li.appendChild(removeBtn);
      taskList.appendChild(li);
      taskInput.value = ""; // Clear input
    }
  });
  
  // Timer Functionality
  let timer;
  let timeLeft = 1500; // 25 minutes in seconds
  let isRunning = false;
  
  document.getElementById("start-timer").addEventListener("click", function() {
    if (!isRunning) {
      isRunning = true;
      timer = setInterval(() => {
        if (timeLeft > 0) {
          timeLeft--;
          updateTimerDisplay();
        } else {
          clearInterval(timer);
          alert("Time's up! Take a break.");
          isRunning = false;
        }
      }, 1000);
    }
  });


  // Stop Timer (Pause)
document.getElementById("stop-timer").addEventListener("click", function () {
    clearInterval(timer);
    isRunning = false; // Allow restart
  });
  
  document.getElementById("reset-timer").addEventListener("click", function() {
    clearInterval(timer);
    timeLeft = 1500;
    updateTimerDisplay();
    isRunning = false;
  });
  


  document.getElementById("task-input").addEventListener("keypress", function(event) {
    if (event.key === "Enter") { // Check if Enter key is pressed
      event.preventDefault(); // Prevent form submission (if inside a form)
      document.getElementById("add-task-btn").click(); // Trigger Add Task button
    }
  });

  

  function updateTimerDisplay() {
    let minutes = Math.floor(timeLeft / 60);
    let seconds = timeLeft % 60;
    document.getElementById("timer-display").textContent = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  }
  

//ANIMATION SECTION

  document.addEventListener("DOMContentLoaded", function () {
    gsap.registerPlugin(ScrollTrigger);
  
    // Hero Section Animation
    gsap.from(".hero-content h1", {
      opacity: 0,
      y: -50,
      duration: 1.2,
      ease: "power2.out",
    });
  
    gsap.from(".hero-content .logo-text", {
      opacity: 0,
      x: -100,
      duration: 1.5,
      ease: "power3.out",
    });
  
    gsap.from(".social-icons a", {
      opacity: 0,
      scale: 0.8,
      stagger: 0.2,
      duration: 1,
      ease: "elastic.out(1, 0.5)",
    });
  
    // About Section Scroll Animation
    gsap.from(".about-section", {
      opacity: 0,
      y: 50,
      duration: 1.5,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".about-section",
        start: "top 80%",
        toggleActions: "play none none reverse",
      },
    });
  
    // Mind-Blowing Staggered Effect for Text
    gsap.from(".about-content p", {
      opacity: 0,
      y: 30,
      stagger: 0.3,
      duration: 1.2,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".about-content",
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
    });
  
    // Parallax Effect for Stars (if you have background stars)
    gsap.to("#stars-container", {
      yPercent: -10,
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: true,
      },
    });

  });
  
 



  gsap.from(".hero-content", {
    opacity: 0,
    rotateX: 15,
    scale: 0.95,
    duration: 1.5,
    ease: "power3.out",
  });


 