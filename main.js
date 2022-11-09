(function main() {
  const activeColor = document.getElementById("active-color");
  const colorMenu = document.getElementById("color-menu");
  const gameEl = document.getElementById("game");

  const COLORS = {
    r: "4, 100%, 59%",
    o: "35, 100%, 50%",
    y: "48, 100%, 50%",
    g: "130, 69%, 48%",
    b: "211, 100%, 50%",
    v: "280, 68%, 60%",
    0: "0, 0%, 100%",
    1: "0, 0%, 0%",
  };
  // Writable for applying saves from local storage
  let MAP = {};
  const MAX = {
    x: 17,
    y: 9,
  };
  const POSITION = [Math.floor(MAX.x / 2), Math.floor(MAX.y / 2)];
  let prevPosition;
  let color = null;
  // Prevents spam saving. Disabled on save and re-enabled on color.
  let isSaveableState = true;

  // Begin setup
  colorMenu.innerHTML += Object.entries(COLORS).reduce((acc, [key, value]) => {
    return (
      acc +
      `<div data-color-key="${key}" style="background-color:hsl(${value})">${key}</div>`
    );
  }, "");

  gameEl.style.gridTemplateColumns = `repeat(${MAX.x}, 50px)`;
  gameEl.style.gridTemplateRows = `repeat(${MAX.y}, 50px)`;

  for (let y = MAX.y - 1; y >= 0; y--) {
    for (let x = 0; x < MAX.x; x++) {
      const coordinates = [x, y].join(",");
      const element = document.createElement("div");
      element.dataset.coordinates = coordinates;
      if (coordinates === POSITION.join(",")) element.textContent = "🐷";
      MAP[coordinates] = {
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

    MAP[prevPosition.join(",")].element.textContent = "";

    const next = MAP[nextPosition.join(",")];
    next.element.textContent = "🐷";
    if (color) {
      const hsl = blendColors(next.hsl, color);
      next.hsl = hsl;
      next.element.style.backgroundColor = `hsl(${hsl})`;
      isSaveableState = true;
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

    if (Math.abs(color2[0] - color1[0]) > 180)
      color1[0] < color2[0] ? (color1[0] += 360) : (color2[0] += 360);

    let h;

    if (color1[1] === 0 || color2[1] === 0) {
      // White and black are the only colors with 0% saturation,
      // so here we know one is black/white. We want to skip
      // blending and return the hue of the other color.
      h = color1[1] === 0 ? color2[0] : color1[0];
    } else {
      h = mean(color1[0], color2[0]);
    }

    if (h > 360) h -= 360;

    return [
      h,
      mean(color1[1], color2[1]) + "%",
      mean(color1[2], color2[2]) + "%",
    ].join(", ");
  }

  function handleKeydown(event) {
    // Save buttons are activated when the save is applied, so we remove that on
    // the next interaction.
    document
      .querySelectorAll(".active")
      .forEach((el) => el.classList.remove("active"));

    switch (event.key) {
      case "0":
      case "1":
      case "r":
      case "o":
      case "y":
      case "g":
      case "b":
      case "v": {
        event.preventDefault();
        color = COLORS[event.key];
        document.body.dataset.activeColor = event.key;
        activeColor.style.backgroundColor = `hsl(${color})`;
        break;
      }
      case "Escape": {
        event.preventDefault();
        color = null;
        activeColor.style.backgroundColor = "transparent";
        delete document.body.dataset.activeColor;
        break;
      }
      case "ArrowDown": {
        event.preventDefault();
        move(0, -1);
        break;
      }
      case "ArrowLeft": {
        event.preventDefault();
        move(-1, 0);
        break;
      }
      case "ArrowRight": {
        event.preventDefault();
        move(1, 0);
        break;
      }
      case "ArrowUp": {
        event.preventDefault();
        move(0, 1);
        break;
      }
      case "R": {
        event.preventDefault();
        reset();
        break;
      }
      case "s": {
        // There is probably a clever way to handle Mac/Windows here, but this
        // seemed the easiest option.
        // For the record, this will be true for ctrl+s on Mac and windows+s on
        // Windows.
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          if (isSaveableState) {
            save();
            isSaveableState = false;
          }
        }
        break;
      }
      case "j":
      case "k":
      case "l": {
        event.preventDefault();
        applySave(["j", "k", "l"].indexOf(event.key));
      }
    }
  }

  // Saves

  const saveKey = "paint-pig.saves";
  const coordinatesEls = document.querySelectorAll("[data-coordinates]");
  const savesContainerEl = document.getElementById("saves");

  function applySave(i) {
    const data = JSON.parse(localStorage.getItem(saveKey), "[]");
    const save = data[i];
    if (!save) return;
    const nextMAP = {};
    coordinatesEls.forEach((el) => {
      const coordinates = el.dataset.coordinates;
      const hsl = save[coordinates];
      el.style.backgroundColor = `hsl(${hsl})`;
      nextMAP[coordinates] = {
        hsl,
        element: el,
      };
    });

    MAP = nextMAP;

    const saveEl = document.querySelector(`[data-save="${i}"]`);
    saveEl.classList.add("active");
  }

  function getSaveColorHSL(data) {
    let count = 0;
    const hsl = [0, 0, 0];
    Object.values(data).forEach((hslString) => {
      const [h, s, l] = hslString
        .replace(/%/g, "")
        .split(", ")
        .map((s) => parseFloat(s));
      // Ignore white when calculating the average.
      if (h !== 0 && s !== 100) {
        count++;
        hsl[0] += h;
        hsl[1] += s;
        hsl[2] += l;
      }
    });

    return `hsl(${hsl[0] / count}, ${hsl[1] / count}%, ${hsl[2] / count}%)`;
  }

  function renderSaves() {
    const data = JSON.parse(localStorage.getItem(saveKey) || "[]");
    if (!data.length) {
      return (savesContainerEl.textContent = "No saves");
    }
    let html = "<b>Saves</b>";
    data.forEach((saveData, i) => {
      html += `<span aria-label="Apply save ${
        i + 1
      }}" data-save="${i}" style="background-color: ${getSaveColorHSL(
        saveData
      )}; opacity: ${100 - 25 * i}%">${["j", "k", "l"][i]}</span>`;
    });
    savesContainerEl.innerHTML = html;
  }

  function save() {
    const data = Object.entries(MAP).reduce((acc, [key, value]) => {
      acc[key] = value.hsl;
      return acc;
    }, {});
    const nextSave = [
      data,
      ...JSON.parse(localStorage.getItem(saveKey) || "[]"),
    ].slice(0, 3);
    localStorage.setItem(saveKey, JSON.stringify(nextSave));
    renderSaves();
  }

  renderSaves();

  // Reset

  function reset() {
    Object.values(MAP).forEach((cell) => {
      if (cell.hsl) {
        cell.hsl = "0, 0%, 100%";
        cell.element.style.backgroundColor = `hsl(${cell.hsl})`;
      }
    });

    color = null;
    activeColor.style.backgroundColor = "transparent";
    delete document.body.dataset.activeColor;
    prevPosition = null;
  }

  document.addEventListener("keydown", (event) => {
    handleKeydown(event);
  });
})();
