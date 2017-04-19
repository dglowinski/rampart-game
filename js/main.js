var MAX_CANNONS_PER_ROUND = 3;
var WAR_DURATION = 100000;
var NEW_SHIPS_PER_ROUND = 4;
var SHIP_ATTACK_DELAY = 4000;
var MAX_SHIP_DAMAGE = 5;
var CANNON_DELAY = 2500;
var SECONDS_WAR = 1;
var SECONDS_CANNONER = 15; //5
var SECONDS_BUILDER = 150000;



function Game() {
  this.players = [];
  
  this.players.push(new Player('local',0));
  this.players.push(new Player('remote',1));

  this.board = new Board(this.players);
  this.board.initBoard();
  this.board.draw();
  
  this.isMultiplayer = false;
  this.remote = new Remote(this.board, this.players[1], this.onConnect.bind(this), this.onCannonerFinish.bind(this));

  this.builder = new Builder(this.board, this.players[0], this.remote);
  this.war = new War(this.board, this.players, this.onWarFinish, this.remote);
  this.cannoner = new Cannoner(this.board, this.players[0], this.onCannonerFinish.bind(this), this.remote);
  
  this.stage = "begin";

  this.gameOptions(); 
}

Game.prototype.onConnect = function (role) {
  this.masterSlave = role;
  this.players[0].masterSlave = role
  $("#game-waiting").html("GAME ON!").center();
  setTimeout(function(){
    $("#game-waiting").remove();
    this.nextStage();
  }.bind(this), 1000) 
}

Game.prototype.nextStage = function () {
  switch(this.stage) {
    case "begin":
      this.players[0].reset();
      this.players[1].reset();
      this.war.reset();
      this.board.reset();
      this.cannoner.reset();
      this.builder.makeCastle();
      this.stage = "cannoner";
      this.message("Place cannons", this.startStage.bind(this));
      break;
 
    case "builder":
      this.builder.finish();

      if(this.players[0].territory.length===0) {
        this.gameOver();
        return;
      }
 
      this.stage = "cannoner";
      this.message("Place cannons", this.startStage.bind(this));
      break;
 
    case "war":
      this.war.finish();
      this.stage = "builder";
      this.message("Rebuild walls", this.startStage.bind(this));
      break;
 
    case "cannoner":
      this.cannoner.finish();
      if(!this.players[0].checkCannonsOnTerritory()) {
        this.gameOver();
        return;  
      }
      this.stage = "war";
      this.message("WAR!!", this.startStage.bind(this));
      break;
  }
}

Game.prototype.startStage = function () {
  switch(this.stage) {  
    case "war":
        this.startTimer(SECONDS_WAR);
        this.war.start();
        break;
    case "cannoner":
        this.startTimer(SECONDS_CANNONER);
        this.cannoner.init();
        break;
    case "builder":
        this.startTimer(SECONDS_BUILDER);
        this.builder.init();
        break;
  }
}

Game.prototype.gameOver = function () {
  this.message("GAME OVER", this.gameOptions.bind(this));
}

Game.prototype.gameOptions = function () {
  $message = $('<div>').addClass("game-options animated flipInX").html("Start single").attr("id", "game-option-single");
  $(".container").append($message);
  $message.center().css('top', "-=20px");
  
 
  $message = $('<div>').addClass("game-options animated flipInX").html("Start multi").attr("id", "game-option-multi");
  $(".container").append($message);
  $message.center().css('top', "+=20px");

 
  $(".game-options").mouseover(function() {
    $(this).removeClass("flipInX");
    $(this).addClass("pulse infinite game-options-over");
  });
   $(".game-options").mouseout(function() {
     $(this).removeClass("pulse infinite game-options-over");
   })

   $("#game-option-single").click(function(){
      $(".game-options").remove();
      this.stage = "war";
      this.isMultiplayer = false;
      this.nextStage();
   }.bind(this));

  $("#game-option-multi").click(function(){
      $(".game-options").remove();
      this.isMultiplayer = true;
      this.remote.init();
      $message = $('<div>').addClass("game-options animated flash infinite").html("Waiting for player 2...").attr("id", "game-waiting");
       $(".container").append($message);
       $message.center();
   }.bind(this));


};


Game.prototype.message = function(message, cb) {
  $message = $('<div>').addClass("game-message animated bounceInDown").html(message);
  $(".container").append($message);
  $(".game-message").center();
  setTimeout(function(){
    $('.game-message').addClass("fadeOutDown");
    setTimeout(function(){
      $('.game-message').remove();
      cb();
    }, 1000);
  }, 2000)
}

Game.prototype.onCannonerFinish = function (gameOver) {
  
  if(gameOver) {
    clearInterval(this.timerId);
    this.gameOver();
  } else {
    if(!this.isMultiplayer || this.cannoner.isFinished && this.remote.isCannonerFinished) {

       clearInterval(this.timerId);
       this.nextStage()
    }
  }
};

