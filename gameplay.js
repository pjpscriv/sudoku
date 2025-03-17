/*  Javascript Sudoku
    Just for fun. 

    Author: Peter J P Scriven
    Date: Apr 2018
    Update: Aug 2019
*/
// 0. GLOBAL VARIABLES
// 0.1 Highlights
var H_VALS = true;
var H_ROWS = true;
var H_COLS = true;
var H_BOXES = false;

// 0.2 Show Errors
var SHOW_ERR = true;

// 0.3 current cell
var CELL = null;

// 1. HELPERS
// 1.1 Item in Array
function in_arr(key, arr) {
  return ($.inArray(key, arr) >= 0);
}
// 1.2 Get Class List
function classes_of(cell) {
  return cell.prop('className').split(' ');
}
// 1.3 Get Specific Class of Cell
function get_class(cell, class_prefix) {
  var classes = classes_of(cell);
  for (var i = 0; i < classes.length; i++) {
    if (classes[i].startsWith(class_prefix)) {
      return parseInt(classes[i].slice(1));
    }
  }
  throw 'Cell doesn\'t have ' + class_prefix + ' class';
}
// 1.4 Get Class Selector String
function get_selector(x, y) {
  return '.x' + x.toString() + '.y' + y.toString();
}
// 1.5 Set current cell
function set_current(cell) {
  $('input').removeClass('current');
  cell.addClass('current');
  CELL = cell;
}
// 1.6 Convert Keyboard Code to Int
function keycode_to_number(code) {
  var numbers = {49:1, 50:2, 51:3,
                  52:4, 53:5, 54:6,
                  55:7, 56:8, 57:9}
  if (in_arr(String(code), Object.keys(numbers))) {
    return String(numbers[code]);
  } else {
    throw 'This keycode is incorrect:' + code;
  }
}
// 1.7 Disable Mobile Keyboard
function disable_mobile_keyboard() {
  if (Modernizr.touch) {
    // Disable keyboard by adding readonly attribute
     $('input').attr('readonly', 'readonly');  
  }   
}



// 2. BUSINESS FUNCTIONS
// 2.1 Update Focus Position
function update_position(cell, key) {

  var left  = [37, 65];
  var up    = [38, 87];
  var right = [39, 68];
  var down  = [40, 83];

  var x = get_class(cell, 'x');
  var y = get_class(cell, 'y');

  if (in_arr(key, left)) {
    x = Math.max(x - 1, 1);
  } else if (in_arr(key, up)) {
    y = Math.min(y + 1, 9);
  } else if (in_arr(key, right)) {
    x = Math.min(x + 1, 9);
  } else if (in_arr(key, down)) {
    y = Math.max(y - 1, 1);
  }

  cell.blur()

  var new_cell = $(get_selector(x, y));
  CELL = new_cell;
  new_cell.focus();
  return false;
}

// 2.2 Grid Resizing - does nothing atm
function scale_game() {

  // Get Sizes
  var w = $(window).width();
  var h = $(window).height();

  var ws = Math.floor(w / 15);
  var hs = Math.floor(h / 17);

  var s = Math.min(ws, hs);

  // Resize fonts
  // Grid
  $('input').css('font-size', s);
  $('input').css('width', s);
  $('input').css('height', s);

  // Buttons
  $('.numbers p').css('font-size', s); // Numbers
  $('.numbers p i').css('font-size', s-15); // Pencil
  $('.numbers p i.fa-backspace').css('font-size', s-17); // Backspace
  $('.numbers p').css('width', s+'px');
  $('.numbers p').css('height', s+'px');

  console.log('resized!: '+$(window).width());
}

// 2.3 Loads a Game
function load(string) {
  // Loads a sudoku game from a string
  if (string.length !== 81) {
    throw 'Load string must be exactly 81 digits long. \
            This one is ' + string.length;
  }

  // Loads left -> right, top -> bottom
  // Completely arbitrary I just wanted it this way. :P
  for(var y = 0; y < 9; y++) {
    for (var x = 0; x < 9; x++) {
      var num = parseInt(string[(y*9) + x]);
      if (num > 0) {
        var selector = '.x'+(x+1)+'.y'+(9-y);
        var cell = $(selector);
        cell.val(num);
        cell.toggleClass('uneditable');
      }
    }
  }
}

