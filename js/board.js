
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
  $(".container").append('<div id="icons-author">Icons made by <a href="http://www.freepik.com" title="Freepik">Freepik</a> from <a href="http://www.flaticon.com" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>');
  $('.cell').contextmenu(function() {
    return false;
  });
};

Board.prototype.reset = function () {
  $(".wall").removeClass("wall");
  $(".cannon-img").remove();
  $(".ship").remove();
};

Board.prototype.loadTerrain = function () {
  this.rows = 40;
  this.columns = 70;
  this.board = [];
  var ter;
  for(var rowIndex=0; rowIndex<this.rows; rowIndex++) {
    this.board.push([]);
    for(var colIndex=0; colIndex<this.columns; colIndex++) {
      if(rowIndex>colIndex) {
        ter = {terrain:'water'};
      } else {
        if(colIndex > this.columns/3) {
          if (rowIndex<(this.columns/3 + colIndex)/2 ){ter={terrain:'land'};}
          else {ter = {terrain:"water"};}
        } else {
         ter = {terrain:'land'};
        }
      }
      if(colIndex === this.rows-rowIndex +15 || colIndex === this.rows-rowIndex +16) {
        ter = {terrain:'water'};
      }

      this.board[rowIndex].push(ter);
    }
  }
  this.castles = [{
    row: 25,
    col: 50
  },{
    row: 10,
    col: 27
  }];

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
};

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
      if(isCellInside({row:rowIndex, col:colIndex}, this.castles)) {
        $(selector).append("<img class='castle' src='img/castle.svg'>");
      }
    }.bind(this));
  }.bind(this));
};

Board.prototype.drawSegment = function (segment) {

  if(segment.some(function(seg) {
        return seg.row < 0 || seg.row > this.rows-1 || seg.col<0 || seg.col>this.columns-1;
      }.bind(this))) {
    return;
  }
  segment.forEach(function(seg){
    $(cellSelector(seg.row, seg.col)).addClass(seg.type).addClass("segment");
  });

};
Board.prototype.removeSegment = function (segment) {
  segment.forEach(function(seg){
    $(cellSelector(seg.row, seg.col)).addClass(seg.type).removeClass('seg-single seg-closed-up seg-closed-down seg-closed-left seg-closed-right seg-through-horizontal seg-through-vertical seg-corner-lu seg-corner-ru seg-corner-rd seg-corner-ld');
  });
};

Board.prototype.segmentValid = function (segment, valid) {
  var color;
  color = valid ? "white" : "red";
  segment.forEach(function(seg){
    $(cellSelector(seg.row, seg.col)).css("border-color", color);
  });

};

Board.prototype.drawCannonSegment = function (segment) {

  segment.forEach(function(seg){
    $(cellSelector(seg.row, seg.col)).addClass(seg.type).addClass("cannon-segment");
      $(".cannon-segment").css('border-color','white');
  });

  $(cellSelector(segment[0].row, segment[0].col)).html("<img src='img/cannon_left.svg' class='cannon-img'>")
                                                  .addClass("cannon-segment-main");
  
};

Board.prototype.removeCannonSegment = function (segment) {
  if(segment) {
    $(cellSelector(segment[0].row, segment[0].col)).html("");
    segment.forEach(function(seg){
      $(cellSelector(seg.row, seg.col)).removeClass("cannon-segment").removeClass('seg-corner-lu seg-corner-ru seg-corner-rd seg-corner-ld');
    });
  }
};

Board.prototype.drawCannons = function () {
  this.players.forEach(function(player){
    player.cannons.forEach(function(cannon) {
      if($(cellSelector(cannon.row, cannon.col)).find("img").length===0)
        $(cellSelector(cannon.row, cannon.col)).html("<img src='img/cannon_left.svg' class='cannon-img'>");
   }.bind(this));
  }.bind(this));
};

Board.prototype.drawWalls = function () {
  this.players.forEach(function(player){
    player.wall.forEach(function(wallSegment) {
      $(cellSelector(wallSegment.row, wallSegment.col)).removeClass("territory-player-0 territory-player-1 territory-player-3 territory-player-4");
      $(cellSelector(wallSegment.row, wallSegment.col)).addClass("wall");
    }.bind(this));
    
  }.bind(this));
};

