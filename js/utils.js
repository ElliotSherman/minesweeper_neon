"use strict"

function buildBoard({ rowCount, colCount }) {
  const board = []
  for (var i = 0; i < rowCount; i++) {
    board.push([])
    for (var j = 0; j < colCount; j++) {
      board[i][j] = {
        coord: `${i}-${j}`,
        i,
        j,
        minesAroundCount: null,
        isShown: false,
        isMine: false,
        isMarked: false,
      }
    }
  }
  return board
}

function getRandCell(vals) {
  var randVal = vals[getRandNum(0, vals.length - 1)]
  return randVal
}

function getRandNum(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function renderBoard(boardMatrix, isPlaceCustomMines = false) {
  var boardStr = ""
  for (var i = 0; i < boardMatrix.length; i++) {
    boardStr += `<tr>\n`
    for (var j = 0; j < boardMatrix[i].length; j++) {
      var cell = boardMatrix[i][j]
      var styleClassName
      if (isPlaceCustomMines) {
        styleClassName = EDIT
      } else {
        styleClassName = !cell.isShown ? HIDDEN : cell.isMine ? MINE : EMPTY
      }
      boardStr += `\t<td
          class="cursor ${styleClassName}"
          oncontextmenu="cellMarked(this)"
          onclick="cellClicked(this)"
          data-coord="${cell.coord}"
        >${
          cell.minesAroundCount > 0 && cell.isShown && !cell.isMine
            ? cell.minesAroundCount
            : ""
        }
        </td>\n`
    }
    boardStr += `</tr>\n`
  }
  return boardStr
}

function getCoord(elCell) {
  var i = +elCell.dataset.coord.split("-")[0]
  var j = +elCell.dataset.coord.split("-")[1]
  return { i, j }
}

function renderCell(elCell, className, value = "") {
  const classToRemove = elCell.classList[1]
  elCell.classList.remove(classToRemove)
  elCell.classList.add(className)
  elCell.innerText = value
}

function neighbourLoop(matrix, coord) {
  const neigbours = []
  neigbours.push(matrix[coord.i][coord.j])
  const negsDirections = [
    { x: -1, y: -1 }, // topLeft
    { x: 0, y: -1 }, // top
    { x: 1, y: -1 }, // topRight
    { x: 1, y: 0 }, // right
    { x: -1, y: 0 }, // left
    { x: -1, y: 1 }, // bottomLeft
    { x: 0, y: 1 }, // bottom
    { x: 1, y: 1 }, // bottomRight
  ]

  for (var i = 0; i < negsDirections.length; i++) {
    var x = coord.i + negsDirections[i].x
    var y = coord.j + negsDirections[i].y
    // console.log("elem", x, y)
    var isInBouundries =
      x >= 0 && x < matrix.length && y >= 0 && y < matrix[0].length
    if (isInBouundries) {
      neigbours.push(matrix[x][y])
    }
  }
  return neigbours
}
