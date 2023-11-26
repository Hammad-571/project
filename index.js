const mongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const auth = require('./auth').auth
const crypto = require('crypto')
var cors = require('cors')
const express = require('express')
const path = require('path');
const uri = "mongodb+srv://hammadahmad571:1h13a4571@pwm.jnfuzra.mongodb.net/?retryWrites=true&w=majority";

const app = express()
app.use(cors())
// app.use(auth) Per avere apikey su tutti gli endpoint
app.use(express.json())

function hash(input) {
    return crypto.createHash('md5')
        .update(input)
        .digest('hex')
}
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

    user.password = hash(user.password)

    var pwmClient = await new mongoClient(uri).connect()
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
        console.log('catch in test');
        if (e.code == 11000) {
            res.status(400).send("User with this email already exists");
            return;
        }
        res.status(500).send(`Generic Error: ${e}`);
    }


}
async function deleteUser(res, userId) {
    try {
        var pwmClient = await new mongoClient(uri).connect()
        //const usersCollection = ;
        const objectId = new ObjectId(userId);

        var result = await pwmClient.db('pwm').collection('users').deleteOne({ _id: objectId });

        result.deletedCount === 1
            ? res.json({ success: true, message: 'User deleted successfully.' })
            : res.status(404).send('User not found');

    } catch (error) {
        console.error('Error in deleteUser:', error);
        res.status(500).send(`Internal Server Error: ${error.message}`);
    } finally {
        await pwmClient.close();
    }
}

async function deletePlaylistsByCreator(userId) {
    try {
        console.log(userId);

        // Connect to MongoDB
        const pwmClient = await new mongoClient(uri).connect();

        // Convert userId to ObjectId
        //const creatorId = new ObjectId(userId);

        // Delete playlists for the specified creator
        const result = await pwmClient.db('pwm').collection('playlist').deleteMany({ creator: userId });

        // Check if playlists were deleted
        result.deletedCount > 0 ? console.log("Playlists deleted") : console.log("No playlists found for the given creator");
    } catch (error) {
        console.error('Error in deletePlaylistsByCreator:', error);
    } finally {
        // Close the MongoDB connection
        //await pwmClient.close();
    }
}



async function updateUser(res, id, updatedUser) {
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
    updatedUser.password = hash(updatedUser.password)
    try {

        var pwmClient = await new mongoClient(uri).connect()

        var filter = { "_id": new ObjectId(id) }

        var updatedUserToInsert = {
            $set: updatedUser
        }

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
        res.status(500).send(`Errore generico: ${e}`)

    };
}


async function addFavorites(res, id, movie_id) {
    try {
        var pwmClient = await new mongoClient(uri).connect()
        var filter = { "user_id": new ObjectId(id) }
        var favorite = {
            $push: { movie_ids: movie_id }
        }
        console.log(filter)
        console.log(favorite)
        var item = await pwmClient.db("pwm").collection('preferiti').updateOne(filter, favorite)
        res.send(item)
    } catch (e) {
        res.status(500).send(`Errore generico: ${e}`)
    };
}
async function removeFavorites(res, id, movie_id) {
    try {
        var pwmClient = await new mongoClient(uri).connect()
        var filter = { "user_id": new ObjectId(id) }
        var favorite = {
            $pull: { movie_ids: movie_id }
        }
        console.log(filter)
        console.log(favorite)
        var item = await pwmClient.db("pwm")
            .collection('preferiti')
            .updateOne(filter, favorite)
        res.send(item)
    } catch (e) {
        res.status(500).send(`Errore generico: ${e}`)
    };
}

app.get('/users', auth, async function (req, res) {
    var pwmClient = await new mongoClient(uri).connect()
    var users = await pwmClient.db("pwm").collection('users').find().project({ "password": 0 }).toArray();
    res.json(users)

})

app.post("/users", auth, function (req, res) {
    addUser(res, req.body)

})


app.post("/login", async (req, res) => {
    loginUser(res, req.body)

}
)

app.put("/users/:id", auth, function (req, res) {
    updateUser(res, req.params.id, req.body)
})

app.delete("/users/:id", auth, function (req, res) {
    deleteUser(res, req.params.id)
    deletePlaylistsByCreator(req.params.id)
})

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});


