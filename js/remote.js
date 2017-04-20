function Remote(board, players, onConnect, onCannonerFinish, onGameOver) {
  this.board = board;
  this.players = players;
  this.player = players[1];
  this.onConnect = onConnect;
  this.isCannonerFinished = false;
  this.onCannonerFinish = onCannonerFinish;
  this.isOn = false;
 
  this.onGameOver = onGameOver;
}

Remote.prototype.init = function(type, obj) {

  if(!this.socket) {
    this.socket = io('https://safe-falls-11425.herokuapp.com');
    
    this.socket.on('message', function(msg){
      if(this.isOn) {
        console.log("recieve "+msg.type);
        switch(msg.type) {
          case "draw-segment": this.moveSegment(msg.obj); break;
          case "segment-valid": this.segmentValid(msg.obj); break;
          case "draw-wall": this.drawWall(msg.obj); break;
          case "draw-territory": this.drawTerritory(msg.obj); break;
          case "you-are-master": this.setMaster(); break;
          case "you-are-slave": this.setSlave(); break;
          case "draw-cannon-segment": this.drawCannonSegment(msg.obj); break;
          case "draw-cannon": this.drawCannon(msg.obj); break;
          case "cannoner-finished": this.cannonerFinished(); break;
          case "draw-ships": this.drawShips(msg.obj); break;
          case "ship-shoot": this.shipShoot(msg.obj); break;
          case "destroy-ship": this.shipDestroy(msg.obj); break;
          case "cannon-shoot-land": this.cannonShootLand(msg.obj); break;
          case "cannon-shoot-ship": this.cannonShootShip(msg.obj); break;
          case "game-over": this.win(); break;
        }
      }
    }.bind(this));
  }
  this.start();  
  this.emit('you-are-master', {});

};

Remote.prototype.emit = function(type, obj) { 
  if(this.socket && this.isOn) {
      console.log("emit "+type);
      this.socket.emit('message', {type:type, obj:obj});
  }
};

Remote.prototype.moveSegment = function(segment) {
  if(this.segment)
    this.board.removeSegment(this.segment); 
  this.segment = segment;
  this.board.drawSegment(this.segment); 
};

Remote.prototype.segmentValid = function(valid) {
  this.board.segmentValid(this.segment, valid);
};

Remote.prototype.drawWall = function(segment) {
  this.player.addWall(segment);
  this.board.drawWalls();
};

Remote.prototype.drawTerritory = function(territory) {
  this.player.territory = territory;
  this.board.drawTerritory();
};

Remote.prototype.setMaster = function(territory) {
  this.isMaster = true;
  this.onConnect('master');
  this.emit("you-are-slave", null);
};

Remote.prototype.setSlave = function(territory) {
  this.onConnect('slave');
  this.isSlave = true;
};

Remote.prototype.drawCannonSegment = function(segment) {
  this.board.removeCannonSegment(this.cannonSegment);
  this.cannonSegment = segment;
  this.board.drawCannonSegment(this.cannonSegment);
};

Remote.prototype.drawCannon = function(cell) {
  this.player.addCannon(cell);
  this.board.removeCannonSegment(this.cannonSegment);
  this.cannonSegment = null;
  this.board.drawCannons();
};

Remote.prototype.cannonerFinished = function(cell) {
  this.isCannonerFinished = true;
  this.onCannonerFinish(false);

};

Remote.prototype.drawShips = function(ships) {
  this.board.removeCannonSegment(this.cannonSegment);
  this.ships = ships;
  this.ships.forEach(function(ship){
    ship.id="r"+ship.id;
  });
  this.board.drawShips(this.ships);
};

Remote.prototype.shipShoot = function(obj) {
   this.board.animateShotShip($(cellSelector(obj.ship.row, obj.ship.col)).find("img"));
   this.board.animateShot($(cellSelector(obj.ship.row, obj.ship.col)).find("img"), $(cellSelector(obj.wall.row, obj.wall.col)), this.shipShootCb.bind(this, obj.ship, obj.wall));
};

Remote.prototype.shipShootCb = function(ship, wall) {
  var wallIndex = this.player.wall.findIndex(function(w){
    return wall.row === w.row && wall.col === w.col;
  });
  this.player.destroyWall(wallIndex);
  this.board.removeWall(wall);
};

Remote.prototype.shipDestroy = function(ship) {
  if(ship.id[0]==="r") {
    this.onShipDestroyed(ship);
  } else {
    this.board.removeShip("r"+ship.id);
    _.remove(this.ships, function(s){return s.id === "r"+ship.id;});
  }
};

Remote.prototype.cannonShootLand = function(data) {
  var targetSelector = cellSelector(data.cell.row, data.cell.col);
  var wallIndex = this.players[0].wall.findIndex(function(wall){
    return wall.row === data.cell.row && wall.col === data.cell.col;
  });

  if(wallIndex!=-1) {
    this.players[0].destroyWall(wallIndex);
  }
  this.cannonShoot(data.cannon, targetSelector, function(wall){
    this.board.removeWall(wall);
  }.bind(this, data.cell));
};

Remote.prototype.cannonShootShip = function(data) {
  var targetSelector = "#"+(data.id[0]==="r" ? data.id.substr(1) : "r"+data.id);
  this.cannonShoot(data.cannon, targetSelector);
};

Remote.prototype.cannonShoot = function(cannon, targetSelector, cb) {
  this.board.animateShotCannon($(cellSelector(cannon.row, cannon.col)));
  this.board.animateShot($(cellSelector(cannon.row, cannon.col)), $(targetSelector), cb);
};

Remote.prototype.win = function() {
  this.onGameOver();
};

Remote.prototype.stop = function() {
  this.isOn = false;
  this.board.removeCannonSegment(this.cannonSegment);
  if(this.segment) this.board.removeSegment(this.segment);
};

Remote.prototype.start = function() {
  this.isOn = true;
}