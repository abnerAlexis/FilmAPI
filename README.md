# Setting up an Express Project
1. Install
```
    npm init -y
    npm install express --save
    npm install nodemon --save-dev  //will be used in development mode
```
 2. Create a gitignore file
 3. Create the core file server.js and change the js file name in package.json from index.js to server.js
 4. Build the express server
 ```
    const express = require('express');
    const app = express();  

//  Endpoints come in here

    app.listen(8080, () => {
        console.log('Listening at port 8080.');
    });
 ```
 5. Set up an <strong style="color:lightgreen">endpoint</strong> to begin with. This should be set before listen method.
 ```
    app.get('/', (req, res) => {
        res.send('');
    })
 ```

 6. In package.json, add the  following line in scripts
 ```
     "start": "node server.js",
    "dev": "nodemon server.js"
 ```
 so it would look like this;
 ```
    "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
 ```
 ## why start: 
 "start": "node server.js" starts running the server when you type on termial the following
 ```
    npm start
 ```

  ## why nodemon: 
 "dev": "nodemon server.js" allow the server refresh after changes instead of restarting the server after each change. 

 Type the following  to start on terminal
 ```
    npm run dev
 ```

 After this when you make changes, server will compile itself thanks to nodemon.
 7. Install uuid and body-parser
 ```
   npm install uuid
   npm install body-parser
 ```

 8. From vscode extentions, find <strong style="color:lightgreen">Thunder Client</strong> and add it to your tools. This allows you to test the endpoints you created. Just lioke <strong style="color:lightgreen">Postman</strong>.
 