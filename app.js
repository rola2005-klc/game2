const ROWS = 8;
const COLS = 8;
const COLORS = 6;
const ICONS = ['', '🍓', '⭐️', '🫐', '🌸', '🥝', '🍬'];

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
const comboText = document.getElementById('comboText');

function randomGem() {
  return makeRandomGem(COLORS);
}

function vibrate(pattern = 12) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

function setMessage(text) {
  msgEl.textContent = text;
}

function showCombo(text) {
  comboText.textContent = text;
  comboText.classList.remove('show');
  void comboText.offsetWidth;
  comboText.classList.add('show');
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
      cell.setAttribute('aria-label', `第${r+1}行第${c+1}列，${ICONS[board[r][c]]}`);
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
    setMessage(`结束啦！你拿到 ${score} 分，点 ↻ 再来一局。`);
    showCombo('Game Over 💫');
    return true;
  }
  if (!hasPossibleMove(board)) {
    setMessage('没有能走的啦，自动换一盘糖果～');
    board = createBoard(ROWS, COLS, COLORS);
    render();
    return false;
  }
  return false;
}

function onCellClick(r, c) {
  if (busy || moves <= 0) return;
  vibrate(8);

  if (!selected) {
    selected = [r, c];
    setMessage('再点旁边一个糖果交换～');
    render();
    return;
  }

  const a = selected;
  const b = [r, c];
  if (a[0] === b[0] && a[1] === b[1]) {
    selected = null;
    setMessage('取消选择啦');
    render();
    return;
  }
  if (!areAdjacent(a, b)) {
    selected = b;
    setMessage('只能和上下左右相邻的糖果交换哦');
    render();
    return;
  }

  busy = true;
  selected = null;
  const swapped = swapCells(board, a, b);
  const firstMatches = findMatches(swapped);
  if (firstMatches.length === 0) {
    setMessage('还没凑成 3 个，换回来啦');
    showCombo('差一点!');
    vibrate([20, 30, 20]);
    busy = false;
    render();
    return;
  }

  board = swapped;
  render(firstMatches);
  setTimeout(() => {
    const result = resolveBoard(board, randomGem);
    board = result.board;
    const gained = result.removed * 10 + Math.max(0, result.chains - 1) * 25;
    score += gained;
    moves -= 1;
    const comboLabel = result.chains > 1 ? `${result.chains} 连击 +${gained}` : `+${gained}`;
    showCombo(comboLabel);
    vibrate(result.chains > 1 ? [18, 35, 18] : 18);
    setMessage(`消掉 ${result.removed} 个糖果，继续冲！`);
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
  setMessage('点一下糖果，再点旁边的糖果交换 ✨');
  showCombo('Ready?');
  render();
}

newBtn.addEventListener('click', () => {
  vibrate(10);
  startGame();
});
startGame();
