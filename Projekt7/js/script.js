// Canvas Setup
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const previewCanvas = document.getElementById('previewCanvas');
const previewCtx = previewCanvas.getContext('2d');

// Canvas-Größe setzen
function initCanvas() {
    canvas.width = 1920;
    canvas.height = 1080;
    previewCanvas.width = canvas.width;
    previewCanvas.height = canvas.height;
    
    // Weißer Hintergrund
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    updateCanvasSize();
}

// Status Bar Update
function updateCanvasSize() {
    document.querySelector('.canvas-size').textContent = `${canvas.width} x ${canvas.height}`;
}

// Variablen
let isDrawing = false;
let currentTool = 'brush';
let currentColor = '#2d605c';
let secondaryColor = '#ffffff';
let currentSize = 5;
let currentOpacity = 1;
let currentHardness = 1;
let fillShape = false;
let smoothing = false;
let startX, startY;
let zoom = 1;

// History für Undo/Redo
const history = [];
let historyStep = -1;
const maxHistory = 50;

// Werkzeug-Objekte
const tools = {
    brush: {
        name: 'Pinsel',
        draw: drawBrush,
        cursor: 'crosshair'
    },
    pencil: {
        name: 'Bleistift',
        draw: drawPencil,
        cursor: 'crosshair'
    },
    spray: {
        name: 'Sprühdose',
        draw: drawSpray,
        cursor: 'crosshair'
    },
    eraser: {
        name: 'Radiergummi',
        draw: drawEraser,
        cursor: 'grab'
    },
    fill: {
        name: 'Füllen',
        draw: fillArea,
        cursor: 'crosshair'
    },
    eyedropper: {
        name: 'Pipette',
        draw: pickColor,
        cursor: 'crosshair'
    },
    line: {
        name: 'Linie',
        draw: drawLine,
        cursor: 'crosshair'
    },
    rectangle: {
        name: 'Rechteck',
        draw: drawRectangle,
        cursor: 'crosshair'
    },
    circle: {
        name: 'Kreis',
        draw: drawCircle,
        cursor: 'crosshair'
    },
    triangle: {
        name: 'Dreieck',
        draw: drawTriangle,
        cursor: 'crosshair'
    },
    star: {
        name: 'Stern',
        draw: drawStar,
        cursor: 'crosshair'
    },
    text: {
        name: 'Text',
        draw: null,
        cursor: 'text'
    }
};

// Initialize
initCanvas();
saveState();

// Werkzeug-Auswahl
document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTool = btn.dataset.tool;
        canvas.style.cursor = tools[currentTool].cursor;
        document.querySelector('.tool-info').textContent = tools[currentTool].name;
    });
});

// Farb-System
const colorPicker = document.getElementById('colorPicker');
colorPicker.addEventListener('change', (e) => {
    currentColor = e.target.value;
    document.querySelector('.color-display.primary').style.background = currentColor;
});

document.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        currentColor = btn.style.background;
        colorPicker.value = rgbToHex(currentColor);
        document.querySelector('.color-display.primary').style.background = currentColor;
    });
});

// Farben tauschen
document.querySelector('.color-display.primary').addEventListener('click', () => {
    [currentColor, secondaryColor] = [secondaryColor, currentColor];
    document.querySelector('.color-display.primary').style.background = currentColor;
    document.querySelector('.color-display.secondary').style.background = secondaryColor;
    colorPicker.value = rgbToHex(currentColor);
});

// Einstellungen
document.getElementById('brushSize').addEventListener('input', (e) => {
    currentSize = e.target.value;
    e.target.nextElementSibling.textContent = currentSize + 'px';
});

document.getElementById('opacity').addEventListener('input', (e) => {
    currentOpacity = e.target.value / 100;
    e.target.nextElementSibling.textContent = e.target.value + '%';
});

document.getElementById('hardness').addEventListener('input', (e) => {
    currentHardness = e.target.value / 100;
    e.target.nextElementSibling.textContent = e.target.value + '%';
});

document.getElementById('fillShape').addEventListener('change', (e) => {
    fillShape = e.target.checked;
});

document.getElementById('smoothing').addEventListener('change', (e) => {
    smoothing = e.target.checked;
});

// Maus-Koordinaten anzeigen
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / zoom);
    const y = Math.round((e.clientY - rect.top) / zoom);
    document.querySelector('.coords').textContent = `X: ${x}, Y: ${y}`;
});

// Canvas Events
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

// Touch Events
canvas.addEventListener('touchstart', handleTouch, { passive: false });
canvas.addEventListener('touchmove', handleTouch, { passive: false });
canvas.addEventListener('touchend', stopDrawing);

