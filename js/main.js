function Game() {
  this.players = [];
 
  this.players.push(new Player('local',0));
  
  this.board = new Board(this.players);
  this.board.initBoard();
  this.board.draw();

  this.builder = new Builder(this.board, this.players[0]);
}

function Player(type,number) {
  this.number = number;
  this.type = type;
  this.wall = [];
  this.cannons = [];
}

Player.prototype.addWall = function (segment) {
  segment.forEach(function(seg){
    this.wall.push({row:seg.row, col:seg.col});
  }.bind(this));
};

function Builder(board, player) {
  this.board = board;
  this.player = player;
  
  this.segmentFunctions = [seg1, seg2, seg3, segL, segLlarge, seg5];
  this.segmentDirection = 0; //N

  this.segmentFunction = this.getRandomSegment();
  this.registerEventHandlers();

  this.initWalls();
  this.board.drawWalls();
  this.findTerritory();

}
Builder.prototype.getRandomSegment = function () {
  return this.segmentFunctions[Math.floor(Math.random() * this.segmentFunctions.length)];
}

Builder.prototype.initWalls = function () {
  for(var i=0; i<7; i++) {
    this.player.addWall([{row:this.board.castle.row-3, col:this.board.castle.col-3+i}]);
    this.player.addWall([{row:this.board.castle.row+3, col:this.board.castle.col-3+i}]);
  }
  for(var i=0; i<5; i++) {
    this.player.addWall([{row:this.board.castle.row-2+i, col:this.board.castle.col-3}]);
    this.player.addWall([{row:this.board.castle.row-2+i, col:this.board.castle.col+3}]);
  }
}
Builder.prototype.registerEventHandlers = function () {

  $('.land').mouseover(this.moveSegment.bind(this));
  $(window).mousedown(this.click.bind(this));

};

