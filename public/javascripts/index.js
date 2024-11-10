// Constants and Initial Variables
const API_KEY = "b1cd873b996025c059ed17379953c1b8";
const BASE_URL = "https://api.themoviedb.org/3";
const BACKGROUND_IMAGE = "url('https://www.teahub.io/photos/full/220-2205714_get-the-latest-movies-data-src-kodi-tv.jpg')";
let counter = 0;
let movieId = 21;
let buttonCounter = 0;
let inputId = "idi";
let allMovies = [];

// Error Handling
function handleError(error) {
  console.error("Error:", error);
}

// Fetch Utility
async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return response.json();
  } catch (error) {
    handleError(error);
  }
}

// Fetch Movie Details
async function fetchMovieDetails() {
  try {
    const url = `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US`;
    const movieData = await fetchData(url);

    if (movieData) {
      counter++;
      const divId = `div${counter}`;
      buttonCounter++;
      inputId = `idi${counter}`;

      // Add movie details to the DOM
      addMovieComponent(divId, BACKGROUND_IMAGE, movieData.release_date, movieData.original_title, movieData.poster_path);

      // Prompt user for input
      getUserInput("Who has played in or directed this movie?", `${divId}_input`);
    }
  } catch (error) {
    handleError(error);
  }
}

// Create Input and Button for User Interaction
function getUserInput(question, divId) {
  const container = document.createElement("div");
  container.id = divId;
  container.style.background = "#001926";
  container.style.padding = "20px 12px";
  container.className = "container border mb-3";
  document.body.appendChild(container);

  const input = document.createElement("input");
  input.type = "text";
  input.id = inputId;
  input.placeholder = question;
  input.className = "form-control";
  input.onclick = () => {
    input.value = "";
    input.style.color = "black";
  };
  container.appendChild(input);

  const button = document.createElement("button");
  button.textContent = "Check";
  button.className = "btn btn-primary mt-2";
  button.id = `button${buttonCounter}`;
  button.onclick = () => handleUserResponse(question);
  container.appendChild(button);
}

// Handle User Response
async function handleUserResponse(question) {
  const input = document.getElementById(inputId).value;

  if (question === "Who has played in or directed this movie?") {
    await checkActorOrDirector(input);
  } else {
    await checkMovie(input);
  }
}

// Check Actor/Director Response
async function checkActorOrDirector(input) {
  try {
    const searchPersonUrl = `${BASE_URL}/search/person?api_key=${API_KEY}&query=${encodeURIComponent(input)}`;
    const personData = await fetchData(searchPersonUrl);
    console.log('personData', personData);

    if (personData && personData.results.length > 0) {
      const personId = personData.results[0].id;
      const creditsUrl = `${BASE_URL}/person/${personId}/movie_credits?api_key=${API_KEY}`;
      const creditsData = await fetchData(creditsUrl);

      if (creditsData) {
        const isInMovie = creditsData.cast.some((movie) => movie.id === movieId);

        if (isInMovie) {
          allMovies.push(input);
          displaySuccess();
          counter++;
          inputId = `idi${counter}`;
          buttonCounter++;

          addMovieComponent(`div${counter}`, BACKGROUND_IMAGE, `Department: ${personData.results[0].known_for_department}`, personData.results[0].name, personData.results[0].profile_path);

          getUserInput("Find me a movie in which this actor or director has been involved.", `div${counter}_input`);

        } else {
          displayError("Incorrect answer. Please try again!");
        }
      }
    } else {
        displayError("Incorrect answer. Please try again!");
    }
  } catch (error) {
    handleError(error);
  }
}

// Check Movie Response
async function checkMovie(input) {
  try {
    const searchMovieUrl = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(input)}`;
    const movieData = await fetchData(searchMovieUrl);

    if (movieData && movieData.results.length > 0) {
      const newMovie = movieData.results[0];

      if (allMovies.includes(newMovie.original_title)) {
        displayError("You can't choose the same movie twice!");
      } else {
        movieId = newMovie.id;
        allMovies.push(newMovie.original_title);
        await fetchMovieDetails();
        displaySuccess();
      }
    } else {
      displayError("Movie not found!");
    }
  } catch (error) {
    handleError(error);
  }
}

// Add Movie Component to DOM
function addMovieComponent(id, backgroundImage, releaseDate, title, posterPath) {
  const container = document.createElement("div");
  container.id = id;
  container.style.backgroundImage = backgroundImage;
  container.style.backgroundSize = "cover";
  container.style.color = "pink";
  container.style.padding = "10px";
  container.className = "container border col-sm";
  document.body.appendChild(container);

  const movieTitle = document.createElement("h1");
  movieTitle.textContent = title;
  container.appendChild(movieTitle);

  const releaseInfo = document.createElement("h6");
  releaseInfo.textContent = releaseDate;
  container.appendChild(releaseInfo);

  const poster = document.createElement("img");
  poster.src = `https://www.themoviedb.org/t/p/w600_and_h900_bestv2${posterPath}`;
  poster.className = "img-fluid img-thumbnail";
  poster.style.height = "250px";
  container.appendChild(poster);
}

// Display Error in Input Field
function displayError(message) {
  const inputField = document.getElementById(inputId);
  inputField.value = message;
  inputField.style.color = "red";
  inputField.style.border = "solid 1px red";
}

function displaySuccess() {
    const inputField = document.getElementById(inputId);
    inputField.style.color = "green";
    inputField.style.border = "solid 1px green";

    console.log('success');
}

// Initialize
fetchMovieDetails();
