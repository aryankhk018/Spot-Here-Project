// console.log("lets write javascript");

let currentSong = new Audio();
let songName = document.querySelector(".songInfo");
let play = document.querySelector("#play");
let songs;

let currentFolder;

let volLabel = document
  .querySelector(".songVolume")
  .getElementsByTagName("label")[0];

//Function to convert seconds into minute in the format of minute:seconds
function secondsToMinutesAndSeconds(seconds) {
  // Round the seconds to the nearest integer
  const roundedSeconds = Math.round(seconds);

  // Calculate minutes and seconds
  const minutes = Math.floor(roundedSeconds / 60);
  const remainingSeconds = roundedSeconds % 60;

  // Format minutes and seconds to have leading zeros if necessary
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  // Combine minutes and seconds with a colon
  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currentFolder = folder;
  //Fetching songs from the html page
  let a = await fetch(`http://127.0.0.1:3000/${currentFolder}/`);

  // Getting there text value or the html code through response that returns a promise
  let response = await a.text();

  // creating a div element and adding all the html of response in the div
  let div = document.createElement("div");
  div.innerHTML = response;

  //Accessing all the elements with anchor tag in the div
  let anchors = div.getElementsByTagName("a");

  songs = [];

  //reading all the anchor tags of the div
  for (anchor of anchors) {
    if (anchor.href.endsWith(".mp3")) {
      // Pushing all the anchor tags which ends with .mp3 into a empty array songs
      songs.push(anchor.href.split(`/${folder}/`)[1]);
    }
  }
  //Show all songs in the playlist
  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];

  songUL.innerHTML = "";

  for (song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      ` <li>
   <img src="music.svg" alt="Music-icon" class="invert">
   <div class="info">
       <div>  ${song.replaceAll("%20", " ")}</div>
       <div>Song Artist</div>
   </div>

   <div class="playnow">
       <span>Play Now</span>
       <img src="play.svg" alt="Play" class="invert">
   </div>
</li> `;
  }

  //Attach an event listener to each song

  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((element) => {
    element.addEventListener("click", (e) => {
      // console.log(
      //   element.querySelector(".info").firstElementChild.innerHTML.trim()
      // );

      //Calling playMusic function for the same element that we consoled
      playMusic(
        element.querySelector(".info").firstElementChild.innerHTML.trim()
      );
    });
  });
}
// Function to play the song
const playMusic = (track, pause = false) => {
  currentSong.volume = 0.5;
  currentSong.src = `/${currentFolder}/` + track;
  if (!pause) {
    currentSong.play();
  }

  play.src = "pause.svg";
  if ((pause = true)) {
    play.src = "play.svg";
  }

  songName.innerHTML = currentSong.src
    .split(`/${currentFolder}/`)[1]
    .replaceAll("%20", " ");
};

async function displayAlbum() {
  //Fetching albums from the html page
  let a = await fetch(`http://127.0.0.1:3000/songs/`);

  // Getting there text value or the html code through response that returns a promise
  let response = await a.text();
  // creating a div element and adding all the html of response in the div
  let div = document.createElement("div");
  div.innerHTML = response;

  let albumAnchors = div.getElementsByTagName("a");
  Array.from(albumAnchors).forEach(async (e) => {
    if (e.href.includes("/songs")) {
      let cardContainer = document.querySelector(".cardContainer");
      let folderName = e.href.split("/").slice("-2")[0];

      //Get meta data of the folder or the album
      let a = await fetch(
        `http://127.0.0.1:3000/songs/${folderName}/info.json`
      );
      // Getting there text value or the html code through response that returns a promise
      let response = await a.json();
      console.log(response);
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `<div class="card " data-folder="${folderName}">
   <div class="play">
       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
           <circle cx="22" cy="24" r="22" fill="#1ED760" stroke="" stroke-width="2"></circle>
           <circle cx="24" cy="24" r="20" fill="none"></circle>
           <path
               d="M17.25 12.9998V23.9998C17.25 26.1998 17.25 27.2998 17.8373 27.6932C18.4247 28.0865 19.5527 27.3941 21.4201 26.1281L26.1248 23.7975C27.6803 22.7533 28.5 22.1473 28.5 21.4998C28.5 20.8523 27.6803 20.2463 26.1248 19.2021L21.4201 16.8715C19.5527 15.6055 18.4247 14.9131 17.8373 15.3064C17.25 15.6998 17.25 16.7998 17.25 16.9998Z"
               fill="black"></path>
       </svg>
   </div>
   <img src="/songs/${folderName}/cover.jpeg" alt="">
   <h2>${response.title}</h2>
   <p>${response.description}.</p>
</div>
`;
      Array.from(document.getElementsByClassName("card")).forEach((e) => {
        // console.log(e);
        e.addEventListener("click", async (item) => {
          // console.log(item,item.currentTarget.dataset);
          await getSongs(`songs/${item.currentTarget.dataset.folder}`);
        });
      });
    }
  });
}

