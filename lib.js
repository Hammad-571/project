const BASE = "https://api.spotify.com/v1/";                                     //base for spotify api
const client_id = '13dba2d798ed4c35a07254e94aacf2bd';                           //client id to generate token
const client_secret = '228fdf9d83bd47ecadea512beb2af31d';                       //client secret
var url = "https://accounts.spotify.com/api/token";                             //url to get token
var data;                                                                       // variable to store data like the genre and searched song                               
var playlistPub;                                                                //public playlist 
var isInfoVisible = false;                                                      // Track the state of the element
var playSong = false;

function removeLoader() {
    // Hide the loader element and show the content element
    document.getElementById("loader").classList.add("d-none");
    document.getElementById("every").classList.remove("d-none");
}

function addLoader() {
    // Show the loader element and hide the content element
    document.getElementById("loader").classList.remove("d-none");
    document.getElementById("every").classList.add("d-none");
}

function isUserLoggedIn() {
    // Check if the "user" key exists in sessionStorage
    var userData = sessionStorage.getItem("user");
    // If userData is not null or undefined, consider the user as logged in
    if (userData === null || userData === undefined) {
        window.location.href = "login.html";
    }
    else {
        return true;
    }

}

function getUser() {
    // Parse the JSON string back into an object
    const userJSON = sessionStorage.getItem("user");
    const userObj = JSON.parse(userJSON);
    // Access and print individual properties
    document.getElementById("username").textContent = "Hello, " + userObj.name;
    document.getElementById("email").textContent = "Your email is " + userObj.email;
}
//go profile page
function Profile() {
    window.location.href = "profile.html";
}
//login function
function login() {
    //get the value of email and password 
    var email = document.getElementById('email').value
    var password = document.getElementById('password').value
    //create an object user with email and password
    user = {
        email: email,
        password: password
    }
    //send a post request then save the user's info and go to index page
    fetch("https://tune-hub.it:443/login", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    })
        .then(response => {
            if (response.status === 401) {
                // If the response status is 401, show an alert and return
                alert('Unauthorized');
                return null;  // Return null or an appropriate value to indicate no further processing
            } else {
                // Otherwise, return the response.json() to process in the next .then block
                return response.json();
            }
        })
        .then(logged_user => {
            if (logged_user) {
                // Only proceed if logged_user is not null
                sessionStorage.setItem("user", JSON.stringify(logged_user));
                window.location.href = "index.html";
            }
        })
}

function registrati() {
    // Get input values
    var email = document.getElementById('email');
    var password1 = document.getElementById('password1');
    var password2 = document.getElementById('password2');
    var nome = document.getElementById('name');

    // Validate email format
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var isEmailValid = emailPattern.test(email.value);

    // Highlight invalid email
    if (!isEmailValid) {
        email.classList.add('border');
        email.classList.add('border-danger');
    } else {
        email.classList.remove('border');
        email.classList.remove('border-danger');
    }

    // Check if the name is not blank
    if (nome.value.trim() === '') {
        nome.classList.add('border');
        nome.classList.add('border-danger');
    } else {
        nome.classList.remove('border');
        nome.classList.remove('border-danger');
    }

    // Validate password criteria
    if (password1.value != password2.value || password1.value.length < 7) {
        password1.classList.add('border');
        password1.classList.add('border-danger');
        password2.classList.add('border');
        password2.classList.add('border-danger');
    } else {
        password1.classList.remove('border');
        password1.classList.remove('border-danger');
        password2.classList.remove('border');
        password2.classList.remove('border-danger');

    }
    if (isEmailValid && nome.value.trim() !== '' && !(password1.value != password2.value || password1.value.length < 7)) {
        // Prepare data for registration
        var data = {
            name: nome.value,
            email: email.value,
            password: password1.value,
        };

        // Send registration request to the server
        fetch("https://tune-hub.it:443/users?apikey=123456", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }).then(response => {
            // Handle response from the server
            if (response.ok) {
                window.location.href = "login.html?msg=Registrato";
            } else {
                // Display error message
                response.text().then(text => alert(text));
            }
        });
    }
}

// Toggle the visibility of an element based on its ID
function show(id) {
    var search = document.getElementById(id);

    if (!isInfoVisible) {
        // Show the element
        search.classList.remove("d-none");
        search.classList.add("d-flex");
    } else {
        // Hide the element
        search.classList.remove("d-flex");
        search.classList.add("d-none");
    }
    // Toggle the state
    isInfoVisible = !isInfoVisible;
}

// Retrieve an access token using client credentials
async function getToken() {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: "Basic " + btoa(`${client_id}:${client_secret}`),
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ grant_type: "client_credentials" }),
    });
    const tokenResponse = await response.json();
    const token = tokenResponse.access_token;
    sessionStorage.setItem("access", token);
    return;
}

