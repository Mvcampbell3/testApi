var config = {
    apiKey: "AIzaSyCyTlLrY30Yw_3eqKWmj4ejqmAAYL_X1-Y",
    authDomain: "flu-fighters.firebaseapp.com",
    databaseURL: "https://flu-fighters.firebaseio.com",
    projectId: "flu-fighters",
    storageBucket: "flu-fighters.appspot.com",
    messagingSenderId: "356867364502"
};
firebase.initializeApp(config);


// ------------ Authentication Area -----------------//

var authenication = {
    justSigned: false,
    displayName: "MichaelC25",
    // Need to set this from the form login page. update on html script for now


    hello: firebase.auth().onAuthStateChanged(function (user) {
        if (user && this.justSigned) {
            // User is signed in and just created account
            user.updateProfile({
                displayName: this.displayName,
            });
            justSigned = false;
            console.log(user + " first sign in");
        } else if (user && !this.justSigned) {
            // User is signed in and already was a user
            console.log(user);
            console.log(user.displayName + " logged in again");
            this.displayName = user.displayName;
        } else {
            console.log("not logged in");
            // Not signed in
        }
    }),

    goodbye: firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE)
        .then(function () {
            var provider = new firebase.auth.GoogleAuthProvider();
            // In memory persistence will be applied to the signed in Google user
            // even though the persistence was set to 'none' and a page redirect
            // occurred.
            return firebase.auth().signInWithRedirect(provider);
        })
        .catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
        }),

}


// ---------------- Image Recognition Api ----------//

const app = new Clarifai.App({
    apiKey: 'ead5e62eaa3444cf8d7881fcd75751c5'
});

// Will tell you what is in the image
// Not using but still pretty cool
function predictURL(url) {
    app.models.initModel({ id: Clarifai.GENERAL_MODEL, version: "aa7f35c01e0642fda5cf400f543e7c40" })
        .then(generalModel => {
            return generalModel.predict(url);
        })
        .then(response => {
            var concepts = response['outputs'][0]['data']['concepts'];
            console.log(concepts);
            var highLevel = concepts.filter(function (concept) {
                return concept.value >= .94;
            });
            console.log(highLevel);
            return concepts;
        })
}

// ------------------------ Game Object -----------------------//

var game = {

    game_URLs: [],
    roomName: "Mike's Room", // Will be grabbed from input
    // Going to be linked from userRoom object
    gameName: "testGame", // Will be grabbed from input
    gameInfo: null,


    // Load game pictures from our created databse
    // Can load from user gen database later
    getURL: function () {
        game.gameInfo = firebase.database().ref("/gameStorage/" + game.gameName)
            .once("value", function (snap) {
                console.log(snap.val());
                game.gameInfo = snap.val();
            }).then(function (response) {
                console.log("finished");
                console.log(response);
                game.populateURL()
            });
    },

    populateURL: function () {
        // Takes the urls from storage and pushes into game_URLs array for loading into clarifai
        for (var i = 0; i < this.gameInfo.pictures.length; i++) {
            this.game_URLs.push(this.gameInfo.pictures[i].url);
            console.log(i + " " + this.game_URLs[i] + " " + this.gameInfo.pictures[i].url);
        }
        game.addToClarifai();
    },

    // Loads the 5 urls from game_URLs to clarifai cloud
    addToClarifai: function () {
        if (game.game_URLs.length === 5) {
            app.inputs.create([
                // pretty certain can run for loop with right keys
                // may want to ad id's to the mix or metadata
                { url: game.game_URLs[0] },
                { url: game.game_URLs[1] },
                { url: game.game_URLs[2] },
                { url: game.game_URLs[3] },
                { url: game.game_URLs[4] },
            ]).then(
                function (response) {
                    // do something with response
                    console.log(response);
                },
                function (err) {
                    // there was an error
                    console.log(err);
                }
            );
        }
    },

    // This is what we might want to use in the game, may want to think about using arrays and then for looping them through to keep time down
    addToClarifaiExact: function (URL, ID) {
        app.inputs.create({
            url: URL,
            id: ID
        }).then(
            function (response) {
                console.log(response);
            },
            function (err) {
                console.log(err);
            }
        )
    },

    checkClarifaiStorage: function () {
        // Just checks what is in the clarifai database
        app.inputs.list().then(
            function (response) {
                // do something with response
                console.log(response)
            },
            function (err) {
                // there was an error
                console.log(err);
            }
        );
    },

    deleteClarifai: function () {
        // Dumps entire database
        // Can pinpoint to certain id's in future
        app.inputs.delete().then(
            function (response) {
                // do something with response
                console.log(response)
            },
            function (err) {
                // there was an error
                console.log(err);
            }
        );
    },

    // Only dumps file that have that id, may modify into array
    deleteClarifaiExact: function (id) {
        app.inputs.delete(id).then(
            function (response) {
                console.log(response);
            },
            function (err) {
                console.log(err);
            }
        );
    },

    checkURL: function (URL) {
        // Basic component of the game, get the values back
        // can also be targeted if cloud storage is too big
        app.inputs.search({ input: { url: URL } }).then(
            function (response) {
                // do something with response
                // response will contain the values of the url vs urls in clarifai cloud
                console.log(response);
                // This is where we will do somthing with the response in terms of right or wrong
            },
            function (err) {
                // there was an error
                console.log(err);
            }
        );
    },

    runCompare: function () {
        var grabArray = [];

        var addToGrab = firebase.database().ref("/gameStorage/userRooms/" + game.roomName);

        addToGrab.once("value", function (snapshot) {
            snapshot.forEach(function (childSnap) {
                var url = childSnap.val().url;
                grabArray.push(url);
            })
        }).then(function () {
            console.log(grabArray);
            for (var i = 0; i < grabArray.length; i++) {
                game.checkURL(grabArray[i]);
                console.log(grabArray[i]);
            }
        })


    },

    setGameDatabase: function () {
        // What will set user gen game databases
        // MVP only premade test games at first, when running can add
        console.log("still working on that")
        var database = firbase.database().ref("/gameStorage/" + game.roomName);


    },
}; //End of Game Object

