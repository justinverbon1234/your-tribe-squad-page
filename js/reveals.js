// Project reveals

const projects = document.querySelectorAll(".project");

const reveal = entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    entry.target.classList.add("is-visible");
    observer.unobserve(entry.target);
  });
};

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(reveal, { threshold: 0.25 });

  projects.forEach(project => observer.observe(project));
} else {
  // No observer support: show everything immediately.
  projects.forEach(project => project.classList.add("is-visible"));
}
