function itemTemplate(item) {
    return `
    <li class="list-group-item-action d-flex align-items-center justify-content-between">
    <span class="item-text">${item.text}</span>
    <div>
    <button data-id="${item._id}" class="edit-me btn btn-secondary btn-sm mr-1">Edit</button>
    <button data-id="${item._id}" class="delete-me btn btn-danger btn-sm">Delete</button>
    </div>
    </li>
    `
}

// Initial page load render
let listHTML = items.map(function(eachItem) {
    return itemTemplate(eachItem)
}).join('')
document.getElementById("item-list").insertAdjacentHTML("beforeend", listHTML)

// Create feature
let createInput = document.getElementById("create-input")
                                                        // (event, action) 
document.getElementById("create-form").addEventListener("submit", function(event) {
    event.preventDefault() // prevents from reloading the page
    axios
    .post("create-item", { text: createInput.value })
    .then(function (response) {
        // adding a list at the end of the page |              (a: where, B: what = response.data comes from app.post res.json()  )
        document.getElementById("item-list").insertAdjacentHTML("beforeend", itemTemplate(response.data))
        createInput.value = "" // clear out the input
        createInput.focus()
    })
    .catch(function() {
        console.log("Try again later")
    })
})

document.addEventListener("click", function(event) {
    // this specifies that the click is only trigerred on EDIT-ME
    if (event.target.classList.contains("edit-me")) {
        // PROMPT replaces FORM
        // (a. message on-click, b. pre populate the field with the existing value)
        let userInput = prompt("Update your field", event.target.parentElement.parentElement.querySelector(".item-text").innerHTML)
        // this IF is used in order for the value not to be blank in case the user cancels the input
        if (userInput) {
            // axios is retrieved from server.js > html > very end (boilerplate code)            
            axios
            // .post(URL, data that gets sent) | axios.post(a, b) RETURNS A PROMISE | .target.getAttribute gets the id value
            .post("/update-item", { text: userInput, id: event.target.getAttribute("data-id") })
            // .then() this function won't run till the previous method (promise) is complete
            .then(function () {
                // .target = whichever button got clicked on / .querySelector() = spam element of text that houses that value / .innerHTML = property
                event.target.parentElement.parentElement.querySelector(".item-text").innerHTML = userInput // immediate refresh once a value is updated
            })
            // .catch() what to do in case the previous methods get an error
            .catch(function () {
                console.log("Try again later.")
            })
        }
    }
    // this specifies that the click is only trigerred on DELETE-ME
    if (event.target.classList.contains("delete-me")) {
        if (confirm("Are you sure to delete this item?")){
            axios                 // when deleting, we no longer need to send "text: userInput"
            .post("/delete-item", { id: event.target.getAttribute("data-id") })
            .then(function () {
                // e.target = button / 1st parent: <span> / 2nd parent: <li>
                event.target.parentElement.parentElement.remove() // this does not only remove the .querySelector but the entire row
            })
            .catch(function () {
                console.log("Try again later.")
            })
        }
    }
})