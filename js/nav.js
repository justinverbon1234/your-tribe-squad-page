// Nav

const header = document.querySelector(".site-header");
const nav = document.querySelector(".site-nav");
const sections = [...document.querySelectorAll("main > section[id]")];

if (header) {
  const links = [
  ...(nav ? [...nav.querySelectorAll("a[href^='#']")] : []),
  ...[...document.querySelectorAll(".tab-bar a[href^='#']")],
];

  let frame = 0;
  let lastY = window.scrollY;

  const update = () => {
    frame = 0;

    const y = window.scrollY;
    const threshold = header.offsetHeight + 8;
    
    header.classList.toggle("is-hidden", y > lastY && y > threshold);
    lastY = y;

    if (!links.length) return;

    const barBottom = header.offsetHeight + 1;
    let current = null;

    for (const section of sections) {
      if (section.getBoundingClientRect().top <= barBottom) current = section.id;
    }

    for (const link of links) {
      if (current && link.hash === `#${current}`) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    }
  };

  const schedule = () => {
    if (frame) return;
    frame = requestAnimationFrame(update);
  };

  update();

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
}