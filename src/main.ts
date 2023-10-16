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

canvasElement.addEventListener("mousedown", () => {
    drawing = true;
    context?.beginPath();
});

canvasElement.addEventListener("mouseup", () => {
    drawing = false;
    context?.closePath();
});

canvasElement.addEventListener("mousemove", draw);

function draw(event: MouseEvent) {
    if (!drawing) return;
    context!.lineWidth = 5;
    context!.lineCap = "round";
    context!.lineJoin = "round";
    context!.strokeStyle = "black";

    context!.lineTo(event.clientX - canvasElement.offsetLeft, event.clientY - canvasElement.offsetTop);
    context!.stroke();
    context!.beginPath();
    context!.moveTo(event.clientX - canvasElement.offsetLeft, event.clientY - canvasElement.offsetTop);
}

const clearButton = document.createElement("button");
clearButton.textContent = "Clear";
clearButton.addEventListener("click", () => {
    context?.clearRect(0, 0, canvasElement.width, canvasElement.height);
});
app?.appendChild(clearButton);