function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent(e.type === 'touchstart' ? 'mousedown' : 'mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}

// Zeichenfunktionen
function startDrawing(e) {
    if (currentTool === 'text') {
        handleTextTool(e);
        return;
    }
    
    if (currentTool === 'eyedropper') {
        pickColor(e);
        return;
    }
    
    if (currentTool === 'fill') {
        fillArea(e);
        return;
    }
    
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    startX = (e.clientX - rect.left) / zoom;
    startY = (e.clientY - rect.top) / zoom;
    
    if (currentTool === 'brush' || currentTool === 'pencil' || currentTool === 'eraser' || currentTool === 'spray') {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
    }
}

function draw(e) {
    if (!isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    
    ctx.globalAlpha = currentOpacity;
    ctx.lineWidth = currentSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (tools[currentTool] && tools[currentTool].draw) {
        tools[currentTool].draw(x, y);
    }
}

function stopDrawing(e) {
    if (!isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const endX = (e.clientX - rect.left) / zoom;
    const endY = (e.clientY - rect.top) / zoom;
    
    // Formen zeichnen
    if (['line', 'rectangle', 'circle', 'triangle', 'star'].includes(currentTool)) {
        // Preview löschen
        previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        
        // Auf Hauptcanvas zeichnen
        ctx.globalAlpha = currentOpacity;
        ctx.strokeStyle = currentColor;
        ctx.fillStyle = currentColor;
        ctx.lineWidth = currentSize;
        
        tools[currentTool].draw(startX, startY, endX, endY);
    }
    
    isDrawing = false;
    ctx.beginPath();
    saveState();
}

// Zeichenwerkzeuge
function drawBrush(x, y) {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = currentColor;
    ctx.lineTo(x, y);
    ctx.stroke();
}

function drawPencil(x, y) {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = Math.max(1, currentSize / 2);
    ctx.lineTo(x, y);
    ctx.stroke();
}

function drawSpray(x, y) {
    ctx.globalCompositeOperation = 'source-over';
    const radius = currentSize;
    const density = 20;
    
    for (let i = 0; i < density; i++) {
        const offsetX = (Math.random() - 0.5) * radius * 2;
        const offsetY = (Math.random() - 0.5) * radius * 2;
        const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
        
        if (distance <= radius) {
            ctx.fillStyle = currentColor;
            ctx.globalAlpha = currentOpacity * (1 - distance / radius) * 0.3;
            ctx.fillRect(x + offsetX, y + offsetY, 1, 1);
        }
    }
}

function drawEraser(x, y) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineTo(x, y);
    ctx.stroke();
}

// Formen
function drawLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function drawRectangle(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.rect(x1, y1, x2 - x1, y2 - y1);
    if (fillShape) {
        ctx.fill();
    } else {
        ctx.stroke();
    }
}

function drawCircle(x1, y1, x2, y2) {
    const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    ctx.beginPath();
    ctx.arc(x1, y1, radius, 0, 2 * Math.PI);
    if (fillShape) {
        ctx.fill();
    } else {
        ctx.stroke();
    }
}

function drawTriangle(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1 - (y2 - y1));
    ctx.lineTo(x1 - (x2 - x1), y2);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    if (fillShape) {
        ctx.fill();
    } else {
        ctx.stroke();
    }
}

function drawStar(cx, cy, ex, ey) {
    const outerRadius = Math.sqrt(Math.pow(ex - cx, 2) + Math.pow(ey - cy, 2));
    const innerRadius = outerRadius * 0.4;
    const spikes = 5;
    
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * Math.PI) / spikes - Math.PI / 2;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.closePath();
    if (fillShape) {
        ctx.fill();
    } else {
        ctx.stroke();
    }
}

// Farbe aufnehmen
function pickColor(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    
    const imageData = ctx.getImageData(x, y, 1, 1);
    const pixel = imageData.data;
    
    currentColor = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
    document.querySelector('.color-display.primary').style.background = currentColor;
    colorPicker.value = rgbToHex(currentColor);
}

// Füllen (vereinfachte Version)
function fillArea(e) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / zoom);
    const y = Math.floor((e.clientY - rect.top) / zoom);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const targetColor = getPixelColor(imageData, x, y);
    const fillColor = hexToRgb(currentColor);
    
    if (colorsMatch(targetColor, fillColor)) return;
    
    floodFill(imageData, x, y, targetColor, fillColor);
    ctx.putImageData(imageData, 0, 0);
    saveState();
}

// Text Tool
const textModal = document.getElementById('textModal');
const textInput = document.getElementById('textInput');

function handleTextTool(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    
    textModal.style.left = e.clientX + 'px';
    textModal.style.top = e.clientY + 'px';
    textModal.classList.add('active');
    textInput.focus();
    
    document.getElementById('textConfirm').onclick = () => {
        const text = textInput.value;
        const fontSize = document.getElementById('fontSize').value;
        const fontFamily = document.getElementById('fontFamily').value;
        
        if (text) {
            ctx.font = `${fontSize}px ${fontFamily}`;
            ctx.fillStyle = currentColor;
            ctx.globalAlpha = currentOpacity;
            ctx.fillText(text, x, y);
            saveState();
        }
        
        textModal.classList.remove('active');
        textInput.value = '';
    };
}

