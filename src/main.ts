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

const context = canvasElement.getContext("2d")!;
let drawing = false;

let paths: { x: number; y: number }[][] = [];
let currentPath: { x: number; y: number }[] = [];
let currentThickness = 5;
const thin = 2;
const thick = 10;
const defaultXY = 0;
let stickerIcon = "*";
const redoStack: { x: number; y: number }[][] = [];

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
  context.clearRect(defaultXY, defaultXY, canvasElement.width, canvasElement.height);
  context.lineWidth = currentThickness;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.strokeStyle = "black";

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
  context?.clearRect(defaultXY, defaultXY, canvasElement.width, canvasElement.height);
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

const stickerButtons = ["🙂", "😺", "🌟"];
stickerButtons.forEach((sticker) => {
  const button = document.createElement("button");
  button.textContent = sticker;
  button.addEventListener("click", () => {
    stickerIcon = sticker;
    //currentCursor = new CursorCommand(0, 0, sticker);
    canvasElement.dispatchEvent(new Event("tool-moved"));
  });
  app?.appendChild(button);
});
