# bookbag


The goal here is to create APIs for a simple blogging website. These APIs can then be consumed
and manipulated on the front-end.
The database of choice is MongoDB and Mongoose ODM will be utilized in modelling the database.

<h3>Step One => Setting up the app directory</h3>

The backend folder serves as our root folder. Several subdirectories were created inside the backend directory.
These include middleware, config, database, and _test_. Files will also be created inside the backend folder.
These files include: server.js(which is the entry point for the app).
Access the root folder on the command line and run <b>npm install</b> to pull the various dependencies required by the app in the package.json file.
You should see a node_modules folder in your root directory once you're done installing the packages.

<h3>Step Two => Setting Up mongoose connection</h3>

Inside your config folder, create a config.json file and define your various environment variables, such as MONGODB_URI, PORT, JWT_SECRET for your various environment(development and test) accordingly.

<h3>Routes</h3>
There are eleven(11) routes in total, four(4) public routes which and seven(7) protected routes

Public routes Examples

    GET "https://bookz-bag.herokuapp.com"
    --header "Content-Type: application/json"
    
    To view all available book resource and their ratings
    GET "https://bookz-bag.herokuapp.com/books/all" 
    --header "Content-Type: application/json"

    Create a new user account
    POST "https://bookz-bag.herokuapp.com/users" 
    --header "Content-Type: application/json"
    --data "{
        \"email\": \"example@gmail.com\",
        \"password\": \"password\"
    }"

    Login registered users
    POST "https://bookz-bag.herokuapp.com/users/login"
    --header "Content-Type: application/json"
    --data "{
        \"email\": \"example@gmail.com\",
        \"password\": \"password\"
    }"

Protected routes

    To verify a registered user
    GET "https://bookz-bag.herokuapp.com/users/me"
    --header "Content-Type: application/json"
    --data "{
        \"email\": \"example@gmail.com\",
        \"password\": \"password\"
    }"

    To create a resource
    POST "https://bookz-bag.herokuapp.com/books" \
    --header "Content-Type: application/json" \
    --header "x-auth: " \"token\"
    --data "{
        \"title\": \"example book\",
        \"author\": \"example author\",
        \"isbn\": \"example isbn\",
        \"rating\": 3 (1-5)
    }"

    To get all the book resources by a specific user
    GET "https://bookz-bag.herokuapp.com/books" 
    --header "Content-Type: application/json"
    ---header "x-auth: " \"token\"

    To get a single book by a user
    GET "https://bookz-bag.herokuapp.com/books/:bookId" \
    --header "Content-Type: application/json" \
    ---header "x-auth: " \"token\"

    To edit a book resource
    PATCH "https://bookz-bag.herokuapp.com/books/:bookId"
    --header "Content-Type: application/json"
    ---header "x-auth: " \"token\"
    --data "{
        \"author\": \"example author\"
    }"

    To delete a book resource by a user
    DELETE "https://bookz-bag.herokuapp.com/books/:bookId" \
    --header "Content-Type: application/json" \
    ---header "x-auth: " \"token\"

    To logout a user or delete a token
    DELETE "https://bookz-bag.herokuapp.com/users/token" 
    --header "Content-Type: application/json"
    ---header "x-auth: " \"token\"

Have fun. Cheers.