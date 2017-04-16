
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
        $(selector).append("<img class='castle' src='img/castle.svg'>");
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
  if(this.canBuild(segment)) {
    $(".segment").css('border-color','white');
  } else {

    $(".segment").css('border-color','red');
  }
};

Board.prototype.drawCannonSegment = function (segment) {

  
  if(segment.some(function(seg) {
        return seg.row < 0 || seg.row > this.rows-1 || seg.col<0 || seg.col>this.columns-1;
      }.bind(this))) {
    return;
  }
  if(this.canBuild(segment)) {

    $(".cannon-segment-main").html("");
    $(".cannon-segment").removeClass("cannon-segment").removeClass('seg-corner-lu seg-corner-ru seg-corner-rd seg-corner-ld');
    segment.forEach(function(seg){
      $(cellSelector(seg.row, seg.col)).addClass(seg.type).addClass("cannon-segment");
    });

    $(cellSelector(segment[0].row, segment[0].col)).html("<img src='img/cannon.svg' class='cannon-img'>")
                                                   .addClass("cannon-segment-main");
    

    $(".cannon-segment").css('border-color','white');

    return {row:segment[0].row, col:segment[0].col};
  } 
};
Board.prototype.drawCannon = function () {
  $(".cannon-segment-main").removeClass('cannon-segment-main').addClass('cannon');
  $(".cannon-segment").removeClass('seg-corner-lu seg-corner-ru seg-corner-rd seg-corner-ld')
}
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

  this.players.forEach(function(player) {
    player.territory.forEach(function(ter){
      $(cellSelector(ter.row, ter.col)).addClass("territory-player-"+player.number)
    });
  });
};


Board.prototype.drawShips = function (ships) {
  ships.forEach(function(ship){
    $(cellSelector(ship.row, ship.col)).html("<img src='img/ship2.svg' class='ship' id='"+ship.id+"'>");
  });
};

Board.prototype.canBuild = function (segment) {
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

  var hasCannon= segment.some(function(seg){
    return this.players.some(function(player){
      return player.cannons.some(function(cannon){
        return cannon.row===seg.row && cannon.col===seg.col ||
               cannon.row+1===seg.row && cannon.col===seg.col ||
               cannon.row===seg.row && cannon.col+1===seg.col ||
               cannon.row+1===seg.row && cannon.col+1===seg.col;
      })
    })
  }.bind(this));

  var hasCastle = segment.some(function(seg){
    return this.castle.row === seg.row && this.castle.col === seg.col ||
           this.castle.row+1 === seg.row && this.castle.col === seg.col ||
           this.castle.row === seg.row && this.castle.col+1 === seg.col ||
           this.castle.row+1 === seg.row && this.castle.col+1 === seg.col;
  }.bind(this));
  return !(hasWater || hasWall || hasCannon || hasCastle);
};

Board.prototype.canPlaceCannon = function () {
  return this.players[0].territory.some(function(ter){
    return this.canBuild(segCannon(ter.row, ter.col));
  }.bind(this))

}

Board.prototype.removeWall = function (wallSeg) {
  $(cellSelector(wallSeg.row, wallSeg.col)).removeClass('wall');
}
Board.prototype.removeShip = function (id) {
  $("#"+id).remove();
}

Board.prototype.animateShot = function ($origin, $target, cb) {
  var anim1, anim2, anim3;
  var originOffset = $origin.offset();
  originOffset.top+=5;
  originOffset.left+=5;

  var $ball = $("<img src='img/cannonball.svg' class='cannonball'>");
  $(".container").append($ball);
  $ball.offset(originOffset);

  var targetOffset = $target.offset();
  
  var self = this;
  if(Math.abs(originOffset.left - targetOffset.left) > Math.abs(originOffset.top-targetOffset.top)) {
    anim1 = {left:targetOffset.left};
    
    anim2 = {top:targetOffset.top-50-(targetOffset.top-originOffset.top)*2/3, width:"20", height:"20"};
    anim3 = {top:targetOffset.top,width:"10", height:"10"};
  } else {
    anim1 = {top:targetOffset.top};
    if( targetOffset.left > originOffset.left)
      anim2 = {left:targetOffset.left+50, width:"20", height:"20"};
    else
      anim2 = {left:targetOffset.left-50, width:"20", height:"20"};
    anim3 = {left:targetOffset.left,width:"10", height:"10"};
  }
    $ball.animate(anim1, {queue:false, duration:1500});
    $ball.animate(anim2, 1000);
    $ball.animate(anim3 ,500, function(){
  
    var $explosion = $("<img src='img/explosion.svg' class='explosion'>");
    var explosionOffset = $ball.offset();
    explosionOffset.top-=5;
    explosionOffset.left-=8;

    $explosion.offset(explosionOffset);
    $ball.remove();
    $('.container').append($explosion);
    cb();
    
    setTimeout(function(){
      $explosion.remove();
    }.bind(this), 200)
  });
}