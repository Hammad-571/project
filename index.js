const mongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const auth = require('./auth').auth
const crypto = require('crypto')
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-output.json'); // Path to the generated Swagger file
var cors = require('cors')
const express = require('express')
const path = require('path');
const uri = "mongodb+srv://hammadahmad571:1h13a4571@pwm.jnfuzra.mongodb.net/?retryWrites=true&w=majority";
const app = express()

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(cors())
// app.use(auth) Per avere apikey su tutti gli endpoint
app.use(express.json())

//convert the text into the hash MD5
function hash(input) {
    return crypto.createHash('md5')
        .update(input)
        .digest('hex')
}

//get a user by ID
app.get('/users/:id', auth, async function (req, res) {
    // Ricerca nel database
    var id = req.params.id
    var pwmClient = await new mongoClient(uri).connect()
    var user = await pwmClient.db("pwm")
        .collection('users')
        .find({ "_id": new ObjectId(id) })
        .project({ "password": 0 })
        .toArray();
    res.json(user)
})
//funtion that add user
async function addUser(res, user) {
    if (user.name == undefined) {
        res.status(400).send("Missing Name")
        return
    }

    if (user.email == undefined) {
        res.status(400).send("Missing Email")
        return
    }

    if (user.password == undefined || user.password.length < 3) {
        res.status(400).send("Password is missing or too short")
        return
    }

    user.password = hash(user.password)                                 //change the text into hash 
    var pwmClient = await new mongoClient(uri).connect()                //connect to mongoDB
    try {
        // Check if a user with the same email exists 
        var existingUser = await pwmClient.db("pwm").collection('users').findOne({ email: user.email });

        if (existingUser) {
            res.status(400).send("User with this email already exists");
            return;
        }

        // If no existing user found, proceed to insert the new user
        var items = await pwmClient.db("pwm").collection('users').insertOne(user);
        res.json(items);
    }
    catch (e) {
        if (e.code == 11000) {
            res.status(400).send("User with this email already exists");
            return;
        }
        res.status(500).send(`Generic Error: ${e}`);
    }
}
//delete a user
async function deleteUser(res, userId) {
    if (userId == undefined) {
        res.status(400).send("Missing user id")
        return
    }

    try {
        var pwmClient = await new mongoClient(uri).connect()
        const objectId = new ObjectId(userId);                              //create a new ObjectId to search for user 

        var result = await pwmClient.db('pwm').collection('users').deleteOne({ _id: objectId });        //delete user
        //check if the user has been deleted or not 
        result.deletedCount === 1
            ? res.json({ success: true, message: 'User deleted successfully.' })
            : res.status(404).send('User not found');
    } catch (error) {
        console.error('Error in deleteUser:', error);
        res.status(500).send(`Internal Server Error: ${error.message}`);
    }
}
//delete a playlist by a specific creator
async function deletePlaylistsByCreator(userId) {
    if (userId == undefined) {
        res.status(400).send("Missing creator id")
        return
    }
    try {
        const pwmClient = await new mongoClient(uri).connect();
        const result = await pwmClient.db('pwm').collection('playlist').deleteMany({ creator: userId });

        // Check if playlists were deleted
        result.deletedCount > 0 ? console.log("All the playlists have been deleted") : console.log("No playlists found for the given creator");
    } catch (error) {
        console.error('Error in deletePlaylistsByCreator:', error);
    }
}

//update a user
async function updateUser(res, id, updatedUser) {
    //check user's name , email, password
    if (updatedUser.name == undefined) {
        res.status(400).send("Missing Name")
        return
    }

    if (updatedUser.email == undefined) {
        res.status(400).send("Missing Email")
        return
    }
    if (updatedUser.password == undefined) {
        res.status(400).send("Missing Password")
        return
    }

    updatedUser.password = hash(updatedUser.password)                   //hash the new password

    try {
        var pwmClient = await new mongoClient(uri).connect()
        var filter = { "_id": new ObjectId(id) }
        //set the new user
        var updatedUserToInsert = { $set: updatedUser }
        //search the old user and update it
        var item = await pwmClient.db("pwm")
            .collection('users')
            .updateOne(filter, updatedUserToInsert)

        res.send(item)
    } catch (e) {
        console.log('catch in test');
        if (e.code == 11000) {
            res.status(400).send("Utente già presente")
            return
        }
        res.status(500).send(`Generic error: ${e}`)
    };
}

