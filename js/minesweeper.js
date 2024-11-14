"use strict"

// done : undo button functionality
// done : previousMovesAndStates store each stage of the board and stats
// done : make lives and gameover management work properly
// ========= GAME FUNCTIONALITY ========
// done : complete recursive cell reveal on cells that have no mines around
// done : allow player to input how many mines
// todo : create default difficulties easy medium and hard
// todo : allow player to input boardSize rows and cols
// todo : fix any existing bugs
// ======== CODE REFINEMENT =========
// in progress : refactor the code as best as you can
// done : style the game as desired
// todo : add hover effects

const FLAG = `cell-marked`
const MINE = `mine`
const EMPTY = `cell-show`
const HIDDEN = `hidden`
const SAFE = `cell-safe`
const EDIT = `cell-edit`
const WINNER = `<span class="ui-icon yellow success"></span>`
const LOSER = `<span class="ui-icon yellow fail"></span>`
const START = `<span class="ui-icon yellow start"></span>`

// model - DATA
const gameStates = []
var gGameBoard = []
var gGame
var boardSize
var gGame
var timePassed
var timePassedIntervalId
var isHint
var isPlaceCustomMines
var cellCount = 0
var reStartEmoji = START

// view - DOM
var elGameTable
var elTimePassed
var elFlagsLeft
var elLivesLeft
var elHintsLeft
var elSafeLeft
var elSafeBtn
var elHintBtn
var elDisabledBtns
var elRestartBtn
var elEditBtn
var elOpenModalBtn

function init() {
  ;(() => {
    if (!getData("boardSize")) {
      setData("boardSize", { rowCount: 6, colCount: 6 })
    }
  })()
  boardSize = getData("boardSize")
  gGameBoard = buildBoard(boardSize)
  gGame = {
    isGameOver: false,
    livesLeft: 1,
    hintsCount: 3,
    safeClickCount: 2,
    shownCount: 0,
    markedCount: 0,
    mineCount: 2,
    flagsCount: 2,
  }
  gameStates.splice(0, gameStates.length)
  isHint = false
  isPlaceCustomMines = false

  resetInterval()

  document.querySelector("body").addEventListener("keydown", cancelHint)

  setDocumentSelectors()

  elFlagsLeft.innerText = gGame.flagsCount
  elLivesLeft.innerText = gGame.livesLeft
  elHintsLeft.innerText = gGame.hintsCount
  elSafeLeft.innerText = gGame.safeClickCount
  elRestartBtn.innerHTML = reStartEmoji

  disableBtns()
  setDisabledBtn(elEditBtn, false)
  setMines(gGameBoard)
  setMinesCount()
  elTimePassed.innerText = "000"
  elGameTable.innerHTML = renderBoard(gGameBoard)
  saveGameState()
}

function handleSafeClick() {
  const safeCells = gGameBoard.flat().filter((e) => !e.isMine && !e.isShown)
  const cellCoord = getRandCell(safeCells).coord
  const safeCell = document.querySelector(`[data-coord = "${cellCoord}"]`)
  renderCell(safeCell, SAFE)
  setDisabledBtn(elSafeBtn, true)
  elSafeLeft.innerText = --gGame.safeClickCount
  if (gGame.safeClickCount === 0) {
    setDisabledBtn(elSafeBtn, true)
  }
  setTimeout(() => {
    renderCell(safeCell, HIDDEN)
    gGame.safeClickCount === 0
      ? setDisabledBtn(elSafeBtn, true)
      : setDisabledBtn(elSafeBtn, false)
  }, 1200)
}

function setMines(boardMatrix) {
  // const cells = boardMatrix.flat().filter((e) => !e.isMine || !e.isShown)
  for (var i = 0; i < gGame.mineCount; i++) {
    const cells = boardMatrix.flat().filter((e) => !e.isMine)
    var cell = getRandCell(cells)
    cell.isMine = true
  }
}

function checkGameOver() {
  const cellsMarkedWithMinesCount = gGameBoard
    .flat()
    .filter((e) => e.isMine && e.isMarked).length
  if (cellsMarkedWithMinesCount === gGame.mineCount) {
    console.log("YOU WIN!!!")
    elRestartBtn.innerHTML = WINNER
    gGame.isGameOver = true
    gGameBoard.flat().forEach((e) => {
      e.isShown = true
    })
    elGameTable.innerHTML = renderBoard(gGameBoard)
    resetInterval()
    disableBtns()
  }
  if (gGame.livesLeft < 0) {
    console.log("YOU LOSE!!!")
    elRestartBtn.innerHTML = LOSER
    gGame.isGameOver = true
    gGameBoard.flat().forEach((e) => {
      e.isShown = true
    })
    elGameTable.innerHTML = renderBoard(gGameBoard)
    resetInterval()
    disableBtns()
  }
}