// ---------------File Input ---------------//

// Need to clean this up, add to the game object or make new object


var fileInputArea = document.getElementById("gameRoom");

fileInputArea.addEventListener("change", function (e) {
    if (e.target.type === "file") {
        doSomethingWithFiles(e);
    }
})

function doSomethingWithFiles(e) {
    // Grabs the files from the input, stores it in storage array
    // When storageArray.length == 5, takes the files and stores them to the firebase cloud
    console.log(e.target.files);
    // console.log(e.target.files);

    var file = e.target.files[0];
    var userDatabase = firebase.database().ref("/gameStorage/userRooms/" + userRoom.roomKey);
    var whichInput = e.target.id;
    var whichURL = $("#" + whichInput).attr("data-pic");
    switch (whichURL) {
        case "pic1URL":
            picHolder[0].picFile = file;
            picHolder[0].picChange = true;
            updateStorage();
            break;
        case "pic2URL":
            picHolder[1].picFile = file;
            picHolder[1].picChange = true;
            updateStorage();
            break;
        case "pic3URL":
            picHolder[2].picFile = file;
            picHolder[2].picChange = true;
            updateStorage();
            break;
        case "pic4URL":
            picHolder[3].picFile = file;
            picHolder[3].picChange = true;
            updateStorage();
            break;
        case "pic5URL":
            picHolder[4].picFile = file;
            picHolder[4].picChange = true;
            updateStorage();
            break;
        default:
            console.log("pic switch not working as expected");
    }
    console.log(picHolder);

}

var picHolder = [
    { picName: "pic1URL", picChange: false, picFile: null },
    { picName: "pic2URL", picChange: false, picFile: null },
    { picName: "pic3URL", picChange: false, picFile: null },
    { picName: "pic4URL", picChange: false, picFile: null },
    { picName: "pic5URL", picChange: false, picFile: null }
]

function updateStorage() {
    for (var i = 0; i < picHolder.length; i++) {
        if (picHolder[i].picChange === true) {
            picHolder[i].picChange = false;
            var place = firebase.storage().ref("/userPics/" + userRoom.roomKey + "/" + picHolder[i].picName);
            var setPic = place.put(picHolder[i].picFile).then(function (snap) {
                console.log("added pic");
                console.log(snap.ref);
                snap.ref.getDownloadURL().then(function(url){
                    console.log(url);
                })
                
            })
        }
    }
}

// Room Object-------------------------//