//get all the users
app.get('/users', auth, async function (req, res) {
    var pwmClient = await new mongoClient(uri).connect()
    var users = await pwmClient.db("pwm").collection('users').find().project({ "password": 0 }).toArray();
    res.json(users)
})

//add the user by using post
app.post("/users", auth, function (req, res) {
    addUser(res, req.body)
})

//login using post
app.post("/login", async (req, res) => {
    loginUser(res, req.body)
})

//update user using put
app.put("/users/:id", auth, function (req, res) {
    updateUser(res, req.params.id, req.body)
})

//delete user and all his playlist even public
app.delete("/users/:id", auth, function (req, res) {
    deleteUser(res, req.params.id)
    deletePlaylistsByCreator(req.params.id)
})

//get the index file
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});

//add a playlist using post
app.post('/playlist', auth, function (req, res) {
    addPlaylist(res, req.body)
})

//add a playlist
async function addPlaylist(res, playlist) {
    //check the title,description and tag
    if (playlist.title == undefined || playlist.title == "") {
        res.status(400).send("Enter a title")
        return
    }
    if (playlist.description == undefined || playlist.description == "") {
        res.status(400).send("Enter a  description")
        return
    }

    if (playlist.tag.length === 0) {
        res.status(400).send("Enter a valid")
        return
    }

    var pwmClient = await new mongoClient(uri).connect()
    try {
        var items = await pwmClient.db("pwm").collection('playlist').insertOne(playlist)            //add one playlist
        res.json(items)

    }
    catch (e) {
        res.status(500).send(`Generic error: ${e}`)
    };
}
//get the infomation of a playlist
app.get('/playlist/:id/info', auth, async (req, res) => {

    var id = req.params.id
    var pwmClient = await new mongoClient(uri).connect()
    //id è una stringa, va trasmormato in oggetto quindi si usa ObjectId()
    var playlist = await pwmClient.db("pwm").collection('playlist')
        .find({ "_id": new ObjectId(id) })
        .project({ "title": 1, "description": 1, "tag": 1, "pubblica": 1 })
        .toArray();
    res.json(playlist)
})

//add a song to the playlist
app.put('/playlist/:id/song', auth, function (req, res) {
    addSong(res, req.params.id, req.body)
})

//remove a song from the playlist
app.delete('/playlist/:id/:song', auth, function (req, res) {
    removeSong(res, req.params.song, req.params.id)
})

//update a playlist
app.put('/playlist/:id', auth, function (req, res) {
    updatePlaylist(res, req.params.id, req.body)
})

//delete a  playlist
app.delete('/playlist/:id', auth, function (req, res) {
    deletePlaylist(res, req.params.id)
})

//get all the public playlist
app.get('/playlist', auth, async (req, res) => {
    var pwmClient = await new mongoClient(uri).connect()
    var info = await pwmClient.db("pwm")
        .collection('playlist')
        .find({ "pubblica": true }).toArray();                  //show all the public playlist

    res.json(info)
})

//get all the playlist of a user
app.get('/playlist/:id', auth, async (req, res) => {

    var id = req.params.id
    var pwmClient = await new mongoClient(uri).connect()

    var users = await pwmClient.db("pwm").collection('playlist')
        .find({ "creator": id })
        .toArray();
    res.json(users)
})
//add a song inside a playlist
async function addSong(res, id, song) {
    if (id == undefined || id == "") {
        res.status(400).send("The id is not present")
        return
    }
    if (song.song == undefined || song.song === "") {
        res.status(400).send("The song to add is missing");
        return;
    }

    try {
        var pwmClient = await new mongoClient(uri).connect();
        var filter = { "_id": new ObjectId(id) };

        var play = { $addToSet: song };                       //add song to the array
        //update the playlist 
        var result = await pwmClient.db("pwm")
            .collection('playlist')
            .updateOne(filter, play);

        if (result.modifiedCount === 0) {
            res.status(400).send("song already present in the playlist");
            return
        } else {
            res.status(200).send("song added to playlist");
            return
        }
    } catch (e) {
        console.log('Errore:', e);
        if (e.code == 11000) {
            res.status(400).send("song already present in the playlist");
        } else {
            res.status(500).send(`Generic error: ${e}`);
        }
    };
}
//remove the song
async function removeSong(res, song, playlist) {
    if (!song || song === "") {
        res.status(400).send("The song to be removed is missing");
        return;
    }
    var pwmClient = await new mongoClient(uri).connect();
    try {
        var filter = { "_id": new ObjectId(playlist) };
        var update = { $pull: { "song": song } };                             //remove a song from an array

        var result = await pwmClient.db("pwm").collection('playlist').updateOne(filter, update);            //update the playlist
        if (result.matchedCount === 1 && result.modifiedCount === 1) {
            res.json({ success: true, message: "Song removed successfully." });
        } else {
            res.status(404).send("Song not found in the playlist.");
        }
    } catch (e) {
        console.log('Error in removeSong:', e);
        res.status(500).send(`Generic error: ${e}`);
    }
}

