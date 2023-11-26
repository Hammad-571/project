const BASE = "https://api.spotify.com/v1/";
const client_id = '13dba2d798ed4c35a07254e94aacf2bd';
const client_secret = '228fdf9d83bd47ecadea512beb2af31d';
var url = "https://accounts.spotify.com/api/token";
//var logIn;
var data;
var playlistPub;
var isInfoVisible = false; // Track the state of the element
var pause = false

function removeLoader()
{
    document.getElementById("loader").classList.add("d-none")
    document.getElementById("every").classList.remove("d-none")
}
function addLoader()
{
    document.getElementById("loader").classList.remove("d-none")
    document.getElementById("every").classList.add("d-none")
}
function isUserLoggedIn() {
    // Check if the "user" key exists in localStorage
    var userData = localStorage.getItem("user");
    // If userData is not null or undefined, consider the user as logged in
    if (userData === null || userData === undefined) {
        window.location.href = "login.html";
    } else {
        playlistPubblicheHome()
    }
}

function getUser() {
    // Parse the JSON string back into an object
    const userJSON = localStorage.getItem("user");
    const userObj = JSON.parse(userJSON);
    // Access and print individual properties
    document.getElementById("username").textContent = "Hello, " + userObj.name;
    document.getElementById("email").textContent = "Your email is " + userObj.email;

}

function Profile() {
    window.location.href = "profile.html";
}
function login() {
    var email = document.getElementById('email').value
    var password = document.getElementById('password').value

    user = {
        email: email,
        password: password
    }

    fetch("http://127.0.0.1:3100/login", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    })
        .then(response => response.json())
        .then(logged_user => {
            localStorage.setItem("user", JSON.stringify(logged_user))
            window.location.href = "index.html"
        }

        )
}

function registrati() {
    var email = document.getElementById('email')
    var password1 = document.getElementById('password1')
    var password2 = document.getElementById('password2')
    var nome = document.getElementById('name')

    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var isEmailValid = emailPattern.test(email.value);

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
    if (password1.value != password2.value || password1.value.length < 7) {
        password1.classList.add('border')
        password1.classList.add('border-danger')
        password2.classList.add('border')
        password2.classList.add('border-danger')
    } else {
        password1.classList.remove('border')
        password1.classList.remove('border-danger')
        password2.classList.remove('border')
        password2.classList.remove('border-danger')


        var data = {
            name: nome.value,
            email: email.value,
            password: password1.value,

        }
        console.log(data)
        fetch("http://127.0.0.1:3100/users?apikey=123456", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }).then(/*async*/ response => {
            if (response.ok) {
                window.location.href = "login.html?msg=Registrato"
            } else {
                response.text().then(text =>
                    alert(text)
                )
                // var messaggio = await response.text()
                // alert(messaggio)

            }

        })
    }
}
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
    localStorage.setItem("access", token);
    console.log(token);
    return;
}
/*
function getAlbums() 
{
  const limit = 100
  fetch(`${BASE}albums/382ObEPsp2rxGrnsizN5TX`, {
headers: {
  "Authorization": "Bearer " + token,
},
})
.then((response) => response.json())
.then((playlist) => {
  console.log(playlist);
  // Handle the playlist data
})
.catch((error) => {
  if (error.status === 401) {
      // Handle the invalid token error
      getToken()
  } else {
      // Handle other errors
      console.log('An error occurred:', error.message);
  }
});

}

function getPlaylistByGenre(page) 
{
  const limit = 12
  fetch(`${BASE}browse/categories/${data.categories.items[page].id}/playlists?limit=${limit}`, {
      headers: {
          "Authorization": "Bearer " + localStorage.getItem("access"),
        },
})
.then(response => {
  if (!response.ok) {
      getToken()
      getPlaylistByGenre()
  }
  
  response.json().then((playlist) => { //console.log(playlist); 
      document.getElementById("genere").innerHTML = data.categories.items[page].name
      mostraPlaylist(playlist); })
});

}
*/
function mostraPlaylist(playlist) {
    console.log(playlist);
    //console.log(playlist.playlists);
    var card = document.getElementById("card-film")
    var container = document.getElementById("container-film")
    container.innerHTML = ""
    container.append(card)

    for (var i = playlist.playlists.items.length - 1; i >= 0; i--) {
        var clone = card.cloneNode(true)

        clone.id = 'card-film-' + i
        clone.getElementsByClassName('card-title')[0].innerHTML = playlist.playlists.items[i].name
        clone.getElementsByClassName('card-text')[0].innerHTML = playlist.playlists.items[i].description
        clone.getElementsByClassName('card-img-top')[0].src = playlist.playlists.items[i].images[0].url
        clone.getElementsByClassName('btn')[0].href = "scheda-playlist.html?id_playlist=" + playlist.playlists.items[i].id

        clone.classList.remove('d-none')
        card.after(clone)
    }
    removeLoader()
}

