function generateStars() {
  const starsContainer = document.getElementById("stars-container");
  if (!starsContainer) return;

  starsContainer.innerHTML = ""; // prevent duplicates

  const density = 0.12;
  const numStars = Math.floor(
    (window.innerWidth * window.innerHeight) / 1000 * density
  );

  for (let i = 0; i < numStars; i++) {
    const star = document.createElement("div");
    star.classList.add("star");

    star.style.top = Math.random() * 100 + "vh";
    star.style.left = Math.random() * 100 + "vw";

    const size = Math.random() * 1.5 + 0.2;
    star.style.width = size + "px";
    star.style.height = size + "px";

    star.style.opacity = Math.random() * 0.8 + 0.2;
    star.style.animationDelay = Math.random() * 4 + "s";
    star.style.animationDuration = Math.random() * 3 + 2 + "s";

    starsContainer.appendChild(star);
  }
}

document.addEventListener("DOMContentLoaded", generateStars);
window.addEventListener("resize", generateStars);
