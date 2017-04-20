jQuery.fn.center = function () {
    this.css("position","absolute");
    
    this.css("top", this.parent().offset().top+Math.max(0, (($(".container").height() - $(this).outerHeight()) / 2))+"px"); 
                                                //$(window).scrollTop()) + "px");
    this.css("left", this.parent().offset().left+Math.max(0, (($(".container").width() - $(this).outerWidth()) / 2))+"px"); 
                                                //$(window).scrollLeft()) + "px");
    return this;
};

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
  });
}

function getRandomExplosionSound() {
  return new Audio("snd/"+Math.floor(Math.random()*10+1)+".mp3");
}