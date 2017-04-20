function War(board, players, remote) {
  this.board = board;
  this.players = players;
  this.remote = remote;
  this.ships = [];
  this.shipsDestroyed = 0;
}

War.prototype.start = function () {
  this.addShips();
  this.board.drawShips(this.ships);
  this.remote.emit('draw-ships', this.ships);

  $(".container").css( 'cursor', 'url("img/aim_small.png") 16 16, auto' );

  this.registerEvents();

  setTimeout(this.shipsAttack.bind(this),1000);

  this.shipsAttackTimer = setInterval(this.shipsAttack.bind(this), SHIP_ATTACK_DELAY);
  
  this.checkWallsTimer = setInterval(function(){
    if(this.players[0].wall.length===0) {
      clearInterval(this.shipsAttackTimer);
      clearInterval(this.checkWallsTimer);
    }
  }.bind(this), 50);
};

War.prototype.reset = function () {
  this.ships = [];
  this.shipsDestroyed = 0;
};

War.prototype.finish = function () {
  clearInterval(this.shipsAttackTimer);
  clearInterval(this.checkWallsTimer);
  $(".container").css('cursor', 'default');
  this.clearEvents();
};

War.prototype.clearEvents = function() {
  $('.container').unbind("mousedown");
};

War.prototype.registerEvents = function() {
  var ship = {}, cb;
  $('.container').mousedown(function(mouse){
    
    var cannon = this.players[0].cannons.find(function(can){
      return can.canShoot && !can.outOfTerritory;
    });

    if(cannon) {
      cannon.shoot();

      
      if($(mouse.target).hasClass("cell")) {
        var cell = {row: parseInt($(mouse.target).attr("data-row")), col: parseInt($(mouse.target).attr("data-column"))}; 
        cb = this.destroyRemoteWall.bind(this, cell);
        this.remote.emit("cannon-shoot-land", {cannon:cannon, cell:cell});
      }
      if($(mouse.target).hasClass("ship")) {
        var id = $(mouse.target).attr('id');
        var ship = this.ships.find(function(s){
          return s.id===id;
        });
        if(!ship) {
          ship = this.remote.ships.find(function(s){
           return s.id===id;
          });
        }
        cb = this.checkDestroyedShip.bind(this, ship);
        this.remote.emit("cannon-shoot-ship", {cannon:cannon, id:id});
      }
      this.board.animateShotCannon($(cellSelector(cannon.row, cannon.col)));
      this.board.animateShot($(cellSelector(cannon.row, cannon.col)), $(mouse.target) , cb);
    }
   }.bind(this));
};

War.prototype.destroyRemoteWall = function(cell) {
  var wallIndex = this.players[0].wall.findIndex(function(wall){
    return wall.row === cell.row && wall.col === cell.col;
  });
  this.players[1].destroyWall(wallIndex);
  this.board.removeWall(cell);
};

War.prototype.checkDestroyedShip = function(ship) {
  if(ship) {
    ship.damage++;
    if(ship.damage>=MAX_SHIP_DAMAGE) {
      this.board.removeShip(ship.id);
      if(ship.id[0]==="r") {
        _.remove(this.remote.ships, function(s){return s.id === ship.id;});
      } else {
        _.remove(this.ships, function(s){return s.id === ship.id;});
      }
      this.remote.emit("destroy-ship", ship);
      this.shipsDestroyed++;
    }
  }
};

War.prototype.remoteShipDestroy = function(ship) {
  ship.id = ship.id.substr(1);
  this.board.removeShip(ship.id);
   _.remove(this.ships, function(s){return s.id === ship.id;});
};

War.prototype.shipsAttack = function() {
  this.ships.forEach(function(ship,index){
    setTimeout(ship.shoot.bind(ship), index*1000*Math.random());
  });
};

War.prototype.onShipShoot = function(ship, wall) {
  this.remote.emit("ship-shoot", {ship:ship, wall:wall});
};

War.prototype.addShips = function () {
  for(var i=0; i<NEW_SHIPS_PER_ROUND; i++) {
    this.ships.push(new Ship(this.getRandomShipPosition(), this.players[0], this.board, this.onShipShoot.bind(this)));
  }
};

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
};


function Ship(position, player, board, onShipShootCb) {
  this.row = position.row;
  this.col = position.col;
  this.player = player;
  this.board = board;
  this.onShipShootCb = onShipShootCb;
  this.id = _.uniqueId();
  this.damage = 0;
}


Ship.prototype.shoot = function() {
  if(this.player.wall.length) {

    var wallIndex = Math.floor(Math.random() * this.player.wall.length);

    var wall = this.player.wall[wallIndex];
    this.player.destroyWall(wallIndex); 
    this.board.animateShotShip($(cellSelector(this.row, this.col)).find("img"));
    this.board.animateShot($(cellSelector(this.row, this.col)).find("img"), $(cellSelector(wall.row, wall.col)), this.shootCb.bind(this, wallIndex, wall));
    this.onShipShootCb(this,wall);
  }
};

Ship.prototype.shootCb = function(wallIndex, wall) {
  this.board.removeWall(wall);
};

function Cannon(cell) {
  this.row = cell.row;
  this.col = cell.col;
  this.canShoot = true;
}

Cannon.prototype.shoot = function () {
  this.canShoot = false;
  setTimeout(function(){
    this.canShoot = true;
  }.bind(this), CANNON_DELAY); 
};