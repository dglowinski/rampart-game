function Remote(board, player, onConnect) {
  this.board = board;
  this.player = player;
  this.onConnect = onConnect;

}
Remote.prototype.init = function(type, obj) {
  console.log("remote init");
  this.socket = io('https://safe-falls-11425.herokuapp.com');
  this.emit('you-are-master', {});
  this.socket.on('message', function(msg){
    console.log("message "+msg.type)
   switch(msg.type) {
     case "draw-segment": this.moveSegment(msg.obj); break;
     case "segment-valid": this.segmentValid(msg.obj); break;
     case "draw-wall": this.drawWall(msg.obj); break;
     case "draw-territory": this.drawTerritory(msg.obj); break;
     case "you-are-master": this.setMaster(); break;
     case "you-are-slave": this.setSlave(); break;
     case "draw-cannon": this.setSlave(); break;
   }
  }.bind(this));
}

Remote.prototype.emit = function(type, obj) {
  if(this.socket) {
      this.socket.emit('message', {type:type, obj:obj});
  }
}

Remote.prototype.moveSegment = function(segment) {
  if(this.segment)
    this.board.removeSegment(this.segment); 
  this.segment = segment;
  this.board.drawSegment(this.segment); 
}

Remote.prototype.segmentValid = function(valid) {
  this.board.segmentValid(this.segment, valid);
}

Remote.prototype.drawWall = function(segment) {
  this.player.addWall(segment);
  this.board.drawWalls();
}

Remote.prototype.drawTerritory = function(territory) {
  this.player.territory = territory;

  this.board.drawTerritory();
}

Remote.prototype.setMaster = function(territory) {
  this.isMaster = true;
  console.log('master');
  this.onConnect('master');
  this.emit("you-are-slave", null);
}

Remote.prototype.setSlave = function(territory) {
  this.onConnect('slave');
  this.isSlave = true;
}

Remote.prototype.drawCannon = function(cell) {
  this.player.cannons.push(cell);
  this.board.drawCannon();
}