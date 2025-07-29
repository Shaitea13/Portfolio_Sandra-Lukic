const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const boxSize = 20; // Größe eines Segments der Schlange
let snake, direction, food, score, bestScore = 0, gameInterval, isGameOver;
let leaderboard = JSON.parse(localStorage.getItem('snakeLeaderboard')) || [];
let gameStarted = false;

// Joystick Buttons
const upButton = document.getElementById('upButton');
const downButton = document.getElementById('downButton');
const leftButton = document.getElementById('leftButton');
const rightButton = document.getElementById('rightButton');

// Reset-Funktion
function resetAll() {
    // Score zurücksetzen
    score = 0;
    document.getElementById('score').textContent = "Punkte: 0";
    
    // Canvas leeren
    clearScreen();
    
    // Buttons zurücksetzen
    document.getElementById('resetButton').style.display = 'none';
    document.getElementById('startButton').style.display = 'block';
    
    // Game-Status zurücksetzen
    isGameOver = false;
    gameStarted = false;
}

// Spiel starten
function startGame() {
    gameStarted = true;
    score = 0;
    direction = { x: boxSize, y: 0 };
    document.getElementById('score').textContent = "Punkte: 0";
    resetGame();
    isGameOver = false; 
    gameInterval = setInterval(gameLoop, 150); // Spielschleife alle 150 ms
    
    // Verstecke Reset Button, zeige Start Button
    document.getElementById('resetButton').style.display = 'none';
    document.getElementById('startButton').style.display = 'block';
}

// Spielschleife
function gameLoop() {
    if (checkCollision()) {
        clearInterval(gameInterval);
        isGameOver = true;
        gameStarted = false;
        updateBestScore();
        drawGameOver(); // Rufe die Game Over Anzeige auf
        return;
    }
    updateSnake();
    draw();
}

// Leeren Bildschirm zeichnen
function clearScreen() {
    ctx.fillStyle = '#120f0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Zeichne die Schlange
    snake.forEach((segment, index) => {
        ctx.fillStyle = index % 2 === 0 ? '#00b894' : '#00a76b';
        ctx.fillRect(segment.x, segment.y, boxSize, boxSize);
    });
    
    // Zeichne das Essen
    ctx.fillStyle = '#d63031';
    ctx.fillRect(food.x, food.y, boxSize, boxSize);
}

