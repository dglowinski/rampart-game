var MAX_CANNONS_PER_ROUND = 3;
var WAR_DURATION = 100000;
var NEW_SHIPS_PER_ROUND = 3;
var SHIP_ATTACK_DELAY = 4000;

function Game() {
  this.players = [];
 
  this.players.push(new Player('local',0));
  
  this.board = new Board(this.players);
  this.board.initBoard();
  this.board.draw();

  this.builder = new Builder(this.board, this.players[0]);
  this.builder.finish();

  this.war = new War(this.board, this.players, this.onWarFinish);

  this.cannoner = new Cannoner(this.board, this.players[0], this.onCannonerFinish.bind(this));
  this.cannoner.init();

  
}/*
  this.duration = 0;
  this.timerId = setInterval(function() {
    if(++this.duration === WAR_DURATION) {
      clearInterval(this.timerId)
      this.finish();
    }
  }.bind(this), 1000);
*/

Game.prototype.onCannonerFinish = function () {
  console.log('now war');
  this.war.start();
}

Game.prototype.onWarFinish = function () {
  console.log('war finished');
}


function War(board, players) {
  this.board = board;
  this.players = players;
  this.ships = [];
  
}

War.prototype.start = function () {
  this.addShips();
  this.board.drawShips(this.ships);
  setTimeout(this.shipsAttack.bind(this),1000);
  this.shipsAttackTimer = setInterval(this.shipsAttack.bind(this), SHIP_ATTACK_DELAY);
  this.checkWallsTimer = setInterval(function(){
    if(this.players[0].wall.length===0) {
      console.log('walls destroyed');
      clearInterval(this.shipsAttackTimer);
      clearInterval(this.checkWallsTimer);
    }
  }.bind(this), 50) 
}

War.prototype.shipsAttack = function() {
  this.ships.forEach(function(ship,index){
    setTimeout(ship.shoot.bind(ship), index*1000*Math.random());
  });
}

War.prototype.addShips = function () {
  for(var i=0; i<NEW_SHIPS_PER_ROUND; i++) {
    this.ships.push(new Ship(this.getRandomShipPosition(), this.players[0], this.board));
  }
}

War.prototype.getRandomShipPosition = function () {
  var isCorrectPosition = false, row, col, hasLand, hasShip;
  do {
    row = Math.floor(Math.random() * (this.board.rows-1));
    col = Math.floor(Math.random() * (this.board.columns-1));
    hasLand = this.board.board[row][col].terrain==='land' ||
              this.board.board[row+1][col].terrain==='land' ||
              this.board.board[row][col+1].terrain==='land' ||
              this.board.board[row+1][col+1].terrain==='land';
    if(!hasLand) {
      hasShip = this.ships.length ? false : this.ships.some(function(ship){
        return row===ship.row && (col===ship.col-1 || col===ship.col || col===ship.col+1) ||
                row===ship.row-1 && (col===ship.col-1 || col===ship.col || col===ship.col+1) ||
                row===ship.row+1 && (col===ship.col-1 || col===ship.col || col===ship.col+1);
      });
      if(!hasShip) isCorrectPosition = true;
    }
    
  } while(!isCorrectPosition);
  return {row:row, col:col};
}

function Ship(position, player, board) {
  this.row = position.row;
  this.col = position.col;
  this.player = player;
  this.board = board;
}


Ship.prototype.shoot = function() {
  console.log("shoot");
  if(this.player.wall.length) {

    var wallIndex = Math.floor(Math.random() * this.player.wall.length);

    var wall = this.player.wall[wallIndex];
    this.destroyedWall = {row:wall.row, col:wall.col};
    this.player.destroyWall(wallIndex); 
    this.board.animateShot($(cellSelector(this.row, this.col)).find("img"), $(cellSelector(wall.row, wall.col)), this.shootCb.bind(this));
  }
}
Ship.prototype.shootCb = function() {
  this.board.removeWall(this.destroyedWall);
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

Player.prototype.destroyWall= function (wallIndex) {
  
  
  this.wall.splice(wallIndex, 1);
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