// 2.4 Highlighters
function highlight_values(cell) {
  value = cell.val();
  $('input').each(function(event) {
    if ($(this).val() !== '' && $(this).val() === value) {
      $(this).addClass('vhighlight');
    }
  });
}
function highlight_rows(cell) {
  var y   = '.y' + get_class(cell, 'y');
  $(y).addClass('highlight');
}
function highlight_cols(cell) {
  var x   = '.x' + get_class(cell, 'x');
  $(x).addClass('highlight');
}
function highlight_boxes(cell) {
    var box = '.b' + get_class(cell, 'b');
    $(box).addClass('highlight');
}

// 2.5 Error Highlighters
function highlight_errors(cell, val) {
  // Remember previous errors
  var errs = $('.error').not('.uneditable').not('.current');

  // Clear all errors
  $('input').removeClass('error');

  // reinstate old errors (if still valid)
  errs.each(function(event) {
    if ($(this).val() !== '') {
      check_cell_error($(this), $(this).val());
    }
  });

  // Check for new errors
  if (val !== '') {
  check_cell_error(cell, val);
  }
}

function check_cell_error(cell, val) {
  var err = false;

  var x = '.x' + get_class(cell, 'x');
  var y = '.y' + get_class(cell, 'y');
  var b = '.b' + get_class(cell, 'b');

  // Iterate through cols, rows, boxes
  $(x).not('.current').each(function(event) {
    if ($(this).val() === val) {
      $(this).addClass('error');
      err = true;
    }
  });
  $(y).not('.current').each(function(event) {
    if ($(this).val() === val) {
      $(this).addClass('error');
      err = true;
    }
  });
  $(b).not('.current').each(function(event) {
    if ($(this).val() === val) {
      $(this).addClass('error');
      err = true;
    }
  });

  if (err) {
    cell.addClass('error');
  }
}




// 3. MAIN LISTENER FUNCTION(S)
function main() {

  scale_game();
  disable_mobile_keyboard();

  // Keyboard Inputs
  $('input').keydown(function(event) {
    var key = event.which;
    var cell = $('input:focus');
        
    // Keycodes
    // left, up, right, down, a, w, d, s
    var moves = [37,38,39,40,65,87,68,83];
    var numbers = [49,50,51,52,53,54,55,56,57];
    var deletes = [8, 46]; // backspace, delete
        
    // Movement
    if (in_arr(key, moves)) { 
      update_position(cell, key);
    } 
    
    // Edits - Check cell is editable
    if (in_arr('uneditable', classes_of(cell))) { 
      console.log('Cell cannot be edited!');

    // Deletes
    } else if (in_arr(key, deletes)) {
      cell.val('').focus();
  
    // Numbers
    } else if (in_arr(key, numbers)) {
        cell.val(keycode_to_number(key)).focus();
    }
    // Don't actually write to cell (already written to)
    return false;
  });

  // Cell Focussed (Update Highlights)
  $('input').on('focus', function(event) {

    $('input').removeClass('highlight').removeClass('vhighlight');

    var cell = $(this);
    set_current(cell);

    if (H_VALS) { highlight_values(cell); }
    if (H_ROWS) { highlight_rows(cell); }
    if (H_COLS) { highlight_cols(cell); }
    if (H_BOXES) { highlight_boxes(cell); }
    if (SHOW_ERR) { highlight_errors(cell, cell.val()); } 
  });

  // Button Clicks
  $('.numbers p').click(function(event) {
    var num = $(this).text();

    if (CELL !== null) {
      // console.log('BUTTON:', num);
      if (in_arr('uneditable', classes_of(CELL))) {
        console.log('Cell cannot be edited!');
      } else {
        if (num === '') { // Backspace or Pencil
          CELL.val('').focus();
        } else {         // Number
          CELL.val(num).focus();
        }
      }
    } else {
      console.log('BUTTON: No cell selected')
    }
  });

  // Resizing
  $(window).resize(function() {
    scale_game();
  });

    // Lol test
  load('000801345030200800800300026700090100058102479000700500586020000020010600179683254');
}

// Listener Loader
$(document).ready(main);