function getGenres() {
    //const limit = 100
    fetch(`${BASE}recommendations/available-genre-seeds`, {
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("access"),
        },
    })
        .then(async response => {
            if (!response.ok) {
                getToken()
                getGenres()
            }
            data = await response.json()
            //console.log(data.genres)
            addCheckboxesFromArray(data.genres);
            //getPlaylistByGenre(0)
        });
}

function getSearch() {
    const track = document.getElementById("search_bar").value;
    const artist = document.getElementById("Artist_bar").value;
    const genre = document.getElementById("Genre_bar").value;

    let searchQuery = ''
    if (track) {
        searchQuery += `track:${track} `;
    }
    if (artist) {
        searchQuery += `artist:${artist} `;
    }
    if (genre) {
        searchQuery += `genre:${genre}`;
    }
    console.log(searchQuery)
    fetch(`${BASE}search?q=${encodeURIComponent(searchQuery)}&type=track`, {
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("access"),
        },
    })
        .then(async response => {
            if (!response.ok) {
                getToken()
            }
            else {
                data = await response.json()
                //console.log(data)
                searchTrack(data);
            }
        });
}
/*
    function getPlaylist(query) 
    {
        //const limit = 100
        console.log(query);
        //var inputValue = document.getElementById("search_bar").value;
        //console.log(inputValue);
        fetch(`${BASE}playlists/${query}`, {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("access"),
              },
    })
    .then(async response => {
        if (!response.ok) 
        {
            getToken()
            getSearch()
        }
        
        data = await response.json()
        console.log(data)
        //getPlaylistByGenre(0)
    });

    }
  */
function searchTrack(tracks) {
    console.log(tracks);
    //console.log(playlist.playlists);


    var card = document.getElementById("card-songs")
    var container = document.getElementById("container-songs")
    container.innerHTML = ""
    container.append(card)
    //Object.keys(myObject).length;

    for (var i = 0; i <= tracks.tracks.items.length - 1; i++) {
        var clone = card.cloneNode(true)

        clone.id = 'card-tracks-' + i
        clone.getElementsByClassName('card-title')[0].innerHTML = tracks.tracks.items[i].name
        //clone.getElementsByClassName('card-text')[0].innerHTML = tracks.tracks.items[i].artists[0]
        var cardTextElement = clone.getElementsByClassName('card-text')[0];
        var artists = tracks.tracks.items[i].artists;

        var artistsHTML = "";
        for (var j = 0; j < artists.length; j++) {
            artistsHTML += artists[j].name + ", ";
        }

        // Remove the trailing comma and space
        artistsHTML = artistsHTML.slice(0, -2);

        cardTextElement.innerHTML = artistsHTML;

        clone.getElementsByClassName('card-img-top')[0].src = tracks.tracks.items[i].album.images[0].url
        //clone.getElementsByClassName('btn')[0].href = "scheda-playlist.html?id_playlist=" + playlist.playlists.items[i].id
        //console.log(clone.id.split("-")[2]);
        //clone.onclick = sidebar(data.tracks.items[clone.id.split("-")[2]])
        clone.addEventListener('click', function (event) {
            var clickedCard = event.currentTarget;
            var cardId = clickedCard.id;

            // Extract the index from the card ID
            var index = cardId.split("-")[2];
            sidebar(data.tracks.items[index])
            getPlaylistUser()

        });


        clone.classList.remove('d-none')

        card.after(clone)

    }
    //playTrack()
}

function delayedSearch() {
    //clearTimeout(searchTimer); // Clear any existing timer
    searchTimer = setTimeout(() => {
        // Call the search function
        getSearch();
    }, 50); // Set a 500ms delay
}

