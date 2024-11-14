"use strict"
console.log("ls running")

function setData(itemName, data) {
  localStorage.setItem(itemName, JSON.stringify(data))
}
function getData(itemName) {
  return JSON.parse(localStorage.getItem(itemName))
}
function clearData() {
  localStorage.clear()
}
function removeData(itemName) {
  localStorage.removeItem(itemName)
}
