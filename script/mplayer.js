// The following function is "borrowed" from Stack Overflow
function eventFire(el, callFunction) {
  if (el.fireEvent) {
    el.fireEvent("on" + callFunction);
  } else {
    var evObj = document.createEvent("Events");
    evObj.initEvent(callFunction, true, false);
    el.dispatchEvent(evObj);
  } // else
} // eventFire

function shrink() {
  document.getElementById("playlist").style.display = "none";
  document.getElementById("expandIcon").className = "fas fa-angle-left";
  document.getElementById("expandbtn").setAttribute("onclick", "expand()");
} // shrink

function expand() {
  document.getElementById("playlist").style.display = "block";
  document.getElementById("expandIcon").className = "fas fa-angle-right";
  document.getElementById("expandbtn").setAttribute("onclick", "shrink()");
} // expand

function changeSong(event) {
  var nodes = event.target
    .closest(".columncontainer")
    .getElementsByTagName("article");

  $($(".playlistItem")[currentSong - 1]).removeClass("currentlyPlaying");
  currentSong = this.id;
  $($(".playlistItem")[currentSong - 1]).addClass("currentlyPlaying");

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

  e = new CustomEvent("MyEvent", {
    detail: { newSong: true },
    bubbles: false,
    cancelable: true
  });
  playClip(e);
} // changeSong

function playClip(event) {
  $("#startSong").css("display", "none");
  $("#stopSong").css("display", "block");
  seek.attr("value", 0);

  if (event.type === "MyEvent") console.log(event.detail);
  else console.log(event.data);

  if (
    (event.type === "MyEvent" && event.detail.newSong) ||
    (event.type != "MyEvent" && event.data.newSong)
  ) {
    player.src = $(".playedimagecontainer").attr("data-songurl");
    seek.attr("max", player.duration);
  } // if event.type...

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
} // seekbarSlide

// Gets called when the song has ended
function songEnd() {
  player.currentTime = 0;
  seek.attr("value", 0);

  // Is there another song to play?
  if (currentSong < playListLength) {
    nextSong();
  } // if currentSong...
  else {
    // Nope, there was no more songs in the list, reset things
    $("#stopSong").css("display", "none");
    $("#startSong").css("display", "block");
  } // else
} // songEnd

function prevSong() {
  // Are we close to the beginning of the song, and there is a previous song?
  // If so, fire the click to play it
  if (player.currentTime < 3 && currentSong > 1) {
    $($(".playlistItem")[currentSong - 1]).removeClass("currentlyPlaying");
    eventFire($(".playlistItem")[--currentSong - 1], "click");
  } else {
    player.currentTime = 0;
    seek.attr("value", 0);
    updateTimers();
  } // else...
} // prevSong

function nextSong() {
  if (currentSong < playListLength) {
    $($(".playlistItem")[currentSong - 1]).removeClass("currentlyPlaying");
    eventFire($(".playlistItem")[currentSong++], "click");
  }
} // nextSong

function init() {
  $(player).on("ended", songEnd);
  $(player).on("timeupdate", updateTimers);

  $("#prevSong").click(prevSong);
  $("#nextSong").click(nextSong);
  $("#stopSong").click(pauseClip);
  $(".playlistItem").click(changeSong);
  $("#startSong").click({ newSong: false }, playClip);

  $(seek).on("input", seekbarSlide);

  // Make sure we load the right data into the currently played part of the player
  eventFire($(".playlistItem")[currentSong - 1], "click");

  // Make sure the two player control buttons' visibility is properly set
  $("#startSong").css("display", "block");
  $("#stopSong").css("display", "none");
} // init

// Set up global variables
let seek = $("#seek");
let player = new Audio();
let playListLength = $(".playlistItem").length;
let currentSong = 1;

$(init());
