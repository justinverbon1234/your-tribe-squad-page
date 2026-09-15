// hier ook niet fyi

import { constellations } from "../constellation-data.js";
import { clamp, directionBetween, formatIndex } from "./utils.js";
import { createStar } from "./stars.js";
import {
  bindPreview,
  bindPreviewActionBlur,
  createPreview,
} from "./preview.js";

const TRAVEL_DISTANCE = 60;
const TRANSITION_MS = 550;
const STAR_STAGGER_MS = 8;

const announce = (ctx, message) => {
  if (ctx.announcer) {
    ctx.announcer.textContent = message;
  }
};

export const clearStage = ctx => {
  ctx.stage.replaceChildren();
};

export const travelTo = (
  ctx,
  render,
  direction = { x: 0, y: 0 },
  message
) => {
  const { stage, state, reducedMotion } = ctx;

  if (state.isTravelling) return;

  const hadFocus = stage.contains(document.activeElement);

  if (reducedMotion.matches) {
    render();
    announce(ctx, message);
    return;
  }

  state.isTravelling = true;

  const travelX = `${(direction.x * TRAVEL_DISTANCE).toFixed(0)}px`;
  const travelY = `${(direction.y * TRAVEL_DISTANCE).toFixed(0)}px`;

  const outgoingStage = document.createElement("div");

  outgoingStage.className =
    "constellation-stage constellation-stage--outgoing";

  outgoingStage.setAttribute("aria-hidden", "true");

  outgoingStage.style.setProperty("--travel-x", travelX);
  outgoingStage.style.setProperty("--travel-y", travelY);

  while (stage.firstChild) {
    outgoingStage.append(stage.firstChild);
  }

  stage.after(outgoingStage);


  stage.style.setProperty("--travel-x", travelX);
  stage.style.setProperty("--travel-y", travelY);

  render();

  outgoingStage.classList.add("is-leaving");
  stage.classList.add("is-entering");

  /* Force a reflow so the enter animation starts from its offset
     position instead of snapping in from the layout. */
  void stage.offsetWidth;

  announce(ctx, message);

  if (hadFocus) {
    stage
      .querySelector(".constellation-star")
      ?.focus({ preventScroll: true });
  }

  /* Stars stagger their entrance with --delay, so wait for the full
     animation (max delay + duration) before cleanup, otherwise late
     stars snap mid-animation. */
  const maxDelay = Math.max(
    0,
    ...[...stage.querySelectorAll(".constellation-star")].map(
      star => parseFloat(star.style.getPropertyValue("--delay")) || 0
    )
  );

  requestAnimationFrame(() => {
    setTimeout(() => {
      outgoingStage.remove();

      stage.classList.remove("is-entering");

      stage.style.removeProperty("--travel-x");
      stage.style.removeProperty("--travel-y");

      state.isTravelling = false;
    }, TRANSITION_MS + maxDelay);
  });
};

export const renderUniverse = ctx => {
  const { stage, state } = ctx;

  state.mode = "universe";
  state.activeConstellation = null;
  ctx.preview = null;

  clearStage(ctx);

  constellations.forEach((constellation, index) => {
    stage.append(
      createStar(ctx, {
        position: constellation.position,
        name: constellation.name,
        meta: `${constellation.members.length} members`,
        members: constellation.members,
        delay: index * STAR_STAGGER_MS,
        modifier: "constellation-star--universe",

        onClick: () =>
          travelTo(
            ctx,
            () => renderConstellation(ctx, constellation.id),
            directionBetween(
              { x: 50, y: 50 },
              constellation.position
            ),
            `${constellation.name}, ${constellation.members.length} members`
          ),
      })
    );
  });
};

const renderDestinations = (ctx, constellation) => {
  const { stage } = ctx;

  const others = constellations.filter(
    item => item.id !== constellation.id
  );

  const center = { x: 50, y: 50 };

  for (const target of others) {
    const direction = directionBetween(
      constellation.position,
      target.position
    );

    let x = 0;
    let y = 0;

  
    for (let radius = 42; radius <= 50; radius += 2) {
      x = center.x + direction.x * radius;
      y = center.y + direction.y * radius;

      const overlapsMember = constellation.members.some(member =>
        Math.hypot(
          member.position.x - x,
          member.position.y - y
        ) < 12
      );

      if (!overlapsMember) break;
    }

    stage.append(
      createStar(ctx, {
        position: {
          x: clamp(x),
          y: clamp(y),
        },

        name: target.name,
        meta: `${target.members.length} members · travel`,
        members: target.members,
        modifier: "constellation-star--destination",

        onClick: () =>
          travelTo(
            ctx,
            () => renderConstellation(ctx, target.id),
            directionBetween(
              constellation.position,
              target.position
            ),
            `${target.name}, ${target.members.length} members`
          ),
      })
    );
  }
};

export const renderConstellation = (ctx, id) => {
  const { stage, state } = ctx;

  const constellation = constellations.find(
    item => item.id === id
  );

  if (!constellation) return;

  state.mode = "constellation";
  state.activeConstellation = id;

  clearStage(ctx);

  /*
   * Preview card
   */
  ctx.preview = createPreview();

  stage.append(ctx.preview);

  bindPreviewActionBlur(
    ctx,
    ctx.preview.querySelector(".member-preview-action")
  );

  /*
   * Member stars
   */
  constellation.members.forEach((member, index) => {
    const star = createStar(ctx, {
      position: member.position,
      name: member.name,
      meta: formatIndex(index + 1),
      delay: index * STAR_STAGGER_MS,
      modifier: "constellation-star--member",
      href: member.url,
    });

    bindPreview(
      ctx,
      star,
      member,
      index + 1,
      constellation.members.length
    );

    stage.append(star);
  });


  renderDestinations(ctx, constellation);


  stage.append(
    createStar(ctx, {
      position: { x: 50, y: 50 },
      name: "Universe",
      modifier: "constellation-star--home",

      delay:
        constellation.members.length *
        STAR_STAGGER_MS,

      onClick: () =>
        travelTo(
          ctx,
          () => renderUniverse(ctx),
          directionBetween(
            constellation.position,
            { x: 50, y: 50 }
          ),
          "Universe overview"
        ),
    })
  );
};

export const onKeyDown = (ctx, event) => {
  const { state } = ctx;

  if (
    event.key !== "Escape" ||
    state.mode !== "constellation" ||
    state.isTravelling
  ) {
    return;
  }

  const current = constellations.find(
    item => item.id === state.activeConstellation
  );

  const direction = current
    ? directionBetween(
        current.position,
        { x: 50, y: 50 }
      )
    : { x: 0, y: 0 };

  travelTo(
    ctx,
    () => renderUniverse(ctx),
    direction,
    "Universe overview"
  );
};