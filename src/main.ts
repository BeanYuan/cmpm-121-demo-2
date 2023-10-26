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

const context = canvasElement.getContext("2d");
let drawing = false;

let paths: { x: number, y: number }[][] = [];
let currentPath: { x: number, y: number }[] = [];
let currentThickness = 5;
const redoStack: { x: number, y: number }[][] = [];

// ToolPreviewCommand for previewing the tool
class ToolPreviewCommand {
    constructor(public x: number, public y: number, public width: number) {}

    draw(ctx: CanvasRenderingContext2D) {
        ctx.strokeStyle = "rgba(0, 0, 0, 0.5)"; // semi-transparent black
        ctx.lineWidth = this.width;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
        ctx.stroke();
    }
}

let toolPreviewCommand: ToolPreviewCommand | null = null;

canvasElement.addEventListener("mousemove", (event: MouseEvent) => {
    const x = event.clientX - canvasElement.offsetLeft;
    const y = event.clientY - canvasElement.offsetTop;

    if (drawing) {
        currentPath.push({ x, y });
        context?.lineTo(x, y);
        context?.stroke();
    } else {
        toolPreviewCommand = new ToolPreviewCommand(x, y, currentThickness);
        canvasElement.dispatchEvent(new Event("tool-moved"));
    }
});

canvasElement.addEventListener("mousedown", (event: MouseEvent) => {
    drawing = true;
    toolPreviewCommand = null; // remove the tool preview when drawing starts

    // Start the path right away on mouse down
    const x = event.clientX - canvasElement.offsetLeft;
    const y = event.clientY - canvasElement.offsetTop;
    currentPath = [{ x, y }];
    context?.beginPath();
    context?.moveTo(x, y);
});

canvasElement.addEventListener("mouseup", () => {
    drawing = false;
    if (currentPath.length) {
        paths.push(currentPath);
    }
    canvasElement.dispatchEvent(new Event("drawing-changed"));
    context?.closePath();
});

canvasElement.addEventListener("drawing-changed", () => {
    context?.clearRect(0, 0, canvasElement.width, canvasElement.height);
    context!.lineWidth = currentThickness;
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

    if (toolPreviewCommand) {
        toolPreviewCommand.draw(context!);
    }
});

canvasElement.addEventListener("tool-moved", () => {
    canvasElement.dispatchEvent(new Event("drawing-changed"));
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
    currentThickness = 2;
    document.querySelectorAll(".selectedTool").forEach(button => button.classList.remove("selectedTool"));
    thinMarkerButton.classList.add("selectedTool");
});
app?.appendChild(thinMarkerButton);

const thickMarkerButton = document.createElement("button");
thickMarkerButton.textContent = "Thick Marker";
thickMarkerButton.addEventListener("click", () => {
    currentThickness = 10;
    document.querySelectorAll(".selectedTool").forEach(button => button.classList.remove("selectedTool"));
    thickMarkerButton.classList.add("selectedTool");
});
app?.appendChild(thickMarkerButton);