// Game Over Anzeige
function drawGameOver() {
    // Zeichne zuerst den letzten Spielstand
    draw();
    
    // Dann überlagere mit Game Over Text
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; // Halbtransparenter Hintergrund
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Game Over Text
    ctx.fillStyle = '#ff6b6b';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GAME OVER!', canvas.width / 2, canvas.height / 2 - 40);
    
    // Punkte anzeigen
    ctx.fillStyle = '#feca57';
    ctx.font = 'bold 28px Arial';
    ctx.fillText(`Punkte: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
    
    // Zeige Reset Button, verstecke Start Button
    document.getElementById('resetButton').style.display = 'block';
    document.getElementById('startButton').style.display = 'none';
}

// Best Score aus localStorage laden
function loadBestScore() {
    const savedBestScore = localStorage.getItem('snakeBestScore');
    if (savedBestScore) {
        bestScore = parseInt(savedBestScore);
        document.getElementById('bestScore').textContent = "Best Score: " + bestScore;
    }
}

// Best Score speichern
function saveBestScore() {
    localStorage.setItem('snakeBestScore', bestScore.toString());
}
function updateSnake() {
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    snake.unshift(head);
    
    if (head.x === food.x && head.y === food.y) {
        score++;
        document.getElementById('score').textContent = "Punkte: " + score;
        food = spawnFood();
    } else {
        snake.pop();
    }
}

// Nahrung spawnen
function spawnFood() {
    const x = Math.floor(Math.random() * (canvas.width / boxSize)) * boxSize; 
    const y = Math.floor(Math.random() * (canvas.height / boxSize)) * boxSize; 
    return { x, y };
}

// Kollision prüfen
function checkCollision() {
    const head = snake[0];
    
    // Kollision mit dem Rand
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
        return true; 
    }
    
    // Kollision mit sich selbst
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true; 
        }
    }
    return false;
}

// Spiel zurücksetzen
function resetGame() {
    snake = [
        { x: 5 * boxSize, y: 5 * boxSize },
        { x: 4 * boxSize, y: 5 * boxSize },
        { x: 3 * boxSize, y: 5 * boxSize },
        { x: 2 * boxSize, y: 5 * boxSize },
        { x: 1 * boxSize, y: 5 * boxSize },
        { x: 0 * boxSize, y: 5 * boxSize }
    ];
    food = spawnFood(); // Spawne das Essen
}

// Beste Punktzahl aktualisieren
function updateBestScore() {
    if (score > bestScore) {
        bestScore = score;
        document.getElementById('bestScore').textContent = "Best Score: " + bestScore;
        saveBestScore();
    }
    
    // Prüfe ob Score in Top 10
    if (isHighScore(score)) {
        showNicknameModal();
    }
}

// Rangliste löschen
function clearLeaderboard() {
    document.getElementById('confirmModal').style.display = 'block';
}

// Bestätigte Löschung
function confirmDelete() {
    leaderboard = [];
    localStorage.removeItem('snakeLeaderboard');
    
    // Best Score auch löschen
    bestScore = 0;
    localStorage.removeItem('snakeBestScore');
    document.getElementById('bestScore').textContent = "Best Score: 0";
    
    displayLeaderboard();
    hideConfirmModal();
}

// Modal verstecken
function hideConfirmModal() {
    document.getElementById('confirmModal').style.display = 'none';
}

// Ranglisten-Funktionen
function isHighScore(score) {
    if (leaderboard.length < 10) return true;
    return score > leaderboard[leaderboard.length - 1].score;
}

function showNicknameModal() {
    document.getElementById('nicknameModal').style.display = 'block';
    document.getElementById('nicknameInput').focus();
}

function hideNicknameModal() {
    document.getElementById('nicknameModal').style.display = 'none';
    document.getElementById('nicknameInput').value = '';
}

function saveScore() {
    const nickname = document.getElementById('nicknameInput').value.trim();
    
    if (nickname === '') {
        alert('Bitte gib einen Nickname ein!');
        return;
    }
    
    // Neuen Eintrag hinzufügen
    leaderboard.push({
        name: nickname,
        score: score,
        date: new Date().toLocaleDateString('de-DE')
    });
    
    // Sortieren und auf Top 10 begrenzen
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 10);
    
    // In localStorage speichern
    localStorage.setItem('snakeLeaderboard', JSON.stringify(leaderboard));
    
    // Anzeige aktualisieren
    displayLeaderboard();
    hideNicknameModal();
}

function displayLeaderboard() {
    const list = document.getElementById('leaderboardList');
    list.innerHTML = '';
    
    leaderboard.forEach((entry, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${index + 1}. ${entry.name}</span>
            <span>${entry.score} Punkte</span>
        `;
        list.appendChild(li);
    });
}

// Steuerung über Joystick
upButton.addEventListener('click', () => {
    if (!isGameOver && direction.y === 0) {
        direction = { x: 0, y: -boxSize }; // Nach oben
    }
});

downButton.addEventListener('click', () => {
    if (!isGameOver && direction.y === 0) {
        direction = { x: 0, y: boxSize }; // Nach unten
    }
});

leftButton.addEventListener('click', () => {
    if (!isGameOver && direction.x === 0) {
        direction = { x: -boxSize, y: 0 }; // Nach links
    }
});

rightButton.addEventListener('click', () => {
    if (!isGameOver && direction.x === 0) {
        direction = { x: boxSize, y: 0 }; // Nach rechts
    }
});

// Tastatursteuerung
document.addEventListener('keydown', (event) => {
    if (!isGameOver) {
        switch (event.key) {
            case 'ArrowUp':
                if (direction.y === 0) {
                    direction = { x: 0, y: -boxSize }; // Nach oben
                }
                break;
            case 'ArrowDown':
                if (direction.y === 0) {
                    direction = { x: 0, y: boxSize }; // Nach unten
                }
                break;
            case 'ArrowLeft':
                if (direction.x === 0) {
                    direction = { x: -boxSize, y: 0 }; // Nach links
                }
                break;
            case 'ArrowRight':
                if (direction.x === 0) {
                    direction = { x: boxSize, y: 0 }; // Nach rechts
                }
                break;
        }
    }
});

// Event Listener für Modal
document.getElementById('saveScoreBtn').addEventListener('click', saveScore);
document.getElementById('skipScoreBtn').addEventListener('click', hideNicknameModal);

// Enter-Taste im Input
document.getElementById('nicknameInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        saveScore();
    }
});

// Spiel starten Button
document.getElementById('startButton').addEventListener('click', startGame);

// Reset Button
document.getElementById('resetButton').addEventListener('click', resetAll);

// Rangliste löschen Button
document.getElementById('clearLeaderboardBtn').addEventListener('click', clearLeaderboard);

// Confirm Modal Buttons
document.getElementById('confirmDeleteBtn').addEventListener('click', confirmDelete);
document.getElementById('cancelDeleteBtn').addEventListener('click', hideConfirmModal);
