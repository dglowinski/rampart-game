function Cannoner(board, player, finishCb, remote) {
  this.board = board;
  this.player = player;
  this.remote = remote;
  this.onFinishCb = finishCb;

  this.isFinished = false;
  this.cannonsPlaced = 0;
}

Cannoner.prototype.init = function() {
  if(!this.board.canPlaceCannon()) {
      this.remote.emit('cannoner-finished');
      this.finish(true);
  }
  this.reset();
  $('.territory-player-'+this.player.number).mouseover(this.moveCannon.bind(this));
  $('.territory-player-'+this.player.number).mousedown(this.click.bind(this));
};

Cannoner.prototype.reset = function() {
  this.isFinished = false;
  this.cannonsPlaced = 0;
};

Cannoner.prototype.click = function(event) {
  if(this.segment) {
    
    this.player.addCannon(this.segment[0]);
    this.cannonsPlaced++;
    this.board.removeCannonSegment(this.segment);
    this.board.drawCannons();
    (new Audio(SND_BUILD)).play();
    
    this.remote.emit("draw-cannon", this.segment[0] );
    this.segment = null;
    if(!this.board.canPlaceCannon() || this.cannonsPlaced === MAX_CANNONS_PER_ROUND) {
      event.stopPropagation();
      this.remote.emit('cannoner-finished');
      this.finish(true);
    }
  }
};

Cannoner.prototype.finish = function(withCb) {
  $('.territory-player-'+this.player.number).unbind("mouseover");
  $('.territory-player-'+this.player.number).unbind("mousedown");
  this.isFinished = true;
  if(withCb) this.onFinishCb();
};

Cannoner.prototype.moveCannon = function(mouse) {
  var target = getMouseTarget(mouse);
  var newSegment = this.getSegment(target.row, target.col);

  if(newSegment.some(function(seg) {
        return seg.row < 0 || seg.row > this.rows-1 || seg.col<0 || seg.col>this.columns-1;
      }.bind(this))) {
    return;
  }
  if(this.board.canBuild(newSegment)) {
    this.board.removeCannonSegment(this.segment);
    this.segment = newSegment;
    this.board.drawCannonSegment(this.segment); 
   
    (new Audio(SND_ROTATE)).play();

    this.remote.emit('draw-cannon-segment', this.segment);
  }
};

Cannoner.prototype.getSegment = function(row, col) {
  return segCannon(row, col);  
};