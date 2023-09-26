var Game = Object();

Game.garden = Object();

Game.garden.rows = 3;
Game.garden.collums = 3;

Game.garden.div = document.getElementById("garden-div");

Game.garden.cells = Array();

Game.plants = Object();

Game.plants.wheat = () => {return new Plant("Wheat", 5);};

Game.regesterClick = function(obj) {
    console.log("clicked:");
    console.log(obj);
    obj.onClick();
}// Game.regesterClick(obj)

class Cell {

    constructor(x, y, parent) {

        this.x = x;
        this.y = y;

        this.div = document.createElement("div");
        this.div.setAttribute("class", "garden-cell");

        parent.appendChild(this.div);

        this.plant = undefined;

        this.div.addEventListener('click', () => { Game.regesterClick(this); });

    }// constructor

    addPlant(plant) {

        this.plant = plant;

        if(this.plant.state == 'seed') {

            this.div.style = "background-color: yellow;";
            this.div.innerHTML = this.plant.growTimeTicks - this.plant.tickAge + 1;

        }
        else if(this.plant.state == 'mature') {

            this.div.style = "background-color: green";
            this.div.innerHTML = "";

        }
        else {

            this.div.style = "background-color: white";
            this.div.innerHTML = "";

        }

    }// addPlant()

    onClick() {

        if(this.plant) {

            this.plant = undefined;
            this.div.style = "background-color: white";
            this.div.innerHTML = "";

        }
        else {

            this.addPlant(Game.plants.wheat());

        }
    
    }// onClick()

    tick() {

        if(!this.plant) return;

        this.plant.tick();

        if(this.plant.state == 'seed') {

            this.div.style = "background-color: yellow;";
            this.div.innerHTML = this.plant.growTimeTicks - this.plant.tickAge + 1;

        }
        else if(this.plant.state == 'mature') {

            this.div.style = "background-color: green";
            this.div.innerHTML = "";

        }
        else {

            this.div.style = "background-color: white";
            this.div.innerHTML = "";

        }

    }// tick()

}// class Cell

class Plant {

    constructor(name, growTimeTicks) {

        this.name = name;
        this.growTimeTicks = growTimeTicks;

        this.state = 'seed';

        this.tickAge = 0;

    }// constructor

    harvest() {



    }// harvest()

    tick() {

        if(this.tickAge >= this.growTimeTicks && this.state == 'seed') {

            this.state = 'mature';

        }

        this.tickAge++;
    }// tick()

}// class Plant

Game.garden.setup = function() {

    let table = document.createElement("table");

    table.className = "garden-table";

    for(let x = 0; x < Game.garden.rows; x++) {

        let row = document.createElement("tr");
        Game.garden.cells[x] = Array();

        for(let y = 0; y < Game.garden.collums; y++) {

            let tableCell = document.createElement("td");

            Game.garden.cells[x][y] = new Cell(x, y, tableCell);

            row.appendChild(tableCell);

        }

        table.appendChild(row);

    }

    Game.garden.div.appendChild(table);

}// game.garden.setup()

Game.garden.tick = function() {

    for(let x = 0; x < Game.garden.rows; x++) {

        for(let y = 0; y < Game.garden.collums; y++) {

            Game.garden.cells[x][y].tick();

        }

    }

}// Game.garden.tick()

Game.tick = function() {

    Game.garden.tick();

}// Game.tick()

Game.init = function() {

    Game.garden.setup();

    Game.tickInterval = setInterval(Game.tick, 1000);

}// game.init()

Game.init();