function sidebar(track) {
    console.log(track)
    document.getElementById("side_bar").classList.remove("d-none");
    document.getElementById("side_bar").classList.add("d-flex");
    document.getElementById("id").innerHTML = track.id
    document.getElementById("image").src = track.album.images[0].url
    document.getElementById("name").innerHTML = track.name
    var artists = track.artists;

    var artistsHTML = "";
    for (var j = 0; j < artists.length; j++) {
        artistsHTML += artists[j].name + ", ";
    }

    // Remove the trailing comma and space
    artistsHTML = artistsHTML.slice(0, -2);
    document.getElementById("artist").innerHTML = artistsHTML
    const previewUrl = track.preview_url; // Get the track's preview URL

    if (previewUrl !== null) {
        document.getElementById("audio").src = track.preview_url
        document.getElementById("preview").src = "img/play.png"
        document.getElementById("preview").onclick = "playAudio()";
    }
    var song = document.getElementById("songs");

    song.classList.add("d-none");
    song.classList.add("d-sm-block");

}

function playAudio() {
    const audio = document.getElementById("audio")

    if (!isInfoVisible) {
        // Show the element
        audio.play()
        document.getElementById("preview").src = "img/pause.png"
    } else {
        audio.pause()
        document.getElementById("preview").src = "img/play.png"
    }

    // Toggle the state
    isInfoVisible = !isInfoVisible;
}

function cross() {
    var song = document.getElementById("songs");
    var track = document.getElementById("side_bar");
    song.classList.remove("d-none");
    song.classList.remove("d-sm-block");
    track.classList.add("d-none")
}
/*function playTrack()
{
    // Your Spotify Web Playback SDK script loaded from step 2.
// Make sure this line is placed before your custom JavaScript code.
// <script src="https://sdk.scdn.co/spotify-player.js"></script>

// Your Spotify Developer Client ID
//var clientId = 'YOUR_CLIENT_ID';

// Create a new instance of the Spotify Player
var player;
var token = localStorage.getItem("access")
// Called when the Spotify Web Playback SDK is ready
window.onSpotifyWebPlaybackSDKReady = () => {
const token = '[My Spotify Web API access token]';
const player = new Spotify.Player({
  name: 'Web Playback SDK Quick Start Player',
  getOAuthToken: localStorage.getItem("access")
});
}
 

// Connect to the Spotify Player
player.connect().then(success => {
    if (success) {
        console.log('Connected to Spotify Player');
    }
}).catch(error => {
    console.error('Failed to connect to Spotify Player', error);
});

// Play a track
var trackUri = 'spotify:track:4jYwFHigUt3c21ATMklTku';
player.addListener('ready', ({ device_id }) => {
    console.log('Player is ready');
    player.play({
        uris: [trackUri],
        device_id: device_id
    }).then(() => {
        console.log('Playing track');
    }).catch(error => {
        console.error('Error playing track', error);
    });
});
};

}
/*
function searchArtist(artist) {
    console.log(artist);
    //console.log(artist.artists);
    document.getElementById("artists").classList.remove("d-none")
    document.getElementById("playlist").classList.add("d-none")
    document.getElementById("songs").classList.add("d-none")
    document.getElementById("albums").classList.add("d-none")
    var card = document.getElementById("card-artists")
    var container = document.getElementById("container-artists")
    container.innerHTML = ""
    container.append(card)
    //Object.keys(myObject).length;
    
    for (var i = 0; i <= artist.artists.items.length -1; i++) {
        var clone = card.cloneNode(true)
 
        clone.id = 'card-artists-' + i
        clone.getElementsByClassName('card-title')[0].innerHTML = artist.artists.items[i].name
        clone.getElementsByClassName('card-text')[0].innerHTML = "Artist"
        clone.getElementsByClassName('card-img-top')[0].src = artist.artists.items[i].images[0].url
        
        //clone.getElementsByClassName('btn')[0].href = "scheda-artist.html?id_artist=" + artist.artists.items[i].id
        clone.onclick = function () {
            //console.log(clone.id.split("-")[2]);
            window.location.href = 'scheda-artist.html?playlist=' + artist.artists.items[clone.id.split("-")[2]].id;
        };
 
        clone.classList.remove('d-none')
 
        card.after(clone)
 
    }
}
 
 
function searchAlbums(album) {
    console.log(album);
    //console.log(album.albums);
    document.getElementById("albums").classList.remove("d-none")
    document.getElementById("artists").classList.add("d-none")
    document.getElementById("songs").classList.add("d-none")
    document.getElementById("playlist").classList.add("d-none")
    var card = document.getElementById("card-albums")
    var container = document.getElementById("container-albums")
    container.innerHTML = ""
    container.append(card)
    //Object.keys(myObject).length;
    
    for (var i = 0; i <= album.albums.items.length -1; i++) {
        var clone = card.cloneNode(true)
 
        clone.id = 'card-albums-' + i
        clone.getElementsByClassName('card-title')[0].innerHTML = album.albums.items[i].name
        clone.getElementsByClassName('card-text')[0].innerHTML = "album"
        clone.getElementsByClassName('card-img-top')[0].src = album.albums.items[i].images[0].url
        
        clone.onclick = function () {
            //console.log(clone.id.split("-")[2]);
            window.location.href = 'scheda-artist.html?playlist=' + data.playlists.items[clone.id.split("-")[2]].id;
        };
 
        clone.classList.remove('d-none')
 
        card.after(clone)
 
    }
}*/
function edit() {
    document.getElementById("edit").classList.remove("d-none");
}