app.get('/favorites/:id', async (req, res) => {
    // Ricerca nel database
    var id = req.params.id
    var pwmClient = await new mongoClient(uri).connect()
    var favorites = await pwmClient.db("pwm")
        .collection('preferiti')
        .findOne({ "user_id": new ObjectId(id) })
    res.json(favorites)
})

app.post('/favorites/:id', async (req, res) => {
    // Ricerca nel database
    var id = req.params.id
    movie_id = req.body.movie_id
    console.log(movie_id)
    console.log(id)
    addFavorites(res, id, movie_id)
})
app.delete('/favorites/:id', async (req, res) => {
    // Ricerca nel database
    var id = req.params.id
    movie_id = req.body.movie_id
    console.log(movie_id)
    console.log(id)
    removeFavorites(res, id, movie_id)
})


app.listen(3100, "0.0.0.0", () => {
    console.log("Server partito porta 3100")
})

app.post('/playlist', auth, function (req, res) {
    addPlaylist(res, req.body)
})

async function addPlaylist(res, playlist) {

    if (playlist.titolo == undefined || playlist.titolo == "") {
        res.status(400).send("Inserire un titolo")
        return
    }
    if (playlist.descrizione == undefined || playlist.descrizione == "") {
        res.status(400).send("Inserire una descrizione")
        return
    }

    if (playlist.tag.length === 0) {
        res.status(400).send("Inserire almeno un tag valido")
        return
    }

    var pwmClient = await new mongoClient(uri).connect()
    try {
        var items = await pwmClient.db("pwm").collection('playlist').insertOne(playlist)
        //var items = await pwmClient.db("pwm").collection('users').insertOne(user);
        res.json(items)
    }
    catch (e) {
        console.log('catch in test');
        res.status(500).send(`Errore generico: ${e}`)
    };
}

app.get('/playlist/:id/info', auth, async (req, res) => {

    var id = req.params.id
    var pwmClient = await new mongoClient(uri).connect()
    //id è una stringa, va trasmormato in oggetto quindi si usa ObjectId()
    var playlist = await pwmClient.db("pwm").collection('playlist')
        .find({ "_id": new ObjectId(id) })
        .project({ "titolo": 1, "descrizione": 1, "tag": 1, "pubblica": 1 })
        .toArray();
    res.json(playlist)
})

//aggiunge una song della playlist
app.put('/playlist/:id/song', auth, function (req, res) {

    addSong(res, req.params.id, req.body)

})

//rimuove una song della playlist
app.delete('/playlist/:id/:song', auth, function (req, res) {
    removeSong(res, req.params.song, req.params.id)
})

//modifica titolo, descrizione, tag e pubblico della playlist
app.put('/playlist/:id', auth, function (req, res) {

    updatePlaylist(res, req.params.id, req.body)

})

//cancella playlist
app.delete('/playlist/:id', auth, function (req, res) {

    deletePlaylist(res, req.params.id)

})

//ritorna tutte le playlist pubbliche
app.get('/playlist', auth, async (req, res) => {

    var pwmClient = await new mongoClient(uri).connect()
    var info = await pwmClient.db("pwm")
        .collection('playlist')
        .find({ "pubblica": true }).toArray();

    res.json(info)
})

//ritorna tutte le playlist di un utente
app.get('/playlist/:id', auth, async (req, res) => {

    var id = req.params.id
    var pwmClient = await new mongoClient(uri).connect()
    //id è una stringa, va trasmormato in oggetto quindi si usa ObjectId()
    var users = await pwmClient.db("pwm").collection('playlist')
        .find({ "creator": id })
        .toArray();
    res.json(users)
})

//ritorna la playlist di un utente
app.get('/playlist/utente/:id', auth, async (req, res) => {

    var id = req.params.id
    var pwmClient = await new mongoClient(uri).connect()
    //id è una stringa, va trasmormato in oggetto quindi si usa ObjectId()
    var playlist = await pwmClient.db("pwm").collection('playlist')
        .find({ "_id": new ObjectId(id) })
        .toArray();
    res.json(playlist)
})

