// The following function is "borrowed" from Stack Overflow
function eventFire(el, etype) {
  if (el.fireEvent) {
    el.fireEvent("on" + etype);
  } else {
    var evObj = document.createEvent("Events");
    evObj.initEvent(etype, true, false);
    el.dispatchEvent(evObj);
  }
}

function shrink() {
  document.getElementById("playlist").style.display = "none";
  document.getElementById("expandIcon").className = "fas fa-angle-left";
  document.getElementById("expandbtn").setAttribute("onclick", "expand()");
}

function expand() {
  document.getElementById("playlist").style.display = "block";
  document.getElementById("expandIcon").className = "fas fa-angle-right";
  document.getElementById("expandbtn").setAttribute("onclick", "shrink()");
}

function changeSong(event) {
  var nodes = event.target
    .closest(".columncontainer")
    .getElementsByTagName("article");

  $("#songTitle").text(nodes[0].innerHTML);
  $("#songArtist").text(nodes[1].innerHTML);

  nodes = event.target.closest(".columncontainer").getElementsByTagName("img");
  $(".playedimagecontainer").css(
    "background-image",
    "url('" + $(nodes[0]).attr("src") + "')"
  );
  $(".playedimagecontainer").attr(
    "data-songurl",
    $(nodes[0]).attr("data-songurl")
  );

  playClip();
} // changeSong

function playClip() {
  $("#startSong").css("display", "none");
  $("#stopSong").css("display", "block");
  seek.attr("value", 0);

  if (!player.paused || player.currentTime === 0) {
    player.src = $(".playedimagecontainer").attr("data-songurl");
    seek.attr("max", player.duration);
  }

  player.play();
} // playClip

function pauseClip(event) {
  player.pause();
  $("#startSong").css("display", "block");
  $("#stopSong").css("display", "none");
} // pauseClip

function formatTime(dateObject) {
  var timeString = dateObject.getMinutes() + ":";
  timeString =
    timeString +
    (dateObject.getSeconds() < 10 ? "0" : "") +
    dateObject.getSeconds();
  return timeString;
} // formatTime

function updateTimers() {
  if (!isNaN(player.duration)) {
    seek.attr("max", player.duration);
    seek.attr("value", player.currentTime);
    $("#songDuration").text(formatTime(new Date(player.duration * 1000)));
    $("#currentTime").text(formatTime(new Date(player.currentTime * 1000)));
  } // if !isNan...
} // updateTimers

// Called when the user slides the bar to change song position
function seekbarSlide() {
  player.currentTime = $(this).val();
  seek.attr("max", player.duration);
  $("#currentTime").text(formatTime(new Date($(this).val() * 1000)));
}

// Gets called when the song has ended
function songEnd() {
  // Is there another song to play?
  // If so, increase the current song counter and fire a click-event on that playlist item
  if (currentSong < playListLength) {
    eventFire($(".playlistItem")[currentSong++], "click");
  } // if currentSong...
  else {
    // Nope, there was no more songs in the list, reset things
    player.currentTime = 0;
    seek.attr("value", 0);
    $("#stopSong").css("display", "none");
    $("#startSong").css("display", "block");
  }
}

function init() {
  $(player).on("ended", songEnd);
  $(player).on("timeupdate", updateTimers);

  $("#stopSong").on("click", pauseClip);
  $("#startSong").on("click", playClip);
  $(".playlistItem").on("click", changeSong);

  $(seek).on("input", seekbarSlide);
} // init

// Set up global variables
let seek = $("#seek");
let player = new Audio();
let playListLength = $(".playlistItem").length;
let currentSong = 1;

$(init());
