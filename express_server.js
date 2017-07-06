var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
var bodyParser = require("body-parser");
var cookieParser = require('cookie-parser')
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());


app.set("view engine", "ejs")

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  var templateVars = {
    urls: urlDatabase,
    username: req.cookies['user_id']
  };
  console.log(templateVars);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  var templateVars = {
    username: req.cookies['user_id']
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  var templateVars = {
    shortURL: req.params.id,
    fullURL: urlDatabase[req.params.id],
    username: req.cookies['user_id']
  };
  res.render("urls_show", templateVars);
});
app.get("/login", (req, res) => {
  var cookie = req.cookies['user_id']
  var templateVars = { users: users[cookie] }
  res.render("login", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  var longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id', req.body.username);
  res.redirect("/urls");

});

app.get("/logout", (req, res) => {
  res.clearCookie('user_id', req.body.username);
  res.redirect("/urls");

 });




app.post("/urls", (req, res) => {
  console.log(req.body);
  var fullURL = req.body.longURL;
  var newRST = generateRandomString();
  urlDatabase[newRST] = fullURL;
  res.redirect('/urls/' + newRST);
});
//step 9 User Register ASsesment
app.post("/login", (req, res) => {
  console.log(req.body);
  for (var id in users) {
    if (req.body.email === users[id].email ) {
      if (req.body.password === users[id].password) {
        res.cookie('user_id', id);
        res.redirect('/urls');
      } else {
        res.status(403).send("Password does not match");
        return;
      }
    }
  }
  res.status(403).send("User email not found");
  return;

});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.post("/urls/:id", (req, res) => {
  console.log(req.body);
  var fullURL = req.body.newLongURL;
  var shortURL = req.body.shortURL;
  urlDatabase[shortURL] = fullURL;
  res.redirect('/urls');
});


app.post("/register", (req, res) => {

  if (!req.body.email || !req.body.password) {
    res.status(400).send('Enter an email and password, fields cannot be empty');
    return;
  }

  for (var id in users) {
    if (req.body.email === users[id].email){
      res.status(400).send('Sorry, someone has already registered with that email');
      return;
    }
  }
var newUser = generateRandomString();
//set  up
  users[newUser] = {
    id: newUser,
    email: req.body.email,
    password: req.body.password
  }
  res.cookie('user_id', newUser);
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example listening on port ${PORT}!`);
});

function generateRandomString() {
  var text = "";
  var possible = "abcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}


