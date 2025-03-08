/*
The MIT License (MIT)

Copyright (c) 2015 Daniel Borowski

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

export type SizeTuples = [number, number];

export type Piece = {
  clone: () => HTMLElement;
  style: (props: Record<string, string>) => void;
};

export type Cell = {
  DOM: () => ChildNode | null;
  // styling for cells
  style: (props: Record<string, string>) => "OOB" | null;
  // place cloned piece in cell
  place: (piece: Node, cleanCell?: boolean) => "OOB" | null;
  // remove all pieces from cell
  rid: () => "OOB" | null;
  // event listener for cells
  on: (ev: string, func: () => void) => "OOB" | null;
  // remove event listener for cells
  removeOn: (ev: string, func: () => void) => "OOB" | null;
  // get content of given cell
  // this is why text property of a piece is required
  // otherwise it would return null
  get: () => ChildNode | "OOB" | null | undefined;
  // get where in matrix current cell is
  where: () => SizeTuples | "OOB" | null;
};

export type Board = {
  DOM: () => HTMLElement;
  // return matrix form of game board
  matrix: () => (string | null)[][];
  // return rows
  rows: () => number;
  // return cols
  cols: () => number;
  // change board style
  style: (props: Record<string, string>) => void;
  // remove all event listeners on board
  removeEvents: (ev: string, func: () => void) => void;
  // remove all td and th
  clean: () => void;
  // inner cell functions
  cell: (arr: [number, number] | HTMLElement | "each", move?: number) => Cell;
};

type PieceProps = Partial<CSSStyleDeclaration> & {
  text: string;
};

type Init = {
  attach: string;
  size: string;
  style: string;
  stylePattern?: [string, string];
};

const jsboard = (function () {
  "use strict";

  // constr
  function Board(
    table: HTMLElement | null,
    size: SizeTuples,
    attachedId: string
  ): Board | undefined {
    var matrixForm: (string | null)[][] = [];
    if (table === null) {
      console.error("No table found from attached ID");
      return;
    }
    var methods = {
      // return matrix form of game board
      matrix: function () {
        while (matrixForm.length > 0) {
          matrixForm.pop();
        }
        for (var r = 0; r < table.childNodes.length; r++) {
          matrixForm.push([]);
          for (var c = 0; c < table.childNodes[0].childNodes.length; c++) {
            if (
              typeof table.childNodes[r].childNodes[c].childNodes[0] !=
              "undefined"
            ) {
              matrixForm[r].push(
                (table.childNodes[r].childNodes[c].childNodes[0] as HTMLElement)
                  .innerHTML
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
      rows: function () {
        return size[0];
      },
      // return cols
      cols: function () {
        return size[1];
      },
      // change board style
      style: function (props: Record<string, string>) {
        const attachedEl = document.getElementById(attachedId);

        for (var st in props) {
          if (attachedEl) {
            attachedEl.style.setProperty(camelCaseToHyphen(st), props[st]);
          }
        }
      },
      // remove all event listeners on board
      removeEvents: function (ev: string, func: () => void) {
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
        const tds = document.getElementsByTagName("td");
        while (tds.length > 0) {
          tds[0]?.parentNode?.removeChild(tds[0]);
        }
        const trs = document.getElementsByTagName("tr");
        while (trs.length > 0) {
          trs[0]?.parentNode?.removeChild(trs[0]);
        }
      },
      // inner cell functions
      cell: function (
        arr: [number, number] | HTMLElement | "each",
        move?: number
      ) {
        // get DOM node for given row and col
        function getBoardCell(row: number, col: number) {
          const node = document
            .getElementById(attachedId)
            ?.getElementsByClassName("boardRow_" + row)[0];
          if (node) {
            return node.childNodes[col];
          }
          return null;
        }
        // get DOM node from given data attribute
        function getObjFromDataAtr(pl: string) {
          var wh = pl.split("x").map((d) => parseInt(d));
          if (move) {
            var r = movePieceInMatrix(move, [wh[0], wh[1]]);
            wh[0] = r[0];
            wh[1] = r[1];
          }
          return [wh[0], wh[1]];
        }
        // move cell around matrix like so: b.cell(this,-12)
        function movePieceInMatrix(keepDec: number, wh: SizeTuples) {
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
          DOM: function () {
            if (Array.isArray(arr)) {
              if (
                arr[0] < 0 ||
                arr[1] < 0 ||
                arr[0] > size[0] - 1 ||
                arr[1] > size[1] - 1
              ) {
                return document.createElement("div");
              }

              const node = document
                .getElementById(attachedId)
                ?.getElementsByClassName("boardRow_" + arr[0])[0];
              if (node) {
                return node.childNodes[arr[1]];
              }
              return null;
            } else if (typeof arr === "object") {
              var wh = getObjFromDataAtr(arr.getAttribute("data-matrixval")!);
              if (
                wh[0] < 0 ||
                wh[1] < 0 ||
                wh[0] > size[0] - 1 ||
                wh[1] > size[1] - 1
              ) {
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
          style: function (props: Record<string, string>) {
            if (arr == "each") {
              for (var st in props) {
                for (var r = 0; r < size[0]; r++) {
                  for (var c = 0; c < size[1]; c++) {
                    const cell = getBoardCell(r, c);
                    if (cell !== null) {
                      (cell as HTMLElement).style.setProperty(
                        camelCaseToHyphen(st),
                        props[st]
                      );
                    }
                  }
                }
              }
            } else if (Array.isArray(arr)) {
              if (
                arr[0] < 0 ||
                arr[1] < 0 ||
                arr[0] > size[0] - 1 ||
                arr[1] > size[1] - 1
              ) {
                return "OOB";
              }
              for (var st in props) {
                const cell = getBoardCell(arr[0], arr[1]);
                if (cell) {
                  (cell as HTMLElement).style.setProperty(
                    camelCaseToHyphen(st),
                    props[st]
                  );
                }
              }
            } else {
              var wh = getObjFromDataAtr(arr.getAttribute("data-matrixval")!);
              if (
                wh[0] < 0 ||
                wh[1] < 0 ||
                wh[0] > size[0] - 1 ||
                wh[1] > size[1] - 1
              ) {
                return "OOB";
              }
              var th = getBoardCell(wh[0], wh[1]);
              for (var st in props) {
                if (th) {
                  (th as HTMLElement).style.setProperty(
                    camelCaseToHyphen(st),
                    props[st]
                  );
                }
              }
            }
            return null;
          },
          // place cloned piece in cell
          place: function (piece: Node, cleanCell = true) {
            if (arr == "each") {
              for (var r = 0; r < size[0]; r++) {
                for (var c = 0; c < size[1]; c++) {
                  var th = getBoardCell(r, c);
                  if (cleanCell) {
                    while (th && th.firstChild) {
                      th.removeChild(th.firstChild);
                    }
                  }
                  var ra = Math.floor(Math.random() * 3000 + 1);
                  var n = piece.cloneNode(true) as HTMLElement;
                  n.className = "pieceID_" + ra;
                  th?.appendChild(n);
                }
              }
            } else if (Array.isArray(arr)) {
              var th = getBoardCell(arr[0], arr[1]);
              if (cleanCell) {
                while (th && th.firstChild) {
                  th.removeChild(th.firstChild);
                }
              }
              getBoardCell(arr[0], arr[1])?.appendChild(piece);
            } else {
              var wh = getObjFromDataAtr(arr.getAttribute("data-matrixval")!);
              if (
                wh[0] < 0 ||
                wh[1] < 0 ||
                wh[0] > size[0] - 1 ||
                wh[1] > size[1] - 1
              ) {
                return "OOB";
              }
              var th = getBoardCell(wh[0], wh[1]);
              if (cleanCell) {
                while (th && th.firstChild) {
                  th.removeChild(th.firstChild);
                }
              }
              getBoardCell(wh[0], wh[1])?.appendChild(piece);
            }
            return null;
          },
          // remove all pieces from cell
          rid: function () {
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
              var wh = getObjFromDataAtr(arr.getAttribute("data-matrixval")!);
              if (
                wh[0] < 0 ||
                wh[1] < 0 ||
                wh[0] > size[0] - 1 ||
                wh[1] > size[1] - 1
              ) {
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
          on: function (ev: string, func: EventListenerOrEventListenerObject) {
            if (arr == "each") {
              for (var r = 0; r < size[0]; r++) {
                for (var c = 0; c < size[1]; c++) {
                  getBoardCell(r, c)?.addEventListener(ev, func);
                }
              }
            } else if (Array.isArray(arr)) {
              if (
                arr[0] < 0 ||
                arr[1] < 0 ||
                arr[0] > size[0] - 1 ||
                arr[1] > size[1] - 1
              ) {
                return "OOB";
              }
              getBoardCell(arr[0], arr[1])?.addEventListener(ev, func);
            } else {
              var wh = getObjFromDataAtr(arr.getAttribute("data-matrixval")!);
              if (
                wh[0] < 0 ||
                wh[1] < 0 ||
                wh[0] > size[0] - 1 ||
                wh[1] > size[1] - 1
              ) {
                return "OOB";
              }
              var th = getBoardCell(wh[0], wh[1]);
              th?.addEventListener(ev, func);
            }
            return null;
          },
          // remove event listener for cells
          removeOn: function (ev: string, func: () => void) {
            if (arr == "each") {
              for (var r = 0; r < size[0]; r++) {
                for (var c = 0; c < size[1]; c++) {
                  getBoardCell(r, c)?.removeEventListener(ev, func);
                }
              }
            } else if (Array.isArray(arr)) {
              if (
                arr[0] < 0 ||
                arr[1] < 0 ||
                arr[0] > size[0] - 1 ||
                arr[1] > size[1] - 1
              ) {
                return "OOB";
              }
              getBoardCell(arr[0], arr[1])?.removeEventListener(ev, func);
            } else {
              var wh = getObjFromDataAtr(arr.getAttribute("data-matrixval")!);
              if (
                wh[0] < 0 ||
                wh[1] < 0 ||
                wh[0] > size[0] - 1 ||
                wh[1] > size[1] - 1
              ) {
                return "OOB";
              }
              var th = getBoardCell(wh[0], wh[1]);
              th?.removeEventListener(ev, func);
            }
            return null;
          },
          // get content of given cell
          // this is why text property of a piece is required
          // otherwise it would return null
          get: function () {
            if (Array.isArray(arr)) {
              if (
                arr[0] < 0 ||
                arr[1] < 0 ||
                arr[0] > size[0] - 1 ||
                arr[1] > size[1] - 1
              ) {
                return "OOB";
              }
              var th = getBoardCell(arr[0], arr[1]);
              if (th && typeof th.childNodes[0] == "undefined") {
                return null;
              }
              // need data because it returns object
              else {
                return th?.childNodes[0].childNodes[0];
              }
            } else if (arr != "each") {
              var wh = getObjFromDataAtr(arr.getAttribute("data-matrixval")!);
              if (
                wh[0] < 0 ||
                wh[1] < 0 ||
                wh[0] > size[0] - 1 ||
                wh[1] > size[1] - 1
              ) {
                return "OOB";
              }
              var th = getBoardCell(wh[0], wh[1]);
              if (typeof th?.childNodes[0] == "undefined") {
                return null;
              } else {
                return th.childNodes[0].childNodes[0];
              }
            }
            return null;
          },
          // get where in matrix current cell is
          where: function () {
            if (!Array.isArray(arr) && typeof arr === "object") {
              var wh = getObjFromDataAtr(arr.getAttribute("data-matrixval")!);
              if (
                wh[0] < 0 ||
                wh[1] < 0 ||
                wh[0] > size[0] - 1 ||
                wh[1] > size[1] - 1
              ) {
                return "OOB";
              }
              return [wh[0], wh[1]] as SizeTuples;
            }
            return null;
          },
        };
        return cellMethods;
      },
    };

    return methods;
  }

  function Piece(node: HTMLElement): Piece {
    var node = node;

    var methods = {
      clone: function () {
        var nn = node.cloneNode(true) as HTMLElement;
        var ra = Math.floor(Math.random() * 3000 + 1);
        nn.className = "piece pieceID_" + ra;
        return nn;
      },
      style: function (props: Record<string, string>) {
        for (var st in props) {
          node.style.setProperty(camelCaseToHyphen(st), props[st]);
        }
      },
    };

    return methods;
  }

  // methods to create new game board and pieces
  var methods = {
    // create new game board
    board: function (props: Init) {
      var size: SizeTuples = [0, 0];
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
          size = props[el].split("x").map((s) => parseInt(s)) as SizeTuples;
          // create table data to represent game board in DOM
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

          // style default game board
          attachedBoard.style.borderSpacing = "2px";
          for (
            var i = 0;
            i < attachedBoard.getElementsByTagName("td").length;
            i++
          ) {
            attachedBoard.getElementsByTagName("td")[i].style.background =
              "lightgray";
            attachedBoard.getElementsByTagName("td")[i].style.width = "50px";
            attachedBoard.getElementsByTagName("td")[i].style.height = "50px";
          }
          // create checkerboard pattern
          if (props.style && props.style == "checkerboard") {
            var colour = "gray";
            if (props.stylePattern) {
              for (
                var i = 0;
                i < attachedBoard.getElementsByTagName("td").length;
                i++
              ) {
                attachedBoard.getElementsByTagName("td")[i].style.background =
                  props.stylePattern[0];
              }
              colour = props.stylePattern[1];
            }
            for (var r = 0; r < size[0]; r++) {
              if (r % 2) var skipCol = true;
              else var skipCol = false;
              for (var c = 0; c < size[1]; c++) {
                if (skipCol)
                  (
                    attachedBoard.getElementsByClassName("boardRow_" + r)[0]
                      .childNodes[c] as HTMLElement
                  ).style.background = colour;
                skipCol = !skipCol;
              }
            }
          }
        }
      }

      return Board(attachedBoard, size, props.attach);
    },

    // create new game piece
    piece: function (props: PieceProps, datasets?: Record<string, string>) {
      // create new DOM node to serve as piece
      const a = document.createElement("div");
      if (props.text) {
        const n = document.createTextNode(props.text);
        a.appendChild(n);
      }
      // add styles
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
    },
  };

  return methods;
})();

const camelCaseToHyphen = (str: string) => {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
};

export default jsboard;