//update the playlist
async function updatePlaylist(res, id, playlist) {
    //check the title , description and tag of playlist 
    if (playlist.title == undefined || playlist.title == "") {
        res.status(400).send("Enter a title")
        return
    }
    if (playlist.description == undefined || playlist.description == "") {
        res.status(400).send("Enter a description")
        return
    }
    if (playlist.tag.length === 0) {
        res.status(400).send("Enter aleart a valid tag")
        return
    }
    try {
        var pwmClient = await new mongoClient(uri).connect()
        var filter = { "_id": new ObjectId(id) }
        var playlistToIn = { $set: playlist }                        //update the playlist
        var item = await pwmClient.db("pwm").collection('playlist').updateOne(filter, playlistToIn)         //find the playlist and update it 
        res.send(item)
    } catch (e) {
        res.status(500).send(`Generic error: ${e}`)
    };
}
//delete a playlist
async function deletePlaylist(res, playlist) {
    if (playlist == undefined || playlist == "") {
        res.status(400).send("Playlist is not found")
        return
    }
    var pwmClient = await new mongoClient(uri).connect()
    try {
        var filter = await pwmClient.db("pwm").collection('playlist').deleteOne({ _id: new ObjectId(playlist) })        //delete the playlist
        res.json(filter)
    }
    catch (e) {
        res.status(500).send(`Generic error: ${e}`)
    };
}

//login user
async function loginUser(res, login) {
    //check the password and email
    if (login.email == undefined) {
        res.status(400).send("Missing Email")
        return
    }
    if (login.password == undefined) {
        res.status(400).send("Missing Password")
        return
    }
    //hash the password
    login.password = hash(login.password)

    var pwmClient = await new mongoClient(uri).connect()
    //check if the password and email is the smae or not 
    var filter = {
        $and: [
            { "email": login.email },
            { "password": login.password }
        ]
    }
    //check if the user is present or not
    var loggedUser = await pwmClient.db("pwm")
        .collection('users')
        .findOne(filter);

    if (loggedUser == null) {
        res.status(401).send("Unauthorized");
    } else {
        // Move project outside of findOne
        delete loggedUser.password; // Remove password from the result
        res.json(loggedUser);
    }
}

//update the genre that user like  
app.put('/users/:id/genere', auth, function (req, res) {

    var genresArray = req.body.generi;

    //for each genre selected by the user add call function addGenere
    genresArray.forEach(function (genre) {
        var gen = {
            generi: genre
        }
        addGenere(res, req.params.id, gen);
    });
})

//remove un genre from user
app.delete('/users/:id/genere', auth, function (req, res) {
    removeGenere(res, req.params.id, req.body)
})

//add an artist to the user
app.put('/users/:id/artist', auth, function (req, res) {
    addArtist(res, req.params.id, req.body)
})

//remove the artist from user
app.delete('/users/:id/artist', auth, function (req, res) {
    removeArtist(res, req.params.id, req.body)
})

//add the genre to the user
async function addGenere(res, id, genereParam) {
    //check the genre
    if (genereParam.generi === '') {
        res.status(400).send('Manca il genere da aggiungere')
        return
    }

    try {
        var pwmClient = await new mongoClient(uri).connect()
        var filter = { "_id": new ObjectId(id) }
        var Gen = { $addToSet: genereParam }                                //add the genre to the array
        //update the user by adding the genre
        var result = await pwmClient.db("pwm")
            .collection('users')
            .updateOne(filter, Gen)
        if (result.modifiedCount === 0) {
            res.status(400).send("Genre already present ");
            return
        } else {
            res.status(200).send("Gender added");
            return
        }

    } catch (e) {
        if (e.code == 11000) {
            res.status(400).send("Genre already present")
            return
        }
        res.status(500).send(`Generic error: ${e}`)
    };
}

