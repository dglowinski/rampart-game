function Player(type,number) {
  this.number = number;
  this.type = type;
  this.wall = [];
  this.territory = [];
  this.cannons = [];
}

Player.prototype.addWall = function (segment) {
  segment.forEach(function(seg){
    this.wall.push({row:seg.row, col:seg.col});
  }.bind(this));
  
};

Player.prototype.addTerritory = function (cell) {
  this.territory.push(cell);
};

Player.prototype.addCannon= function (cell) {
  this.cannons.push(new Cannon(cell));
};

Player.prototype.destroyWall= function (wallIndex) {
  this.wall.splice(wallIndex, 1);
};

Player.prototype.checkCannonsOnTerritory= function () {
  var hasCannonsInTerritory = false;
  this.cannons.forEach(function(cannon){
    if(this.territory.find(function(ter){
      return ter.row === cannon.row && ter.col === cannon.col;
    })) {
      cannon.outOfTerritory = false;
    } else {
      cannon.outOfTerritory = true;
    }
    hasCannonsInTerritory = hasCannonsInTerritory || !cannon.outOfTerritory;
  }.bind(this));
  return hasCannonsInTerritory;
};

Player.prototype.reset= function () {
  this.wall = [];
  this.cannons = [];
  this.territory = [];
};