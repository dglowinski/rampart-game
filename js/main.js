function Game() {
  this.players = [];
 
  this.players.push(new Player('local',0));
  
  this.board = new Board(this.players);
  this.board.initBoard();
  this.board.draw();

  this.builder = new Builder(this.board, this.players[0]);
}

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
}
function cellSelector(row, col) {
  return  "[data-row='"+row+"'][data-column='"+col+"']";
}
function getMouseTarget(mouse) {
    return { row: parseInt($(mouse.target).attr('data-row')),
             col: parseInt($(mouse.target).attr('data-column'))
           };
}


var game = new Game();