"use strict"

function cellClicked(elCell) {
  if (gGame.isGameOver) return

  var coord = getCoord(elCell)
  var row = coord.i
  var col = coord.j
  var cellClicked = gGameBoard[row][col]

  if (isPlaceCustomMines) {
    placeMine(cellClicked)
    return
  }
  // on first cellClicked
  if (!timePassedIntervalId) {
    timePassedIntervalId = setInterval(setTimePassed, 1000)
    elDisabledBtns.forEach((e) => setDisabledBtn(e, false))
    setDisabledBtn(elEditBtn, true)
    if (cellClicked.isMine) {
      var emptyCells = gGameBoard.flat().filter((e) => !e.isMine)
      var alternativeCell = getRandCell(emptyCells)
      cellClicked.isMine = false
      alternativeCell.isMine = true
      setMinesCount()
    }
  }
  if (gameStates.length < 1) {
    disableBtns(true)
  } else {
    disableBtns(false)
  }
  if (isHint) {
    if (cellClicked.isShown) return
    hintCellClicked(elCell)
    return
  }

  if (cellClicked.isMarked)
    // handle FLAGED cell
    return

  // handle EMPTY cell
  if (!cellClicked.isShown) {
    cellClicked.isShown = true
    cellClicked.minesAroundCount === 0
      ? renderCell(elCell, EMPTY)
      : renderCell(elCell, EMPTY, cellClicked.minesAroundCount)
    revealCells(cellClicked)
  }

  // handle MINE cell
  if (cellClicked.isMine) {
    renderCell(elCell, MINE)
    gGame.livesLeft--
    gGame.mineCount--
    gGame.flagsCount--
    elFlagsLeft.innerText = gGame.flagsCount
    elLivesLeft.innerText = gGame.livesLeft < 0 ? 0 : gGame.livesLeft
    checkGameOver()
  }

  gGame.shownCount++
  saveGameState()
}

function cellMarked(elCell) {
  if (!timePassedIntervalId || isHint) return

  var coord = getCoord(elCell)
  var cell = gGameBoard[coord.i][coord.j]

  if (cell.isShown) return

  if (!cell.isMarked) {
    if (gGame.flagsCount === 0) return
    cell.isMarked = !cell.isMarked
    if (cell.isMine) {
      checkGameOver()
    }
    gGame.flagsCount--
    elFlagsLeft.innerText = gGame.flagsCount
  } else {
    cell.isMarked = !cell.isMarked
    gGame.flagsCount++
    elFlagsLeft.innerText = gGame.flagsCount
  }
  renderCell(elCell, cell.isMarked ? FLAG : HIDDEN)
  saveGameState()
}

function hintCellClicked(elCell) {
  if (isHint) isHint = false
  elDisabledBtns.forEach((e) => setDisabledBtn(e, isHint))
  var coord = getCoord(elCell)
  var neigCells = neighbourLoop(gGameBoard, coord)
  neigCells.map((e) => {
    var currCell = document.querySelector(`[data-coord="${e.coord}"]`)
    var prevType = currCell.classList[1]
    var renderType = e.isMine
      ? MINE
      : e.minesAroundCount > 0
      ? EMPTY
      : e.isMarked
      ? FLAG
      : EMPTY
    renderCell(currCell, renderType, e.isMine ? "" : e.minesAroundCount)
    setTimeout(() => {
      renderCell(currCell, prevType)
    }, 1000)
  })

  elHintsLeft.innerText = --gGame.hintsCount
  setDisabledBtn(elHintBtn, gGame.hintsCount === 0)
}

function revealCells(clickedCell) {
  console.log("running reveal cells")

  const clickedCellNeigbours = neighbourLoop(gGameBoard, {
    i: clickedCell.i,
    j: clickedCell.j,
  })
  for (var i = 0; i < clickedCellNeigbours.length; i++) {
    if (
      !clickedCellNeigbours[i].isMine &&
      !clickedCellNeigbours[i].minesAroundCount
    ) {
      const currCellCoord = clickedCellNeigbours[i].coord
      const currCell = document.querySelector(
        `[data-coord = "${currCellCoord}"]`
      )
      cellClicked(currCell)
    } else continue
  }
}

function placeMine(cell) {
  const elCell = document.querySelector(`[data-coord="${cell.coord}"]`)
  if (cell.isMine) {
    cell.isMine = false
    renderCell(elCell, EDIT)
    setFlagCount(-1)
  } else {
    cell.isMine = true
    renderCell(elCell, MINE)
    setFlagCount(1)
  }
}
