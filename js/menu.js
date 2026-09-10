// Menu

const toggle = document.querySelector(".menu-toggle");
const menu = document.querySelector(".site-menu");
const overlay = document.querySelector(".menu-overlay");
const content = document.querySelector("main");

if (toggle && menu && overlay) {
  const isOpen = () => menu.classList.contains("is-open");

  const setMenu = open => {
    toggle.classList.toggle("is-open", open);
    menu.classList.toggle("is-open", open);
    overlay.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);

    toggle.setAttribute("aria-expanded", open);
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");

    // Inert the page content while the menu covers it: the focus trap below
    // stops Tab, but inert also keeps screen-reader browse mode from reaching
    // content behind the overlay. Header and menu sit outside <main> and stay
    // reachable.
    if (content) content.inert = open;

    if (open) {
      menu.querySelector("a")?.focus();
    } else {
      toggle.focus();
    }
  };

  toggle.addEventListener("click", () => {
    setMenu(!isOpen());
  });

  overlay.addEventListener("click", () => setMenu(false));

  menu.addEventListener("click", event => {
    if (event.target.closest("a")) setMenu(false);
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && isOpen()) {
      setMenu(false);
      return;
    }

    // Trap focus while the menu is open. The toggle sits above the overlay,
    // so it is part of the cycle.
    if (event.key !== "Tab" || !isOpen()) return;

    const focusable = [toggle, ...menu.querySelectorAll("a")];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      last.focus();
      event.preventDefault();
    } else if (!event.shiftKey && document.activeElement === last) {
      first.focus();
      event.preventDefault();
    }
  });
}
