function Builder(board, player, remote) {
  this.board = board;
  this.player = player;
  this.remote = remote;
  
  this.segmentFunctions = [seg1, seg2, seg3, segL, segLlarge, seg5];
  this.segmentDirection = 0; //N


  
 /* this.initWalls();
  this.board.drawWalls();
  this.findTerritory();*/

}



Builder.prototype.init = function() {
  this.segmentFunction = this.getRandomSegment();
  this.registerEvents();
  this.findTerritory();
}

Builder.prototype.makeCastle = function() {
  this.initWalls();
  this.board.drawWalls();
  this.findTerritory();
}

Builder.prototype.getRandomSegment = function () {
  return this.segmentFunctions[Math.floor(Math.random() * this.segmentFunctions.length)];
}

Builder.prototype.initWalls = function () {
  var castleNum = this.player.masterSlave === "master" ? 0 : 1;
  for(var i=0; i<8; i++) {
    this.player.addWall([{row:this.board.castles[castleNum].row-3, col:this.board.castles[castleNum].col-3+i}]);
    this.player.addWall([{row:this.board.castles[castleNum].row+4, col:this.board.castles[castleNum].col-3+i}]);
    this.remote.emit('draw-wall', [{row:this.board.castles[castleNum].row-3, col:this.board.castles[castleNum].col-3+i}]);
    this.remote.emit('draw-wall', [{row:this.board.castles[castleNum].row+4, col:this.board.castles[castleNum].col-3+i}]);
  }
  for(var i=0; i<6; i++) {
    this.player.addWall([{row:this.board.castles[castleNum].row-2+i, col:this.board.castles[castleNum].col-3}]);
    this.player.addWall([{row:this.board.castles[castleNum].row-2+i, col:this.board.castles[castleNum].col+4}]);
    this.remote.emit('draw-wall', [{row:this.board.castles[castleNum].row-2+i, col:this.board.castles[castleNum].col-3}]);
    this.remote.emit('draw-wall', [{row:this.board.castles[castleNum].row-2+i, col:this.board.castles[castleNum].col+4}]);
  }
}
Builder.prototype.registerEvents = function () {

  $('.land').mouseover(this.moveSegment.bind(this));
  $(window).mousedown(this.click.bind(this));

};

Builder.prototype.moveSegment = function(mouse) {
  var target = getMouseTarget(mouse);
  if(this.segment)
    this.board.removeSegment(this.segment); 

  this.segment = this.segmentFunction(target.row, target.col, this.segmentDirection);
  this.board.drawSegment(this.segment); 
  this.remote.emit('draw-segment', this.segment);

  this.segmentValid();

}
Builder.prototype.segmentValid = function() {
  if(this.board.canBuild(this.segment)) {
    this.board.segmentValid(this.segment, true);
    this.remote.emit('segment-valid', true)
  } else {
    this.board.segmentValid(this.segment, false);
    this.remote.emit('segment-valid', false)
  }
}
Builder.prototype.findTerritory = function() {
  var maxRows = this.board.rows;
  var maxColumns = this.board.columns;

  this.board.board.forEach(function(row, rowIndex){
    row.forEach(function(el, colIndex) {
      el.flooded=false;
    });
  });
  var walls = this.player.wall;
  this.board.board.forEach(function(row, rowIndex, board){
    row.forEach(function(el, colIndex) {
      if(board[rowIndex][colIndex].terrain==='water' || rowIndex===0 || rowIndex===maxRows-1 || colIndex===0 || colIndex===maxColumns-1 ) {
        flood(board,rowIndex, colIndex, maxRows, maxColumns, walls);
      }
    });
  });
  
  this.player.territory = [];

  this.board.board.forEach(function(row, rowIndex){
    row.forEach(function(el, colIndex) {

      if(!el.flooded && !isWall({row:rowIndex, col:colIndex}, walls)) {
        this.player.addTerritory({row:rowIndex, col:colIndex})
       }
    }.bind(this));
  }.bind(this));
  this.remote.emit("draw-territory",this.player.territory);
  this.board.drawTerritory();

  function checkValidFlood(board,row, col, maxRows, maxColumns, walls) {
    if( row < 0 || col < 0 || row>maxRows-1 || col>maxColumns-1
      || board[row][col].flooded || isWall({row:row, col:col},walls) ) {
      return false;
    } else {
      return true;
    }
  }
  function isWall(cell, wall) {
    if(wall.length===0) return false;
    return wall.find(function(w) {
      return w.row === cell.row && w.col === cell.col;
    });
  }
  function flood(board, row, col, maxRows, maxColumns, walls) {
    var q = [], cell, x, y;
    if(checkValidFlood(board,row, col, maxRows, maxColumns, walls)) {
      q.push([row, col]);
      while(q.length) {
        cell = q.pop();
        x=cell[0]; y=cell[1];
        board[x][y].flooded = true;
        if(checkValidFlood(board,x+1, y, maxRows, maxColumns, walls))
          q.push([x+1,y]);
        if(checkValidFlood(board,x-1, y, maxRows, maxColumns, walls))
          q.push([x-1,y]);
        if(checkValidFlood(board,x, y+1, maxRows, maxColumns, walls))
          q.push([x,y+1]);
        if(checkValidFlood(board,x, y-1, maxRows, maxColumns, walls))
          q.push([x,y-1]);
        if(checkValidFlood(board,x+1, y+1, maxRows, maxColumns, walls))
          q.push([x+1,y+1]);
        if(checkValidFlood(board,x-1, y-1, maxRows, maxColumns, walls))
          q.push([x-1,y-1]);
        if(checkValidFlood(board,x+1, y-1, maxRows, maxColumns, walls))
          q.push([x+1,y-1]);
        if(checkValidFlood(board,x-1, y+1, maxRows, maxColumns, walls))
          q.push([x-1,y+1]);                              
      }
    }
  }
}



Builder.prototype.click = function(mouse) {
  var target = getMouseTarget(mouse);

  switch(mouse.which) {
    case 1: //left click
      if(this.board.canBuild(this.segment)) {
        this.player.addWall(this.segment);
        this.remote.emit('draw-wall', this.segment);

        this.board.drawWalls();

        this.findTerritory();
        this.board.drawTerritory();
        
        
        this.segmentFunction = this.getRandomSegment();
        this.redrawSegment(target);
      }
      break;
    case 3:
      this.segmentDirection = (this.segmentDirection + 1 + 4) % 4;  
      this.redrawSegment(target);
      break;
  }
  mouse.preventDefault();
}

Builder.prototype.redrawSegment = function(target) {
  this.board.removeSegment(this.segment);
  this.segment = this.segmentFunction(target.row, target.col, this.segmentDirection);
  this.board.drawSegment(this.segment);
  this.remote.emit("draw-segment", this.segment);
  this.segmentValid(this.segment);
}
Builder.prototype.finish = function() {
  this.board.removeSegments(this.segment);
  $('.land').unbind("mouseover");
  $(window).unbind("mousedown");
  
}