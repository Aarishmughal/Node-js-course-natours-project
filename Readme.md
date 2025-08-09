# Express.JS

Express is a minimal Node.JS framework which means it is built on top of Node.JS. It allows us to develop applications much faster as it comes out-of-box with great features like:

- handling complex routing
- easier handling of requests
- adding middleware
- server-side rendering, etc.

It also allows organizing the application into MVC architecture.

## Table of Contents

[Express.JS](#expressjs)
- [RESTful APIs](#restful-apis)
- [Sending back Data Formatting: JSend](#sending-back-data-formatting-jsend)
- [Recieving Data from the Client: Middleware](#recieving-data-from-the-client-middleware)
- [Handling POST Data](#handling-post-data)
- [Sending and Handling Parameters](#sending-and-handling-parameters)
- [Refactoring Express Routes](#refactoring-express-routes)
- [Middleware in Express](#middleware-in-express)
- [Morgan Logging Middleware](#morgan-logging-middleware)
- [Modularize Router(s)](#modularize-routers)
- [Refactoring File(s)](#refactoring-files)
- [Params Middleware](#params-middleware)
- [Chaining Middlewares on a Route](#chaining-middlewares-on-a-route)
- [Serving Static Files](#serving-static-files)
- [Environment Variables](#environment-variables)

**[ESLint & Prettier](#eslint--prettier)**

## Final File Structure

```
=> /controllers
	==> /tourController.js
	==> /userController.js
=> /routes
	==> /tourRoutes.js
	==> /userRoutes.js
=> /node_modules
=> /app.js
=> /server.js
=> /packages.json
=> /Readme.md
```

## RESTful APIs

Some rules to follow when creating RESTful APIs:

1. Separate API into Logical Resources.
2. Expose structured, resource-based URLs.
3. Use HTTP Methods (verbs).
4. Send data as JSON (usually).
5. Be Stateless.

For example,

```javascript
/addNewTour         ->  BAD Example
POST: /tours/{id}   ->  GOOD Example

/getTour            ->  BAD Example
GET: /tours         ->  GOOD Example

/updateTour            ->  BAD Example
PUT/PATCH: /tours/{id} ->  GOOD Example

/deleteTour         ->  BAD Example
DELETE: /tours/{id} ->  GOOD Example

/getToursByUser        ->  BAD Example
GET: /users/{id}/tours ->  GOOD Example

/deleteToursByUser             ->  BAD Example
DELETE: /users/{id}/tours/{id} ->  GOOD Example
```

## Sending back Data Formatting: JSend

1. Format the data into a variable using `JSON.parse()`.
    ```javascript
    const dataToSend = JSON.parse(
    	fs.readFileSync(`${__dirname}/.../tours-simple.json`, 'utf-8'),
    );
    ```
2. Use the `.json()` method on `res` when sending back response.
    - Example Use:

    ```javascript
    res.status(200).json({
    	status: 'success',
    	data: { tours: dataToSend },
    });
    ```

    _The key for the key-value pair in the `data` key, must always be equal to the API Resource Name._

3. In ES6 JavaScript, we do not need to specify name and value of the key-value pair, iff they are the same.
    ```javascript
    //...
    data: { tours: tours },
    // IS EQUAL TO
    data: { tours },
    ```
4. Good practice to include another key-value pair `results` as shown:
    ```javascript
    res.status(200).json({
    	status: 'success',
    	results: data.length,
    	data: {
    		//..
    	},
    });
    ```

## Recieving Data from the Client: Middleware

Middlware is basically a function that can modify the incoming Request Data. It's called middleware because it stands between in the middle of the request and the response.

- Add a new `middleware` in the file.
    ```javascript
    //...
    app.use(express.json());
    //...
    ```

## Handling POST Data

1. Middleware is absolutely necessary to handle POST data. Follow previous section to setup middleware.
2. After we have implemented middleware in our application, we now have access to the object `req.body`.
3. Assign new ID as follows:
    ```javascript
    const newId = tours[tours.length - 1].id + 1; // Get ID of last Entry
    const newTour = Object.assign({ id: newId }, req.body); // Create New Entry
    ```
4. Perform the operation on the POST data and send response.
    ```javascript
    fs.writeFile(
    	`${__dirname}/dev-data/data/tours-simple.json`,
    	JSON.stringify(tours), // `tours` is a plain javascript object. We want to save it as JSON
    	(err) => {
    		if (err) {
    			console.log(err);
    			return res.status(500).json({
    				status: 'error',
    				message: 'Failed to save the new tour.',
    			});
    		}
    		console.log('New Tour Added!');
    		res.status(201).json({
    			status: 'success',
    			data: {
    				tour: newTour,
    			},
    		});
    	},
    );
    ```

## Sending and Handling Parameters

Parameters can be send via the URL. They can be handled on the backend using the below steps:

1.  Define a new route with a placeholder for the parameter(s).
    ```javascript
    app.get('/api/v1/tours/:id', (req, res) => {});
    ```
2.  In this case, the parameter is `id` which can accessed via the object `req.params.id`.
3.  Error handling can be done via one of the following two ways:

    ```javascript
    if (idToGet > tours.length) //Option 01

    const tour = tours.find((el) => el.id === idToGet); //Option 02
    if (!tour)
    ```

- _There can be infinite parameters in a single route as follows:_
    ```javascript
    app.get('/api/v1/tours/:id/:name/:xyz', (req, res) => {
    	//...
    });
    ```
- _All declared placeholders must be sent from the client side unless parameters are optional. Parameters can be set optional if they are marked with a question mark `?` as shown:_
    ```javascript
    app.get('/api/v1/tours/:id/:name?/:xyz?', (req, res) => {
    	//...
    });
    ```
    Now `name` and `xyz` are optional parameters.

## Refactoring Express Routes

1. Different callback functions can be separated into different functions to enhance code readability.

- For Example, this code:
    ```javascript
    app.get('/api/v1/tours', (req, res) => {
    	//...
    });
    ```
- Can be changed into this:
    ```javascript
    const getAllTours = (req, res) => {
    	//...
    };
    app.get('/api/v1/tours', getAllTours);
    ```

2. Different routes can be shortened like as follows:
    ```javascript
    app.route('/api/v1/tours').get(getAllTours).post(createTour);
    app.route('/api/v1/tours/:id')
    	.get(getTour)
    	.patch(updateTour)
    	.delete(deleteTour);
    ```

## Middleware in Express

1. All functions that come between recieving a request and sending a response, are considered `middleware`. This includes all kinds of functions such as:

- Body Parser (`app.use(express.json())`)
- Logger Functions (`app.use(morgan('dev'))`)
- Setting Headers
- Routers

2. A middleware has access to the default `req` and `res` objects when the request hits the server. Middlewares also has access to another method called `next()`. This method is very important as it causes the `req/res` objects to move through the request/response cycle. i.e into the next middleware.

3. Position is very important in middlewares. Any middleware placed after sending the response, is NOT PART of the request/response cycle.

## Morgan Logging Middleware

1. Morgan is a loggin middleware for EXPRESS. It's imported via:

    ```javascript
    const morgan = require('morgan');
    app.use(morgan('dev'));
    ```

2. It logs different information about the request response cycle in the console.

## Modularize Router(s)

1. When there are more than one resources in the Application, it can get cluttered really quickly with the routers.
    ```javascript
    app.route('/api/v1/tours').get(getAllTours).post(createTour);
    app.route('/api/v1/tours/:id')
    	.get(getTour)
    	.patch(updateTour)
    	.delete(deleteTour);
    //....MORE ROUTES FOR OTHER RESOURCES
    ```
2. Good thing in express is that we can modularize our routers in terms of separate router(s) sub-applications. We then call those sub-application(s) to act as middleware in our main application.
    ```javascript
    const toursRouter = express.Router();
    app.use('/api/v1/tours', toursRouter);
    toursRouter.route('/').get(getAllTours).post(createTour);
    toursRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);
    ```

## Refactoring File(s)

1. Rather than working in one file and keeping everything in that one single file, we try to refactor our code intor separate files such as:

- Routers
- Controllers
- Server & App

2. Create a new file `routes/tourRoutes.js` for keeping all the routes related to the `tour` resource.

    ```javascript
    const express = require('express');
    const router = express.Router();
    router
    	.route('/')
    	.get(tourController.getAllTours)
    	.post(tourController.createTour);
    router
    	.route('/:id')
    	.get(tourController.getTour)
    	.patch(tourController.updateTour)
    	.delete(tourController.deleteTour);

    module.exports = router; // For exporting the router object
    ```

3. Create a new file `controllers/tourController.js` for keeping all the handlers/controller methods in it.

    ```javascript
    const fs = require('fs');

    const tours = JSON
    	.parse
    	//..reading file (temporary)
    	();
    exports.getAllTours = (req, res) => {
    	//..
    };
    exports.getTour = (req, res) => {
    	//..
    };
    exports.createTour = (req, res) => {
    	//..
    };
    exports.updateTour = (req, res) => {
    	//..
    };
    exports.deleteTour = (req, res) => {
    	//..
    };
    ```

4. Separate the Express Logic from other Node.JS module code by making a new file `server.js`.

    ```javascript
    //app.js
    //...
    module.exports = app;

    //server.js
    const app = require('./app');
    // LISTENERf
    const PORT = 3000;
    app.listen(PORT, () => {
    	console.log(`App is Listening on: ${PORT}`);
    });
    ```

    - Add a new script in `packages.json`:
        ```bash
        ...
        "start":"nodemon server.js",
        ...
        ```

5. Remember to `export` methods and objects from these file.
    ```javascript
    module.exports = router; // 'routes/tourRoutes.js'
    //...
    exports.getAllTours = (req, res) => {
    	//...
    };
    ```

## Params Middleware

1. Instead of checking ids and other parameters sent with the request in the handler/controller method, it is a far better strategy to contain this logic in a separate middleware.
2. Just above the handler methods in the controller:
    ```javascript
    exports.checkId = (req, res, next, val) => {
    	if (val * 1 > tours.length) {
    		console.log(`Invalid ID: ${val}`);
    		return res.status(404).json({
    			status: 'fail',
    			message: 'Invalid ID',
    		});
    	}
    	next();
    };
    ```
3. In the router, import this method as a middleware to the `router` object above the routes.
   `javascript
router.param('id', tourController.checkId);
`
   _This middleware will now be used with every request sent to the respective router (only if there is a parameter specified in the middleware, sent with the request)_

## Chaining Middlewares on a Route

1. Multiple middlewares can be chained on a single route.
    ```javascript
    //controller_code
    exports.checkBody = (req, res, next) => {
    	if (!req.body.name || !req.body.price) {
    		console.log(`Invalid Name or Price`);
    		return res.status(400).json({
    			status: 'fail',
    			message: 'Invalid Name or Price',
    		});
    	}
    	next();
    };
    ```
2. In the router, we can chain this middleware with the route as follows:
    ```javascript
    router
    	.route('/')
    	.get(tourController.getAllTours)
    	.post(tourController.checkBody, tourController.createTour);
    ```

## Serving Static Files

1. In express, we can serve static files using the express built-in middleware `express.static()`.
    ```javascript
    app.use(express.static(`${__dirname}/public`));
    ```
2. All FILES in the `public` directory are now served on the node server.

## Environment Variables

1. Environment variables are used to store sensitive information such as API keys, database credentials, etc.
2. In Node.JS, we can use the `dotenv` package to manage environment variables
    ```bash
    npm install dotenv
    ```
3. Create a `.env` file in the root directory of your project and add your environment variables there:
    ```
    PORT=3000
    DATABASE_URL=mongodb://localhost:27017/mydatabase
    SECRET_KEY=mysecretkey
    ```
4. In your `app.js` or `server.js`, import the `dotenv` package and call the `config()` method to load the environment variables:
    ```javascript
    require('dotenv').config();
    const PORT = process.env.PORT || 3000;
    const DATABASE_URL = process.env.DATABASE_URL;
    const SECRET_KEY = process.env.SECRET_KEY;
    ```
5. Now you can access these environment variables using `process.env.VARIABLE_NAME` throughout your application.
6. Make sure to add `.env` to your `.gitignore` file to prevent it from being committed to version control:
    ```
    # .gitignore
    .env
    ```

# ESLint & Prettier

1. **ESLint** is a tool for identifying and reporting on patterns found in ECMAScript/JavaScript code. It helps maintain code quality and consistency.
2. **Prettier** is an opinionated code formatter that ensures your code is formatted consistently across your project.
3. To set up ESLint and Prettier in your project, follow these steps:
    ```bash
    npm install --save-dev eslint prettier eslint-config-prettier eslint-plugin-prettier
    ```
    OR
    ```json
    //...
    "devDependencies": {
    	"cross-env": "^10.0.0",
    	"eslint": "^8.57.1",
    	"eslint-config-airbnb": "^19.0.4",
    	"eslint-config-node": "^4.1.0",
    	"eslint-config-prettier": "^10.1.8",
    	"eslint-plugin-import": "^2.32.0",
    	"eslint-plugin-jsx-a11y": "^6.10.2",
    	"eslint-plugin-node": "^11.1.0",
    	"eslint-plugin-prettier": "^5.5.4",
    	"eslint-plugin-react": "^7.37.5",
    	"prettier": "^3.6.2"
    }
    ```
4. An eslint configuration is included in this directory as `.eslintrc.json`. You can modify it according to your project's needs. or simply copy it into your project root directory.
