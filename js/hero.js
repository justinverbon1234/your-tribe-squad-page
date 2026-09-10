// Hero typewriter

const title = document.querySelector(".hero-title");
const text = document.querySelector(".hero-text");

if (title && text) {
  const phrase = title.getAttribute("aria-label") || "";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Rhythm: type -> hold -> delete -> pause -> repeat.
  const TYPE_MS = 150;
  const DELETE_MS = 90;
  const HOLD_MS = 1800;
  const EMPTY_MS = 600;
  const START_MS = 400;

  // Without JS the pre-filled text in the HTML simply stays; reduced motion
  // keeps it too (CSS renders the caret and arrow static).
  if (phrase && !reducedMotion.matches) {
    let i = 0;

    text.textContent = "";

    const type = () => {
      i += 1;
      text.textContent = phrase.slice(0, i);

      if (i < phrase.length) {
        setTimeout(type, TYPE_MS);
      } else {
        setTimeout(erase, HOLD_MS);
      }
    };

    const erase = () => {
      i -= 1;
      text.textContent = phrase.slice(0, i);

      if (i > 0) {
        setTimeout(erase, DELETE_MS);
      } else {
        setTimeout(type, EMPTY_MS);
      }
    };

    setTimeout(type, START_MS);
  }
}
