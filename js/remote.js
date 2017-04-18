function Remote(board, player) {
  this.board = board;
  this.player = player;
  this.socket = io('https://safe-falls-11425.herokuapp.com');

  this.socket.on('message', function(msg){

   switch(msg.type) {
     case "draw-segment": this.moveSegment(msg.obj); break;
     case "segment-valid": this.segmentValid(msg.obj); break;
     case "draw-wall": this.drawWall(msg.obj); break;
   }
  }.bind(this));
}

Remote.prototype.emit = function(type, obj) {
  this.socket.emit('message', {type:type, obj:obj});
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