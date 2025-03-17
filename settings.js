/**
 * Script for opening settings modal.
 */

var close = document.getElementsByClassName("close-button")[0];

// When the user clicks on the button, open the modal
$('#settings').click(function(event) {
  $('#settings-modal').show();
});

// When the user clicks on <span> (x), close the modal
close.onclick = function() {
  $('#settings-modal').hide();
}

// When the user clicks anywhere outside of the modal, close it
// TODO: Not working. FIX!
window.onclick = function(event) {
  let modal = $('#settings-modal');
  if (event.target == modal) {
    modal.hide();
  }
} 