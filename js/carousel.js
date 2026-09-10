// Spots slider

const stage = document.querySelector(".spot-stage");
const slides = [...document.querySelectorAll(".spot-slide")];
const thumbs = [...document.querySelectorAll(".spot-thumb")];
const prevButton = document.querySelector(".carousel-prev");
const nextButton = document.querySelector(".carousel-next");
const counter = document.querySelector(".carousel-counter-current");

if (stage && slides.length && thumbs.length && prevButton && nextButton && counter) {
  const section = stage.closest(".archive");
  const count = slides.length;

  let index = 0;

  const pad = value => String(value).padStart(2, "0");

  const render = () => {
    slides.forEach((slide, i) => {
      slide.classList.toggle("is-active", i === index);
    });

    thumbs.forEach((thumb, i) => {
      if (i === index) {
        thumb.setAttribute("aria-current", "true");
      } else {
        thumb.removeAttribute("aria-current");
      }
    });

    counter.textContent = pad(index + 1);
  };

  // Wraps in both directions: 01 ← → 05.
  const goTo = next => {
    index = ((next % count) + count) % count;
    render();
  };

  prevButton.addEventListener("click", () => goTo(index - 1));
  nextButton.addEventListener("click", () => goTo(index + 1));

  thumbs.forEach((thumb, i) => {
    thumb.addEventListener("click", () => goTo(i));
  });

  // Arrow keys while focus is anywhere inside the section step through
  // the spots; the section contains no inputs, so this is safe.
  section?.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(index + 1);
    }
  });

  // Swipe support.

  const SWIPE_THRESHOLD = 48;

  let startX = 0;
  let startY = 0;
  let swipeId = null;

  stage.addEventListener("pointerdown", event => {
    swipeId = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
  });

  stage.addEventListener("pointerup", event => {
    if (swipeId !== event.pointerId) return;

    swipeId = null;

    const dx = event.clientX - startX;
    const dy = event.clientY - startY;

    // Only horizontal, deliberate gestures count; vertical swipes
    // belong to the page.
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;

    goTo(index + (dx < 0 ? 1 : -1));
  });

  stage.addEventListener("pointercancel", () => {
    swipeId = null;
  });

  render();
}
