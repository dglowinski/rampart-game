function Builder(board, player) {
  this.board = board;
  this.player = player;
  
  this.segmentFunctions = [seg1, seg2, seg3, segL, segLlarge, seg5];
  this.segmentDirection = 0; //N

  this.segmentFunction = this.getRandomSegment();
  this.registerEvents();

  this.initWalls();
  this.board.drawWalls();
  this.findTerritory();

}
Builder.prototype.getRandomSegment = function () {
  return this.segmentFunctions[Math.floor(Math.random() * this.segmentFunctions.length)];
}

Builder.prototype.initWalls = function () {
  for(var i=0; i<8; i++) {
    this.player.addWall([{row:this.board.castle.row-3, col:this.board.castle.col-3+i}]);
    this.player.addWall([{row:this.board.castle.row+4, col:this.board.castle.col-3+i}]);
  }
  for(var i=0; i<6; i++) {
    this.player.addWall([{row:this.board.castle.row-2+i, col:this.board.castle.col-3}]);
    this.player.addWall([{row:this.board.castle.row-2+i, col:this.board.castle.col+4}]);
  }
}
Builder.prototype.registerEvents = function () {

  $('.land').mouseover(this.moveSegment.bind(this));
  $(window).mousedown(this.click.bind(this));

};

Builder.prototype.moveSegment = function(mouse) {
  var target = getMouseTarget(mouse);
  this.segment = this.segmentFunction(target.row, target.col, this.segmentDirection);
  this.board.drawSegment(this.segment); 
}


Builder.prototype.findTerritory = function() {
  var maxRows = this.board.rows;
  var maxColumns = this.board.columns;

  this.board.board.forEach(function(row, rowIndex){
    row.forEach(function(el, colIndex) {
      el.flooded=false;
    });
  });

  this.board.board.forEach(function(row, rowIndex, board){
    row.forEach(function(el, colIndex) {
      if(board[rowIndex][colIndex].terrain==='water' || rowIndex===0 || rowIndex===maxRows-1 || colIndex===0 || colIndex===maxColumns-1 ) {
        flood(board,rowIndex, colIndex, maxRows, maxColumns);
      }
    });
  });
  
  this.player.territory = [];

  this.board.board.forEach(function(row, rowIndex){
    row.forEach(function(el, colIndex) {
      if(!el.flooded && !el.wall) {
        this.player.addTerritory({row:rowIndex, col:colIndex})
        
      }
    }.bind(this));
  }.bind(this));
  
  this.board.drawTerritory();

/*  function flood(board, row, col, maxRows, maxColumns) {
    if(row < 0 || col < 0 || row>maxRows-1 || col>maxColumns-1) return;
    
    
    if(!board[row][col].flooded && !board[row][col].wall) {
      board[row][col].flooded = true;
    
      flood(board, row-1, col, maxRows, maxColumns);
      flood(board, row+1, col, maxRows, maxColumns);
      flood(board, row, col+1, maxRows, maxColumns);
      flood(board, row, col-1, maxRows, maxColumns);
    }
  }*/
  function checkValidFlood(board,row, col, maxRows, maxColumns) {
    if( row < 0 || col < 0 || row>maxRows-1 || col>maxColumns-1
      || board[row][col].flooded || board[row][col].wall ) {
      return false;
    } else {
      return true;
    }
  }

  function flood(board, row, col, maxRows, maxColumns) {
    var q = [], cell, x, y;
    if(checkValidFlood(board,row, col, maxRows, maxColumns)) {
      q.push([row, col]);
      while(q.length) {
        cell = q.pop();
        x=cell[0]; y=cell[1];
        board[x][y].flooded = true;
        if(checkValidFlood(board,x+1, y, maxRows, maxColumns))
          q.push([x+1,y]);
        if(checkValidFlood(board,x-1, y, maxRows, maxColumns))
          q.push([x-1,y]);
        if(checkValidFlood(board,x, y+1, maxRows, maxColumns))
          q.push([x,y+1]);
        if(checkValidFlood(board,x, y-1, maxRows, maxColumns))
          q.push([x,y-1]);
        if(checkValidFlood(board,x+1, y+1, maxRows, maxColumns))
          q.push([x+1,y+1]);
        if(checkValidFlood(board,x-1, y-1, maxRows, maxColumns))
          q.push([x-1,y-1]);
        if(checkValidFlood(board,x+1, y-1, maxRows, maxColumns))
          q.push([x+1,y-1]);
        if(checkValidFlood(board,x-1, y+1, maxRows, maxColumns))
          q.push([x-1,y+1]);                              
      }
    }
  }
}



Builder.prototype.click = function(mouse) {
  var target = getMouseTarget(mouse);
  switch(mouse.which) {
    case 1: //left click
      if(this.board.canBuildWall(this.segment)) {
        this.player.addWall(this.segment);
        this.board.drawWalls();

        this.findTerritory();
        this.board.drawTerritory();
        
        
        this.segmentFunction = this.getRandomSegment();
        this.segment = this.segmentFunction(target.row, target.col, this.segmentDirection);
        this.board.drawSegment(this.segment);
      }
      break;
    case 3:
      this.segmentDirection = (this.segmentDirection + 1 + 4) % 4;  
      this.segment = this.segmentFunction(target.row, target.col, this.segmentDirection);
      this.board.drawSegment(this.segment);
      break;
  }
  mouse.preventDefault();
}

Builder.prototype.finish = function() {
  $('.land').unbind("mouseover");
  $(window).unbind("mousedown");
}