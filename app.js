const ROWS = 8;
const COLS = 8;
const COLORS = 6;
const ICONS = ['','🍓','🍋','🫐','🍇','🥝','🍬'];

let board;
let selected = null;
let score = 0;
let moves = 30;
let busy = false;

const boardEl = document.getElementById('board');
const scoreEl = document.getElementById('score');
const movesEl = document.getElementById('moves');
const bestEl = document.getElementById('best');
const msgEl = document.getElementById('message');
const newBtn = document.getElementById('newGame');

function randomGem() {
  return makeRandomGem(COLORS);
}

function setMessage(text) {
  msgEl.textContent = text;
}

function updateStats() {
  scoreEl.textContent = score;
  movesEl.textContent = moves;
  const best = Number(localStorage.getItem('match3-best') || 0);
  if (score > best) localStorage.setItem('match3-best', String(score));
  bestEl.textContent = Math.max(score, best);
}

function render(popCells = []) {
  boardEl.innerHTML = '';
  const pop = new Set(popCells.map(([r,c]) => `${r},${c}`));
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement('button');
      cell.className = 'gem';
      cell.type = 'button';
      cell.dataset.r = r;
      cell.dataset.c = c;
      cell.textContent = ICONS[board[r][c]];
      cell.setAttribute('aria-label', `第${r+1}行第${c+1}列`);
      if (selected && selected[0] === r && selected[1] === c) cell.classList.add('selected');
      if (pop.has(`${r},${c}`)) cell.classList.add('pop');
      cell.addEventListener('click', () => onCellClick(r, c));
      boardEl.appendChild(cell);
    }
  }
  updateStats();
}

function endIfNeeded() {
  if (moves <= 0) {
    setMessage(`游戏结束！最终得分 ${score}。点“重新开始”再来一局。`);
    return true;
  }
  if (!hasPossibleMove(board)) {
    setMessage('没有可消除的移动了，已自动洗牌。');
    board = createBoard(ROWS, COLS, COLORS);
    render();
    return false;
  }
  return false;
}

function onCellClick(r, c) {
  if (busy || moves <= 0) return;
  if (!selected) {
    selected = [r, c];
    setMessage('再点一个相邻方块进行交换。');
    render();
    return;
  }
  const a = selected;
  const b = [r, c];
  if (a[0] === b[0] && a[1] === b[1]) {
    selected = null;
    setMessage('已取消选择。');
    render();
    return;
  }
  if (!areAdjacent(a, b)) {
    selected = b;
    setMessage('只能交换上下左右相邻的方块。');
    render();
    return;
  }

  busy = true;
  selected = null;
  const swapped = swapCells(board, a, b);
  const firstMatches = findMatches(swapped);
  if (firstMatches.length === 0) {
    setMessage('这一步没有形成 3 连，换回来啦。');
    busy = false;
    render();
    return;
  }

  board = swapped;
  render(firstMatches);
  setTimeout(() => {
    const result = resolveBoard(board, randomGem);
    board = result.board;
    score += result.removed * 10 + Math.max(0, result.chains - 1) * 25;
    moves -= 1;
    setMessage(`消除了 ${result.removed} 个！连锁 ${result.chains} 次。`);
    busy = false;
    render();
    endIfNeeded();
  }, 260);
}

function startGame() {
  board = createBoard(ROWS, COLS, COLORS);
  selected = null;
  score = 0;
  moves = 30;
  busy = false;
  setMessage('先选一个方块吧 ✨');
  render();
}

newBtn.addEventListener('click', startGame);
startGame();