// Display playlist data on the page
function mostraPlaylist(playlist) {
    // Get card and container elements
    var card = document.getElementById("card-film");
    var container = document.getElementById("container-film");

    // Clear the container and append the original card
    container.innerHTML = "";
    container.append(card);

    // Iterate through playlist items and create card clones
    for (var i = playlist.playlists.items.length - 1; i >= 0; i--) {
        var clone = card.cloneNode(true);
        // Set a unique ID for the cloned card
        clone.id = 'card-film-' + i;

        // Populate card content with playlist data
        clone.getElementsByClassName('card-title')[0].innerHTML = playlist.playlists.items[i].name;
        clone.getElementsByClassName('card-text')[0].innerHTML = playlist.playlists.items[i].description;
        clone.getElementsByClassName('card-img-top')[0].src = playlist.playlists.items[i].images[0].url;
        clone.getElementsByClassName('btn')[0].href = "scheda-playlist.html?id_playlist=" + playlist.playlists.items[i].id;

        // Show the cloned card
        clone.classList.remove('d-none');
        card.after(clone);
    }
    // Remove the loader once the playlist is displayed
    removeLoader();
}

// Retrieve available music genres
function getGenres() {
    fetch(`${BASE}recommendations/available-genre-seeds`, {
        headers: {
            "Authorization": "Bearer " + sessionStorage.getItem("access"),
        },
    })
        .then(async response => {
            if (!response.ok) {
                // Refresh access token and retry if the request fails
                getToken().then(() => {
                    getGenres();
                });
            }
            data = await response.json();
            addCheckboxesFromArray(data.genres);
        });
}

// Perform a search based on user input
function getSearch() {
    const track = document.getElementById("search_bar").value;
    const artist = document.getElementById("Artist_bar").value;
    const genre = document.getElementById("Genre_bar").value;

    let searchQuery = '';
    if (track) {
        searchQuery += `track:${track} `;
    }
    if (artist) {
        searchQuery += `artist:${artist} `;
    }
    if (genre) {
        searchQuery += `genre:${genre}`;
    }

    fetch(`${BASE}search?q=${encodeURIComponent(searchQuery)}&type=track`, {
        headers: {
            "Authorization": "Bearer " + sessionStorage.getItem("access"),
        },
    })
        .then(async response => {
            if (!response.ok) {
                // Refresh access token and retry if the request fails
                getToken().then(() => {
                    getSearch();
                });
            } else {
                data = await response.json();
                searchTrack(data);
            }
        });
}

// Display search results on the page
function searchTrack(tracks) {
    var card = document.getElementById("card-songs");
    var container = document.getElementById("container-songs");
    container.innerHTML = "";
    container.append(card);

    for (var i = 0; i <= tracks.tracks.items.length - 1; i++) {
        var clone = card.cloneNode(true);

        // Set a unique ID for the cloned card
        clone.id = 'card-tracks-' + i;

        // Populate card content with track data
        clone.getElementsByClassName('card-title')[0].innerHTML = tracks.tracks.items[i].name;

        var cardTextElement = clone.getElementsByClassName('card-text')[0];
        var artists = tracks.tracks.items[i].artists;

        var artistsHTML = "";
        for (var j = 0; j < artists.length; j++) {
            artistsHTML += artists[j].name + ", ";
        }
        // Remove the trailing comma and space
        artistsHTML = artistsHTML.slice(0, -2);

        cardTextElement.innerHTML = artistsHTML;

        clone.getElementsByClassName('card-img-top')[0].src = tracks.tracks.items[i].album.images[0].url;

        // Add click event listener to each card
        clone.addEventListener('click', function (event) {
            var clickedCard = event.currentTarget;
            var cardId = clickedCard.id;

            // Extract the index from the card ID
            var index = cardId.split("-")[2];
            sidebar(data.tracks.items[index]);
            getPlaylistUser();
        });

        clone.classList.remove('d-none');
        card.after(clone);
    }
}

// Delayed search of 50 ms 
function delayedSearch() {
    searchTimer = setTimeout(() => {
        // Call the search function
        getSearch();
    }, 50);
}

// Show the sidebar with track details
function sidebar(track) {
    document.getElementById("side_bar").classList.remove("d-none");
    document.getElementById("side_bar").classList.add("d-flex");
    document.getElementById("id").innerHTML = track.id;
    document.getElementById("image").src = track.album.images[0].url;
    document.getElementById("name").innerHTML = track.name;

    // Format and display artist names
    var artists = track.artists;
    var artistsHTML = "";
    for (var j = 0; j < artists.length; j++) {
        artistsHTML += artists[j].name + ", ";
    }
    artistsHTML = artistsHTML.slice(0, -2); // Remove trailing comma and space
    document.getElementById("artist").innerHTML = artistsHTML;

    const previewUrl = track.preview_url;
    // Display play/pause button based on preview availability
    if (previewUrl !== null) {
        document.getElementById("audio").src = track.preview_url;
        document.getElementById("preview").src = "img/play.png";
        document.getElementById("preview").onclick = playAudio;         //assign the function as the callback
    }
    var song = document.getElementById("songs");
    song.classList.add("d-none");
    song.classList.add("d-sm-block");
}

// Play or pause the audio track
function playAudio() {
    const audio = document.getElementById("audio");

    if (!playSong) {
        audio.play();
        document.getElementById("preview").src = "img/pause.png";
    } else {
        audio.pause();
        document.getElementById("preview").src = "img/play.png";
    }
    playSong = !playSong;
}

