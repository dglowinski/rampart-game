

  function seg1(row, col, direction) {
    return [{row:row, col:col, type:'seg-single'}];
  }
  function seg2(row, col, direction) {
    var segment=[];
    
    switch (direction) {
      case 0:
      case 2: 
        segment.push({row:row, col:col, type:'seg-closed-left'});
        segment.push({row:row, col:col+1, type:'seg-closed-right'}); 
        break;
      case 1:
      case 3: 
        segment.push({row:row, col:col, type:'seg-closed-up'});
        segment.push({row:row+1, col:col, type:'seg-closed-down'}); 
        break;

    }
    return segment;
  }

  function seg3(row, col, direction) {
    var segment=[];
    
    switch (direction) {
      case 0:
      case 2: 
        segment.push({row:row, col:col, type:'seg-through-vertical'});
        segment.push({row:row+1, col:col,  type:'seg-closed-down'}); 
        segment.push({row:row-1, col:col, type:'seg-closed-up'});
        break;
      case 1:
      case 3: 
        segment.push({row:row, col:col, type:'seg-through-horizontal'});
        segment.push({row:row, col:col-1, type:'seg-closed-left'}); 
        segment.push({row:row, col:col+1, type:'seg-closed-right'}); 
        break;
    }
    return segment;
  }

  function segL(row, col, direction) {
    var segment=[];
    
    switch (direction) {
      case 0:
        segment.push({row:row, col:col, type:'seg-corner-ld'});
        segment.push({row:row-1, col:col,  type:'seg-closed-up'}); 
        segment.push({row:row, col:col+1, type:'seg-closed-right'});
        break;
      case 1: 
        segment.push({row:row, col:col, type:'seg-corner-lu'});
        segment.push({row:row+1, col:col,  type:'seg-closed-down'}); 
        segment.push({row:row, col:col+1, type:'seg-closed-right'}); 
        break;     
      case 2:
        segment.push({row:row, col:col, type:'seg-corner-ru'});
        segment.push({row:row+1, col:col,  type:'seg-closed-down'}); 
        segment.push({row:row, col:col-1, type:'seg-closed-left'}); 
        break;      
      case 3: 
        segment.push({row:row, col:col, type:'seg-corner-rd'});
        segment.push({row:row-1, col:col,  type:'seg-closed-up'}); 
        segment.push({row:row, col:col-1, type:'seg-closed-left'}); 
        break;
    }
    return segment;
  }

  function segLlarge(row, col, direction) {
    var segment=[];
//    direction=3;
    switch (direction) {
      case 0:
        segment.push({row:row, col:col, type:'seg-corner-ld'});
        segment.push({row:row-2, col:col,  type:'seg-closed-up'});
        segment.push({row:row-1, col:col,  type:'seg-through-vertical'});  
        segment.push({row:row, col:col+1, type:'seg-closed-right'});
        break;
      case 1: 
        segment.push({row:row, col:col, type:'seg-corner-lu'});
        segment.push({row:row+1, col:col,  type:'seg-closed-down'}); 
        segment.push({row:row, col:col+1, type:'seg-through-horizontal'}); 
        segment.push({row:row, col:col+2, type:'seg-closed-right'}); 
        break;     
      case 2:
        segment.push({row:row, col:col, type:'seg-corner-ru'});
        segment.push({row:row+1, col:col,  type:'seg-through-vertical'}); 
        segment.push({row:row+2, col:col,  type:'seg-closed-down'}); 
        segment.push({row:row, col:col-1, type:'seg-closed-left'}); 
        break;      
      case 3: 
        segment.push({row:row, col:col, type:'seg-corner-rd'});
        segment.push({row:row-1, col:col,  type:'seg-closed-up'}); 
        segment.push({row:row, col:col-1, type:'seg-through-horizontal'}); 
        segment.push({row:row, col:col-2, type:'seg-closed-left'}); 
        break;
    }
    return segment;
  }

  function seg5(row, col, direction) {
    var segment=[];

    switch (direction) {
      case 0:
        segment.push({row:row, col:col, type:'seg-through-vertical'});
        segment.push({row:row-1, col:col,  type:'seg-corner-lu'});
        segment.push({row:row-1, col:col+1,  type:'seg-closed-right'});  
        segment.push({row:row+1, col:col+1,  type:'seg-closed-right'});
        segment.push({row:row+1, col:col, type:'seg-corner-ld'});
        break;
      case 1: 
        segment.push({row:row, col:col, type:'seg-through-horizontal'});
        segment.push({row:row, col:col-1,  type:'seg-corner-lu'});
        segment.push({row:row+1, col:col-1,  type:'seg-closed-down'});  
        segment.push({row:row, col:col+1, type:'seg-corner-ru'});
        segment.push({row:row+1, col:col+1,  type:'seg-closed-down'});
        break;     
      case 2:
        segment.push({row:row, col:col, type:'seg-through-vertical'});
        segment.push({row:row-1, col:col,  type:'seg-corner-ru'});
        segment.push({row:row-1, col:col-1,  type:'seg-closed-left'});  
        segment.push({row:row+1, col:col, type:'seg-corner-rd'});
        segment.push({row:row+1, col:col-1,  type:'seg-closed-left'});
        break;      
      case 3: 
        segment.push({row:row, col:col, type:'seg-through-horizontal'});
        segment.push({row:row, col:col-1,  type:'seg-corner-ld'});
        segment.push({row:row-1, col:col-1,  type:'seg-closed-up'});  
        segment.push({row:row, col:col+1, type:'seg-corner-rd'});
        segment.push({row:row-1, col:col+1,  type:'seg-closed-up'});
        break;
    }
    return segment;
  }
  
  