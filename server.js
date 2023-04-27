// axios lets you submit an input without the need of a form

let express = require("express")
// objectId represents the content of MongoClient
let { MongoClient, ObjectId } = require("mongodb")

let app = express()
let db

// this + <script src="/browser.js"></script> creates a connection to the public folder
app.use(express.static("public"))

async function go() {
    // ('') = where to connect it to from mongoDB | after .net/ add "db name"
    let client = new MongoClient('mongodb+srv://toDoUser:11011996@cluster2023.7lhom7b.mongodb.net/ToDoApp?retryWrites=true&w=majority')
    await client.connect() // await needs to be inside an async function
    db = client.db() // this line requires the line above to be finished beforehand - THUS AWAIT
    app.listen(4000)
}

go()

function passwordProtected(req, res, next) {
           // (a. browser is gonna ask user to enter user/pass, b. name of the app)
    res.set('WWW-Authenticate', 'Basic realm="to-do App')
    console.log(req.headers.authorization)
    // .headers.authorization is boiler plate // =="This is the basic 64 format copied code you get on console.log after entering your chosen user+pass"
    if (req.headers.authorization == "Basic bGVhcm46amF2YQ==") {
        next()
    } else {
        // 401 = unauthorized
        res.status(401).send("Authentication required")
    }
}

// does the same as below but instead of FOR SUBMITTED FORMS, do it for ASYNC REQUESTS
app.use(express.json())
// tell express to add all form values to a body object & add that body object to the request object
app.use(express.urlencoded({ extended: false })) // boilerplate code to make the user's input (.item) accessible

// this will add authent. for all URLs
app.use(passwordProtected)

// .join is used to remove the commas between the retrieved items
app.get("/", async function(req, res) {
    const items = await db.collection("items").find().toArray() // .FIND equals READ | .toArray converts the db data type
    res.send(`<!DOCTYPE html>
    <html>
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Simple To-Do App</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
        </head>
            <body>
                <div class="container">
                    <h1 class="display-4 text-center py-1">To-Do List 2023</h1>
                    <div class="jumbotron p-3 shadow-sm">
                    <form id="create-form" action="/create-item" method="POST">
                        <div class="d-flex align-items-center">
                        <input id="create-input" name="item" autofocus autocomplete="off" class="form-control mr-3" type="text" style="flex: 1;">
                        <button class="btn btn-primary">Add New Item</button>
                        </div>
                    </form>
                    </div>
                    <ul id="item-list" class="list-group pb-5">
                    </ul>
                </div>

            <script> let items = ${JSON.stringify(items)} </script>
            <script src="https://unpkg.com/axios@1.1.2/dist/axios.min.js"></script>
            <script src="/browser.js"></script>
            
            </body>
    </html>`)
})

// res.send won't work till db.collection has been completed
app.post("/create-item", async function (req, res) {
    // storing in database
    const infoSent = await db.collection("items").insertOne({ text: req.body.text }) // 1st "text" is whatever you choose / 2nd "Text" is defined in axios.post
               // _id: infoSent.insertedId represents the ID of the insertOne({})
    res.json({ _id: infoSent.insertedId, text: req.body.text })
    // res.redirect.("/") would send back to homepage
})

// "/update-item" is called a HANDLER | (url, function)
app.post("/update-item", async function (req, res) {
                                                 // request with a JSON body from db - "ObjectId" is a constructor from the mongodb set as a VAR at the beginning
    await db.collection("items").findOneAndUpdate({ _id: new ObjectId(req.body.id) }, { $set: { text: req.body.text } })
                                                 // (a. which doc. to update, b. what we want to update on that doc.)
    res.send("Success")
})

app.post("/delete-item", async function (req, res) {
    await db. collection("items").deleteOne({ _id: new ObjectId(req.body.id) })
    res.send("Success")
})

// PREVIOUS UL now represented in function itemTemplate in browser.js
/*
    ${items
        .map(function (item) {
            return `
            <li class="list-group-item-action d-flex align-items-center justify-content-between">
            <span class="item-text">${item.text}</span>
            <div>
            <button data-id="${item._id}" class="edit-me btn btn-secondary btn-sm mr-1">Edit</button>
            <button data-id="${item._id}" class="delete-me btn btn-danger btn-sm">Delete</button>
            </div>
            </li>
            `
        })
        .join('')}
*/