const express = require('express');
const app = express();
const PORT = 8080;

const cookieParser = require('cookie-parser')
app.use(cookieParser())


const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true})); 

app.set("view engine", "ejs")



// res.render("urls_index", templateVars);

// app.get('/login', (req, res) => {
// res.render('_header') 
// });
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

app.get("/login", (req, res) => {
  const templateVars = { urls: urlDatabase, userId: users[req.cookies['uid']] };

  res.render("urls_login", templateVars)
})

app.post('/login', (req, res) => {
  console.log(req.body)
  const templateVars = { urls: urlDatabase, userId: users[req.cookies['uid']] };
  // const username = req.body.username;

  const { email, password } = req.body;
    
  if (email === "" || password === "") {
    res.status(400).send("Email or password missing")
    return;
  } else if (email && password) {
    if (getUserByEmail(email, users)) {
      const userId = generateRandomString();
      users[userId] = {
        userId,
        email: email,
        password: password
      };
      // req.cookies.userId = userId;
      res.cookie("uid", userId)
      res.redirect('/urls');
    } else {
      const errorMessage = 'Invalid email or password';
      res.status(400).send(errorMessage);
    }
  }
  // res.cookie('uid', templateVars);
// res.redirect('/urls')
});

app.post('/logout', (req, res) => {
  res.clearCookie('uid')
  res.redirect('/login')
});

const urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
  };

  app.get('/', (req, res) => {
      res.send("Hello!");
  });

  app.get("/urls.json", (req, res) => {
      res.json(urlDatabase)
  })

  app.get("/register", (req, res) => {
    const templateVars = { urls: urlDatabase, userId: users[req.cookies['uid']] };
res.render("urls_register", templateVars)
  })

  

  app.post("/register", (req, res) => {     /////////////////////////////////
    const { email, password } = req.body;
    
    if (email === "" || password === "") {
      res.status(400).send("Email or password missing")
      return;
    } else if (req.body.email && req.body.password) {
      if (!getUserByEmail(req.body.email, users)) {
        const userId = generateRandomString();
        users[userId] = {
          userId,
          email: req.body.email,
          password: req.body.password
        };
        req.cookies.userId = userId;
        res.redirect('/urls');
      } else {
        const errorMessage = 'Cannot create new account, because this email address is already registered.';
        res.status(400).send(errorMessage);
      }
    }


    const uid = generateRandomString()
     users[uid] = {uid, email: req.body.email, password: req.body.password};
     res.cookie('uid', uid);
    res.redirect("/urls");
  })

  app.get("/urls", (req, res) => {
    const templateVars = { urls: urlDatabase, userId: users[req.cookies['uid']] };
  res.render("urls_index", templateVars);
})

app.get("/urls/new", (req, res) => {
  const templateVars = {userId: users[req.cookies['uid']]}
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  console.log(shortURL)
  console.log(urlDatabase)
  const longURL = urlDatabase[shortURL];
  console.log(longURL)
  res.redirect(longURL);
});
/////////////****** *
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.body.longURL], userId: users[req.cookies['uid']]};
  res.render("urls_show", templateVars);
});


// UPDATE => update the info in the db
app.post('/urls/:shortURL', (req, res) => {    ////////////////////////////////////////////
  // extract the id
  const shortURL = req.params.shortURL;
  // extract the question and anwer
  const longURL = req.body.longURL;
  // update the db
  urlDatabase[req.params.shortURL] = longURL
  // redirect
  res.redirect('/urls');

})

app.post("/urls/:shortURL/delete", (req, res) =>{
  // extract the id
  const shortURL = req.params.shortURL;
  // delete this joke from db
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
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