// Close the sidebar and show the main content
function cross() {
    var song = document.getElementById("songs");
    var track = document.getElementById("side_bar");
    song.classList.remove("d-none");
    song.classList.remove("d-sm-block");
    track.classList.add("d-none");
}

// Display the edit form for user information
function edit() {
    document.getElementById("edit").classList.remove("d-none");
}

// Update user information
async function updateUser() {
    // Retrieve user information from session storage
    const userJSON = sessionStorage.getItem("user");
    const userObj = JSON.parse(userJSON);

    var name = document.getElementById('nameIn').value;
    var email = document.getElementById('emailInput').value;
    var newPassword1 = document.getElementById('Password1');
    var newPassword2 = document.getElementById('Password2');

    // Use existing values if input is empty
    if (!name) {
        name = userObj.name;
    }

    if (!email) {
        email = userObj.email;
    }

    if (newPassword1.value === newPassword2.value) {
        // Prepare data for update
        var data = {
            name: name,
            email: email,
            password: newPassword1.value
        };

        // Send update request to the server
        fetch(`https://tune-hub.it:443/users/${userObj._id}?apikey=123456`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }).then(response => {
            if (response.ok) {
                window.location.href = "login.html?msg=Updated";
            } else {
                response.text().then(text => {
                    alert(text);
                });
            }
        });
    } else {
        newPassword1.classList.add('border');
        newPassword1.classList.add('border-danger');
        newPassword2.classList.add('border');
        newPassword2.classList.add('border-danger');
    }
}

// Log out the user
function logout() {
    sessionStorage.removeItem("user");
    window.location.href = "login.html?msg=logout";
}

// Create a new playlist
function createPlaylist() {
    const userJSON = sessionStorage.getItem("user");
    const userObj = JSON.parse(userJSON);
    var creator = userObj._id;

    // Retrieve input values
    var titolo = document.getElementById('titolo');
    var descrizione = document.getElementById('des');
    var tag = document.getElementById("tag").value;
    var pubblica = document.getElementById("checkbox").checked;

    // Split tags and filter out empty ones
    const tagsArray = tag.split(' ');
    const filteredTagsArray = tagsArray.filter(tag => tag.trim() !== '');

    // Prepare playlist data
    var playlist = {
        creator: creator,
        title: titolo.value,
        description: descrizione.value,
        tag: filteredTagsArray,
        pubblica: pubblica
    };

    // Send playlist creation request to the server
    fetch("https://tune-hub.it:443/playlist/?apikey=123456", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(playlist)
    })
        .then(response => {
            if (response.status == 401) {
                window.location.href = 'login.html';
                throw new Error('Token scaduto, rieffettuare il login');
            }
            if (response.status == 400) {
                return response.text();
            } else {
                return response.json();
            }
        })
        .then(async response => {
            if (response) {
                window.location.href = "playlist.html";
            }
        })
        .catch(error => alert(error));
}

