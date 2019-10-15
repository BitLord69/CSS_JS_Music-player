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

  if (!player.paused || player.currentTime === 0) {
    player.src = $(".playedimagecontainer").attr("data-songurl");
    $("#seek").attr("value", 0);
    $("#seek").attr("max", player.duration);
  }

  player.play();
} // playClip

function stopClip() {
  player.pause();
  $("#startSong").css("display", "block");
  $("#stopSong").css("display", "none");
} // stopClip

function formatTime(dateObject) {
  var timeString = "";
  timeString = dateObject.getMinutes();
  timeString =
    timeString +
    ":" +
    (dateObject.getSeconds() < 10 ? "0" : "") +
    dateObject.getSeconds();
  return timeString;
} // formatTime

function updateTimers() {
  if (!isNaN(player.duration)) {
    $("#seek").attr("max", player.duration);
    $("#seek").attr("value", parseInt(player.currentTime, 10));
    $("#songDuration").text(formatTime(new Date(player.duration * 1000)));
    $("#currentTime").text(formatTime(new Date(player.currentTime * 1000)));

    console.log("updateTimers: " + $("#seek").attr("value"));
  }
} // updateTimers

function seekbarSlide() {
  console.log("#seek:input");
  $("#currentTime").text(formatTime(new Date($(this).val() * 1000)));
}

function seekbarChange() {
  console.log("#seek:change");
  player.currentTime = $(this).val();
}

function init() {
  $("#stopSong").on("click", stopClip);
  $("#startSong").on("click", playClip);
  $(".changeSongContainer").on("click", changeSong);
  $(".playlistpart > .fa-play-circle").on("click", playClip);

  // player.addEventListener("timeupdate", updateTimers);
  $(player).on("timeupdate", updateTimers);
  $("#seek").on("input", seekbarSlide);
  $("#seek").bind("change", seekbarChange);
} // init

let player = new Audio();
$(init());
