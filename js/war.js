
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

  $(".container").css( 'cursor', 'url("img/aim_small.png") 16 16, auto' );

  this.registerEvents();
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

War.prototype.reset = function () {
  this.ships = [];
  this.shipsDestroyed = 0;
}

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
  var ship = {}, cb = function(){};
  $('.container').mousedown(function(mouse){
    
    var cannon = this.players[0].cannons.find(function(can){
      return can.canShoot && !can.outOfTerritory;
    });

    if(cannon) {
      cannon.shoot();
      if($(mouse.target).hasClass('ship')) {
        var id = $(mouse.target).attr('id');
        var ship = this.ships.find(function(s){
          return s.id===id;
        });
      } 
      this.board.animateShotCannon($(cellSelector(cannon.row, cannon.col)));
      this.board.animateShot($(cellSelector(cannon.row, cannon.col)), $(mouse.target) , this.checkDestroyedShip.bind(this, ship));
    }
   }.bind(this))
};

War.prototype.checkDestroyedShip = function(ship) {
  /*
  for(var i=0; i<this.ships.length; i++) {
    if(this.ships[i].damage>=MAX_SHIP_DAMAGE) {
      this.board.removeShip(this.ships[i].id);ship.damage++;
      this.ships.splice(i,1);
    }
  }
  */
    if(ship) {
      ship.damage++;
      if(ship.damage>=MAX_SHIP_DAMAGE) {
        this.board.removeShip(ship.id);
        _.remove(this.ships, function(s){return s.id === ship.id;});
        this.shipsDestroyed++;
      }
    }
};

War.prototype.shipsAttack = function() {

  this.ships.forEach(function(ship,index){
    setTimeout(ship.shoot.bind(ship), index*1000*Math.random());
  });
};

War.prototype.addShips = function () {
  for(var i=0; i<NEW_SHIPS_PER_ROUND; i++) {
    this.ships.push(new Ship(this.getRandomShipPosition(), this.players[0], this.board));
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