// Retrieve and display public playlists for the home page
function playlistPubblicheHome() {
    /*const userJSON = sessionStorage.getItem("user");
    const userObj = JSON.parse(userJSON);*/

    // Fetch playlists from the server
    fetch(`https://tune-hub.it:443/playlist/?apikey=123456`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then(response => {
            if (response.status == 401) {
                window.location.href = 'login.html';
                throw new Error('Token scaduto, rieffettuare il login');
            } else {
                return response.json();
            }
        })
        .then(async playlist => {
            // Create an array to store promises
            const userInfoPromises = [];

            // Use map to create an array of promises for each getUserInfo call
            playlist.forEach(item => {
                userInfoPromises.push(getUserInfoForPlay(item.creator, item));
            });
            // Wait for all promises to resolve before continuing
            await Promise.all(userInfoPromises);
            // After all promises have resolved, call mostraPlaylistPubliche
            mostraPlaylistPubliche(playlist);
        })
        .catch(error => alert(error));
}

// Fetch user information for a playlist item
function getUserInfoForPlay(user_id, playlistItem) {
    return fetch(`https://tune-hub.it:443/users/${user_id}?apikey=123456`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then(response => {
            if (response.status == 401) {
                window.location.href = 'login.html';
                throw new Error('Token scaduto, rieffettuare il login');
            } else {
                return response.json();
            }
        })
        .then(user => {
            playlistItem.creator = user[0].name;                            // us name instead of object id 
        })
        .catch(error => {
            alert(error);
        });
}

// Display public playlists on the home page
function mostraPlaylistPubliche(films) {
    playlistPub = films;

    const userJSON = sessionStorage.getItem("user");
    const userObj = JSON.parse(userJSON);

    var card = document.getElementById("card-film");
    var container = document.getElementById("container-film");
    container.innerHTML = "";
    container.append(card);

    for (var i = films.length - 1; i >= 0; i--) {
        var clone = card.cloneNode(true);

        clone.id = "card-film-" + i;
        clone.onclick = function (i) {
            return function () {
                showSongsPub(films[i]);
            };
        }(i);

        clone.getElementsByClassName('card-title')[0].innerHTML = films[i].title;
        clone.getElementsByClassName('card-text')[0].innerHTML = films[i].description;
        clone.getElementsByClassName('card-tag')[0].innerHTML = "#" + films[i].tag.join(', #');

        if (films[i].song) {
            songs = films[i].song.length;
        } else {
            songs = 0;
        }
        clone.getElementsByClassName('card-songs')[0].innerHTML = "Number of songs: " + songs;
        clone.getElementsByClassName('card-owner')[0].innerHTML = films[i].creator;
        clone.getElementsByClassName('playlistid')[0].innerHTML = films[i]._id;

        // Set like button state based on user's liking
        var likeElement = clone.getElementsByClassName('like')[0];

        if (films[i].like && Array.isArray(films[i].like) && films[i].like.includes(userObj._id)) {
            likeElement.src = "img/heart_fill.png";
        } else {
            likeElement.src = "img/heart.png";
        }

        if (films[i].like && films[i].like.length > 0) {
            clone.getElementsByClassName('total_like')[0].innerHTML = films[i].like.length;
        } else {
            clone.getElementsByClassName('total_like')[0].innerHTML = '0';
        }

        // Attach click event for liking/unliking a playlist
        likeElement.onclick = function (i) {
            return function () {
                var card = document.getElementById("card-film-" + i);
                var id = card.getElementsByClassName('playlistid')[0].innerHTML;
                likePlaylist(id);
            };
        }(i);

        clone.classList.remove('d-none');
        card.after(clone);
    }
    removeLoader();
}

// Fetch and display playlists for the current user inside the search page so user can add 
function getPlaylistUser() {
    const userJSON = sessionStorage.getItem("user");
    const userObj = JSON.parse(userJSON);

    fetch(`https://tune-hub.it:443/playlist/${userObj._id}?apikey=123456`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then(response => {
            if (response.status == 401) {
                window.location.href = 'login.html';
                throw new Error('Token scaduto, rieffettuare il login');
            } else {
                return response.json();
            }
        })
        .then(playlist => {
            addItemsToDropdown(playlist);
        })
        .catch(error => alert(error));
}

// Fetch and display playlists for the current user 
function getUserPlaylist() {
    addLoader();
    const userJSON = sessionStorage.getItem("user");
    const userObj = JSON.parse(userJSON);

    fetch(`https://tune-hub.it:443/playlist/${userObj._id}?apikey=123456`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then(response => {
            if (response.status == 401) {
                window.location.href = 'login.html';
                throw new Error('Token scaduto, rieffettuare il login');
            } else {
                return response.json();
            }
        })
        .then(playlist => {
            mostraMyPlaylist(playlist);
        })
        .catch(error => alert(error));
}

// Display playlists for the current user
function mostraMyPlaylist(films) {
    const userJSON = sessionStorage.getItem("user");
    var card = document.getElementById("card-film");
    var container = document.getElementById("container-film");
    container.innerHTML = "";
    container.append(card);

    for (var i = films.length - 1; i >= 0; i--) {
        var clone = card.cloneNode(true);

        clone.id = 'card-film-' + i;
        clone.onclick = function (i) {
            return function () {

                showSongs(films[i]);
            };
        }(i);

        clone.getElementsByClassName('card-title')[0].innerHTML = films[i].title;
        clone.getElementsByClassName('card-text')[0].innerHTML = films[i].description;
        clone.getElementsByClassName('card-tag')[0].innerHTML = "#" + films[i].tag.join(' #');

        if ('song' in films[i]) {
            songs = films[i].song.length;
        } else {
            songs = 0;
        }
        clone.getElementsByClassName('card-songs')[0].innerHTML = "Number of songs: " + songs;

        clone.classList.remove('d-none');
        card.after(clone);
    }
    removeLoader();
}

// Fetch playlist details by ID
function getPlaylist(id) {
    fetch(`https://tune-hub.it:443/playlist/${id}/info?apikey=123456`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then(response => {
            if (response.status == 401) {
                window.location.href = 'login.html';
                throw new Error('Token scaduto, rieffettuare il login');
            } else {
                return response.json();
            }
        })
        .then(playlist => {
            mostraMyPlaylist(playlist);
        })
        .catch(error => alert(error));
}

// Add items to a dropdown list
function addItemsToDropdown(items) {
    // Get the ul element by its ID
    var dropdownList = document.getElementById('dropdownList');

    // Clear existing list items
    dropdownList.innerHTML = '';

    // Loop through the items array and add li elements
    items.forEach(function (item) {
        var li = document.createElement('li');

        // Set the class and href attributes
        li.className = 'dropdown-item';
        li.innerHTML = item.title;
        li.id = item._id;
        li.onclick = function () {
            document.getElementById("dropdownMenuButton1").textContent = item.title;
            document.getElementById("sub1").onclick = addSong(item._id);
        };
        // Append the 'li' element to the dropdown list
        dropdownList.appendChild(li);
    });
}

// Add a song to a playlist
function addSong(playlist) {
    var id = document.getElementById("id").innerHTML;                               //song id
    var data = { song: id };
    fetch(`https://tune-hub.it:443/playlist/${playlist}/song?apikey=123456`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (response.status == 401) {
                window.location.href = 'login.html';
                throw new Error('Token scaduto, rieffettuare il login');
            }
            return response.text();
        })
        .then(response => {
            if (typeof response === 'string') {
                window.location.reload();
            }
        })
        .catch(error => alert(error));
}

// Show playlist details and associated songs
function showSongs(play) {
    addLoader();
    document.getElementById("showplaylist").classList.remove("d-none");
    document.getElementById("consegna").classList.add("d-none");
    document.getElementById("container-film").classList.add("d-none");
    document.getElementById("card-titolo").innerHTML = "Title : " + play.title;
    document.getElementById("id").innerHTML = play._id;
    document.getElementById("card-des").innerHTML = "Descrption : " + play.description;
    document.getElementById("card-tag").innerHTML = "#" + play.tag.join(' #');
    document.getElementById("card-public").innerHTML = play.pubblica ? "Public" : "Private";

    if (play.song && play.song.length > 0) {
        for (var i = 0; i < play.song.length; i++) {
            searchTrackById(play.song[i]);
        }
    } else {
        removeLoader();
    }

}

// Fetch track details by ID
function searchTrackById(trackId) {
    fetch(`${BASE}tracks/${trackId}`, {
        headers: {
            "Authorization": "Bearer " + sessionStorage.getItem("access"),
        },
    })
        .then(async response => {
            if (!response.ok) {
                // If not OK, refresh the token and reload the page
                getToken().then(() => {
                    window.location.reload();
                });
            } else {
                const data = await response.json();
                console.log(data)
                // add the data to the table row
                addTableRows(data);
            }
        });
}

// Add table rows for a track to the songs table
function addTableRows(dataArray) {
    const table = document.getElementById('songs');
    let seconds = Math.floor(dataArray.duration_ms / 1000);

    // Calculate minutes and remaining seconds
    let minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;

    // Format the result
    let formattedDuration = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    const newRow = table.insertRow();

    // Create cells and set class names
    const imgCell = newRow.insertCell(0);
    imgCell.innerHTML = `<img src="${dataArray.album.images[0].url}" height="50px" alt="">`;

    const nameCell = newRow.insertCell(1);
    nameCell.innerHTML = `<h7 class="my-2">${dataArray.name}</h7>`;

    const artCell = newRow.insertCell(2);
    artCell.innerHTML = `<h7 class="my-2">${dataArray.artists[0].name}</h7>`;

    const albCell = newRow.insertCell(3);
    albCell.innerHTML = `<h7 class="my-2">${dataArray.album.name}</h7>`;

    const durCell = newRow.insertCell(4);
    durCell.innerHTML = `<h7 class="my-2">${formattedDuration}</h7>`;

    if (dataArray.preview_url !== null) {
        const playCell = newRow.insertCell(5);
        playCell.innerHTML = `<img src="img/play.png" id="img-${dataArray.id}" onclick="togglePlayPause('${dataArray.id}')" height="40px" alt="">
            <audio id="${dataArray.id}" controls class="d-none" src="${dataArray.preview_url}">
            </audio>`;
        const removeCell = newRow.insertCell(6);
        removeCell.innerHTML = `<img src="img/remove.png" alt="" height="50px" onclick="removeSong('${dataArray.id}')">`;
    } else {
        const playCell = newRow.insertCell(5);
        playCell.innerHTML = `<img src="img/no-music.png" id="img-${dataArray.id}"  height="40px" alt="">`;
        const removeCell = newRow.insertCell(6);
        removeCell.innerHTML = `<img src="img/remove.png" alt="" height="50px" onclick="removeSong('${dataArray.id}')">`;
    }
    removeLoader();                                 // removes the loader element
}

// Toggle play/pause for an audio element
function togglePlayPause(id) {
    const audio = document.getElementById(id);
    const imgElement = document.getElementById(`img-${id}`);

    if (audio.paused) {
        audio.play();
        imgElement.src = "img/pause.png";
    } else {
        audio.pause();
        audio.currentTime = 0; // Reset playback to the beginning
        imgElement.src = "img/play.png";
    }
}

// Remove a song from the playlist
function removeSong(songId) {
    var id = document.getElementById("id").innerHTML;

    //send delete request to the server with id of the playlist and song id
    fetch(`https://tune-hub.it:443/playlist/${id}/${songId}?apikey=123456`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((response) => {
            if (response.status == 401) {
                window.location.href = 'login.html';
                throw new Error('Token scaduto, rieffettuare il login');
            }

            return response.text();
        })
        .then((response) => {
            if (typeof response === 'string') {
                window.location.reload();
            }
        })
        .catch((error) => alert(error));
}

// Delete the current user
function deleteUser() {
    const userJSON = sessionStorage.getItem("user");
    const userObj = JSON.parse(userJSON);

    fetch(`https://tune-hub.it:443/users/${userObj._id}?apikey=123456`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((response) => {
            if (response.status == 401) {
                window.location.href = 'login.html';
                throw new Error('Token scaduto, rieffettuare il login');
            }

            return response.text();
        })
        .then((response) => {
            if (typeof response === 'string') {
                logout();
            }
        })
        .catch((error) => alert(error));
}

// Delete the current playlist
function deletePlaylist() {
    var id = document.getElementById("id").innerHTML;

    fetch(`https://tune-hub.it:443/playlist/${id}?apikey=123456`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then((response) => {
            if (response.status == 401) {
                window.location.href = 'login.html';
                throw new Error('Token scaduto, rieffettuare il login');
            }

            return response.text();
        })
        .then((response) => {
            if (typeof response === 'string') {
                window.location.href = "playlist.html";
            }
        })
        .catch((error) => alert(error));
}

// Function to update playlist information
function updatePlaylist() {
    // Hide the edit element
    document.getElementById("edit").classList.add("d-none");

    // Get values from HTML elements
    var id = document.getElementById("id").innerHTML;
    var titolo = document.getElementById('titolo');
    var descrizione = document.getElementById('des');
    var tag = document.getElementById("tag").value;
    var pubblica = document.getElementById("checkbox").checked;

    // Split tags and remove empty tags
    const tagsArray = tag.split(' ');
    var filteredTagsArray = tagsArray.filter(tag => tag.trim() !== '');

    // Set default values if title or description is empty
    if (titolo.value === "") {
        // Get the second part of card-titolo content and set it as the value
        var cardTitoloContent = document.getElementById("card-titolo").innerHTML;
        var splitArray = cardTitoloContent.split(":");
        var secondPart = splitArray[1];
        secondPart = secondPart.trim(); // Assign the trimmed value back to secondPart
        titolo.value = secondPart;
    }

    if (descrizione.value === "") {
        // Get the third part of card-des content and set it as the value
        var cardTitoloContent = document.getElementById("card-des").innerHTML;
        var splitArray = cardTitoloContent.split(" ");
        var secondPart = splitArray[2];
        descrizione.value = secondPart;
    }

    // If no tags are provided, use tags from card-tag
    if (filteredTagsArray.length === 0) {
        var array = document.getElementById("card-tag").innerHTML;
        array = array.split(' ');
        array = array.filter(tag => tag.trim() !== '');
        const newArray = array.map(item => item.replace("#", ""));
        filteredTagsArray = newArray;
    }

    // Create playlist object
    var playlist = {
        title: titolo.value,
        description: descrizione.value,
        tag: filteredTagsArray,
        pubblica: pubblica
    };

    // use put method to update the playlist
    fetch(`https://tune-hub.it:443/playlist/${id}?apikey=123456`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(playlist)
    })
        .then((response) => {
            // Handle authentication error
            if (response.status == 401) {
                window.location.href = 'login.html';
                throw new Error('Token scaduto, rieffettuare il login');
            }
            return response.text();
        })
        .then((response) => {
            // Redirect to playlist.html after successful update
            if (typeof response === 'string') {
                window.location.href = "playlist.html";
            }
        })
        .catch((error) => alert(error));
}

// Function to show the edit element
function editPlaylist() {
    document.getElementById("edit").classList.remove("d-none");
}

// Function to add checkboxes to the dropdown menu that shows genre
function addCheckboxesFromArray(array) {
    var dropdownMenu = document.querySelector('.genere');

    array.forEach(function (item, index) {
        // Create checkbox elements and add them to the dropdown menu
        var li = document.createElement('li');
        var div = document.createElement('div');
        div.classList.add('form-check');

        var checkboxId = 'checkbox' + (index + 1);
        var input = document.createElement('input');
        input.classList.add('form-check-input');
        input.setAttribute('type', 'checkbox');
        input.setAttribute('value', item);
        input.setAttribute('id', checkboxId);

        var label = document.createElement('label');
        label.classList.add('form-check-label');
        label.setAttribute('for', checkboxId);
        label.textContent = item;

        div.appendChild(input);
        div.appendChild(label);
        li.appendChild(div);
        dropdownMenu.appendChild(li);
    });
}

// Function to check all checkboxes and return an array of checked values
function checkAllCheckboxes() {
    n = 126;
    var array = [];
    for (var i = 1; i <= n; i++) {
        // Get checkbox by ID and add its value to the array if checked
        var checkboxId = 'checkbox' + i;
        var checkbox = document.getElementById(checkboxId);

        if (checkbox && checkbox.type === 'checkbox') {
            if (checkbox.checked) {
                array.push(checkbox.value);
            }
        } else {
            console.error('Checkbox not found or invalid ID: ' + checkboxId);
        }
    }
    return array;
}

// Function to search for artists using API
function searchArtist() {
    let searchQuery = document.getElementById("artist").value;
    fetch(`${BASE}search?q=${encodeURIComponent(searchQuery)}&type=artist`, {
        headers: {
            "Authorization": "Bearer " + sessionStorage.getItem("access"),
        },
    })
        .then(async response => {
            // Handle authentication error and retry after getting a new token
            if (!response.ok) {
                getToken().then(() => {
                    searchArtist();
                });
            } else {
                const data = await response.json();
                showArtist(data.artists.items);
            }
        });
}

// Function to display artist options in a dropdown
function showArtist(artist) {
    document.getElementById("showArtist").classList.remove("d-none");
    var selectElement = document.getElementById('artistOp');

    if (selectElement) {
        // Clear existing options
        selectElement.innerHTML = '';

        // Add options from the array
        artist.forEach(function (item) {
            var option = document.createElement('option');
            option.value = item.name;
            option.text = item.name;
            option.onclick = function () {
                // Do something when the option is clicked
                document.getElementById("showArtist").classList.add("d-none");
                document.getElementById("artist").value = item.name;
                document.getElementById("artist").text = item.name;
            };
            selectElement.appendChild(option);
        });
    } else {
        console.error('Select element not found.');
    }
}

// Function to add an artist to the user's collection
function addArtist() {
    const userJSON = sessionStorage.getItem("user");
    const userObj = JSON.parse(userJSON);

    var artist = {
        artist: document.getElementById("artist").value
    };
    fetch(`https://tune-hub.it:443/users/${userObj._id}/artist?apikey=123456`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(artist)
    })
        .then((response) => {
            if (response.status == 401) {
                window.location.href = 'login.html';
                throw new Error('Token scaduto, rieffettuare il login');
            }
            return response.text();
        })
        .then(() => {
            window.location.reload();
        })
        .catch((error) => alert(error));
}

// Function to add genres to the user's collection
function addGenere() {
    const userJSON = sessionStorage.getItem("user");
    const userObj = JSON.parse(userJSON);

    var genre = { generi: checkAllCheckboxes() };               //array of genres

    fetch(`https://tune-hub.it:443/users/${userObj._id}/genere?apikey=123456`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(genre)
    })
        .then((response) => {
            console.log(response)
            if (response.status == 401) {
                window.location.href = 'login.html';
                throw new Error('Token scaduto, rieffettuare il login');
            } else if (response.status == 200) {
                window.location.reload();
            }
            return response.text();
        })
        .catch((error) => alert(error));

}

// Function to add badges to a container based on an array
function addBadgesToContainer(array, id) {
    const container = document.getElementById(id);

    array.forEach(item => {
        const span = document.createElement('span');
        span.className = 'badge rounded-pill bg-dark fs-4';
        span.textContent = `${item} \u2717`;                    // \u2717 is the Unicode character for a heavy multiplication x
        span.onclick = function () {
            // Call another function when the span is clicked
            if (id === "genereContainer") { removeGenere(item); }
            else { removeArtist(item); }
        };
        container.appendChild(span);
    });
}

// Function to get user information asynchronously
async function getUserInfo() {
    const userJSON = sessionStorage.getItem("user");
    const userObj = JSON.parse(userJSON);

    try {
        const response = await fetch(`https://tune-hub.it:443/users/${userObj._id}?apikey=123456`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (response.status === 401) {
            window.location.href = 'login.html';
            throw new Error('Token scaduto, rieffettuare il login');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        alert(error);
    }
}

// Function to get user genres asynchronously
async function getUserGenere() {
    try {
        var user = await getUserInfo();
        addBadgesToContainer(user[0].generi, "genereContainer");
        getUserArtist(user);
        // Do something with user data
    } catch (error) {
        console.error(error);
        // Handle error, maybe redirect to login or show an error message
    }
}

// Function to remove a genre from the user's collection
async function removeGenere(genere) {
    const userJSON = sessionStorage.getItem("user");
    const userObj = JSON.parse(userJSON);
    var body = { generi: genere };
    fetch(`https://tune-hub.it:443/users/${userObj._id}/genere?apikey=123456`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body)
    })
        .then((response) => {
            if (response.status == 401) {
                window.location.href = 'login.html';
                throw new Error('Token scaduto, rieffettuare il login');
            }
            return response.text();
        })
        .then(() => {
            window.location.reload();
        })
        .catch((error) => alert(error));
}

// Function to get user artists and display them
async function getUserArtist(user) {
    addBadgesToContainer(user[0].artist, "artistContainer");
}

// Function to remove an artist from the user's collection
async function removeArtist(artist) {
    const userJSON = sessionStorage.getItem("user");
    const userObj = JSON.parse(userJSON);
    var body = { artist: artist };
    fetch(`https://tune-hub.it:443/users/${userObj._id}/artist?apikey=123456`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body)
    })
        .then((response) => {
            if (response.status == 401) {
                window.location.href = 'login.html';
                throw new Error('Token scaduto, rieffettuare il login');
            }
            return response.text();
        })
        .then(() => {
            window.location.reload();
        })
        .catch((error) => alert(error));
}

// Function to like a playlist 
function likePlaylist(playlistID) {
    const userJSON = sessionStorage.getItem("user");
    const userObj = JSON.parse(userJSON);
    var body = { like: userObj._id };
    fetch(`https://tune-hub.it:443/like/${playlistID}?apikey=123456`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body)
    })
        .then(response => {
            if (response.status == 401) {
                window.location.href = 'login.html';
                throw new Error('Token scaduto, rieffettuare il login');
            }
            else if (response.status == 200) {
                window.location.reload();
            }
        })
        .catch(error => alert(error));
}

