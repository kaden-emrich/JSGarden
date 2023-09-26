const GENES = [
    'x',
    'y',
    'g',
    's'
];

var Game = Object();

Game.garden = Object();

Game.garden.div = document.getElementById("garden-div");

Game.infoBox = document.getElementById("info");

Game.garden.rows = 3;
Game.garden.collums = 3;

Game.garden.cells = Array();

Game.inventory = Object();

Game.inventory.seeds = Object();

Game.plants = Object();

Game.plants.wheat = () => {return new Plant("Wheat", 5, 2);};

Game.regesterClick = function(obj) {
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

    updatePlant() {
        if(!this.plant) return;

        this.div.innerHTML = this.plant.name + "<br>";
        this.div.innerHTML += this.plant.genesToString() + "<br>";

        if(this.plant.state == 'seed') {

            this.div.style = "background-color: yellow;";
            this.div.innerHTML += this.plant.growTimeTicks - this.plant.tickAge + 1;

        }
        else if(this.plant.state == 'mutate') {

            this.div.style = "background-color: blue";
            this.mutatePlant();

        }
        else if(this.plant.state == 'mature') {

            this.div.style = "background-color: green";

        }
        else {

            this.div.style = "background-color: white";
            this.div.innerHTML = "";

        }

    }// updatePlant()

    mutatePlant() {

        if(!this.plant) return;
    
        // get other gene sets
        var otherGenes = [this.plant.genes];

        for(let x = -1; x < 2; x++) {

            if(this.x + x >= 0 && this.x + x < Game.garden.rows) {

                for(let y = -1; y < 2; y++) {

                    if(this.y + y >= 0 && this.y + y < Game.garden.collums) {

                        var otherCell = Game.garden.cells[this.x + x][this.y + y];

                        if(otherCell.plant) {

                            otherGenes[otherGenes.length] = otherCell.plant.genes;

                        }

                    }

                }

            }

        }

        // calculate new gene

        var newGenes = this.plant.genes;

        if(otherGenes.length < 1) return;

        for(let i = 0; i < this.plant.genes; i++) {

            var geneWeights = Array();

            for(let j = 0; j < GENES.length; j++) {

                geneWeights[j] = 0;

            }

            for(let j = 0; j < otherGenes.length; j++) {

                var thisGene = otherGenes[j][i];

                for(let g = 0; g < GENES.length; g++) {

                    if(thisGene == GENES[g]) {
                        geneWeights[g] ++;
                    }

                }

            }

            var highestWeight = 0;
            var highestGene = newGenes[i];

            for(let j = 0; j < geneWeights.length; j++) {

                if(geneWeights[j] > highestWeight) {

                    highestWeight = geneWeights[j];
                    highestGene = GENES[j];

                }

            }

            newGenes[i] = highestGene;

        }

        console.log(newGenes);

        this.plant.genes = newGenes;

    }// mutatePlant()

    addPlant(plant) {

        this.plant = plant;

        this.updatePlant();

    }// addPlant()

    harvest() {

        if(!this.plant) return;

        this.plant.harvest();

        this.plant = undefined;
        this.div.style = "background-color: white";
        this.div.innerHTML = "";

    }// harvest()

    onClick() {

        if(this.plant) {

            
            this.harvest();
            

        }
        else {

            if(Game.inventory.seeds.wheat > 0) {
                this.addPlant(Game.plants.wheat());
                Game.inventory.seeds.wheat -= 1;
            } 

        }

        Game.update();
    
    }// onClick()

    tick() {

        if(!this.plant) return;

        this.plant.tick();

        this.updatePlant();

    }// tick()

}// class Cell

class Plant {

    constructor(name, growTimeTicks, seedYield, genes) {

        this.name = name;

        this.baseGrowTimeTicks = growTimeTicks;
        this.growTimeTicks = growTimeTicks;

        this.state = 'seed';

        this.tickAge = 0;

        this.baseYield = seedYield;
        this.seedYield = seedYield;

        if(genes) this.genes = genes;
        else {

            this.genes = Array();

            for(let i = 0; i < 5; i++) {
                this.genes[i] = GENES[rng(0, GENES.length)];

                if(this.genes[i] == 'y') {
                    this.seedYield++;
                }
                if(this.genes[i] == 'g') {
                    this.growTimeTicks--;
                }
                if(this.genes[i] == 's') {
                    this.growTimeTicks++;
                }
            }

        }

    }// constructor

    genesToString() {

        var geneString = "";

        for(let i = 0; i < this.genes.length; i++) {
            geneString += this.genes[i];
        }

        return geneString;

    }

    harvest() {

        if(this.state == 'mature') {
            Game.inventory.seeds.wheat += this.seedYield;
        }
        else {
            Game.inventory.seeds.wheat += 1;
        }

    }// harvest()

    tick() {

        if(this.tickAge > this.growTimeTicks) {

            this.state = 'mature';

        }
        else if(this.tickAge == this.growTimeTicks) {

            this.state = 'mutate';

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

Game.update = function() {
    Game.infoBox.innerText = "Wheat seeds: " + Game.inventory.seeds.wheat;
}

Game.tick = function() {

    Game.garden.tick();

    Game.update();

}// Game.tick()

Game.init = function() {

    Game.garden.setup();

    Game.tickInterval = setInterval(Game.tick, 1000);

    Game.inventory.seeds.wheat = 1;

    Game.tick();

}// game.init()

Game.init();