async function addSong(res, id, song) {

    try {
        var pwmClient = await new mongoClient(uri).connect();
        var filter = { "_id": new ObjectId(id) };

        if (song.song == undefined || song.song === "") {
            res.status(400).send("Manca la song da aggiungere");
            return;
        }

        var play = {
            $addToSet: song
        };

        var result = await pwmClient.db("pwm")
            .collection('playlist')
            .updateOne(filter, play);

        if (result.modifiedCount === 0) {
            res.status(400).send("song già presente in playlist");
            return
        } else {
            res.status(200).send("song aggiunta alla playlist");
            return
        }
    } catch (e) {
        console.log('Errore:', e);
        if (e.code == 11000) {
            res.status(400).send("song già presente");
        } else {
            res.status(500).send(`Errore generico: ${e}`);
        }
    };
}

async function removeSong(res, song, playlist) {
    if (!song || song === "") {
        res.status(400).send("Manca la song da togliere");
        return;
    }
    var pwmClient = await new mongoClient(uri).connect();
    try {
        var filter = {
            "_id": new ObjectId(playlist)
        };
        var update = {
            $pull: { "song": song }
        };

        var result = await pwmClient.db("pwm").collection('playlist').updateOne(filter, update);
        if (result.matchedCount === 1 && result.modifiedCount === 1) {
            res.json({ success: true, message: "Song removed successfully." });
        } else {
            res.status(404).send("Song not found in the playlist.");
        }
    } catch (e) {
        console.log('Error in removeSong:', e);
        res.status(500).send(`Errore generico: ${e}`);
    }
}


async function updatePlaylist(res, id, playlist) {
    if (playlist.titolo == undefined || playlist.titolo == "") {
        res.status(400).send("Inserire un titolo")
        return
    }
    if (playlist.descrizione == undefined || playlist.descrizione == "") {
        res.status(400).send("Inserire una descrizione")
        return
    }
    if (playlist.tag.length === 0) {
        res.status(400).send("Inserire almeno un tag valido")
        return
    }
    try {
        var pwmClient = await new mongoClient(uri).connect()
        var filter = { "_id": new ObjectId(id) }
        var playlistToIn = {
            $set: playlist
        }
        var item = await pwmClient.db("pwm").collection('playlist').updateOne(filter, playlistToIn)
        res.send(item)
    } catch (e) {
        console.log('catch in test');
        res.status(500).send(`Errore generico: ${e}`)
    };
}

async function deletePlaylist(res, playlist) {
    var pwmClient = await new mongoClient(uri).connect()
    try {
        var filter = await pwmClient.db("pwm").collection('playlist').deleteOne({ _id: new ObjectId(playlist) })
        res.json(filter)
    }
    catch (e) {
        console.log('catch in test');
        res.status(500).send(`Errore generico: ${e}`)
    };
}

async function loginUser(res, login) {
    //login = req.body

    if (login.email == undefined) {
        res.status(400).send("Missing Email")
        return
    }
    if (login.password == undefined) {
        res.status(400).send("Missing Password")
        return
    }

    login.password = hash(login.password)

    var pwmClient = await new mongoClient(uri).connect()
    var filter = {
        $and: [
            { "email": login.email },
            { "password": login.password }
        ]
    }
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
    console.log(loggedUser)

}

app.put('/users/:id/genere', auth, function (req, res) {

    var genresArray = req.body.generi;

    //for(var i = 0; i < re)
    genresArray.forEach(function (genre) {
        var gen = {
            generi: genre
        }
        addGenere(res, req.params.id, gen);
    });
    //addGenere(res, req.params.id, req.body)
})

//rimuove un genere preferito dell'utente
app.delete('/users/:id/genere', auth, function (req, res) {

    removeGenere(res, req.params.id, req.body)
})

//aggiunge un'artista preferito dall'utente
app.put('/users/:id/artist', auth, function (req, res) {

    addArtist(res, req.params.id, req.body)
})

//rimuove un'artista preferito dall'utente
app.delete('/users/:id/artist', auth, function (req, res) {

    removeArtist(res, req.params.id, req.body)
})

async function addGenere(res, id, genereParam) {

    if (genereParam.generi === '') {
        res.status(400).send('Manca il genere da aggiungere')
        return
    }

    try {
        var pwmClient = await new mongoClient(uri).connect()
        var filter = { "_id": new ObjectId(id) }
        var Gen = {
            $addToSet: genereParam
        }
        var result = await pwmClient.db("pwm")
            .collection('users')
            .updateOne(filter, Gen)
        if (result.modifiedCount === 0) {
            res.status(400).send("Genere già presente ");
            return
        } else {
            res.status(200).send("Genere aggiunto");
            return
        }

    } catch (e) {
        console.log('catch in test', e);
        if (e.code == 11000) {
            res.status(400).send("Genere già presente")
            return
        }
        res.status(500).send(`Errore generico: ${e}`)

    };
}