//remove the genre
async function removeGenere(res, id, genereParam) {
    //check the genre
    if (genereParam.generi == undefined || genereParam.generi === "") {
        res.status(400).send("Manca il genere da rimuovere")
        return
    }

    try {
        var pwmClient = await new mongoClient(uri).connect()
        var filter = { "_id": new ObjectId(id) }
        var Gen = { $pull: genereParam }                            //remove the genre from array
        //update the user by removing the genre
        var item = await pwmClient.db("pwm")
            .collection('users')
            .updateOne(filter, Gen)

        res.send(item)
    } catch (e) {
        res.status(500).send(`Generic error: ${e}`)
    };
}

//addd artist
async function addArtist(res, id, artistaParam) {
    //check the artist
    if (artistaParam.artist == undefined || artistaParam.artist === '') {
        res.status(400).send("The artist to add is missing")
        return
    }

    try {
        var filter = { "_id": new ObjectId(id) }
        var pwmClient = await new mongoClient(uri).connect()
        var Art = { $addToSet: artistaParam }                                   //add artist to the array
        //update the user by adding artist
        var result = await pwmClient.db("pwm")
            .collection('users')
            .updateOne(filter, Art)

        if (result.modifiedCount === 0) {
            res.status(400).send("Artist already present");
            return
        } else {
            res.status(200).send("Artist added");
            return
        }
    } catch (e) {
        if (e.code == 11000) {
            res.status(400).send("Artist already present")
            return
        }
        res.status(500).send(`Generic error: ${e}`)
    };
}

//remove artist
async function removeArtist(res, id, artistaParam) {
    //check the artist
    if (artistaParam.artist == undefined || artistaParam.artist == "") {
        res.status(400).send("The artist to remove is missing")
        return
    }

    try {
        var pwmClient = await new mongoClient(uri).connect()
        var filter = { "_id": new ObjectId(id) }
        var artista = { $pull: artistaParam }                                           //remove the artist from the array
        //update the user by removing the artist
        var item = await pwmClient.db("pwm")
            .collection('users')
            .updateOne(filter, artista)

        res.send(item)

    } catch (e) {
        if (e.code == 11000) {
            res.status(400).send("Artist already present")
            return
        }
        res.status(500).send(`Generic error: ${e}`)
    };
}

// add like to a playlist by putting the user id inside the array like
app.put('/like/:playlistId', auth, function (req, res) {
    addLike(res, req.params.playlistId, req.body);
});

// Update the playlist adding the user id inside the like 
async function addLike(res, playlistId, userId) {
    //check if the user id is present 
    if (userId.like == undefined) {
        res.status(400).send('Manca il genere da aggiungere')
        return
    }

    try {
        var pwmClient = await new mongoClient(uri).connect()
        var filter = { "_id": new ObjectId(playlistId) }
        var like = { $addToSet: userId }                                    //add the user id inside the like array
        //update playlist by adding the user id to the like array
        var result = await pwmClient.db("pwm")
            .collection('playlist')
            .updateOne(filter, like)
        //if i haven't modified that means i have already liked the playlist so remove it 
        if (result.modifiedCount === 0) {
            //remove the like
            await removeLike(res, playlistId, userId);
            return;
        } else {
            res.status(200).send("Like added");
            return
        }
    } catch (e) {
        res.status(500).send(`Generic error: ${e}`)
    };
}
//remove the userID from like array inside the playlist
async function removeLike(res, playlistId, userId) {
    //check userID and playlist
    if (userId.like == undefined) {
        res.status(400).send('UserID is not present')
        return
    }
    if (playlistId == undefined) {
        res.status(400).send('Playlist id is not present')
        return
    }
    try {
        var pwmClient = await new mongoClient(uri).connect()
        var filter = { "_id": new ObjectId(playlistId) }
        var unlike = { $pull: userId }                                                      //remove the userID from like array inside the playlist
        //update the playlist by removing the userID from like array
        var result = await pwmClient.db("pwm")
            .collection('playlist')
            .updateOne(filter, unlike)

        if (result.modifiedCount === 0) {
            res.status(400).send("User not present in the like list");
            return
        } else {
            res.status(200).send("User removed from like list");
            return
        }

    } catch (e) {
        res.status(500).send(`Generic error: ${e}`)
    };
}

//listen on the port 3100 and accept the request from every IP
app.listen(3100, () => {
    console.log("Server partito porta 3100")
})