Game.prototype.startTimer = function (seconds) {
  this.secondsLeft = seconds;
  this.board.drawTimer(this.secondsLeft);
  this.timerId = setInterval(function(){
    this.secondsLeft--;
    this.board.drawTimer(this.secondsLeft);
    
    if(this.secondsLeft===0) {
      clearInterval(this.timerId);
      this.board.hideTimer(this.secondsLeft);
      
      this.nextStage();
    }
  }.bind(this), 1000);
}


function Ship(position, player, board) {
  this.row = position.row;
  this.col = position.col;
  this.player = player;
  this.board = board;
  this.id = _.uniqueId();
  this.damage = 0;
}


Ship.prototype.shoot = function() {
  
  if(this.player.wall.length) {

    var wallIndex = Math.floor(Math.random() * this.player.wall.length);

    var wall = this.player.wall[wallIndex];
    this.destroyedWall = {row:wall.row, col:wall.col};
    this.player.destroyWall(wallIndex); 
    this.board.animateShotShip($(cellSelector(this.row, this.col)).find("img"));
    this.board.animateShot($(cellSelector(this.row, this.col)).find("img"), $(cellSelector(wall.row, wall.col)), this.shootCb.bind(this));
  }
};
Ship.prototype.shootCb = function() {
  this.board.removeWall(this.destroyedWall);
};

function Cannoner(board, player, finishCb, remote) {
  this.board = board;
  this.player = player;
  this.remote = remote;
  this.onFinishCb = finishCb;

  this.isFinished = false;
  this.cannonsPlaced = 0;
}

Cannoner.prototype.init = function() {
  $('.territory-player-'+this.player.number).mouseover(this.moveCannon.bind(this));
  $('.territory-player-'+this.player.number).mousedown(this.click.bind(this));
};

Cannoner.prototype.reset = function() {
  this.isFinished = false;
  this.cannonsPlaced = 0;
}
Cannoner.prototype.click = function(event) {
  if(this.segment) {
    
    this.player.addCannon(this.segment[0]);
    this.cannonsPlaced++;
    this.board.removeCannonSegment(this.segment);
    this.board.drawCannons();
    
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
    this.remote.emit('draw-cannon-segment', this.segment);
  }
};

Cannoner.prototype.getSegment = function(row, col) {
  return segCannon(row, col);  
};

function Player(type,number) {
  this.number = number;
  this.type = type;
  this.wall = [];
  this.territory = [];
  this.cannons = [];
}

Player.prototype.addWall = function (segment) {
  segment.forEach(function(seg){
    this.wall.push({row:seg.row, col:seg.col});
  }.bind(this));
  
};

Player.prototype.addTerritory = function (cell) {
  this.territory.push(cell);
};

Player.prototype.addCannon= function (cell) {
  this.cannons.push(new Cannon(cell));
};

Player.prototype.destroyWall= function (wallIndex) {
  this.wall.splice(wallIndex, 1);
};

Player.prototype.checkCannonsOnTerritory= function () {
  var hasCannonsInTerritory = false;
  this.cannons.forEach(function(cannon){
    if(this.territory.find(function(ter){
      return ter.row === cannon.row && ter.col === cannon.col;
    })) {
      cannon.outOfTerritory = false;
    } else {
      cannon.outOfTerritory = true;
    }
    hasCannonsInTerritory = hasCannonsInTerritory || !cannon.outOfTerritory;
  }.bind(this));
  return hasCannonsInTerritory;
};

Player.prototype.reset= function () {
  this.wall = [];
  this.cannons = [];
  this.territory = [];
};

function Cannon(cell) {
  this.row = cell.row;
  this.col = cell.col;
  this.canShoot = true;
}
Cannon.prototype.shoot = function () {
  this.canShoot = false;
  setTimeout(function(){
    this.canShoot = true;
  }.bind(this), CANNON_DELAY); 
}








jQuery.fn.center = function () {
    this.css("position","absolute");
    
    this.css("top", this.parent().offset().top+Math.max(0, (($(".container").height() - $(this).outerHeight()) / 2))+"px"); 
                                                //$(window).scrollTop()) + "px");
    this.css("left", this.parent().offset().left+Math.max(0, (($(".container").width() - $(this).outerWidth()) / 2))+"px"); 
                                                //$(window).scrollLeft()) + "px");
    return this;
}

function cellSelector(row, col) {
  return  "[data-row='"+row+"'][data-column='"+col+"']";
}
function getMouseTarget(mouse) {
    return { row: parseInt($(mouse.target).attr('data-row')),
             col: parseInt($(mouse.target).attr('data-column'))
           };
}

function isCellInside(cell, area) {
  return area.find(function(a) {
    return cell.row === a.row && cell.col === a.col;
  })
}

var game = new Game();