async function removeGenere(res, id, genereParam) {
    if (genereParam.generi == undefined || genereParam.generi === "") {
        res.status(400).send("Manca il genere da rimuovere")
        return
    }

    try {

        var pwmClient = await new mongoClient(uri).connect()

        var filter = { "_id": new ObjectId(id) }

        var Gen = {
            $pull: genereParam
        }

        var item = await pwmClient.db("pwm")
            .collection('users')
            .updateOne(filter, Gen)

        res.send(item)

    } catch (e) {
        console.log('catch in test');

        res.status(500).send(`Errore generico: ${e}`)

    };
}

async function addArtist(res, id, artistaParam) {

    if (artistaParam.artist == undefined || artistaParam.artist === '') {

        res.status(400).send("Manca l'artista da aggiungere")
        return
    }


    try {

        var filter = { "_id": new ObjectId(id) }
        var pwmClient = await new mongoClient(uri).connect()

        var Art = {
            $addToSet: artistaParam
        }

        var result = await pwmClient.db("pwm")
            .collection('users')
            .updateOne(filter, Art)
        if (result.modifiedCount === 0) {
            res.status(400).send("Artista già presente");
            return
        } else {
            res.status(200).send("Artista aggiunto");
            return
        }

    } catch (e) {
        console.log('catch in test');
        if (e.code == 11000) {
            res.status(400).send("Artista già presente")
            return
        }
        res.status(500).send(`Errore generico: ${e}`)


    };
}

async function removeArtist(res, id, artistaParam) {
    if (artistaParam.artist == undefined || artistaParam.artist == "") {
        res.status(400).send("Manca l'artista da rimuovere")
        return
    }

    try {

        var pwmClient = await new mongoClient(uri).connect()

        var filter = { "_id": new ObjectId(id) }

        var artista = {
            $pull: artistaParam
        }

        var item = await pwmClient.db("pwm")
            .collection('users')
            .updateOne(filter, artista)

        res.send(item)

    } catch (e) {
        console.log('catch in test');
        if (e.code == 11000) {
            res.status(400).send("Artista già presente")
            return
        }
        res.status(500).send(`Errore generico: ${e}`)

    };
}

// Update the Express route to handle the request body correctly
app.put('/like/:playlistId', auth, function (req, res) {
    console.log('Request Body:', req.body);
    console.log(req.params.playlistId)
    addLike(res, req.params.playlistId, req.body);

});

// Update the addLike function to expect userId as a string
async function addLike(res, playlistId, userId) {
    if (userId.like === '') {
        res.status(400).send('Manca il genere da aggiungere')
        return
    }

    try {
        var pwmClient = await new mongoClient(uri).connect()
        var filter = { "_id": new ObjectId(playlistId) }
        var like = {
            $addToSet: userId
        }
        var result = await pwmClient.db("pwm")
            .collection('playlist')
            .updateOne(filter, like)

        if (result.modifiedCount === 0) {
            await removeLike(res, playlistId, userId);
            return;
        } else {
            res.status(200).send("Genere aggiunto");
            return
        }

    } catch (e) {
        console.log('catch in test', e);
        if (e.code == 11000) {
            res.status(400).send("Genere già presente")
            return
        }
        res.status(500).send(`Errore generico: ${e}`)

    };
}

async function removeLike(res, playlistId, userId) {
    try {
        var pwmClient = await new mongoClient(uri).connect()
        var filter = { "_id": new ObjectId(playlistId) }
        var unlike = {
            $pull:  userId 
        }
        var result = await pwmClient.db("pwm")
            .collection('playlist')
            .updateOne(filter, unlike)

        if (result.modifiedCount === 0) {
            res.status(400).send("Utente non presente nella lista dei like");
            return
        } else {
            res.status(200).send("Utente rimosso dalla lista dei like");
            return
        }

    } catch (e) {
        console.log('catch in removeLike', e);
        res.status(500).send(`Errore generico: ${e}`)
    };
}
