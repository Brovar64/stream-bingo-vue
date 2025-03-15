/**
 * Grid utility functions for the bingo game
 */

/**
 * Generate a bingo grid with random words
 * @param {Array} words - Array of words to use in the grid
 * @param {number} gridSize - Size of the grid (e.g., 3 for 3x3, 5 for 5x5)
 * @returns {Object} The generated grid
 */
export function generateBingoGrid(words, gridSize) {
  // Ensure we have enough words
  if (!words || words.length < gridSize * gridSize) {
    console.error(`Not enough words (${words?.length || 0}) for grid size ${gridSize}x${gridSize}`);
    return null;
  }
  
  // Shuffle words for randomness
  const shuffledWords = [...words].sort(() => Math.random() - 0.5);
  
  // Create grid
  const grid = {};
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const index = row * gridSize + col;
      const cellKey = `${row}_${col}`;
      
      // Every cell uses a regular word - no special handling for center
      grid[cellKey] = {
        word: shuffledWords[index],
        row: row,
        col: col,
        marked: false,
        approved: false
      };
    }
  }
  
  return grid;
}

/**
 * Check if a player has achieved bingo
 * @param {Object} grid - The player's grid
 * @param {number} gridSize - Size of the grid (e.g., 3 for 3x3, 5 for 5x5)
 * @returns {boolean} True if the player has bingo, false otherwise
 */
export function checkForBingo(grid, gridSize) {
  if (!grid) return false;
  
  // Check rows
  for (let row = 0; row < gridSize; row++) {
    let rowComplete = true;
    for (let col = 0; col < gridSize; col++) {
      const cell = grid[`${row}_${col}`];
      if (!cell || !cell.marked || !cell.approved) {
        rowComplete = false;
        break;
      }
    }
    if (rowComplete) return true;
  }
  
  // Check columns
  for (let col = 0; col < gridSize; col++) {
    let colComplete = true;
    for (let row = 0; row < gridSize; row++) {
      const cell = grid[`${row}_${col}`];
      if (!cell || !cell.marked || !cell.approved) {
        colComplete = false;
        break;
      }
    }
    if (colComplete) return true;
  }
  
  // Check diagonals
  let diag1Complete = true;
  let diag2Complete = true;
  
  for (let i = 0; i < gridSize; i++) {
    const cell1 = grid[`${i}_${i}`];
    if (!cell1 || !cell1.marked || !cell1.approved) {
      diag1Complete = false;
    }
    
    const cell2 = grid[`${i}_${gridSize - 1 - i}`];
    if (!cell2 || !cell2.marked || !cell2.approved) {
      diag2Complete = false;
    }
  }
  
  return diag1Complete || diag2Complete;
}