// History Management
function saveState() {
    historyStep++;
    if (historyStep < history.length) {
        history.length = historyStep;
    }
    if (history.length >= maxHistory) {
        history.shift();
        historyStep--;
    }
    history.push(canvas.toDataURL());
}

// Undo/Redo
document.getElementById('undoBtn').addEventListener('click', () => {
    if (historyStep > 0) {
        historyStep--;
        const img = new Image();
        img.src = history[historyStep];
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
    }
});

document.getElementById('redoBtn').addEventListener('click', () => {
    if (historyStep < history.length - 1) {
        historyStep++;
        const img = new Image();
        img.src = history[historyStep];
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };
    }
});

// Neu, Öffnen, Speichern
document.getElementById('newBtn').addEventListener('click', () => {
    if (confirm('Neues Bild erstellen? Alle ungespeicherten Änderungen gehen verloren.')) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        history.length = 0;
        historyStep = -1;
        saveState();
    }
});

// Alles löschen Button
document.getElementById('clearCanvasBtn').addEventListener('click', () => {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
});

// Raster Toggle
let gridVisible = false;
document.getElementById('gridBtn').addEventListener('click', (e) => {
    gridVisible = !gridVisible;
    const container = document.querySelector('.canvas-container');
    const btn = e.currentTarget;
    
    if (gridVisible) {
        container.classList.add('grid-visible');
        btn.classList.add('active');
    } else {
        container.classList.remove('grid-visible');
        btn.classList.remove('active');
    }
});

document.getElementById('openBtn').addEventListener('click', () => {
    document.getElementById('fileInput').click();
});

document.getElementById('fileInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            previewCanvas.width = img.width;
            previewCanvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            updateCanvasSize();
            saveState();
        };
        img.src = event.target.result;
    };
    
    reader.readAsDataURL(file);
});

document.getElementById('saveBtn').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'kunstwerk.png';
    link.href = canvas.toDataURL();
    link.click();
});

// Zoom
let currentZoom = 100;

document.getElementById('zoomInBtn').addEventListener('click', () => {
    currentZoom = Math.min(currentZoom + 10, 500);
    updateZoom();
});

document.getElementById('zoomOutBtn').addEventListener('click', () => {
    currentZoom = Math.max(currentZoom - 10, 10);
    updateZoom();
});

document.getElementById('fitBtn').addEventListener('click', () => {
    currentZoom = 100;
    updateZoom();
});

function updateZoom() {
    zoom = currentZoom / 100;
    canvas.style.transform = `scale(${zoom})`;
    previewCanvas.style.transform = `scale(${zoom})`;
    document.querySelector('.zoom-display').textContent = currentZoom + '%';
}

// Ebenen Toggle
document.getElementById('layersBtn').addEventListener('click', () => {
    document.getElementById('layersPanel').classList.toggle('active');
});

function toggleLayers() {
    document.getElementById('layersPanel').classList.remove('active');
}

// Hilfsfunktionen
function rgbToHex(rgb) {
    const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (!match) return '#000000';
    
    const hex = (x) => ('0' + parseInt(x).toString(16)).slice(-2);
    return '#' + hex(match[1]) + hex(match[2]) + hex(match[3]);
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function getPixelColor(imageData, x, y) {
    const index = (y * imageData.width + x) * 4;
    return {
        r: imageData.data[index],
        g: imageData.data[index + 1],
        b: imageData.data[index + 2],
        a: imageData.data[index + 3]
    };
}

function colorsMatch(c1, c2) {
    return c1.r === c2.r && c1.g === c2.g && c1.b === c2.b;
}

function floodFill(imageData, x, y, targetColor, fillColor) {
    const pixels = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const stack = [[x, y]];
    
    while (stack.length) {
        const [cx, cy] = stack.pop();
        const index = (cy * width + cx) * 4;
        
        if (cx < 0 || cx >= width || cy < 0 || cy >= height) continue;
        
        if (pixels[index] === targetColor.r &&
            pixels[index + 1] === targetColor.g &&
            pixels[index + 2] === targetColor.b) {
            
            pixels[index] = fillColor.r;
            pixels[index + 1] = fillColor.g;
            pixels[index + 2] = fillColor.b;
            pixels[index + 3] = 255;
            
            stack.push([cx + 1, cy]);
            stack.push([cx - 1, cy]);
            stack.push([cx, cy + 1]);
            stack.push([cx, cy - 1]);
        }
    }
}

// Tastenkürzel
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 'z':
                e.preventDefault();
                document.getElementById('undoBtn').click();
                break;
            case 'y':
                e.preventDefault();
                document.getElementById('redoBtn').click();
                break;
            case 's':
                e.preventDefault();
                document.getElementById('saveBtn').click();
                break;
            case 'o':
                e.preventDefault();
                document.getElementById('openBtn').click();
                break;
        }
    }
});