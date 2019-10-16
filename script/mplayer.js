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

  // Create a new custom event that tells playSong that a new song shoudl be loaded
  e = new CustomEvent("MyEvent", {
    detail: { newSong: true },
    bubbles: false,
    cancelable: true
  });
  playSong(e);
} // changeSong

function playSong(event) {
  $("#startSong").css("display", "none");
  $("#stopSong").css("display", "block");
  seek.attr("value", 0);

  // Check the extra event data, ie if it's a new song or not
  // Since a custom event's data field is named differently than a built in's, check this
  if (
    (event.type === "MyEvent" && event.detail.newSong) ||
    (event.type != "MyEvent" && event.data.newSong)
  ) {
    player.src = $(".playedimagecontainer").attr("data-songurl");
    seek.attr("max", player.duration);
  } // if event.type...

  // Not a new song, start the playing counter anew
  if (
    (event.type === "MyEvent" && !event.detail.newSong) ||
    (event.type != "MyEvent" && !event.data.newSong)
  ) {
    startPlaybackTime = Date.now();
  }

  player.play();
} // playSong

function pauseSong(event) {
  player.pause();
  $("#startSong").css("display", "block");
  $("#stopSong").css("display", "none");

  startPlaybackTime = Date.now();
} // pauseSong

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

    if (Date.now() - startPlaybackTime > playLimitInMillis) {
      pauseSong();
      if (
        confirm("You have been playing for a long while now - still alive?")
      ) {
        e = new CustomEvent("MyEvent", {
          detail: { newSong: false },
          bubbles: false,
          cancelable: true
        });
        playSong(e);
      } // else, yes, the user wants to play on
    } // if Date.now...
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
  } // if currentSong...
} // nextSong

function loopSong() {
  if (player.loop) {
    player.loop = false;
    $("#loopSong").css("color", loopColor);
  } else {
    player.loop = true;
    $("#loopSong").css("color", loopColorHighlit);
  } // else
} // loopSong

function init() {
  $(player).on("ended", songEnd);
  $(player).on("timeupdate", updateTimers);

  $("#loopSong").click(loopSong);
  $("#prevSong").click(prevSong);
  $("#nextSong").click(nextSong);
  $("#stopSong").click(pauseSong);
  $(".playlistItem").click(changeSong);
  $("#startSong").click({ newSong: false }, playSong);

  $(seek).on("input", seekbarSlide);

  // Make sure we load the right data into the 'currently played' part of the player
  eventFire($(".playlistItem")[currentSong - 1], "click");

  // Make sure the two player control buttons' visibility is properly set
  $("#startSong").css("display", "block");
  $("#stopSong").css("display", "none");
} // init

// Set up global variables
let currentSong = 1; // Yup, we shoudl start on the first song
let seek = $("#seek"); // Ease-of-acces variable for the seeker bar
let player = new Audio(); // Create the actual audio obejct
let playLimitInMillis = 10000; // How long to play before the player asks for your presence
let loopColorHighlit = "lime"; // Set the highlight color for the loop button
let startPlaybackTime = Date.now(); // Create the played time variable
let loopColor = $("#loopSong").css("color"); // Save the original color of hte loop button
let playListLength = $(".playlistItem").length; // Check how ,many songs are in the playlist

$(init());