// 1 livesLeft - 2mines  win = cellsMarked with mines = 2
// 0 livesLeft - 2mines win = cellsMarkedWithMines && cellsShownwithMines = 2
// if livesLeft = 0 and next cell clicked isMine gameOver you lose

function handleHintClick() {
  if (gGame.hintsCount === 0) return
  isHint = true
  elDisabledBtns.forEach((e) => setDisabledBtn(e, true))
}

function cancelHint(ev) {
  if (!isHint) return
  if (ev.key === "Escape") {
    isHint = false
    elDisabledBtns.forEach((e) => setDisabledBtn(e, isHint))
  }
}

function setMinesCount() {
  gGameBoard.flat().forEach((e) => {
    var mineCount = 0
    neighbourLoop(gGameBoard, { i: e.i, j: e.j }).forEach((cell) => {
      if (cell.isMine) mineCount++
    })
    gGameBoard[e.i][e.j].minesAroundCount = mineCount
  })
}

function setTimePassed() {
  var strZeros = "00" + ++timePassed
  elTimePassed.innerText = strZeros.slice(-3)
}

function resetInterval() {
  clearInterval(timePassedIntervalId)
  timePassedIntervalId = 0
  timePassed = 0
}

function setDisabledBtn(elBtn, isDisabled) {
  elBtn.disabled = isDisabled
}

function disableBtns(isEnabled = true) {
  elDisabledBtns.forEach((e) => setDisabledBtn(e, isEnabled))
}

function edit() {
  if (isPlaceCustomMines) {
    isPlaceCustomMines = false
    // elEditBtn.innerText = "Place Mines"
    elGameTable.innerHTML = renderBoard(gGameBoard, isPlaceCustomMines)
    setMinesCount()
    return
  }
  gGameBoard = buildBoard(boardSize, isPlaceCustomMines)
  // elEditBtn.innerText = "Done"
  isPlaceCustomMines = true
  gGame.mineCount = 0
  gGame.flagsCount = gGame.mineCount
  elFlagsLeft.innerText = gGame.flagsCount
  gGameBoard = buildBoard(boardSize)
  elGameTable.innerHTML = renderBoard(gGameBoard, isPlaceCustomMines)
}

function setDocumentSelectors() {
  elEditBtn = document.querySelector(".edit")
  elRestartBtn = document.querySelector("#reset")
  elSafeBtn = document.querySelector(".safe")
  elLivesLeft = document.querySelector(".lives-left")
  elSafeLeft = document.querySelector(".safe-left")
  elHintsLeft = document.querySelector(".hints-left")
  elFlagsLeft = document.querySelector(".flags-left")
  elGameTable = document.querySelector(".board")
  elHintBtn = document.querySelector(".hint")
  elDisabledBtns = document.querySelectorAll(".help-tool")
  elTimePassed = document.querySelector(".time")
  elOpenModalBtn = document.querySelector(".board-size-modal")
}

function setFlagCount(diff) {
  gGame.mineCount += diff
  gGame.flagsCount = gGame.mineCount
  elFlagsLeft.innerText = gGame.flagsCount
}

function undo() {
  gameStates.pop()
  disableBtns(gameStates.length < 2)
  gGame = { ...gameStates[gameStates.length - 1].gGame }
  gGameBoard = gameStates[gameStates.length - 1].gameBoard
  setGameStatsValues()
  elGameTable.innerHTML = renderBoard(gGameBoard)
}

function saveGameState() {
  const currBoard = []
  for (var i = 0; i < gGameBoard.length; i++) {
    currBoard.push([])
    for (var j = 0; j < gGameBoard[i].length; j++) {
      currBoard[i].push({ ...gGameBoard[i][j] })
    }
  }
  const currState = {
    gGame: { ...gGame },
    gameBoard: currBoard,
  }
  gameStates.push(currState)
}

function setGameStatsValues() {
  elFlagsLeft.innerText = gGame.flagsCount
  elLivesLeft.innerText = gGame.livesLeft
  elHintsLeft.innerText = gGame.hintsCount
  elSafeLeft.innerText = gGame.safeClickCount
}

function openModal() {
  const elModal = document.querySelector(".modal-container")
  document.querySelector("#rowCount").value = boardSize.rowCount
  document.querySelector("#colCount").value = boardSize.colCount
  elModal.classList.toggle("hide-modal")
}

function updateBoardSize() {
  const rowsVal = +document.querySelector("#rowCount").value
  const colsVal = +document.querySelector("#colCount").value
  setData("boardSize", { rowCount: rowsVal, colCount: colsVal })
  openModal()
  init()
}