// Function to search within playlists based on a search string
async function searchInPlaylist() {
    var searchString = document.getElementById("search_bar").value;
    for (var i = 0; i < playlistPub.length; i++) {
        // Search in tags
        var playlist = playlistPub[i];
        document.getElementById("card-film-" + i).classList.add("d-none");

        if (playlist.tag && playlist.tag.some(tag => tag.toLowerCase().startsWith(searchString.toLowerCase()))) {
            document.getElementById("card-film-" + i).classList.remove("d-none");
        } else if (playlist.title.toLowerCase().startsWith(searchString.toLowerCase())) {
            document.getElementById("card-film-" + i).classList.remove("d-none");
        } else {
            if (playlist.song) {
                for (const songId of playlist.song) {
                    await (function (index) {
                        // Call searchSong for each song ID
                        return searchSong(songId)
                            .then(data => {
                                // Handle the fetched data here
                                if (data.name.toLowerCase().startsWith(searchString.toLowerCase())) {
                                    document.getElementById("card-film-" + index).classList.remove("d-none");
                                }
                            })
                            .catch(error => {
                                console.error("Error fetching data for songId " + songId, error);
                            });
                    })(i);
                }
            }
        }
    }
}

// Function to search for a song based on its ID
function searchSong(trackId) {
    return new Promise((resolve, reject) => {
        fetch(`${BASE}tracks/${trackId}`, {
            headers: {
                "Authorization": "Bearer " + sessionStorage.getItem("access"),
            },
        })
            .then(async response => {
                if (!response.ok) {
                    // If the response is not okay, reject the promise
                    getToken().then(() => {
                        searchInPlaylist();
                    });
                    reject(new Error("Failed to fetch song data"));
                } else {
                    const data = await response.json();
                    // Resolve the promise with the fetched data
                    resolve(data);
                }
            })
            .catch(error => {
                // Handle other errors, if any
                console.error("Error fetching song data:", error);
                reject(error);
            });
    });
}