async function main() {
  await getSongs(`songs/English`);
  // console.log(songs);
  playMusic(songs[0], true);

  //Displaying all the albums on the page
  displayAlbum();

  //Attach an event listener to play, previous and next icons

  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "pause.svg";
    } else {
      currentSong.pause();
      play.src = "play.svg";
    }
    // play.classList.toggle("playPause");
  });

  //Listener for time update event
  currentSong.addEventListener("timeupdate", () => {
    // console.log(currentSong.currentTime);
    // console.log(currentSong.duration);

    let songTime = document.querySelector(".songDuration");
    songTime.innerHTML = `${secondsToMinutesAndSeconds(
      currentSong.currentTime
    )}/${secondsToMinutesAndSeconds(currentSong.duration)}`;

    //Manipulating circle of the seek bar

    let circle = document.querySelector(".circle");
    circle.style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  //Adding event listener to seek bar
  let seekBar = document.querySelector(".seekbar");
  seekBar.addEventListener("click", (e) => {
    console.log(e.offsetX);
    console.log(e.target.getBoundingClientRect().width);

    console.log(
      (e.offsetX / Math.round(e.target.getBoundingClientRect().width)) * 100
    );

    //Getting percentage of the seek bar clicked by the user
    let userPercent =
      (e.offsetX / Math.round(e.target.getBoundingClientRect().width)) * 100;
    document.querySelector(".circle").style.left = userPercent + "%";

    //Updating the current time of the song and it will automatically play the song on that instance of the time
    currentSong.currentTime = (currentSong.duration * userPercent) / 100;
  });

  //Adding event listener on hamburger

  let hamBurger = document.querySelector(".hamburger");

  hamBurger.addEventListener("click", () => {
    document.querySelector(".left").style.left = "0%";
  });

  document.querySelector(".hamburger2").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  //Adding event listener to previous button
  let previous = document.querySelector("#previous");
  previous.addEventListener("click", () => {
    currentSong.pause();
    console.log("previous was clicked");
    // console.log(currentSong.src);

    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  //Adding event listener to next button
  let next = document.querySelector("#next");
  next.addEventListener("click", () => {
    currentSong.pause();
    play.src = "pause.svg";
    console.log("next was clicked");
    // console.log(currentSong.src);

    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }

    console.log(songs);
    console.log(index);
  });

  //Adding an event listener to volume

  let volume = document
    .querySelector(".songVolume")
    .getElementsByTagName("input")[0];

  volume.addEventListener("change", (e) => {
    currentSong.volume = parseInt(e.target.value) / 100;

    if (currentSong.volume == 0) {
      volLabel.querySelector("img").src = "mute.svg";
      console.log(volLabel.querySelector("img").src);
    } else {
      volLabel.querySelector("img").src = "volume.svg";
    }
  });

  //Adding event listener to the play button of the card

  // let hoverPlay= document.querySelector(".play");
  // hoverPlay.addEventListener("click",()=>{
  //   console.log("button clicked")
  //   playMusic();
  //   currentSong.play();
  // })

  //Mute the volume when clicked and vice versa
  let songVolume = Array.from(
    document.querySelector(".songVolume").getElementsByTagName("img")
  );
  console.log(songVolume);
  songVolume[0].addEventListener("click", (e) => {
    console.log(e.target);
    if (e.target.src.includes("volume.svg")) {
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentSong.volume = 0;
      let volume = (document
        .querySelector(".songVolume")
        .getElementsByTagName("input")[0].value = 0);
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentSong.volume = 0.2;
      let volume = (document
        .querySelector(".songVolume")
        .getElementsByTagName("input")[0].value = 20);
    }
  });
}

main();
