"use strict";
const jsboard = /* @__PURE__ */ function() {
  function Board(table, size, attachedId) {
    var matrixForm = [];
    if (table === null) {
      console.error("No table found from attached ID");
      return;
    }
    var methods2 = {
      // return matrix form of game board
      matrix: function() {
        while (matrixForm.length > 0) {
          matrixForm.pop();
        }
        for (var r = 0; r < table.childNodes.length; r++) {
          matrixForm.push([]);
          for (var c = 0; c < table.childNodes[0].childNodes.length; c++) {
            if (typeof table.childNodes[r].childNodes[c].childNodes[0] != "undefined") {
              matrixForm[r].push(
                table.childNodes[r].childNodes[c].childNodes[0].innerHTML
              );
            } else {
              matrixForm[r].push(null);
            }
          }
        }
        return matrixForm;
      },
      DOM() {
        return table;
      },
      // return rows
      rows: function() {
        return size[0];
      },
      // return cols
      cols: function() {
        return size[1];
      },
      // change board style
      style: function(props) {
        const attachedEl = document.getElementById(attachedId);
        for (var st in props) {
          if (attachedEl) {
            attachedEl.style.setProperty(camelCaseToHyphen(st), props[st]);
          }
        }
      },
      // remove all event listeners on board
      removeEvents: function(ev, func) {
        const boardElement = document.getElementById(attachedId);
        if (boardElement) {
          Array.from(boardElement.getElementsByTagName("td")).forEach(
            (cell) => {
              if (cell) {
                cell.removeEventListener(ev, func);
              }
            }
          );
        }
      },
      clean() {
        var _a, _b, _c, _d;
        const tds = document.getElementsByTagName("td");
        while (tds.length > 0) {
          (_b = (_a = tds[0]) == null ? void 0 : _a.parentNode) == null ? void 0 : _b.removeChild(tds[0]);
        }
        const trs = document.getElementsByTagName("tr");
        while (trs.length > 0) {
          (_d = (_c = trs[0]) == null ? void 0 : _c.parentNode) == null ? void 0 : _d.removeChild(trs[0]);
        }
      },
      // inner cell functions
      cell: function(arr, move) {
        function getBoardCell(row, col) {
          var _a;
          const node = (_a = document.getElementById(attachedId)) == null ? void 0 : _a.getElementsByClassName("boardRow_" + row)[0];
          if (node) {
            return node.childNodes[col];
          }
          return null;
        }
        function getObjFromDataAtr(pl) {
          var wh = pl.split("x").map((d) => parseInt(d));
          if (move) {
            var r = movePieceInMatrix(move, [wh[0], wh[1]]);
            wh[0] = r[0];
            wh[1] = r[1];
          }
          return [wh[0], wh[1]];
        }
        function movePieceInMatrix(keepDec, wh) {
          if (keepDec < 0) {
            while (keepDec < 0) {
              if (wh[1] > 0) {
                wh[1] -= 1;
              } else {
                wh[1] = size[1] - 1;
                wh[0] -= 1;
              }
              keepDec++;
            }
          } else {
            while (keepDec > 0) {
              if (wh[1] < size[1] - 1) {
                wh[1] += 1;
              } else {
                wh[1] = 0;
                wh[0] += 1;
              }
              keepDec--;
            }
          }
          return [wh[0], wh[1]];
        }
        var cellMethods = {
          DOM: function() {
            var _a;
            if (Array.isArray(arr)) {
              if (arr[0] < 0 || arr[1] < 0 || arr[0] > size[0] - 1 || arr[1] > size[1] - 1) {
                return document.createElement("div");
              }
              const node = (_a = document.getElementById(attachedId)) == null ? void 0 : _a.getElementsByClassName("boardRow_" + arr[0])[0];
              if (node) {
                return node.childNodes[arr[1]];
              }
              return null;
            } else if (typeof arr === "object") {
              var wh = getObjFromDataAtr(arr.getAttribute("data-matrixval"));
              if (wh[0] < 0 || wh[1] < 0 || wh[0] > size[0] - 1 || wh[1] > size[1] - 1) {
                return document.createElement("div");
              }
              var th = getBoardCell(wh[0], wh[1]);
              if (th && typeof th.childNodes[0] == "undefined") {
                return document.createElement("div");
              }
              return getBoardCell(wh[0], wh[1]);
            }
            return null;
          },
          // styling for cells
          style: function(props) {
            if (arr == "each") {
              for (var st in props) {
                for (var r = 0; r < size[0]; r++) {
                  for (var c = 0; c < size[1]; c++) {
                    const cell = getBoardCell(r, c);
                    if (cell !== null) {
                      cell.style.setProperty(
                        camelCaseToHyphen(st),
                        props[st]
                      );
                    }
                  }
                }
              }
            } else if (Array.isArray(arr)) {
              if (arr[0] < 0 || arr[1] < 0 || arr[0] > size[0] - 1 || arr[1] > size[1] - 1) {
                return "OOB";
              }
              for (var st in props) {
                const cell = getBoardCell(arr[0], arr[1]);
                if (cell) {
                  cell.style.setProperty(
                    camelCaseToHyphen(st),
                    props[st]
                  );
                }
              }
            } else {
              var wh = getObjFromDataAtr(arr.getAttribute("data-matrixval"));
              if (wh[0] < 0 || wh[1] < 0 || wh[0] > size[0] - 1 || wh[1] > size[1] - 1) {
                return "OOB";
              }
              var th = getBoardCell(wh[0], wh[1]);
              for (var st in props) {
                if (th) {
                  th.style.setProperty(
                    camelCaseToHyphen(st),
                    props[st]
                  );
                }
              }
            }
            return null;
          },
          // place cloned piece in cell
          place: function(piece, cleanCell = true) {
            var _a, _b;
            if (arr == "each") {
              for (var r = 0; r < size[0]; r++) {
                for (var c = 0; c < size[1]; c++) {
                  var th = getBoardCell(r, c);
                  if (cleanCell) {
                    while (th && th.firstChild) {
                      th.removeChild(th.firstChild);
                    }
                  }
                  var ra = Math.floor(Math.random() * 3e3 + 1);
                  var n = piece.cloneNode(true);
                  n.className = "pieceID_" + ra;
                  th == null ? void 0 : th.appendChild(n);
                }
              }
            } else if (Array.isArray(arr)) {
              var th = getBoardCell(arr[0], arr[1]);
              if (cleanCell) {
                while (th && th.firstChild) {
                  th.removeChild(th.firstChild);
                }
              }
              (_a = getBoardCell(arr[0], arr[1])) == null ? void 0 : _a.appendChild(piece);
            } else {
              var wh = getObjFromDataAtr(arr.getAttribute("data-matrixval"));
              if (wh[0] < 0 || wh[1] < 0 || wh[0] > size[0] - 1 || wh[1] > size[1] - 1) {
                return "OOB";
              }
              var th = getBoardCell(wh[0], wh[1]);
              if (cleanCell) {
                while (th && th.firstChild) {
                  th.removeChild(th.firstChild);
                }
              }
              (_b = getBoardCell(wh[0], wh[1])) == null ? void 0 : _b.appendChild(piece);
            }
            return null;
          },
          // remove all pieces from cell
          rid: function() {
            if (arr == "each") {
              for (var r = 0; r < size[0]; r++) {
                for (var c = 0; c < size[1]; c++) {
                  var th = getBoardCell(r, c);
                  while (th && th.firstChild) {
                    th.removeChild(th.firstChild);
                  }
                }
              }
            } else if (Array.isArray(arr)) {
              var th = getBoardCell(arr[0], arr[1]);
              while (th && th.firstChild) {
                th.removeChild(th.firstChild);
              }
            } else {
              var wh = getObjFromDataAtr(arr.getAttribute("data-matrixval"));
              if (wh[0] < 0 || wh[1] < 0 || wh[0] > size[0] - 1 || wh[1] > size[1] - 1) {
                return "OOB";
              }
              var th = getBoardCell(wh[0], wh[1]);
              while (th && th.firstChild) {
                th.removeChild(th.firstChild);
              }
            }
            return null;
          },
          // event listener for cells
          on: function(ev, func) {
            var _a, _b;
            if (arr == "each") {
              for (var r = 0; r < size[0]; r++) {
                for (var c = 0; c < size[1]; c++) {
                  (_a = getBoardCell(r, c)) == null ? void 0 : _a.addEventListener(ev, func);
                }
              }
            } else if (Array.isArray(arr)) {
              if (arr[0] < 0 || arr[1] < 0 || arr[0] > size[0] - 1 || arr[1] > size[1] - 1) {
                return "OOB";
              }
              (_b = getBoardCell(arr[0], arr[1])) == null ? void 0 : _b.addEventListener(ev, func);
            } else {
              var wh = getObjFromDataAtr(arr.getAttribute("data-matrixval"));
              if (wh[0] < 0 || wh[1] < 0 || wh[0] > size[0] - 1 || wh[1] > size[1] - 1) {
                return "OOB";
              }
              var th = getBoardCell(wh[0], wh[1]);
              th == null ? void 0 : th.addEventListener(ev, func);
            }
            return null;
          },
          // remove event listener for cells
          removeOn: function(ev, func) {
            var _a, _b;
            if (arr == "each") {
              for (var r = 0; r < size[0]; r++) {
                for (var c = 0; c < size[1]; c++) {
                  (_a = getBoardCell(r, c)) == null ? void 0 : _a.removeEventListener(ev, func);
                }
              }
            } else if (Array.isArray(arr)) {
              if (arr[0] < 0 || arr[1] < 0 || arr[0] > size[0] - 1 || arr[1] > size[1] - 1) {
                return "OOB";
              }
              (_b = getBoardCell(arr[0], arr[1])) == null ? void 0 : _b.removeEventListener(ev, func);
            } else {
              var wh = getObjFromDataAtr(arr.getAttribute("data-matrixval"));
              if (wh[0] < 0 || wh[1] < 0 || wh[0] > size[0] - 1 || wh[1] > size[1] - 1) {
                return "OOB";
              }
              var th = getBoardCell(wh[0], wh[1]);
              th == null ? void 0 : th.removeEventListener(ev, func);
            }
            return null;
          },
          // get content of given cell
          // this is why text property of a piece is required
          // otherwise it would return null
          get: function() {
            if (Array.isArray(arr)) {
              if (arr[0] < 0 || arr[1] < 0 || arr[0] > size[0] - 1 || arr[1] > size[1] - 1) {
                return "OOB";
              }
              var th = getBoardCell(arr[0], arr[1]);
              if (th && typeof th.childNodes[0] == "undefined") {
                return null;
              } else {
                return th == null ? void 0 : th.childNodes[0].childNodes[0];
              }
            } else if (arr != "each") {
              var wh = getObjFromDataAtr(arr.getAttribute("data-matrixval"));
              if (wh[0] < 0 || wh[1] < 0 || wh[0] > size[0] - 1 || wh[1] > size[1] - 1) {
                return "OOB";
              }
              var th = getBoardCell(wh[0], wh[1]);
              if (typeof (th == null ? void 0 : th.childNodes[0]) == "undefined") {
                return null;
              } else {
                return th.childNodes[0].childNodes[0];
              }
            }
            return null;
          },
          // get where in matrix current cell is
          where: function() {
            if (!Array.isArray(arr) && typeof arr === "object") {
              var wh = getObjFromDataAtr(arr.getAttribute("data-matrixval"));
              if (wh[0] < 0 || wh[1] < 0 || wh[0] > size[0] - 1 || wh[1] > size[1] - 1) {
                return "OOB";
              }
              return [wh[0], wh[1]];
            }
            return null;
          }
        };
        return cellMethods;
      }
    };
    return methods2;
  }
  function Piece(node) {
    var node = node;
    var methods2 = {
      clone: function() {
        var nn = node.cloneNode(true);
        var ra = Math.floor(Math.random() * 3e3 + 1);
        nn.className = "piece pieceID_" + ra;
        return nn;
      },
      style: function(props) {
        for (var st in props) {
          node.style.setProperty(camelCaseToHyphen(st), props[st]);
        }
      }
    };
    return methods2;
  }
  var methods = {
    // create new game board
    board: function(props) {
      var size = [0, 0];
      if (!props.attach) {
        console.error("Need attachment for game board");
        return;
      }
      var attachedBoard = document.getElementById(props.attach);
      if (attachedBoard === null) {
        console.error(
          "You should attach the board with an Id on a table element"
        );
        return;
      }
      for (var el in props) {
        if (el == "size") {
          size = props[el].split("x").map((s) => parseInt(s));
          for (var i = 0; i < size[0]; i++) {
            var a = document.createElement("tr");
            a.className = "boardRow boardRow_" + i;
            for (var k = 0; k < size[1]; k++) {
              var t = document.createElement("td");
              t.className = "boardCol boardCol_" + k;
              t.dataset.matrixval = i + "x" + k;
              a.appendChild(t);
            }
            attachedBoard.appendChild(a);
          }
          attachedBoard.style.borderSpacing = "2px";
          for (var i = 0; i < attachedBoard.getElementsByTagName("td").length; i++) {
            attachedBoard.getElementsByTagName("td")[i].style.background = "lightgray";
            attachedBoard.getElementsByTagName("td")[i].style.width = "50px";
            attachedBoard.getElementsByTagName("td")[i].style.height = "50px";
          }
          if (props.style && props.style == "checkerboard") {
            var colour = "gray";
            if (props.stylePattern) {
              for (var i = 0; i < attachedBoard.getElementsByTagName("td").length; i++) {
                attachedBoard.getElementsByTagName("td")[i].style.background = props.stylePattern[0];
              }
              colour = props.stylePattern[1];
            }
            for (var r = 0; r < size[0]; r++) {
              if (r % 2) var skipCol = true;
              else var skipCol = false;
              for (var c = 0; c < size[1]; c++) {
                if (skipCol)
                  attachedBoard.getElementsByClassName("boardRow_" + r)[0].childNodes[c].style.background = colour;
                skipCol = !skipCol;
              }
            }
          }
        }
      }
      return Board(attachedBoard, size, props.attach);
    },
    // create new game piece
    piece: function(props, datasets) {
      const a = document.createElement("div");
      if (props.text) {
        const n = document.createTextNode(props.text);
        a.appendChild(n);
      }
      for (var st in props) {
        if (st != "text") {
          a.style.setProperty(camelCaseToHyphen(st), props[st] ?? null);
        }
      }
      if (datasets) {
        Object.entries(datasets).forEach(([name, value]) => {
          a.dataset[name] = value;
        });
      }
      return Piece(a);
    }
  };
  return methods;
}();
const camelCaseToHyphen = (str) => {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
};
module.exports = jsboard;
