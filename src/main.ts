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

const context = canvasElement.getContext("2d");
let drawing = false;

let paths: { x: number, y: number }[][] = [];
let currentPath: { x: number, y: number }[] = [];
let redoStack: { x: number, y: number }[][] = [];

canvasElement.addEventListener("mousedown", () => {
    drawing = true;
    currentPath = [];
    context?.beginPath();
});

canvasElement.addEventListener("mouseup", () => {
    drawing = false;
    if (currentPath.length) {
        paths.push(currentPath);
    }
    canvasElement.dispatchEvent(new Event('drawing-changed'));
    context?.closePath();
});

canvasElement.addEventListener("mousemove", (event: MouseEvent) => {
    if (drawing) {
        const point = {
            x: event.clientX - canvasElement.offsetLeft,
            y: event.clientY - canvasElement.offsetTop
        };
        currentPath.push(point);
    }
});

canvasElement.addEventListener('drawing-changed', () => {
    context?.clearRect(0, 0, canvasElement.width, canvasElement.height);
    context!.lineWidth = 5;
    context!.lineCap = "round";
    context!.lineJoin = "round";
    context!.strokeStyle = "black";

    paths.forEach(path => {
        context?.beginPath();
        for (let i = 0; i < path.length; i++) {
            if (i === 0) {
                context?.moveTo(path[i].x, path[i].y);
            } else {
                context?.lineTo(path[i].x, path[i].y);
                context?.stroke();
            }
        }
    });
});

const clearButton = document.createElement("button");
clearButton.textContent = "Clear";
clearButton.addEventListener("click", () => {
    paths = [];
    context?.clearRect(0, 0, canvasElement.width, canvasElement.height);
});
app?.appendChild(clearButton);

const undoButton = document.createElement("button");
undoButton.textContent = "Undo";
undoButton.addEventListener("click", () => {
    if (paths.length) {
        const poppedPath = paths.pop();
        redoStack.push(poppedPath!);
        canvasElement.dispatchEvent(new Event('drawing-changed'));
    }
});
app?.appendChild(undoButton);

const redoButton = document.createElement("button");
redoButton.textContent = "Redo";
redoButton.addEventListener("click", () => {
    if (redoStack.length) {
        const poppedRedoPath = redoStack.pop();
        paths.push(poppedRedoPath!);
        canvasElement.dispatchEvent(new Event('drawing-changed'));
    }
});
app?.appendChild(redoButton);