const GENES = [
    'X',
    'Y',
    'G',
    'S'
];

var Game = Object();

Game.garden = Object();

Game.garden.div = document.getElementById("garden-div");

Game.infoBox = document.getElementById("info");

Game.garden.rows = 3;
Game.garden.collums = 3;

Game.dnaLength = 5;

Game.garden.cells = Array();

Game.inventory = Object();

Game.inventory.seeds = Array();

Game.species = Object();

Game.selected = undefined;

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

        this.div.innerHTML = this.plant.getID() + "<br>";
        //this.div.innerHTML += this.plant.genesToString() + "<br>";

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
        var otherGenes = Array();

        for(let x = -1; x < 2; x++) {

            if(this.x + x >= 0 && this.x + x < Game.garden.collums) {

                for(let y = -1; y < 2; y++) {

                    if(this.y + y >= 0 && this.y + y < Game.garden.rows) {

                        var otherCell = Game.garden.cells[this.x + x][this.y + y];

                        if(otherCell.plant && otherCell.plant.name == this.plant.name) {

                            otherGenes[otherGenes.length] = otherCell.plant.genes;

                        }

                    }

                }

            }

        }

        // calculate new gene

        let newGenes = Array();
        let geneString = "";

        if(otherGenes.length < 3) return;

        for(let i = 0; i < this.plant.genes.length; i++) {

            newGenes[i] = this.plant.genes[i];

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
            var currentGeneWeight = 0;

            for(let j = 0; j < geneWeights.length; j++) {

                if(GENES[j] == newGenes[i]) {
                    currentGeneWeight = geneWeights[j];
                }

                if(geneWeights[j] > highestWeight) {

                    highestWeight = geneWeights[j];
                    highestGene = GENES[j];

                }

            }


            if(highestWeight > currentGeneWeight) {
                newGenes[i] = highestGene;
            }

            geneString += newGenes[i];

        }

        var seedExists = false;

        for(let i = 0; i < Game.inventory.seeds.length; i++) {
            
            if(Game.inventory.seeds[i].name == this.plant.name && Game.inventory.seeds[i].genesToString() == geneString) {

                this.plant.seed = Game.inventory.seeds[i];
                seedExists = true;
                break;

            }

        }

        if(!seedExists) {
            this.plant.seed = new Seed(this.plant.seed.species, newGenes);
        }

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
        else if(Game.selected) {

            if(Game.selected.num > 0) {
                this.addPlant(Game.selected.plantSeed());
                Game.selected.num -= 1;
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

    constructor(seed) {

        this.seed = seed;

        this.name = this.seed.name;

        this.baseGrowTimeTicks = this.seed.BaseGrowTimeTicks;
        this.growTimeTicks = this.seed.growTimeTicks;

        this.state = 'seed';

        this.tickAge = 0;

        this.baseYield = this.seed.baseYield;

        if(this.seed.genes) this.genes = this.seed.genes;
        else {

            this.genes = Array();

            for(let i = 0; i < Game.dnaLength; i++) {
                this.genes[i] = GENES[rng(0, GENES.length)];
            }

        }

        for(let i = 0; i < Game.dnaLength; i++) {
            if(this.genes[i] == 'G') {
                this.growTimeTicks--;
            }
            if(this.genes[i] == 'S') {
                this.growTimeTicks++;
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

            var overalYield = 0;

            overalYield += this.baseYield;

            for(let i = 0; i < this.genes.length; i++) {
                if(this.genes[i] == 'Y') {
                    overalYield += 1;
                }
            }

            if(!this.seed.genes) {

                var seedExists = false;

                for(let i = 0; i < Game.inventory.seeds.length; i++) {
                    
                    if(Game.inventory.seeds[i].name == this.name && Game.inventory.seeds[i].genesToString() == this.genesToString()) {

                        this.seed = Game.inventory.seeds[i];
                        seedExists = true;
                        continue;

                    }

                }

                if(!seedExists) {
                    this.seed = new Seed(this.seed.species, this.genes);
                }
                
            }

            this.seed.num += overalYield;

        }
        else {

            this.seed.species.pureSeed.num += 1;

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

    getID() {

        var id = this.name;

        if(this.genes) {
            id += '-';

            for(let i = 0; i < this.genes.length; i++) {

                id += this.genes[i];

            }
        }

        return id;

    }

}// class Plant

class Seed {

    constructor(species, genes) {

        this.idNum = Game.inventory.seeds.length;

        Game.inventory.seeds[this.idNum] = this;

        this.species = species;

        this.name = this.species.name;

        this.button = undefined;

        this.baseGrowTimeTicks = this.species.growTimeTicks;
        this.growTimeTicks = this.species.growTimeTicks;

        this.baseYield = this.species.harvestYield;

        this.isSelected = false;

        this.num = 0;

        if(genes) {
            this.genes = genes;
        }
        else {
            this.genes = undefined;
        }
    }

    plantSeed() {

        return new Plant(this);

    }

    genesToString() {

        if(!this.genes) {
            return "";
        }

        var geneString = "";

        for(let i = 0; i < this.genes.length; i++) {
            geneString += this.genes[i];
        }

        return geneString;

    }

    getID() {

        var id = this.name;

        if(this.genes) {
            id += '-';

            for(let i = 0; i < this.genes.length; i++) {

                id += this.genes[i];

            }
        }

        return id;

    }

}

class Species {

    constructor(name, growTimeTicks, harvestYield) {

        this.name = name;
        this.growTimeTicks = growTimeTicks;
        this.harvestYield = harvestYield;

        this.pureSeed = new Seed(this);

    }
    
}

Game.species.wheat = new Species("Wheat", 5, 2);

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

Game.inventory.regesterButtonPress = function(element, idNum) {

    if(Game.inventory.seeds[idNum].isSelected) {
        
        Game.selected = undefined;
        Game.inventory.seeds[idNum].isSelected = false;
        Game.inventory.seeds[idNum].button.removeAttribute('id');

    }
    else {

        Game.selected = Game.inventory.seeds[idNum];
        Game.inventory.seeds[idNum].isSelected = true;
        Game.inventory.seeds[idNum].button.setAttribute('id', "inv-seed-selected");

    }

    Game.inventory.update();

}

Game.inventory.update = function() {

    while(Game.infoBox.hasChildNodes()) {

        Game.infoBox.removeChild(Game.infoBox.firstChild);

    }

    for(let i = 0; i < Game.inventory.seeds.length; i++) {

        if(Game.inventory.seeds[i].num < 1) {

            Game.inventory.seeds[i].isSelected = false;

            if(Game.selected == Game.inventory.seeds[i]) {
                Game.selected = undefined;
            }

            continue;

        }

        Game.inventory.seeds[i].button = document.createElement('button');

        Game.inventory.seeds[i].button.setAttribute('class', "inv-seed");

        if(Game.selected == Game.inventory.seeds[i]) {
            Game.inventory.seeds[i].button.setAttribute('id', "inv-seed-selected");
            Game.inventory.seeds[i].isSelected = true;
        }
        else {
            Game.inventory.seeds[i].isSelected = false;
        }

        Game.inventory.seeds[i].button.setAttribute('onclick', 'Game.inventory.regesterButtonPress(this, ' + Game.inventory.seeds[i].idNum + ')');

        Game.inventory.seeds[i].button.innerText = Game.inventory.seeds[i].getID() + ": " + Game.inventory.seeds[i].num;

        Game.infoBox.appendChild(Game.inventory.seeds[i].button);

        Game.infoBox.appendChild(document.createElement('br'));

    }
}

Game.update = function() {

    Game.inventory.update();

}

Game.tick = function() {

    Game.garden.tick();

    Game.update();

}// Game.tick()

Game.init = function() {

    Game.garden.setup();

    Game.tickInterval = setInterval(Game.tick, 1000);

    //Game.inventory.seeds[Game.seeds.wheat.idNum] = Game.seeds.wheat;

    Game.inventory.seeds[0].num = 1;

    //Game.selected = Game.inventory.seeds[0];

    Game.tick();

}// game.init()

Game.init();

// maybe make the weight of the X gene higher to make geneswaping more straightforward and less reliant on the random genes when planting a blank seed