function showSongsPub(play) {
    addLoader();
    document.getElementById("showplaylist").classList.remove("d-none");
    document.getElementById("consegna").classList.add("d-none");
    document.getElementById("container-film").classList.add("d-none");
    document.getElementById("card-titolo").innerHTML = "Title : " + play.title;
    document.getElementById("id").innerHTML = play._id;
    document.getElementById("card-des").innerHTML = "Descrption : " + play.description;
    document.getElementById("card-tag").innerHTML = "#" + play.tag.join(' #');
    document.getElementById("card-public").innerHTML = play.pubblica ? "Public" : "Private";

    if (play.song && play.song.length > 0) {
        for (var i = 0; i < play.song.length; i++) {
            searchTrackByIdPub(play.song[i]);
        }
    } else {
        removeLoader();
    }

}

// Fetch track details by ID
function searchTrackByIdPub(trackId) {
    fetch(`${BASE}tracks/${trackId}`, {
        headers: {
            "Authorization": "Bearer " + sessionStorage.getItem("access"),
        },
    })
        .then(async response => {
            if (!response.ok) {
                // If not OK, refresh the token and reload the page
                getToken().then(() => {
                    window.location.reload();
                });
            } else {
                const data = await response.json();

                // add the data to the table row
                addTableRowsPub(data);
            }
        });
}

