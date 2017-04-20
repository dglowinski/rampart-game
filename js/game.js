function Game() {
  this.players = [];
  
  this.players.push(new Player('local',0));
  this.players.push(new Player('remote',1));

  this.board = new Board(this.players);
  this.board.initBoard();
  this.board.draw();
  
  this.isMultiplayer = false;
  this.remote = new Remote(this.board, this.players, this.onConnect.bind(this), this.onCannonerFinish.bind(this), this.onWin.bind(this));

  this.builder = new Builder(this.board, this.players[0], this.remote);
  this.war = new War(this.board, this.players, this.remote);
  this.remote.onShipDestroyed = this.war.remoteShipDestroy;
  this.cannoner = new Cannoner(this.board, this.players[0], this.onCannonerFinish.bind(this), this.remote);
  
  this.stage = "begin";
  this.soundTheme = new Audio(SND_THEME);
  this.soundBuildTheme = new Audio(SND_BUILD_THEME);
  this.gameOptions(); 
}

Game.prototype.onConnect = function (role) {
  this.masterSlave = role;
  this.players[0].masterSlave = role;
  $("#game-waiting").html("GAME ON!").center();
  setTimeout(function(){
    $("#game-waiting").remove();
    this.nextStage();
  }.bind(this), 1000);
};

Game.prototype.onWin = function () {
  this.stage = "begin";

  $('.game-message').remove();
  this.message("VICTORY!!", this.gameOptions.bind(this));
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
};

Game.prototype.startStage = function () {
  switch(this.stage) {  
    case "war":
        this.soundBuildTheme.pause();
        this.soundBuildTheme.currentTime=0;
        this.startTimer(SECONDS_WAR);
        this.war.start();
        break;
    case "cannoner":
        if(this.soundBuildTheme.currentTime===0) this.soundBuildTheme.play();
        this.startTimer(SECONDS_CANNONER);
      
        this.cannoner.init();
        break;
    case "builder":
        if(this.soundBuildTheme.currentTime===0) this.soundBuildTheme.play();
        this.startTimer(SECONDS_BUILDER);
        this.builder.init();
        break;
  }
};

Game.prototype.gameOver = function () {
  this.message("GAME OVER", this.gameOptions.bind(this));
  (new Audio(SND_GAME_OVER)).play();
  this.remote.emit("game-over");
};

Game.prototype.gameOptions = function () {
  this.soundTheme.play();
  $message = $('<div>').addClass("game-options animated flipInX").html("Start single").attr("id", "game-option-single");
  $(".container").append($message);
  $message.center().css('top', "-=40px");
  
 
  $message = $('<div>').addClass("game-options animated flipInX").html("Start multi").attr("id", "game-option-multi");
  $(".container").append($message);
  $message.center().css('top', "+=40px");

 
  $(".game-options").mouseover(function() {
    $(this).removeClass("flipInX");
    $(this).addClass("pulse infinite game-options-over");
  });
   $(".game-options").mouseout(function() {
     $(this).removeClass("pulse infinite game-options-over");
   });

   $("#game-option-single").click(function(){
      $(".game-options").remove();
     
      this.soundTheme.pause();
      this.soundTheme.currentTime = 0;
      (new Audio(SND_OPTIONS)).play();
      this.stage = "begin";
      this.isMultiplayer = false;
      this.nextStage();
   }.bind(this));

  $("#game-option-multi").click(function(){
      this.soundTheme.pause();
      this.soundTheme.currentTime = 0;
      (new Audio(SND_OPTIONS)).play();
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
  this.soundBuildTheme.pause();
  this.soundBuildTheme.currentTime=0;
  (new Audio(SND_STAGE)).play();
  setTimeout(function(){
    $('.game-message').addClass("fadeOutDown");
    setTimeout(function(){
      $('.game-message').remove();
      cb();
    }, 1000);
  }, 2000);
};

Game.prototype.onCannonerFinish = function (gameOver) {
  if(gameOver) {
    clearInterval(this.timerId);
    this.gameOver();
  } else {
    if(!this.isMultiplayer || this.cannoner.isFinished && this.remote.isCannonerFinished) {
       clearInterval(this.timerId);
       this.nextStage();
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
};