var MAX_CANNONS_PER_ROUND = 3;

function Game() {
  this.players = [];
 
  this.players.push(new Player('local',0));
  
  this.board = new Board(this.players);
  this.board.initBoard();
  this.board.draw();

  this.builder = new Builder(this.board, this.players[0]);
  this.builder.finish();

  this.cannoner = new Cannoner(this.board, this.players[0], this.onCannonerFinish);
  this.cannoner.init();
}

Game.prototype.onCannonerFinish = function () {
  console.log('now war');
}

function Cannoner(board, player, finishCb) {
  this.board = board;
  this.player = player;
  this.onFinishCb = finishCb;
}

Cannoner.prototype.init = function() {
    $('.territory-player-'+this.player.number).mouseover(this.moveCannon.bind(this));
    $('.territory-player-'+this.player.number).mousedown(this.click.bind(this));
    this.cannonsPlaced = 0;
}

Cannoner.prototype.click = function() {
  if(this.newCannonCell) {
    console.log('here')
    this.player.addCannon(this.newCannonCell);
    this.cannonsPlaced++;
    this.newCannonCell = null;
    this.board.drawCannon();
    if(!this.board.canPlaceCannon() || this.cannonsPlaced === MAX_CANNONS_PER_ROUND) {
      this.finish();
    }
  }
}

Cannoner.prototype.finish = function() {
  $('.territory-player-'+this.player.number).unbind("mouseover");
  $('.territory-player-'+this.player.number).unbind("mousedown");
  this.onFinishCb();
}


Cannoner.prototype.moveCannon = function(mouse) {
  var target = getMouseTarget(mouse);
  this.getSegment(target.row, target.col);
  var cell = this.board.drawCannonSegment(this.segment); 
  if(cell) this.newCannonCell = cell;
}

Cannoner.prototype.getSegment = function(row, col) {
  this.segment = segCannon(row, col)  
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

Player.prototype.addCannon= function (cell) {

  this.cannons.push(new Cannon(cell));
}

function Cannon(cell) {
  this.row = cell.row;
  this.col = cell.col;
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