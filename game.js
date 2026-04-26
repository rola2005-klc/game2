function mulberry32(seed) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function makeRandomGem(colors, rng=Math.random) {
  return Math.floor(rng() * colors) + 1;
}

function cloneBoard(board) {
  return board.map(row => row.slice());
}

function inBounds(board, r, c) {
  return r >= 0 && c >= 0 && r < board.length && c < board[0].length;
}

function areAdjacent(a, b) {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1;
}

function findMatches(board) {
  const rows = board.length;
  const cols = board[0].length;
  const matched = new Set();

  for (let r = 0; r < rows; r++) {
    let c = 0;
    while (c < cols) {
      const val = board[r][c];
      let end = c + 1;
      while (end < cols && board[r][end] === val && val != null) end++;
      if (val != null && end - c >= 3) {
        for (let x = c; x < end; x++) matched.add(`${r},${x}`);
      }
      c = end;
    }
  }

  for (let c = 0; c < cols; c++) {
    let r = 0;
    while (r < rows) {
      const val = board[r][c];
      let end = r + 1;
      while (end < rows && board[end][c] === val && val != null) end++;
      if (val != null && end - r >= 3) {
        for (let y = r; y < end; y++) matched.add(`${y},${c}`);
      }
      r = end;
    }
  }

  return [...matched].map(key => key.split(',').map(Number));
}

function swapCells(board, a, b) {
  const next = cloneBoard(board);
  const temp = next[a[0]][a[1]];
  next[a[0]][a[1]] = next[b[0]][b[1]];
  next[b[0]][b[1]] = temp;
  return next;
}

function collapseBoard(board, fillFn) {
  const rows = board.length;
  const cols = board[0].length;
  const next = Array.from({ length: rows }, () => Array(cols).fill(null));

  for (let c = 0; c < cols; c++) {
    let write = rows - 1;
    for (let r = rows - 1; r >= 0; r--) {
      if (board[r][c] != null) {
        next[write][c] = board[r][c];
        write--;
      }
    }
    while (write >= 0) {
      next[write][c] = fillFn();
      write--;
    }
  }
  return next;
}

function resolveBoard(board, fillFn) {
  let current = cloneBoard(board);
  let totalRemoved = 0;
  let chains = 0;

  while (true) {
    const matches = findMatches(current);
    if (matches.length === 0) break;
    chains++;
    totalRemoved += matches.length;
    const marked = cloneBoard(current);
    for (const [r, c] of matches) marked[r][c] = null;
    current = collapseBoard(marked, fillFn);
    if (chains > 50) break;
  }

  return { board: current, removed: totalRemoved, chains };
}

function hasPossibleMove(board) {
  const rows = board.length;
  const cols = board[0].length;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      for (const [dr, dc] of [[1,0], [0,1]]) {
        const nr = r + dr, nc = c + dc;
        if (!inBounds(board, nr, nc)) continue;
        const swapped = swapCells(board, [r,c], [nr,nc]);
        if (findMatches(swapped).length > 0) return true;
      }
    }
  }
  return false;
}

function createBoard(rows=8, cols=8, colors=6, seed=Date.now()) {
  const rng = typeof seed === 'function' ? seed : mulberry32(seed);
  for (let attempt = 0; attempt < 200; attempt++) {
    const board = Array.from({ length: rows }, () => Array(cols).fill(0));
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let choices = [];
        for (let gem = 1; gem <= colors; gem++) choices.push(gem);
        if (c >= 2 && board[r][c-1] === board[r][c-2]) choices = choices.filter(v => v !== board[r][c-1]);
        if (r >= 2 && board[r-1][c] === board[r-2][c]) choices = choices.filter(v => v !== board[r-1][c]);
        board[r][c] = choices[Math.floor(rng() * choices.length)];
      }
    }
    if (hasPossibleMove(board)) return board;
  }
  throw new Error('Unable to create playable board');
}

function makeMove(board, a, b, fillFn=() => makeRandomGem(6)) {
  if (!inBounds(board, a[0], a[1]) || !inBounds(board, b[0], b[1]) || !areAdjacent(a, b)) {
    return { valid: false, board: cloneBoard(board), score: 0, removed: 0, chains: 0 };
  }
  const swapped = swapCells(board, a, b);
  if (findMatches(swapped).length === 0) {
    return { valid: false, board: cloneBoard(board), score: 0, removed: 0, chains: 0 };
  }
  const resolved = resolveBoard(swapped, fillFn);
  return {
    valid: true,
    board: resolved.board,
    removed: resolved.removed,
    chains: resolved.chains,
    score: resolved.removed * 10 + Math.max(0, resolved.chains - 1) * 25
  };
}

if (typeof module !== 'undefined') {
  module.exports = { createBoard, findMatches, swapCells, collapseBoard, resolveBoard, hasPossibleMove, makeMove, mulberry32, makeRandomGem };
}