async function updateUser() {

    const userJSON = localStorage.getItem("user");
    const userObj = JSON.parse(userJSON);
    // Get the values from the input fields
    var name = document.getElementById('nameIn').value;
    var email = document.getElementById('emailInput').value;
    var newPassword1 = document.getElementById('Password1');
    var newPassword2 = document.getElementById('Password2');
    //console.log(patenteType);
    //console.log(userData);
    if (!name) {
        name = userObj.name;
    }

    if (!email) {
        email = userObj.email;
    }

    if (!newPassword1.value) {
        newPassword1.classList.add('border')
        newPassword1.classList.add('border-danger')
        newPassword2.classList.add('border')
        newPassword2.classList.add('border-danger')
    }

    if (newPassword1.value === newPassword2.value) {

        var data = {
            name: name,
            email: email,
            password: newPassword1.value
        }
        console.log(data)
        console.log(userObj._id)
        fetch(`http://127.0.0.1:3100/users/${userObj._id}?apikey=123456`, {
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
    }
    else {
        newPassword1.classList.add('border')
        newPassword1.classList.add('border-danger')
        newPassword2.classList.add('border')
        newPassword2.classList.add('border-danger')
    }


}

function logout() {
    localStorage.removeItem("user");

    window.location.href = "login.html?msg=logout";
}

function creaPlaylist() {

    const userJSON = localStorage.getItem("user");
    const userObj = JSON.parse(userJSON);
    var creator = userObj._id;
    var titolo = document.getElementById('titolo')
    var descrizione = document.getElementById('des')
    var tag = document.getElementById("tag").value
    var pubblica = document.getElementById("checkbox").checked

    const tagsArray = tag.split(' ');

    // Remove any empty tags (resulting from consecutive spaces)
    const filteredTagsArray = tagsArray.filter(tag => tag.trim() !== '');

    var playlist = {
        creator: creator,
        titolo: titolo.value,
        descrizione: descrizione.value,
        tag: filteredTagsArray,
        pubblica: pubblica
    }

    fetch("http://127.0.0.1:3100/playlist/?apikey=123456", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(playlist)
    })
        .then(response => {
            if (response.status == 401) {
                window.location.href = 'login.html'
                throw new Error('Token scaduto, rieffettuare il login');
            }
            if (response.status == 400) {
                return response.text()
            }
            else {
                return response.json()
            }

        })
        .then(async response => {

            if (response) {
                window.location.href = "playlist.html"
            }
        })
        .catch(error => alert(error))
}

function playlistPubblicheHome() {
    const userJSON = localStorage.getItem("user");
    const userObj = JSON.parse(userJSON);
    // console.log(userObj);
    fetch(`http://127.0.0.1:3100/playlist/?apikey=123456`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then(response => {
            if (response.status == 401) {
                window.location.href = 'login.html'
                throw new Error('Token scaduto, rieffettuare il login')
            } else {
                return response.json()
            }
        })
        .then(async playlist => {
            console.log(playlist);

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

function getUserInfoForPlay(user_id, playlistItem) {
    console.log(user_id)
    return fetch(`http://127.0.0.1:3100/users/${user_id}?apikey=123456`, {
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
            console.log(user);
            // Assuming the email is in user.email, replace it with the actual property if different
            playlistItem.creator = user[0].name;
        })
        .catch(error => {
            alert(error);
        });
}
function mostraPlaylistPubliche(films) {
    playlistPub = films;
    console.log(films);
    const userJSON = localStorage.getItem("user");
    const userObj = JSON.parse(userJSON);

    var card = document.getElementById("card-film");
    var container = document.getElementById("container-film");
    container.innerHTML = "";
    container.append(card)

    for (var i = films.length - 1; i >= 0; i--) {
        var clone = card.cloneNode(true);
        //console.log()
        clone.id = "card-film-" + i;
        clone.onclick = function (i) {
            return function () {
                showSongs(films[i])
            };
        }(i);
        clone.getElementsByClassName('card-title')[0].innerHTML = films[i].titolo;
        clone.getElementsByClassName('card-text')[0].innerHTML = films[i].descrizione;
        clone.getElementsByClassName('card-tag')[0].innerHTML = "#" + films[i].tag.join(', #');
        if (films[i].song) {
            songs = films[i].song.length
        }
        else {
            songs = 0
        }
        clone.getElementsByClassName('card-songs')[0].innerHTML = "Number of songs: " + songs;
        clone.getElementsByClassName('card-owner')[0].innerHTML = films[i].creator;
        clone.getElementsByClassName('playlistid')[0].innerHTML = films[i]._id
        var likeElement = clone.getElementsByClassName('like')[0];
        console.log(userObj._id);
        if (films[i].like && Array.isArray(films[i].like) && films[i].like.includes(userObj._id)) {
            likeElement.src = "img/heart_fill.png";
        }
        else {
            likeElement.src = "img/heart.png";
        }
        likeElement.onclick = function (i) {
            return function () {
                var card = document.getElementById("card-film-" + i)
                var id = card.getElementsByClassName('playlistid')[0].innerHTML
                likePlaylist(id)
            };
        }(i);
        //clone.querySelector('.btn').href = "scheda-film.html?id_film=" + films[i].id;
        clone.classList.remove('d-none');
        card.after(clone);
    }
    removeLoader()
}

function getPlaylistUser() {
    const userJSON = localStorage.getItem("user");
    const userObj = JSON.parse(userJSON);
    //console.log(userObj);
    fetch(`http://127.0.0.1:3100/playlist/${userObj._id}?apikey=123456`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then(response => {
            if (response.status == 401) {
                window.location.href = 'login.html'
                throw new Error('Token scaduto, rieffettuare il login')
            }
            else {
                return response.json()
            }
        })
        .then(playlist => {
            console.log(playlist);
            addItemsToDropdown(playlist);
            //mostraMyPlaylist(playlist)        
        })
        .catch(error => alert(error))
}
function getUserPlaylist() {
    addLoader()
    const userJSON = localStorage.getItem("user");
    const userObj = JSON.parse(userJSON);
    //console.log(userObj);
    fetch(`http://127.0.0.1:3100/playlist/${userObj._id}?apikey=123456`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then(response => {
            if (response.status == 401) {
                window.location.href = 'login.html'
                throw new Error('Token scaduto, rieffettuare il login')
            }
            else {
                return response.json()
            }
        })
        .then(playlist => {
            console.log(playlist);
            mostraMyPlaylist(playlist)
        })
        .catch(error => alert(error))
}

function mostraMyPlaylist(films) {
    const userJSON = localStorage.getItem("user");
    const userObj = JSON.parse(userJSON);
    console.log(films);
    var card = document.getElementById("card-film");
    var container = document.getElementById("container-film");
    container.innerHTML = "";
    container.append(card)

    for (var i = films.length - 1; i >= 0; i--) {
        var clone = card.cloneNode(true);

        clone.id = 'card-film-' + i;
        clone.onclick = function (i) {
            return function () {
                showSongs(films[i])
            };
        }(i);
        clone.getElementsByClassName('card-title')[0].innerHTML = films[i].titolo;
        clone.getElementsByClassName('card-text')[0].innerHTML = films[i].descrizione;
        clone.getElementsByClassName('card-tag')[0].innerHTML = "#" + films[i].tag.join(' #');
        //console.log(films[i].song)
        if ('song' in films[i]) {
            songs = films[i].song.length
        }
        else {
            songs = 0
        }
        clone.getElementsByClassName('card-songs')[0].innerHTML = "Number of songs: " + songs;

        //clone.querySelector('.btn').href = "scheda-film.html?id_film=" + films[i].id;

        clone.classList.remove('d-none');
        card.after(clone);
    }
    removeLoader()
}

function getPlaylist(id) {

    //console.log(userObj);
    fetch(`http://127.0.0.1:3100/playlist/${id}/info?apikey=123456`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    })
        .then(response => {
            if (response.status == 401) {
                window.location.href = 'login.html'
                throw new Error('Token scaduto, rieffettuare il login')
            }
            else {
                return response.json()
            }
        })
        .then(playlist => {
            console.log(playlist);
            mostraMyPlaylist(playlist)
        })
        .catch(error => alert(error))
}

function addItemsToDropdown(items) {
    console.log("Hi")
    // Get the ul element by its ID
    var dropdownList = document.getElementById('dropdownList');

    // Clear existing list items
    dropdownList.innerHTML = '';

    // Loop through the items array and add li elements
    items.forEach(function (item) {
        var li = document.createElement('li');


        // Set the class and href attributes
        li.className = 'dropdown-item';
        li.innerHTML = item.titolo;
        li.id = item._id;
        li.onclick = function () {
            document.getElementById("dropdownMenuButton1").textContent = item.titolo;
            document.getElementById("sub1").onclick = addSong(item._id);
        };

        // Append the 'a' element to the 'li' element
        //li.appendChild(a);

        // Append the 'li' element to the dropdown list
        dropdownList.appendChild(li);
    });
}

function addSong(playlist) {
    console.log(playlist)
    var id = document.getElementById("id").innerHTML
    console.log(id);
    var data = {
        song: id
    }
    fetch(`http://127.0.0.1:3100/playlist/${playlist}/song?apikey=123456`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (response.status == 401) {
                window.location.href = 'login.html'
                throw new Error('Token scaduto, rieffettuare il login');
            }
            return response.text()
        })
        .then(response => {
            if (typeof response === 'string') {
                window.location.reload()
            }
        })
        .catch(error => alert(error))
}

function showSongs(play) {
    addLoader()
    document.getElementById("showplaylist").classList.remove("d-none")
    document.getElementById("consegna").classList.add("d-none")
    document.getElementById("container-film").classList.add("d-none")
    document.getElementById("card-titolo").innerHTML = "Title : " + play.titolo;
    document.getElementById("id").innerHTML = play._id;
    document.getElementById("card-des").innerHTML = "Descrption : " + play.descrizione;
    document.getElementById("card-tag").innerHTML = "#" + play.tag.join(' #');
    document.getElementById("card-public").innerHTML = play.pubblica ? "Public" : "Private";

    if (play.song) {
        for (var i = 0; i < play.song.length; i++) {
            searchTrackById(play.song[i])
        }
    }

}

function searchTrackById(trackId) {
    fetch(`${BASE}tracks/${trackId}`, {
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("access"),
        },
    })
        .then(async response => {
            if (!response.ok) {
                getToken();
            } else {
                const data = await response.json();
                // Handle the data for the specific track by ID
                console.log(data);
                addTableRows(data)
            }
        });
}

function addTableRows(dataArray) {
    const table = document.getElementById('songs');
    console.log(dataArray);
    console.log(dataArray.preview_url);
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
    }
    else
    {
        const playCell = newRow.insertCell(5);
        playCell.innerHTML = `<img src="img/no-music.png" id="img-${dataArray.id}"  height="40px" alt="">`;
        const removeCell = newRow.insertCell(6);
        removeCell.innerHTML = `<img src="img/remove.png" alt="" height="50px" onclick="removeSong('${dataArray.id}')">`;
    }
    removeLoader()
}

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


function removeSong(songId) {
    var id = document.getElementById("id").innerHTML;
    console.log(id);
    console.log(songId)

    fetch(`http://127.0.0.1:3100/playlist/${id}/${songId}?apikey=123456`, {
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
                window.location.reload()
            }
        })
        .catch((error) => alert(error));
}

function deleteUser() {
    const userJSON = localStorage.getItem("user");
    const userObj = JSON.parse(userJSON);

    fetch(`http://127.0.0.1:3100/users/${userObj._id}?apikey=123456`, {
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
                logout()
            }
            
        })
        .catch((error) => alert(error));
}

function deletePlaylist() {
    var id = document.getElementById("id").innerHTML;

    fetch(`http://127.0.0.1:3100/playlist/${id}?apikey=123456`, {
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
                window.location.href = "playlist.html"
            }
            //logout()
        })
        .catch((error) => alert(error));
}

