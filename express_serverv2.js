//file for submission//



//1 Express Server and Requirements
var express = require("express");
var app = express();
var bcrypt = require("bcrypt");
var bodyParser = require("body-parser");
var PORT = process.env.PORT || 8080;
var cookieSession = require("cookie-session");
app.use(cookieSession({
  name: "session",
  keys: [ "KEY1", "KEY2" ],
}));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

var urlDatabase = {
  "skgb86": {
    id: "skgb86",
    userID: "userRandomID",
    url: "http://www.lighthouselabs.ca"
  },
  "8yumg": {
    id: "8yumg",
    userID: "user2RandomID",
    url: "http://www.google.com"
  }
};

var users = {
  "userRandomID": {
    id: "userRandomID",
    email: "fjkg@asda.com",
    hashedPassword: "drowsapp1"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "asd@asdd.com",
    hashedPassword: "drowsapp2"
  }
};

///GET

app.get("/", (req, res) => {
  if (req.session.user_id === undefined) {        //when user is not registered redirect to login
    return res.redirect("/login");
  } else {
    res.redirect("/urls");                //if user is registred redirects us to urls
  }
});

app.get("/urls", (req, res) => {            //shows URLs_INDEX
  var displayUrls= {};
  if (req.session.user_id !== undefined) {
    displayUrls= urlsForUser(req.session.user_id);
  }
  var templateVars = {
    urls: displayUrls,
    user: users[req.session.user_id]
  };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {            //creates new URLs
  var templateVars = {
    user: users[req.session["user_id"]]
  };
  if (users[req.session["user_id"]] !== undefined) {
    return res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:id", (req, res) => {
  if (urlDatabase[req.params.id] === undefined) {
    var templateVars = {
      shortURL: req.params.id,
      fullURL: undefined,
      urlUserID: undefined,
      user: users[req.session["user_id"]]
    };
    return res.render("urls_show", templateVars);

  } else {
    var templateVars = {
      shortURL: req.params.id,
      fullURL: urlDatabase[req.params.id].url,
      urlUserID: urlDatabase[req.params.id].userID,
      user: users[req.session["user_id"]]
    };
    res.render("urls_show", templateVars);
  }
});
app.get("/login", (req, res) => {

  if (req.session["user_id"] !== undefined) {       //get route to  login
    return res.redirect("/urls");                  //if user is already logged in then it will take them to the urls
  } else {
    var templateVars = {
      user: users[req.session["user_id"]]
    };
    res.render("login", templateVars);          //if not, it will ask the user to go to the log in page
  }
});
app.get("/register", (req, res) => {            //get route to  register
  if (req.session["user_id"] !== undefined) {       //if user is already logged in then it will take them to the urls
    return res.redirect("/urls");
  } else {
    var templateVars = {                        //if not, it will ask the user to go to the log in page
      user: users[req.session.user_id]
    };
    res.render("register", templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL] === undefined) {      // If the shortURL is invalid, display an error page
    var templateVars = {
      user: users[req.session.user_id]
    };
    return res.render("urls_invalid", templateVars);        //created a new file called urls_invalid for messages.
  // Otherwise direct to the long URL
  } else {
    var longURL = urlDatabase[req.params.shortURL].url;
    res.redirect(longURL);
  }
});


app.post("/login", (req, res) => {
  var emailEx = [];
  var useridMatch= "";
  for (var userId in users) {
    if (users.hasOwnProperty(userId)) {         //if email exists
      emailEx.push(users[userId].email);
    }
  }
  if (emailEx.indexOf(req.body.email) === -1) {     //if email exists, but details are not right
    return res.end("Email and/or password invalid! Please try again! Or register first!  ");
  } else {
    for (var userId in users) {
      if (users.hasOwnProperty(userId)) {
        if (users[userId].email === req.body.email) {
          useridMatch= userId;
        }
      }
    }
    var hashedPassword = bcrypt.hashSync(req.body.password, 10); //checks typed password with submitted password.
    if (bcrypt.compareSync(req.body.password, users[useridMatch].hashedPassword)) {
      req.session.user_id = useridMatch;
      return res.redirect("/urls");     //if incorrect it will return an error message.
    } else {
      res.end("Email and/or password invalid! Please try again! Or register first! ");
    }
  }
});


app.post("/register", (req, res) => {       //post for registering a new user
  for (var userId in users) {
    if (users.hasOwnProperty(userId)) {
      if (req.body.email === users[userId].email) {
        return res.end("Email address already exists, use a different email or register for one at wwww.gmail.com ");
      }
    }
  }
  if (req.body.email === "") {
    //if email section is empty will return "Please fill out email "
    return res.end("Please fill out email section");

  } else if (req.body.password === "") {
     //if password section is empty will return "Please fill out password "
    return res.end("Please fill out password section");
  } else {

    var rndmString = generateRandomString();
    users[rndmString] = {
      id: rndmString,
      email: req.body.email,
      hashedPassword: bcrypt.hashSync(req.body.password, 10)
    };
    req.session.user_id = rndmString;
    res.redirect("/urls");      //after creating username and password, it redirects to the URL section
  }
});

app.post("/urls", (req, res) => {          //  POST ROUTE for new URLs being shortened

  if (req.session["user_id"] !== undefined) {
    var rndmString = generateRandomString();
    urlDatabase[rndmString] = {
      id: rndmString,
      userID: req.body.userID,
      url: req.body.longURL
    };

    return res.redirect("/urls/" + rndmString);
  } else {    //ELSE, if usern is not validated, then does not permit user to change file.
    res.end("Invalid, please create an account first");
  }
});

app.post("/urls/:id", (req, res) => {

  if (req.session["user_id"] !== undefined && req.session["user_id"] === urlDatabase[req.body.shortURL].userID) {
    var fullURL = req.body.newLongURL;
    var shortURL = req.body.shortURL;
    urlDatabase[req.body.shortURL].url = req.body.newLongURL;
    return res.redirect("/urls");         // Redirect back to the urls index page
  } else {
    res.end("Invalid, unable to modify URL, please log in with a valid account first");   // if user is not authenticatd then it will not allow user to edit files
  }
});

app.post("/urls/:id/delete", (req, res) => {
//for deleting exisiting URLS
  if (urlDatabase[req.params.id].userID === users[req.session["user_id"]].id) {
    delete urlDatabase[req.params.id];
    return res.redirect("/urls");
  } else { //if user is not authenticatd then it will not allow user to delete files
    res.end("Unable to delete, only logged in user may delete files");
  }
});

//LOGS
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});



//LISTENER

app.listen(PORT, () => {
  console.log(`example listening on port ${PORT}!`);
});

/// Random string generator to create  keys for URLs
function generateRandomString() {
  var text = "";
  var possible = "abcdefghijklmnopqrstuvwxy z0123456789";

  for (var i = 0; i < 6; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}



// Object of links made, using userID function
function urlsForUser(id) {
  var userUrls = {};
  for (var urlID in urlDatabase) {
    if (urlDatabase.hasOwnProperty(urlID)) {
      if (urlDatabase[urlID].user === id) {
        userUrls[urlID] = urlDatabase[urlID];
      }
    }
  }
  return userUrls;
}