Board.prototype.drawTerritory = function (playerNum) {
  $(".land").removeClass("territory-player-0 territory-player-1 territory-player-2");
  this.players.forEach(function(player) {
    player.territory.forEach(function(ter){
      $(cellSelector(ter.row, ter.col)).addClass("territory-player-"+player.number);
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
    if(seg.row >= this.rows-1 || seg.col >= this.columns) return true;
    return this.board[seg.row][seg.col].terrain==='water'; 
  }.bind(this));

  var hasWall = segment.some(function(seg){
    return this.players.some(function(player){
      return player.wall.some(function(wallSeg){
        return wallSeg.row===seg.row && wallSeg.col===seg.col;
      });
    });
  }.bind(this));

  var hasCannon= segment.some(function(seg){
    return this.players.some(function(player){
      return player.cannons.some(function(cannon){
        return cannon.row===seg.row && cannon.col===seg.col ||
               cannon.row+1===seg.row && cannon.col===seg.col ||
               cannon.row===seg.row && cannon.col+1===seg.col ||
               cannon.row+1===seg.row && cannon.col+1===seg.col;
      });
    });
  }.bind(this));

  var hasCastle = segment.some(function(seg){

    return this.castles.some(function(castle){
      return castle.row === seg.row && castle.col === seg.col ||
            castle.row+1 === seg.row && castle.col === seg.col ||
            castle.row === seg.row && castle.col+1 === seg.col ||
            castle.row+1 === seg.row && castle.col+1 === seg.col;

    });

    
  }.bind(this));
  return !(hasWater || hasWall || hasCannon || hasCastle);
};

Board.prototype.canPlaceCannon = function () {
  return this.players[0].territory.some(function(ter){
    return this.canBuild(segCannon(ter.row, ter.col));
  }.bind(this));
};

Board.prototype.removeWall = function (wallSeg) {
  $(cellSelector(wallSeg.row, wallSeg.col)).removeClass('wall');
};

Board.prototype.removeShip = function (id) {
  $("#"+id).remove();
};

Board.prototype.animateShotShip = function ($ship) {
  $ship.attr("src", "img/ship_fire.svg");
  getRandomExplosionSound().play();
  setTimeout(function(){
     $ship.attr("src", "img/ship2.svg");
  }, 300);
};

Board.prototype.animateShotCannon = function ($cannon) {
  var offset = $cannon.offset();
  
  var $img = $("<img class='fire' src='img/fire.png'>");
  getRandomExplosionSound().play();
   offset.left-=10;
  $img.offset(offset);
  $('.container').append($img);
  setTimeout(function(){
     $img.remove();
  }, 300);
};

Board.prototype.animateShot = function ($origin, $target, cb) {
  var anim1, anim2, anim3;
  var originOffset = $origin.offset();
  if($origin.length) {
    originOffset.top+=5;
    originOffset.left+=5;

    var $ball = $("<img src='img/cannonball.svg' class='cannonball'>");
    $(".container").append($ball);
    $ball.offset(originOffset);

    var targetOffset = $target.offset();
    
    var self = this;
  // if(Math.abs(originOffset.left - targetOffset.left) > Math.abs(originOffset.top-targetOffset.top)) {
    /*  anim1 = {left:targetOffset.left};
      var z = targetOffset.top-originOffset.top;
      console.log(z);
      if(z>50) {
        var d = z-50+20;
      } else {
        d=0;
      }
      anim2 = {top:targetOffset.top-50-d, width:"20", height:"20"};
      anim3 = {top:targetOffset.top,width:"10", height:"10"};

      $ball.animate(anim1, {queue:false, duration:1500});
      $ball.animate(anim2, 1000);
      $ball.animate(anim3 ,500, function(){*/
        
      $ball.animate({left:targetOffset.left,top:targetOffset.top }, {queue:false, duration:1500});
      $ball.animate({width:"15", height:"15"}, 750);
      $ball.animate({width:"10", height:"10"}, 750, function() {
    
      var $explosion = $("<img src='img/explosion.svg' class='explosion'>");
      var explosionOffset = $ball.offset();
      explosionOffset.top-=5;
      explosionOffset.left-=8;

      $explosion.offset(explosionOffset);
      $ball.remove();
      $('.container').append($explosion);
      getRandomExplosionSound().play();
      if(cb) cb();
      
      setTimeout(function(){
        $explosion.remove();
      }.bind(this), 200);
    });
  }
};

Board.prototype.drawTimer = function (seconds) {

  var $timer = $('.timer'), offset; 
  $timer.remove();
  $timer = $('<div class="timer animated">');
  offset = $('.container').offset();
  offset.top+=10;
  offset.left+=30;
  $timer.offset(offset);
  $(".container").append($timer);
  
  $timer.html(seconds).addClass("flipInX");

};

Board.prototype.hideTimer = function () {
  $('.timer').remove();
};