// Add table rows for a track to the songs table
function addTableRowsPub(dataArray) {
    const table = document.getElementById('songs');
    let seconds = Math.floor(dataArray.duration_ms / 1000);

    // Calculate minutes and remaining seconds
    let minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;

    // Format the result
    let formattedDuration = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    const newRow = table.insertRow();

    // Create cells and set class names
    const imgCell = newRow.insertCell(0);
    imgCell.innerHTML = `<img src="${dataArray.album.images[0].url}" height="50px" alt="">`;

    const nameCell = newRow.insertCell(1);
    nameCell.innerHTML = `<h7 class="my-2">${dataArray.name}</h7>`;

    const artCell = newRow.insertCell(2);
    artCell.innerHTML = `<h7 class="my-2">${dataArray.artists[0].name}</h7>`;

    const albCell = newRow.insertCell(3);
    albCell.innerHTML = `<h7 class="my-2">${dataArray.album.name}</h7>`;

    const durCell = newRow.insertCell(4);
    durCell.innerHTML = `<h7 class="my-2">${formattedDuration}</h7>`;

    if (dataArray.preview_url !== null) {
        const playCell = newRow.insertCell(5);
        playCell.innerHTML = `<img src="img/play.png" id="img-${dataArray.id}" onclick="togglePlayPause('${dataArray.id}')" height="40px" alt="">
            <audio id="${dataArray.id}" controls class="d-none" src="${dataArray.preview_url}">
            </audio>`;
        const removeCell = newRow.insertCell(6);
        removeCell.innerHTML = `<img src="img/remove.png" alt="" height="50px" onclick="removeSong('${dataArray.id}')">`;
    } else {
        const playCell = newRow.insertCell(5);
        playCell.innerHTML = `<img src="img/no-music.png" id="img-${dataArray.id}"  height="40px" alt="">`;
    }
    removeLoader();                                 // removes the loader element
}