var userRoom = {

    roomName: "Mikes",//Grab from html input
    gameName: "testGame1",//grab from html input
    hints: [],
    picURls: [],
    roomKey: "",

    getHints: function () {
        var database = firebase.database().ref("/gameStorage/games/" + this.gameName);

        database.once("value", function (snapshot) {
            console.log(snapshot.val());
            for (var i = 0; i < snapshot.val().length; i++) {
                userRoom.hints.push(snapshot.val()[i].picHint);
                userRoom.picURls.push(snapshot.val()[i].picURL)
                console.log(userRoom.hints[i]);
            }
        }).then(function (response) {
            userRoom.roomDatabaseInit();
        });
    },

    roomDatabaseInit: function () {
        // Need to push room to userRooms database
        // Save Room ID;
        // Data-room 
        var roomDatabase = firebase.database().ref("/gameStorage/userRooms/")
        var roomNew = roomDatabase.push();

        roomNew.set({
            hint1: this.hints[0],
            hint2: this.hints[1],
            hint3: this.hints[2],
            hint4: this.hints[3],
            hint5: this.hints[4],

            roomName: userRoom.roomName,
            roomKey: "",
            roomCreator: authenication.displayName,


            users: [authenication.displayName],
            // Will be grabbed from auth process

            pic1Url: this.picURls[0],
            pic2Url: this.picURls[1],
            pic3Url: this.picURls[2],
            pic4Url: this.picURls[3],
            pic5Url: this.picURls[4],
        });

    },

    addToPage: firebase.database().ref("/gameStorage/userRooms").on("child_added", function (snapshot) {
        var childKey = snapshot.key;
        var childData = snapshot.val();
        // console.log(childData);
        console.log(childKey);

        var newDiv = $("<div>").attr("class", "box").attr("data-roomKey", childKey);
        var title = $("<h2>").attr("class", "divTitle").text(childData.roomName);
        var userNum = $("<h2>").attr("class", "userNum").text(childData.users.length);

        newDiv.append(title, userNum);
        $(".outputArea").append(newDiv);
    }),

    openRoom: function () {
        $(".roomArea").slideUp();
        var gameDatabase = firebase.database().ref("/gameStorage/userRooms/" + $(this).attr("data-roomKey"));

        gameDatabase.on("value", function (snap) {
            var here = snap.val();
            $(".roomTitle").text(here.roomName);
            $("#hint1").text(here.hint1);
            $("#hint2").text(here.hint2);
            $("#hint3").text(here.hint3);
            $("#hint4").text(here.hint4);
            $("#hint5").text(here.hint5);
        })
        $(".gameRoom").slideDown();


    }
}

setTimeout(function () {
    $(".roomArea").slideDown();
}, 1000);

$(".outputArea").on("click", ".box", userRoom.openRoom)














function setTestGame() {
    var database = firebase.database().ref("/gameStorage/games/testGame1");

    database.set([
        { picURL: "https://firebasestorage.googleapis.com/v0/b/flu-fighters.appspot.com/o/gamePics%2FtestGame%2FnotGuessed.jpg?alt=media&token=39e3d7d3-dce7-422b-9de7-a5a9d48a2404", picHint: "This is where the hint1 will go" },
        { picURL: "https://firebasestorage.googleapis.com/v0/b/flu-fighters.appspot.com/o/gamePics%2FtestGame%2FnotGuessed.jpg?alt=media&token=39e3d7d3-dce7-422b-9de7-a5a9d48a2404", picHint: "This is where the hint2 will go" },
        { picURL: "https://firebasestorage.googleapis.com/v0/b/flu-fighters.appspot.com/o/gamePics%2FtestGame%2FnotGuessed.jpg?alt=media&token=39e3d7d3-dce7-422b-9de7-a5a9d48a2404", picHint: "This is where the hint3 will go" },
        { picURL: "https://firebasestorage.googleapis.com/v0/b/flu-fighters.appspot.com/o/gamePics%2FtestGame%2FnotGuessed.jpg?alt=media&token=39e3d7d3-dce7-422b-9de7-a5a9d48a2404", picHint: "This is where the hint4 will go" },
        { picURL: "https://firebasestorage.googleapis.com/v0/b/flu-fighters.appspot.com/o/gamePics%2FtestGame%2FnotGuessed.jpg?alt=media&token=39e3d7d3-dce7-422b-9de7-a5a9d48a2404", picHint: "This is where the hint5 will go" },
    ])
}

//https://firebasestorage.googleapis.com/v0/b/flu-fighters.appspot.com/o/userPics%2Fpic1URL?alt=media&token=aae81dab-5081-4d42-9398-8d2a03ed498a