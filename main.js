(function main() {
  const colorMenu = document.getElementById("color-menu");
  const gameEl = document.getElementById("game");

  const COLORS = {
    r: "360, 100%, 50%", // To differentiate red from black/white
    o: "39, 100%, 50%",
    y: "60, 100%, 50%",
    g: "120, 100%, 25%",
    b: "240, 100%, 50%",
    p: "300, 100%, 25%",
    0: "0, 0%, 100%",
    1: "0, 0%, 0%",
  };
  const MAP = {};
  const MAX = {
    x: 17,
    y: 9,
  };
  const POSITION = [Math.floor(MAX.x / 2), Math.floor(MAX.y / 2)];
  let prevPosition;
  let color = null;

  // Begin setup
  colorMenu.innerHTML += Object.entries(COLORS).reduce((acc, [key, value]) => {
    return (
      acc +
      `<div data-color-key="${key}" style="background-color:hsl(${value})">${key}</div>`
    );
  }, "");

  gameEl.style.gridTemplateColumns = `repeat(${MAX.x}, 40px)`;
  gameEl.style.gridTemplateRows = `repeat(${MAX.y}, 40px)`;

  for (let y = MAX.y - 1; y >= 0; y--) {
    for (let x = 0; x < MAX.x; x++) {
      const coordinates = [x, y].join(",");
      const element = document.createElement("div");
      element.classList.add("coordinate");
      if (coordinates === POSITION.join(","))
        /* element.textContent = "🦜" */ element.dataset.parrot = true;
      MAP[coordinates] = {
        blend: 0,
        hsl: "0, 0%, 100%",
        element,
      };
      gameEl.appendChild(element);
    }
  }
  // End setup

  function move(x = 0, y = 0) {
    const nextPosition = [POSITION[0] + x, POSITION[1] + y];

    if (
      nextPosition[0] < 0 ||
      nextPosition[0] >= MAX.x ||
      nextPosition[1] < 0 ||
      nextPosition[1] >= MAX.y
    ) {
      return;
    }
    prevPosition = [...POSITION];

    // MAP[prevPosition.join(",")].element.textContent = "";
    delete MAP[prevPosition.join(",")].element.dataset.parrot;

    const next = MAP[nextPosition.join(",")];
    // next.element.textContent = "🦜";
    next.element.dataset.parrot = true;
    if (color) {
      next.blend++;
      const hsl = blendColors(next.hsl, color);
      next.hsl = hsl;
      next.element.style.backgroundColor = `hsl(${hsl})`;
    }
    POSITION[0] = nextPosition[0];
    POSITION[1] = nextPosition[1];
  }

  function hslStringToArray(string) {
    const values = string.includes("hsl")
      ? string.slice(3, string.length - 1)
      : string;
    return values
      .replace(/%/g, "")
      .split(", ")
      .map((fragment) => Number(fragment));
  }

  function mean(a, b) {
    return Math.ceil((a + b) / 2);
  }

  function blendColors(c1, c2) {
    const color1 = hslStringToArray(c1);
    const color2 = hslStringToArray(c2);

    return [
      // Only blend hue if both values are not 0
      color1[0] !== 0 && color2[0] !== 0
        ? mean(color1[0], color2[0])
        : color1[0] === 0
        ? color2[0]
        : color1[0],
      mean(color1[1], color2[1]) + "%",
      mean(color1[2], color2[2]) + "%",
    ].join(", ");
  }

  function handleKeydown(event) {
    switch (event.key) {
      case "0":
      case "1":
      case "r":
      case "o":
      case "y":
      case "g":
      case "b":
      case "p": {
        color = COLORS[event.key];
        document.body.dataset.activeColor = event.key;
        break;
      }
      case "Escape": {
        color = null;
        delete document.body.dataset.activeColor;
        break;
      }
      case "ArrowDown": {
        move(0, -1);
        break;
      }
      case "ArrowLeft": {
        move(-1, 0);
        break;
      }
      case "ArrowRight": {
        move(1, 0);
        break;
      }
      case "ArrowUp": {
        move(0, 1);
        break;
      }
    }
  }

  document.addEventListener("keydown", (event) => {
    handleKeydown(event);
  });
})();
