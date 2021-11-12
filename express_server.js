const express = require('express');
const app = express();
const PORT = 8080;

const bcrypt = require('bcryptjs');


const cookieParser = require('cookie-parser')
app.use(cookieParser())


const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true})); 

app.set("view engine", "ejs")


const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
};

const users = { 
  "aJ48lW": {
    id: "aJ48lW", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

app.get("/login", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies['uid']] };

  res.render("urls_login", templateVars)
})

app.post('/login', (req, res) => {
  console.log(req.body)
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
   let bpassword = bcrypt.compareSync(password, hashedPassword)
  if (email === "" || bpassword === "") {
    res.status(400).send("Email or password missing")
    return;
  } else if (email && bpassword) {
    
    const user = getUserByEmail(email, users);
    console.log(users)
    if (user) {
      const userId = user.id;
      // users[userId] = {
      //   userId,
      //   email: email,
      //   password: password
      // };
      res.cookie("uid", userId)
      res.redirect('/urls');
    } else {
      const errorMessage = 'Invalid email or password';
      res.status(400)
      res.redirect('/login')
    }
  }
});

app.post('/logout', (req, res) => {
  res.clearCookie('uid')
  res.redirect('/login')
});


  app.get('/', (req, res) => {
      res.send("Hello!");
  });

  app.get("/urls.json", (req, res) => {
      res.json(urlDatabase)
  })

  app.get("/register", (req, res) => {
    const templateVars = { urls: urlDatabase, user: users[req.cookies['uid']] };
res.render("urls_register", templateVars)
  })

  

  app.post("/register", (req, res) => {     /////////////////////////////////
    const { email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    if (email === "" || password === "") {
      res.status(400).send("Email or password missing")
      return;
    } else if (email && password) {
      if (!getUserByEmail(email, users)) {
        const userId = generateRandomString();
        users[userId] = {
          userId,
          email: email,
          password: hashedPassword
        };
        req.cookies.uid = userId;
        res.cookie('uid', userId);
        res.redirect('/urls');
      } else {
        const errorMessage = 'Cannot create new account, because this email address is already registered.';
        res.status(400).send(errorMessage);
      }
    }
    // const uid = generateRandomString()
    //  users[uid] = {uid, email: req.body.email, password: req.body.password};
    //  res.cookie('uid', uid);
    // res.redirect("/urls");
  })

  app.get("/urls", (req, res) => {
    const templateVars = { 
      urls: urlDatabase,
       user: users[req.cookies['uid']],
       status: 400,
        message: "You shold be logged in to see this content"
   };
    if (templateVars.user) {
      res.render("urls_index", templateVars);
    } 
    return res.render("urls_error", templateVars)
  })

app.get("/urls/new", (req, res) => {
  const templateVars = {user: users[req.cookies['uid']], status: 400, message: "You shold be logged in to see this content"}
  if (templateVars.user) {
    return res.render("urls_new", templateVars);
  } 
  return res.render("urls_error", templateVars)
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  if (req.cookies.uid) {
   const shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL: req.body.longURL, userId: req.cookies.uid}
    return res.redirect(`/urls`);
  }
  res.status(400).send("You can not make the action")
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  console.log(shortURL)
  console.log(urlDatabase)
  const longURL = urlDatabase[shortURL].longURL;
  console.log(longURL)
  res.redirect(longURL);
});
/////////////****** *
app.get("/urls/:shortURL", (req, res) => {
  console.log(req.params.shortURL)
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL]?.longURL, 
    status: 403,
    message: 'You are not allowed to edit that TinyURL',
    user: users[req.cookies.uid]
  };
  const shortURL = req.params.shortURL
  console.log(req.cookies.uid === urlDatabase[shortURL]?.userID)
  if (req.cookies.uid === urlDatabase[shortURL]?.userID && req.cookies.uid !== undefined) {

    res.render("urls_show", templateVars)
  } else {
    res.render("urls_error", templateVars);
  }

});


// UPDATE => update the info in the db
app.post('/urls/:shortURL', (req, res) => {   
  // extract the id
  const shortURL = req.params.shortURL;
  // extract the question and anwer
  const longURL = req.body.longURL;
  // update the db
  urlDatabase[req.params.shortURL].longURL = longURL
  // redirect
  res.redirect('/urls');

})

app.post("/urls/:shortURL/delete", (req, res) =>{
  // extract the id
  const shortURL = req.params.shortURL;
  if (req.cookies.uid === urlDatabase[shortURL].userID) {
    // delete this from db
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    let templateVars = {
      status: 401,
      message: 'You are not allowed to delete that TinyURL',
      user: users[req.cookies.uid]
    }
    res.status(401);
    res.render("urls_error", templateVars);
  }

  // res.redirect("/urls");
})

  app.get('/hello', (req, res) => {
      res.send("<html><body>Hello <b>World</b></body></html>\n")
  })

  app.get("/set", (req, res) => {
    const a = 1;
    res.send(`a = ${a}`);
   });
   
   app.get("/fetch", (req, res) => {
    res.send(`a = ${a}`);
   });

   

  app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
  })




  const generateRandomString = function () {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  const getUserByEmail = (email, database) => {
    for (const user in database) {
      if (database[user].email === email) {
        return database[user];
      }
    }
    return undefined;
  };

  const urlsForUser = (id, database) => {
    let filtered = {};
    for (const shortURL in database) {
      if (database[shortURL].userID === id) {
        userUrls[shortURL] = database[shortURL];
      }
    }
    return filtered;
  };