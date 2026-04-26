const assert = require('assert');
const {
  createBoard,
  findMatches,
  swapCells,
  collapseBoard,
  resolveBoard,
  hasPossibleMove,
  makeMove
} = require('./game.js');

function clone(board) { return board.map(r => r.slice()); }

(function testFindsHorizontalAndVerticalMatches() {
  const board = [
    [1,1,1,2,3],
    [2,3,4,5,1],
    [2,3,4,5,1],
    [2,4,4,5,1],
    [3,4,5,1,2],
  ];
  const matches = findMatches(board);
  const keys = new Set(matches.map(([r,c]) => `${r},${c}`));
  ['0,0','0,1','0,2','1,0','2,0','3,0','1,4','2,4','3,4'].forEach(k => assert(keys.has(k), k));
})();

(function testSwapCellsOnlySwapsTwoPositions() {
  const board = [[1,2],[3,4]];
  const next = swapCells(board, [0,0], [0,1]);
  assert.deepStrictEqual(next, [[2,1],[3,4]]);
  assert.deepStrictEqual(board, [[1,2],[3,4]], 'original board should not mutate');
})();

(function testCollapseFillsHolesAndKeepsDimensions() {
  const board = [
    [null,2,3],
    [1,null,3],
    [2,2,null],
    [3,1,1],
  ];
  const next = collapseBoard(board, () => 9);
  assert.strictEqual(next.length, 4);
  assert.strictEqual(next[0].length, 3);
  assert.deepStrictEqual(next.map(r => r[0]), [9,1,2,3]);
  assert.deepStrictEqual(next.map(r => r[1]), [9,2,2,1]);
  assert.deepStrictEqual(next.map(r => r[2]), [9,3,3,1]);
})();

(function testCreateBoardStartsWithoutMatchesAndHasAMove() {
  const board = createBoard(8, 8, 6, 12345);
  assert.strictEqual(findMatches(board).length, 0, JSON.stringify(board));
  assert.strictEqual(hasPossibleMove(board), true);
})();

(function testMakeMoveRejectsNonMatchingSwap() {
  const board = [
    [1,2,3],
    [4,5,6],
    [1,2,3],
  ];
  const result = makeMove(board, [0,0], [0,1], () => 1);
  assert.strictEqual(result.valid, false);
  assert.deepStrictEqual(result.board, board);
})();

(function testMakeMoveResolvesMatchAndScores() {
  const board = [
    [1,2,1],
    [2,1,2],
    [1,2,2],
  ];
  const fills = [3,4,5];
  const result = makeMove(board, [1,1], [1,2], () => fills.shift() || 6);
  assert.strictEqual(result.valid, true);
  assert(result.score > 0);
  assert.strictEqual(findMatches(result.board).length, 0);
})();

console.log('All tests passed');
