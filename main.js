class Cell {

    constructor(x, y, parent) {

        this.x = x;
        this.y = y;

        this.div = document.createElement("div");
        this.div.setAttribute("class", "garden-cell");

        parent.appendChild(this.div);

    }// constructor

}// class Cell

class Plant {

    constructor(name, growTimeTicks, sprites) {
        
    }// constructor

}// class Plant

var Game = Object();

Game.garden = Object();

Game.garden.rows = 3;
Game.garden.collums = 3;

Game.garden.div = document.getElementById("garden-div");

Game.garden.cells = Array();

Game.garden.setup = function() {

    let table = document.createElement("table");

    table.className = "garden-table";

    for(let i = 0; i < Game.garden.rows; i++) {
        let row = document.createElement("tr");
        Game.garden.cells[i] = Array();

        for(let j = 0; j < Game.garden.collums; j++) {

            let tableCell = document.createElement("td");

            Game.garden.cells[i][j] = new Cell(i, j, tableCell);

            row.appendChild(tableCell);

        }

        table.appendChild(row);
    }

    Game.garden.div.appendChild(table);

}// game.garden.setup()

Game.init = function() {
    Game.garden.setup();
}// game.init()

Game.init();