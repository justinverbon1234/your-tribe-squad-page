// Scroll parallax for project images

// Images drift at a different rate than the page while the copy stays
// put, which offsets the two grid columns on the Y axis and creates depth.

const projects = document.querySelectorAll(".project");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const MAX_OFFSET = 48; // px either side of the viewport centre

if (projects.length && "IntersectionObserver" in window) {
  const active = new Set();

  let frame = 0;

  const update = () => {
    const viewport = window.innerHeight;

    for (const project of active) {
      const image = project.querySelector(".project-image");

      if (!image) continue;

      const rect = image.getBoundingClientRect();

      // -1 when the image sits below the viewport centre,
      // +1 when it sits above it.
      const progress =
        (rect.top + rect.height / 2 - viewport / 2) / viewport;

      const offset = Math.max(-1, Math.min(1, progress)) * MAX_OFFSET;

      image.style.setProperty("--parallax", `${offset.toFixed(1)}px`);
    }

    frame = requestAnimationFrame(update);
  };

  const start = () => {
    if (frame || reducedMotion.matches) return;
    frame = requestAnimationFrame(update);
  };

  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
  };

  const reset = () => {
    for (const image of document.querySelectorAll(".project-image")) {
      image.style.setProperty("--parallax", "0px");
    }
  };

  // Only run the loop while at least one project is on screen.
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        active.add(entry.target);
      } else {
        active.delete(entry.target);

        const image = entry.target.querySelector(".project-image");

        if (image) image.style.setProperty("--parallax", "0px");
      }
    }

    if (active.size) {
      start();
    } else {
      stop();
    }
  });

  reducedMotion.addEventListener("change", () => {
    if (reducedMotion.matches) {
      stop();
      reset();
    } else if (active.size) {
      start();
    }
  });

  projects.forEach(project => observer.observe(project));
}