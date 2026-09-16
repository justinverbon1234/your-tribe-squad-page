// hier ook niet

import { applyFloat } from "./utils.js";

export const createStar = (ctx, {
  position,
  name,
  meta,
  members,
  modifier,
  onClick,
  onMemberClick,
  href,
  delay = 0,
  labelPosition = "below",
}) => {
  const star = document.createElement(href ? "a" : "button");
  star.className = modifier ? `constellation-star ${modifier}` : "constellation-star";

  if (labelPosition === "above") {
    star.classList.add("constellation-star--label-above");
  }
  star.style.left = `${position.x}%`;
  star.style.top = `${position.y}%`;
  star.style.setProperty("--delay", `${delay}ms`);
  applyFloat(star, name, ctx.isTouch);

  if (href) {
    star.href = href;
    star.target = "_blank";
    star.rel = "noopener noreferrer";
  } else {
    star.type = "button";
    star.addEventListener("click", onClick);
  }

  const point = document.createElement("span");
  point.className = "constellation-star-point";
  point.setAttribute("aria-hidden", "true");

  const label = document.createElement("span");
  label.className = "constellation-star-name";
  label.textContent = name;

  star.append(point, label);

  if (meta) {
    const metaElement = document.createElement("span");
    metaElement.className = "constellation-star-meta";
    metaElement.textContent = meta;
    star.append(metaElement);
  }

  if (members?.length) {
    const popup = document.createElement("div");
    popup.className = "constellation-star-members";
    popup.setAttribute("aria-hidden", "true");

    const svgNamespace = "http://www.w3.org/2000/svg";

    const svg = document.createElementNS(svgNamespace, "svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("preserveAspectRatio", "none");

    const line = document.createElementNS(svgNamespace, "polyline");
    line.setAttribute("class", "constellation-star-members-line");
    line.setAttribute("points", members.map(
      member => `${member.position.x},${member.position.y}`
    ).join(" "));
    line.setAttribute("aria-hidden", "true");

    svg.append(line);

    for (const member of members) {
      const dot = document.createElementNS(svgNamespace, "circle");
      dot.setAttribute("class", "constellation-star-members-dot");
      dot.setAttribute("cx", member.position.x);
      dot.setAttribute("cy", member.position.y);
      dot.setAttribute("r", "2.2");
      dot.setAttribute("aria-hidden", "true");

      svg.append(dot);
    }

    for (const member of members) {
      const label = document.createElement("span");

      label.className =
        "constellation-star-members-label constellation-star-members-label--above";

      if (onMemberClick) {
        label.classList.add("constellation-star-members-label--clickable");
        label.addEventListener("click", event => {
          event.stopPropagation();
          onMemberClick(member);
        });
      }

      label.style.left = `${member.position.x}%`;
      label.style.top = `${member.position.y}%`;
      label.textContent = member.name;
      label.setAttribute("aria-hidden", "true");

      popup.append(label);
    }

    popup.prepend(svg);

    star.append(popup);
  }

  

  return star;
};