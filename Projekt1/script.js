let turn = 'X';
const cells = document.querySelectorAll('.cell');
const message = document.getElementById('message');
let board = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];

function handleCellClick(index) {
    if (board[index] !== '' || !gameActive) return;

    board[index] = turn;
    cells[index].innerHTML = `<span class="${turn === 'X' ? 'cross' : 'circle'}">${turn}</span>`;

    checkWinner();
    turn = turn === 'X' ? 'O' : 'X';
}

function checkWinner() {
    for (let condition of winningConditions) {
        const [a, b, c] = condition;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            gameActive = false;
            message.innerHTML = `${board[a]} gewinnt!`;
            return;
        }
    }
    if (!board.includes('')) {
        gameActive = false;
        message.innerHTML = 'Unentschieden!';
    }
}
// Funktion zum Zurücksetzen des Spiels
function resetGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    turn = 'X';
    message.innerHTML = '';
    cells.forEach(cell => {
        cell.innerHTML = '';
    });
}

// Event Listener für Reset-Button
resetButton.addEventListener('click', resetGame);

cells.forEach((cell, index) => {
    cell.addEventListener('click', () => handleCellClick(index));
});