function updatePlaylist() {
    document.getElementById("edit").classList.add("d-none")
    var id = document.getElementById("id").innerHTML
    var titolo = document.getElementById('titolo')
    var descrizione = document.getElementById('des')
    var tag = document.getElementById("tag").value
    var pubblica = document.getElementById("checkbox").checked

    const tagsArray = tag.split(' ');

    // Remove any empty tags (resulting from consecutive spaces)
    var filteredTagsArray = tagsArray.filter(tag => tag.trim() !== '');
    if (titolo.value === "") {
        var cardTitoloContent = document.getElementById("card-titolo").innerHTML;

        // Split the content of card-titolo by space
        var splitArray = cardTitoloContent.split(" ");

        // Get the second element after the split (index 1)
        var secondPart = splitArray[1];

        // Set the value of the input element
        titolo.value = secondPart;
    }

    if (descrizione.value === "") {
        var cardTitoloContent = document.getElementById("card-des").innerHTML;

        // Split the content of card-titolo by space
        var splitArray = cardTitoloContent.split(" ");

        // Get the second element after the split (index 1)
        var secondPart = splitArray[2];

        // Set the value of the input element
        descrizione.value = secondPart;
    }

    if (filteredTagsArray.length === 0) {
        var array = document.getElementById("card-tag").innerHTML;
        array = array.split(' ');
        array = array.filter(tag => tag.trim() !== '')
        const newArray = array.map(item => item.replace("#", ""));
        filteredTagsArray = newArray
    }

    var playlist = {
        titolo: titolo.value,
        descrizione: descrizione.value,
        tag: filteredTagsArray,
        pubblica: pubblica
    }

    console.log(playlist)

    fetch(`http://127.0.0.1:3100/playlist/${id}?apikey=123456`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(playlist)
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
                //alert(response)
                window.location.href = "playlist.html"
            }
            //logout()
        })
        .catch((error) => alert(error));
}
function editPlaylist() {
    document.getElementById("edit").classList.remove("d-none")
}

