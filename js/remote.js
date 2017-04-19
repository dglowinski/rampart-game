function Remote(board, player, onConnect, onCannonerFinish, onShipDestroyed) {
  this.board = board;
  this.player = player;
  this.onConnect = onConnect;
  this.isCannonerFinished = false;
  this.onCannonerFinish = onCannonerFinish;
  this.onShipDestroyed = onShipDestroyed;

}

Remote.prototype.init = function(type, obj) {
  console.log("remote init");
  
  this.socket = io('https://safe-falls-11425.herokuapp.com');
  this.emit('you-are-master', {});
  this.socket.on('message', function(msg){
 //   console.log("message "+msg.type)
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
   }
  }.bind(this));
};

Remote.prototype.emit = function(type, obj) {
  if(this.socket) {
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
  console.log('master');
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
  this.board.drawCannonSegment(this.cannonSegment)
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
  this.ships = ships;
  this.ships.forEach(function(ship){
    ship.id="r"+ship.id;
  })
  this.board.drawShips(this.ships);
};

Remote.prototype.shipShoot = function(obj) {

   this.board.animateShotShip($(cellSelector(obj.ship.row, obj.ship.col)).find("img"));
   this.board.animateShot($(cellSelector(obj.ship.row, obj.ship.col)).find("img"), $(cellSelector(obj.wall.row, obj.wall.col)), this.shipShootCb.bind(this, obj.ship, obj.wall));

}

Remote.prototype.shipShootCb = function(ship, wall) {
  this.board.removeWall(wall);
}

Remote.prototype.shipDestroy = function(ship) {
  
  if(ship.id[0]==="r") {
    //remove own
    this.onShipDestroyed(ship);
  } else {
    this.board.removeShip("r"+ship.id);
    _.remove(this.ships, function(s){return s.id === "r"+ship.id;});
  }
}

