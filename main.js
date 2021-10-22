(function main() {
  const colorMenu = document.getElementById("color-menu");

  const COLORS = {
    r: "0, 100%, 50%",
    o: "39, 100%, 50%",
    y: "60, 100%, 50%",
    g: "120, 100%, 25%",
    b: "240, 100%, 50%",
    p: "300, 100%, 25%",
    0: "0, 0%, 100%",
    1: "0, 0%, 0%"
  };
  let color = null;

  colorMenu.innerHTML += Object.entries(COLORS).reduce((acc, [key, value]) => {
    return (
      acc +
      `<div data-color-key="${key}" style="background-color:hsl(${value})">${key}</div>`
    );
  }, "");

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
    }
    console.log({ color });
  }

  document.addEventListener("keydown", (event) => {
    handleKeydown(event);
  });
})();