function addCheckboxesFromArray(array) {
    var dropdownMenu = document.querySelector('.genere');

    array.forEach(function (item, index) {
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

function checkAllCheckboxes() {
    n = 126;
    var array = [];
    for (var i = 1; i <= n; i++) {
        var checkboxId = 'checkbox' + i;
        var checkbox = document.getElementById(checkboxId);

        if (checkbox && checkbox.type === 'checkbox') {
            if (checkbox.checked) {
                // If checkbox is checked, save the value to the array
                array.push(checkbox.value);
            }
            // If you want to include unchecked checkboxes in the array, remove the 'if (checkbox.checked)' condition
        } else {
            console.error('Checkbox not found or invalid ID: ' + checkboxId);
        }
    }

    // You can log or use the array as needed
    return array;
}

function getArtists() {
    //const limit = 100
    fetch(`${BASE}artists`, {
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("access"),
        },
    })
        .then(async response => {
            if (!response.ok) {
                getToken()
                getArtists()
            }
            data = await response.json()
            console.log(data)
            //addCheckboxesFromArray(data.genres);
            //getPlaylistByGenre(0)
        });
}

function searchArtist() {

    let searchQuery = document.getElementById("artist").value

    console.log(searchQuery)
    fetch(`${BASE}search?q=${encodeURIComponent(searchQuery)}&type=artist`, {
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("access"),
        },
    })
        .then(async response => {
            if (!response.ok) {
                getToken()
            }
            else {
                const data = await response.json()
                console.log(data.artists.items)
                //searchTrack(data);
                showArtist(data.artists.items)
            }
        });
}

function showArtist(artist) {

    document.getElementById("showArtist").classList.remove("d-none")
    console.log(artist)
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
                // You can do something when the option is clicked
                document.getElementById("showArtist").classList.add("d-none")
                document.getElementById("artist").value = item.name
                document.getElementById("artist").text = item.name
            };
            selectElement.appendChild(option);
        });
    } else {
        console.error('Select element not found.');
    }

}

