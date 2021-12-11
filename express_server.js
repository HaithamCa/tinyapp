const {
  getUserByEmail,
  generateRandomString,
  urlsForUser,
} = require("./helpers");
const express = require("express");
var cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const app = express();
const PORT = 8080;

app.use(
  cookieSession({
    name: "session",
    keys: ["relly-hard-this-part", "what-ever"],
  })
);
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

// Those users will not work because of the hash password just for a new ones
const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.get("/login", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.session["uid"]] };

  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;
  if (email === "" || password === "") {
    const errorMessage = "Email or password missing";
    return res.render("urls_error", {
      message: errorMessage,
      status: 403,
      user: null,
    });
  }
  const user = getUserByEmail(email, users);
  if (!user) {
    const errorMessage = "Invalid email";
    return res.render("urls_error", {
      message: errorMessage,
      status: 403,
      user: null,
    });
  }
  console.log("users", users);
  console.log("user 61:", user);
  let passwordsMatch = bcrypt.compareSync(password, user.password);
  if (passwordsMatch) {
    console.log(users);
    req.session.uid = user.id;
    return res.redirect("/urls");
  }
  const errorMessage = "Invalid email or password";
  res.render("urls_error", { message: errorMessage, status: 403, user: null });
});

app.post("/logout", (req, res) => {
  req.session.uid = null;
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.session["uid"]] };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (email === "" || password === "") {
    res.status(400).send("Email or password missing");
    return;
  } else if (email && password) {
    if (!getUserByEmail(email, users)) {
      const userId = generateRandomString();
      users[userId] = {
        id: userId,
        email: email,
        password: hashedPassword,
      };
      req.session.uid = userId;
      res.redirect("/urls");
    } else {
      const errorMessage =
        "Cannot create new account, because this email address is already registered.";
      res.status(400).send(errorMessage);
    }
  }
});

app.get("/urls", (req, res) => {
  // get the urls of this users
  const user = users[req.session["uid"]];
  if (!user) {
    const templateVars = {
      user: user,
      status: 400,
      message: "You shold be logged in to see this content",
    };
    return res.render("urls_error", templateVars);
  }
  console.log("user 113:", user);
  const userId = user.id;
  console.log("userId", userId);
  const userUrls = urlsForUser(userId, urlDatabase);
  console.log("userUrls 114:", userUrls);
  const templateVars = {
    urls: userUrls,
    user: user,
  };
  return res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);
  if (req.session.uid) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.uid,
    };
    console.log("urlDatabase 131:", urlDatabase);
    return res.redirect("/urls");
  }
  res.status(400).send("You can not make the action");
});

app.get("/urls/new", (req, res) => {
  const user = users[req.session["uid"]];
  console.log("user 139:", user);
  const templateVars = {
    user: user,
    status: 400,
    message: "You shold be logged in to see this content",
  };
  if (templateVars.user) {
    return res.render("urls_new", templateVars);
  }
  return res.render("urls_error", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  console.log(shortURL);
  console.log(urlDatabase);
  const longURL = urlDatabase[shortURL].longURL;
  console.log(longURL);
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  console.log(req.params.shortURL);
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]?.longURL,
    status: 403,
    message: "You are not allowed to edit that TinyURL",
    user: users[req.session.uid],
  };
  const shortURL = req.params.shortURL;
  console.log(req.session.uid === urlDatabase[shortURL]?.userID);
  console.log("urlDatabase[shortURL]?.userID", urlDatabase[shortURL]?.userID);
  console.log("req.session.uid", req.session.uid);
  if (
    req.session.uid === urlDatabase[shortURL]?.userID &&
    req.session.uid !== undefined
  ) {
    res.render("urls_show", templateVars);
  } else {
    res.render("urls_error", templateVars);
  }
});

// UPDATE => update the info in the db
app.post("/urls/:shortURL", (req, res) => {
  // extract the id
  const shortURL = req.params.shortURL;
  // extract the question and anwer
  const longURL = req.body.longURL;
  // update the db
  urlDatabase[req.params.shortURL].longURL = longURL;
  // redirect
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  // extract the id
  const shortURL = req.params.shortURL;
  if (req.session.uid === urlDatabase[shortURL].userID) {
    // delete this from db
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    let templateVars = {
      status: 401,
      message: "You are not allowed to delete that TinyURL",
      user: users[req.session.uid],
    };
    res.status(401);
    res.render("urls_error", templateVars);
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
