//file for submission//

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



app.get("/", (req, res) => {
  if (req.session.user_id === undefined) {
    return res.redirect("/login");
  } else {
    res.redirect("/urls");
  }
});

app.get("/urls", (req, res) => {
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
app.get("/urls/new", (req, res) => {
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

  if (req.session["user_id"] !== undefined) {
    return res.redirect("/urls");
  } else {
    var templateVars = {
      user: users[req.session["user_id"]]
    };
    res.render("login", templateVars);
  }
});
app.get("/register", (req, res) => {
  if (req.session["user_id"] !== undefined) {
    return res.redirect("/urls");
  } else {
    var templateVars = {
      user: users[req.session.user_id]
    };
    res.render("register", templateVars);
  }
});


app.post("/login", (req, res) => {
  var emailEx = [];
  var useridMatch= "";
  for (var userId in users) {
    if (users.hasOwnProperty(userId)) {
      emailEx.push(users[userId].email);
    }
  }
  if (emailEx.indexOf(req.body.email) === -1) {
    return res.end("Email and/or password invalid! Please try again!");
  } else {
    for (var userId in users) {
      if (users.hasOwnProperty(userId)) {
        if (users[userId].email === req.body.email) {
          useridMatch= userId;
        }
      }
    }
    var hashedPassword = bcrypt.hashSync(req.body.password, 10);
    if (bcrypt.compareSync(req.body.password, users[useridMatch].hashedPassword)) {
      req.session.user_id = useridMatch;
      return res.redirect("/urls");
    } else {
      res.end("Email and/or password invalid! Please try again! Or register first! ");
    }
  }
});


app.post("/register", (req, res) => {
  for (var userId in users) {
    if (users.hasOwnProperty(userId)) {
      if (req.body.email === users[userId].email) {
        return res.end("Email address already exists, use a different email or register for one at wwww.gmail.com ");
      }
    }
  }
  if (req.body.email === "") {
    return res.end("Please fill out email section");
  } else if (req.body.password === "") {
    return res.end("Please fill out password section");
  } else {

    var rndmString = generateRandomString();
    users[rndmString] = {
      id: rndmString,
      email: req.body.email,
      hashedPassword: bcrypt.hashSync(req.body.password, 10)
    };
    req.session.user_id = rndmString;
    res.redirect("/urls");
  }
});

app.post("/urls", (req, res) => {

  if (req.session["user_id"] !== undefined) {
    var rndmString = generateRandomString();
    urlDatabase[rndmString] = {
      id: rndmString,
      userID: req.body.userID,
      url: req.body.longURL
    };

    return res.redirect("/urls/" + rndmString);
  } else {
    res.end("Invalid, please create an account first");
  }
});

app.post("/urls/:id", (req, res) => {

  if (req.session["user_id"] !== undefined && req.session["user_id"] === urlDatabase[req.body.shortURL].userID) {
    var fullURL = req.body.newLongURL;
    var shortURL = req.body.shortURL;
    urlDatabase[req.body.shortURL].url = req.body.newLongURL;
    return res.redirect("/urls");
  } else {
    res.end("Invalid, unable to modify URL, please log in with a valid account first");
  }
});

app.post("/urls/:id/delete", (req, res) => {
  if (urlDatabase[req.params.id].userID === users[req.session["user_id"]].id) {
    delete urlDatabase[req.params.id];
    return res.redirect("/urls");
  } else {
    res.end("Unable to delete, only logged in user may delete files");
  }
});
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`example listening on port ${PORT}!`);
});


function generateRandomString() {
  var text = "";
  var possible = "abcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

function urlsForUser(id) {
  var userUrls = {};
  for (var urlID in urlDatabase) {
    if (urlDatabase.hasOwnProperty(urlID)) {
      if (urlDatabase[urlID].userID === id) {
        userUrls[urlID] = urlDatabase[urlID];
      }
    }
  }
  return userUrls;
}




