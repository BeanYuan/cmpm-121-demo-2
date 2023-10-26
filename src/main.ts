import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "Wan's game";

document.title = gameName;

const header = document.createElement("h1");
header.innerHTML = gameName;
app.append(header);

const titleElement = document.createElement("h1");
titleElement.textContent = "Canvas";
app?.appendChild(titleElement);

const canvasElement = document.createElement("canvas");
canvasElement.width = 256;
canvasElement.height = 256;
app?.appendChild(canvasElement);

const breakElement = document.createElement("br");
app?.appendChild(breakElement);

let context = canvasElement.getContext("2d")!;
let drawing = false;

let paths: { x: number; y: number }[][] = [];
let currentPath: { x: number; y: number }[] = [];
let currentThickness = 5;
const thin = 4;
const thick = 8;
const defaultXY = 0;
let stickerIcon = "*";
const currentHue = 0;
const redoStack: { x: number; y: number }[][] = [];
const stickers = ["🙂", "😺", "🌟", "🎨", "🚀", "💡", "🎈", "🍕", "🍀", "❤️"];

class CursorCommand {
  constructor(
    public x: number,
    public y: number,
    public icon: string,
  ) {}

  execute() {
    context.font = "32px monospace";
    context.fillText(this.icon, this.x, this.y);
  }
}

let currentCursor: CursorCommand | null = null;

function redraw() {
  context.clearRect(
    defaultXY,
    defaultXY,
    canvasElement.width,
    canvasElement.height,
  );
  context.lineWidth = currentThickness;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.strokeStyle = `hsl(${currentHue}, 100%, 50%)`;

  paths.forEach((path) => {
    if (path.length) {
      context?.beginPath();
      const { x, y } = path[defaultXY];
      context?.moveTo(x, y);

      for (const point of path) {
        context?.lineTo(point.x, point.y);
      }
      context?.stroke();
    }
  });

  if (currentCursor) {
    currentCursor.execute();
  }
}

function renderStickerButtons() {
  const existingStickerButtons = document.querySelectorAll(".stickerButton");
  existingStickerButtons.forEach((btn) => btn.remove());

  stickers.forEach((sticker) => {
    const button = document.createElement("button");
    button.textContent = sticker;
    button.classList.add("stickerButton");
    button.addEventListener("click", () => {
      stickerIcon = sticker;
      canvasElement.dispatchEvent(new Event("tool-moved"));
    });
    app?.appendChild(button);
  });
}

function tick() {
  redraw();
  requestAnimationFrame(tick);
}
tick();

canvasElement.addEventListener("mouseenter", (event: MouseEvent) => {
  currentCursor = new CursorCommand(event.offsetX, event.offsetY, stickerIcon);
  canvasElement.dispatchEvent(new Event("drawing-changed"));
});

canvasElement.addEventListener("mousemove", (event: MouseEvent) => {
  const x = event.offsetX;
  const y = event.offsetY;
  currentCursor = new CursorCommand(x, y, stickerIcon);
  if (drawing) {
    if (!currentPath.length) {
      paths.push(currentPath);
    }
    currentPath.push({ x, y });
    redraw();
  }
});

canvasElement.addEventListener("mouseleave", () => {
  currentCursor = null;
  canvasElement.dispatchEvent(new Event("drawing-changed"));
});

canvasElement.addEventListener("mousedown", (event: MouseEvent) => {
  drawing = true;
  const x = event.offsetX;
  const y = event.offsetY;
  currentCursor = new CursorCommand(x, y, stickerIcon);
  context?.beginPath();
  context?.moveTo(x, y);
  currentPath = [{ x, y }];
});

canvasElement.addEventListener("mouseup", () => {
  drawing = false;
  currentCursor = null;
  if (currentPath.length) {
    paths.push(currentPath);
    currentPath = [];
  }
  canvasElement.dispatchEvent(new Event("drawing-changed"));
  context?.closePath();
});

canvasElement.addEventListener("drawing-changed", () => {
  redraw();
});

canvasElement.addEventListener("cursor-changed", () => {
  redraw();
});

canvasElement.addEventListener("tool-moved", () => {
  canvasElement.dispatchEvent(new Event("drawing-changed"));
});

const clearButton = document.createElement("button");
clearButton.textContent = "Clear";
clearButton.addEventListener("click", () => {
  paths = [];
  context?.clearRect(
    defaultXY,
    defaultXY,
    canvasElement.width,
    canvasElement.height,
  );
});
app?.appendChild(clearButton);

const undoButton = document.createElement("button");
undoButton.textContent = "Undo";
undoButton.addEventListener("click", () => {
  if (paths.length) {
    const poppedPath = paths.pop();
    redoStack.push(poppedPath!);
    canvasElement.dispatchEvent(new Event("drawing-changed"));
  }
});
app?.appendChild(undoButton);

const redoButton = document.createElement("button");
redoButton.textContent = "Redo";
redoButton.addEventListener("click", () => {
  if (redoStack.length) {
    const poppedRedoPath = redoStack.pop();
    paths.push(poppedRedoPath!);
    canvasElement.dispatchEvent(new Event("drawing-changed"));
  }
});
app?.appendChild(redoButton);

const thinMarkerButton = document.createElement("button");
thinMarkerButton.textContent = "Thin Marker";
thinMarkerButton.addEventListener("click", () => {
  currentThickness = thin;
  document
    .querySelectorAll(".selectedTool")
    .forEach((button) => button.classList.remove("selectedTool"));
  thinMarkerButton.classList.add("selectedTool");
});
app?.appendChild(thinMarkerButton);

const thickMarkerButton = document.createElement("button");
thickMarkerButton.textContent = "Thick Marker";
thickMarkerButton.addEventListener("click", () => {
  currentThickness = thick;
  document
    .querySelectorAll(".selectedTool")
    .forEach((button) => button.classList.remove("selectedTool"));
  thickMarkerButton.classList.add("selectedTool");
});
app?.appendChild(thickMarkerButton);

const breakElement2 = document.createElement("br");
app?.appendChild(breakElement2);

const exportButton = document.createElement("button");
exportButton.textContent = "Export";
exportButton.addEventListener("click", () => {
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = 1024;
  exportCanvas.height = 1024;

  const exportCtx = exportCanvas.getContext("2d")!;
  const scale = 4;
  exportCtx.scale(scale, scale);

  const oldContext = context;
  context = exportCtx;
  redraw();
  context = oldContext;

  const link = document.createElement("a");
  link.href = exportCanvas.toDataURL("image/png");
  link.download = "drawing.png";
  link.click();
});
app?.appendChild(exportButton);

const hueSlider = document.createElement("input");
hueSlider.type = "range";
hueSlider.min = "0";
hueSlider.max = "360";
hueSlider.value = "0";
hueSlider.addEventListener("input", () => {
  redraw();
});
app?.appendChild(hueSlider);

const hueLabel = document.createElement("label");
hueLabel.textContent = "Hue Slider:";
app?.insertBefore(hueLabel, hueSlider);

const breakElement3 = document.createElement("br");
app?.appendChild(breakElement3);

renderStickerButtons();

const customStickerButton = document.createElement("button");
customStickerButton.textContent = "Add Custom Sticker";
customStickerButton.addEventListener("click", () => {
  const customSticker = prompt("Enter a custom sticker:", "");
  if (customSticker) {
    stickers.push(customSticker);
    renderStickerButtons();
  }
});
app?.appendChild(customStickerButton);