function addArtist() {
    const userJSON = localStorage.getItem("user");
    const userObj = JSON.parse(userJSON);

    var artist = {
        artist: document.getElementById("artist").value
    }
    fetch(`http://127.0.0.1:3100/users/${userObj._id}/artist?apikey=123456`, {
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
            window.location.reload()
        })
        .catch((error) => alert(error));
}

function addGenere() {
    const userJSON = localStorage.getItem("user");
    const userObj = JSON.parse(userJSON);
    console.log(checkAllCheckboxes())
    var artist = {
        generi: checkAllCheckboxes()
    }
    fetch(`http://127.0.0.1:3100/users/${userObj._id}/genere?apikey=123456`, {
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

function addBadgesToContainer(array, id) {
    const container = document.getElementById(id);

    array.forEach(item => {
        const span = document.createElement('span');
        span.className = 'badge rounded-pill bg-dark fs-4';
        span.textContent = `${item} \u2717`; // \u2717 is the Unicode character for a heavy multiplication x
        span.onclick = function () {

            // Call another function when the span is clicked
            if (id === "genereContainer") { removeGenere(item); }
            else { removeArtist(item); }
        };
        container.appendChild(span);
    });
}

async function getUserInfo() {
    const userJSON = localStorage.getItem("user");
    const userObj = JSON.parse(userJSON);

    try {
        const response = await fetch(`http://127.0.0.1:3100/users/${userObj._id}?apikey=123456`, {
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
        throw error; // Rethrow the error to propagate it
    }
}

async function getUserGenere() {
    try {
        var user = await getUserInfo();
        console.log(user[0].generi);
        addBadgesToContainer(user[0].generi, "genereContainer")
        getUserArtist(user)
        // Do something with user data
    } catch (error) {
        console.error(error);
        // Handle error, maybe redirect to login or show an error message
    }
}

async function removeGenere(genere) {
    const userJSON = localStorage.getItem("user");
    const userObj = JSON.parse(userJSON);
    var body = { generi: genere }
    fetch(`http://127.0.0.1:3100/users/${userObj._id}/genere?apikey=123456`, {
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
            //logout()
        })
        .catch((error) => alert(error));
}

async function getUserArtist(user) {

    addBadgesToContainer(user[0].artist, "artistContainer")
    // Do something with user data
}

async function removeArtist(artist) {
    const userJSON = localStorage.getItem("user");
    const userObj = JSON.parse(userJSON);
    var body = { artist: artist }
    fetch(`http://127.0.0.1:3100/users/${userObj._id}/artist?apikey=123456`, {
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
            window.location.reload()
            //logout()
        })
        .catch((error) => alert(error));
}

function likePlaylist(playlistID) {
    const userJSON = localStorage.getItem("user");
    const userObj = JSON.parse(userJSON);
    console.log(playlistID)
    var body = { like: userObj._id }
    fetch(`http://127.0.0.1:3100/like/${playlistID}?apikey=123456`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body)
    })
        .then(response => {
            if (response.status == 401) {
                window.location.href = 'login.html'
                throw new Error('Token scaduto, rieffettuare il login')
            }
            else if (response.status == 200) {
                window.location.reload()
            }

        })

        .catch(error => alert(error))
}
async function searchInPlaylist() {
    var searchString = document.getElementById("search_bar").value
    console.log(playlistPub)
    for (var i = 0; i < playlistPub.length; i++) {
        // Search in tags
        var playlist = playlistPub[i]
        document.getElementById("card-film-" + i).classList.add("d-none")

        if (playlist.tag && playlist.tag.some(tag => tag.toLowerCase().startsWith(searchString.toLowerCase()))) {
            console.log(`Found in playlist "${playlist.titolo}": Tag - ${searchString}`);
            document.getElementById("card-film-" + i).classList.remove("d-none")
        } else if (playlist.titolo.toLowerCase().startsWith(searchString.toLowerCase())) {
            console.log(`Found in playlist "${playlist.titolo}": Title - ${searchString}`);
            document.getElementById("card-film-" + i).classList.remove("d-none")
        } else {
            if (playlist.song) {
                // Use a closure to capture the current value of i
                for (const songId of playlist.song) {
                    await (function (index) {
                        // Call searchSong for each song ID
                        return searchSong(songId)
                            .then(data => {
                                // Handle the fetched data here
                                if (data.name.toLowerCase().startsWith(searchString.toLowerCase())) {
                                    console.log(data.name + " is " + searchString)
                                    document.getElementById("card-film-" + index).classList.remove("d-none")
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

function searchSong(trackId) {
    return new Promise((resolve, reject) => {
        fetch(`${BASE}tracks/${trackId}`, {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("access"),
            },
        })
            .then(async response => {
                if (!response.ok) {
                    // If the response is not okay, reject the promise
                    getToken();
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