Builder.prototype.moveSegment = function(mouse) {
  var target = getMouseTarget(mouse);
  this.segment = this.segmentFunction(target.row, target.col, this.segmentDirection);
  this.board.drawSegment(this.segment); 
}
/*
Builder.prototype.findTerritory = function() {
  var maxRows = this.board.rows;
  var maxColumns = this.board.columns;
  this.board.board.forEach(function(row, rowIndex){
    row.forEach(function(el, colIndex) {
      el.flooded=false;
      el.notTerritory = false;
   //   if(rowIndex === maxRows-1 || colIndex === maxColumns-1 || rowIndex===0 ||colIndex===0) 
     //   el.notTerritory = true;
    });
  });
  this.player.wall.forEach(function(seg){
    flood(this.board.board, seg.row-1, seg.col, maxRows, maxColumns);
  //  flood(this.board.board, seg.row+1, seg.col, maxRows, maxColumns);
  //  flood(this.board.board, seg.row, seg.col-1, maxRows, maxColumns);
   // flood(this.board.board, seg.row, seg.col+1, maxRows, maxColumns);
  }.bind(this));


  this.board.drawTerritory();


  function flood(board, row, col, maxRows, maxColumns) {
    if(row < 0 || col < 0 || row>maxRows-1 || col>maxColumns-1) return true;
    if(board[row][col].wall) return false;
  //  if( board[row][col].flooded) return board[row][col].notTerritory;
  
//    board[row][col].flooded = true;
    if(board[row][col].terrain==='water' || row===0 || col ===0 || row===maxRows-1 || col===maxColumns-1) {
      board[row][col].notTerritory = true;
      $(cellSelector(row, col)).addClass('territory-player-0');
      return true;
    } else {
       
    var notUp = flood(board, row-1, col, maxRows, maxColumns);
    //  var notDown = flood(board, row+1, col, maxRows, maxColumns);
      var notLeft = flood(board, row, col-1, maxRows, maxColumns);
      var notRight = flood(board, row, col+1, maxRows, maxColumns);
      //if( notUp || notDown || notLeft || notRight) {
        if( notUp || notLeft || noRight ) {
        board[row][col].notTerritory= true;
        $(cellSelector(row, col)).addClass('territory-player-0');
        return true;
      } else {
        return false;
      }

    }

  }

}*/

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
        this.player.territory.push({row:rowIndex, col:colIndex});
      }
    }.bind(this));
  }.bind(this));
  console.log(this.player.territory)
  this.board.drawTerritory();

  function flood(board, row, col, maxRows, maxColumns) {
    if(row < 0 || col < 0 || row>maxRows-1 || col>maxColumns-1) return;
    
    
    if(!board[row][col].flooded && !board[row][col].wall) {
      board[row][col].flooded = true;
    //  $(cellSelector(row, col)).addClass('territory-player-0')
      flood(board, row-1, col, maxRows, maxColumns);
      flood(board, row+1, col, maxRows, maxColumns);
      flood(board, row, col+1, maxRows, maxColumns);
      flood(board, row, col-1, maxRows, maxColumns);
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

function Board(players) {
  this.players = players;
  this.loadTerrain();

}

Board.prototype.initBoard = function () {
  for(var rowIndex=0; rowIndex<this.rows; rowIndex++) {
    for(var colIndex=0; colIndex<this.columns; colIndex++) {
       $(".container").append($("<div class='cell board'>")
            .attr('data-row', rowIndex)
            .attr('data-column', colIndex));
    }
  }
  $('.cell').contextmenu(function() {
    return false;
});
}

Board.prototype.loadTerrain = function () {
  this.rows = 30;
  this.columns = 50;
  this.board = [];
  for(var rowIndex=0; rowIndex<this.rows; rowIndex++) {
    this.board.push([]);
    for(var colIndex=0; colIndex<this.columns; colIndex++) {
      this.board[rowIndex].push(rowIndex>colIndex ? {terrain:'water'} : {terrain:'land'})
    }
  }
  this.castle = {
    row: 10,
    col: 35
  }

/*  this.rows = 13;
  this.columns = 12;
  this.board = [];
  for(var rowIndex=0; rowIndex<this.rows; rowIndex++) {
    this.board.push([]);
    for(var colIndex=0; colIndex<this.columns; colIndex++) {
      this.board[rowIndex].push( {terrain:'land'})
    }
  }
  this.castle = {
    row: 5,
    col: 5
  }  */
}

Board.prototype.draw = function () {
  this.board.forEach(function(row, rowIndex) {
    row.forEach(function(cell, colIndex){
      var selector = cellSelector(rowIndex, colIndex);
      if(cell.terrain==="land") {
        $(selector).addClass('land');
      }
      if(cell.terrain==="water") {
        $(selector).addClass('water');
      }
      if(rowIndex === this.castle.row && colIndex === this.castle.col) {
        $(selector).append("<img class='castle' src='img/castle.bmp'>");
      }
    }.bind(this));
  }.bind(this));
};

Board.prototype.drawSegment = function (segment) {
  $(".cell").removeClass('seg-single seg-closed-up seg-closed-down seg-closed-left seg-closed-right seg-through-horizontal seg-through-vertical seg-corner-lu seg-corner-ru seg-corner-rd seg-corner-ld');
  if(segment.some(function(seg) {
        return seg.row < 0 || seg.row > this.rows-1 || seg.col<0 || seg.col>this.columns-1;
      }.bind(this))) {
    return;
  }
  segment.forEach(function(seg){
    $(cellSelector(seg.row, seg.col)).addClass(seg.type).addClass("segment");
  });
  if(this.canBuildWall(segment)) {
    $(".segment").css('border-color','white');
  } else {

    $(".segment").css('border-color','red');
  }
};

Board.prototype.drawWalls = function () {
  this.players.forEach(function(player){
    player.wall.forEach(function(wallSegment) {
      $(cellSelector(wallSegment.row, wallSegment.col)).removeClass("territory-player-0 territory-player-1 territory-player-3 territory-player-4")
      $(cellSelector(wallSegment.row, wallSegment.col)).addClass("wall");
      this.board[wallSegment.row][wallSegment.col].wall=true;
    }.bind(this));
    
  }.bind(this))
};

Board.prototype.drawTerritory = function (playerNum) {
  /*this.board.forEach(function(row, rowIndex, board){
    row.forEach(function (col, colIndex){
      if(board[rowIndex][colIndex].flooded) {
        $(cellSelector(rowIndex, colIndex)).addClass("territory-player-0");
      }

    })
  })*/
  this.players.forEach(function(player) {
    player.territory.forEach(function(ter){
      $(cellSelector(ter.row, ter.col)).addClass("territory-player-"+player.number)
    })
  })
};


Board.prototype.canBuildWall = function (segment) {
  if(isNaN(segment[0].row)) return false;
  var hasWater = segment.some(function(seg){
    return this.board[seg.row][seg.col].terrain==='water'; 
  }.bind(this));

  var hasWall = segment.some(function(seg){
    return this.players.some(function(player){
      return player.wall.some(function(wallSeg){
        return wallSeg.row===seg.row && wallSeg.col===seg.col;
      })
    })
  }.bind(this));

  return !(hasWater || hasWall);
};

function cellSelector(row, col) {
  return  "[data-row='"+row+"'][data-column='"+col+"']";
}
function getMouseTarget(mouse) {
    return { row: parseInt($(mouse.target).attr('data-row')),
             col: parseInt($(mouse.target).attr('data-column'))
           };
}


var game = new Game();