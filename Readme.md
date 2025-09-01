# Table of Contents

**[Express.JS](#expressjs)**

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

- [Adding files to .gitignore](#adding-files-to-gitignore)

**[MongoDB & Mongoose](#mongodb--mongoose)**

- [MongoDB](#mongodb)
- [npm MongoDB & Mongoose](#npm-mongodb--mongoose)
- [Connecting Mongo Atlas Database with Node App](#connecting-mongo-atlas-database-with-node-app)
- [Performing CRUD Operations via Node.js App & Mongoose](#performing-crud-operations-via-nodejs-app--mongoose)
    - [Creating Documents](#creating-documents)
    - [Getting Documents](#getting-documents)
    - [Updating Documents](#updating-documents)
    - [Deleting Documents](#deleting-documents)
- [Improving Modelling](#improving-modelling)
- [Writing an Importing/Erasing Script](#writing-an-importingerasing-script)
- [Improving the API by adding Features](#improving-the-api-by-adding-features)
    - [Filtering Documents](#filtering-documents)
    - [Advanced Filtering Documents](#advanced-filtering-documents)
    - [Sorting Documents](#sorting-documents)
    - [Field Limiting](#field-limiting)
    - [Pagination & Limit Documents](#pagination--limit-documents)
    - [Await the Query](#await-the-query)
    - [Aliasing Common Routes](#aliasing-common-routes)
- [MongoDB Aggregation Pipeline](#mongodb-aggregation-pipeline)
- [Virtual Properties](#virtual-properties)
- [Mongoose Middlewares](#mongoose-middlewares)
    - [Document Middleware](#document-middleware)
    - [Query Middleware](#query-middleware)
    - [Aggregation Middleware](#aggregation-middleware)
- [Data Validation for Mongoose Models](#data-validation-for-mongoose-models)
    - [Built-in Validators](#built-in-validators)
    - [Third Party Validators](#third-party-validators)
    - [Custom Validators](#custom-validators)

**[Implementing Proper Error Handling](#implementing-proper-error-handling)**

- [Using `ndb` for Debugging](#using-ndb-for-debugging)
- [Handling Unhandled Routes](#handling-unhandled-routes)
- [Creating a Global Error Handling Middleware](#creating-a-global-error-handling-middleware)
- [Refactoring the Global Error Handling Middleware](#refactoring-the-global-error-handling-middleware)
- [Catching errors in Async Functions](#catching-errors-in-async-functions)
- [Using Correct HTTP Codes for Certain errors](#using-correct-http-codes-for-certain-errors)
- [Errors in Development Vs Production](#errors-in-development-vs-production)
- [Errors Outside Express](#errors-outside-express)

**[Implementing Security Measures](#implementing-security-measures)**

- [Making Model Fields Secure](#making-model-fields-secure)
- [Authentication Processes](#authentication-processes)
- [Advanced Postman Setup](#advanced-postman-setup)
- [Sending User's Emails using NodeMailer](#sending-users-emails-using-nodemailer)
- [Implementing updateMe & deleteMe Methods](#implementing-updateme--deleteme-methods)
    - [`updateMe()`](#updateme)
    - [`deleteMe()`](#deleteme)
- [Implementing Other Useful Techniques](#implementing-other-useful-techniques)
    - [Rate Limiting](#rate-limiting)
    - [Security HTTP Headers](#security-http-headers)
    - [Data Sanitization](#data-sanitization)
    - [HTTP Parameter Pollution](#http-parameter-pollution)

# Express.JS

Express is a minimal Node.JS framework which means it is built on top of Node.JS. It allows us to develop applications much faster as it comes out-of-box with great features like:

- handling complex routing
- easier handling of requests
- adding middleware
- server-side rendering, etc.

It also allows organizing the application into MVC architecture.

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
    	fs.readFileSync(
    		`${__dirname}/.../tours-simple.json`,
    		'utf-8',
    	),
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
    app.get(
    	'/api/v1/tours/:id/:name?/:xyz?',
    	(req, res) => {
    		//...
    	},
    );
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
    app.route('/api/v1/tours')
    	.get(getAllTours)
    	.post(createTour);
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
    app.route('/api/v1/tours')
    	.get(getAllTours)
    	.post(createTour);
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
    toursRouter
    	.route('/')
    	.get(getAllTours)
    	.post(createTour);
    toursRouter
    	.route('/:id')
    	.get(getTour)
    	.patch(updateTour)
    	.delete(deleteTour);
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
    	.post(
    		tourController.checkBody,
    		tourController.createTour,
    	);
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

## Adding files to .gitignore

1. Create a new `.gitignore` file if already not exists.
    ```bash
    touch .gitignore
    ```
2. Add the filename with extension in this file as simple plain text.
    ```txt
    node_modules
    config.env
    ```
3. Remove the files from the git cache.
    ```bash
    git rm --cached config.env
    ```

# MongoDB & Mongoose

## MongoDB

1. A NOsql database that is very versatile and lightweight.
2. Creates **DOCUMENTS** instead of **ROWS** for data values like in relational databases.
3. Creates **COLLECTIONS** instead of **TABLES** for holding rows like in relational databases.
4. Uses **BSON** for storage:
    - Similar to JSON.
    - Uses DataType restrictions
    - Max size for a BSON document is **16 MBs** which might increase in future.
    - Each Document contains a unique ID.
5. Each Document in MongoDB contains fields (Columns in Relational DB) as well as their values.
6. One single field could contain more than 1 value (Unlike in Relational DB).
7. **Embedded Documents:**
    - Including related data into a single document.
    - This could mean multiple documents into one single document.
    - This is also called "DENORMALIZING" as it's opposite to what happens in Normalizing in Relational Databases.
    - Simply, documents into documents.

## npm MongoDB & Mongoose

1. An NPM Package that allows us to connect our MongoDB with our Node App and perform operations on the Database.
2. Similar to mongoDb except `Mongoose` offers many useful methods out-of-the-box.

## Connecting Mongo Atlas Database with Node App

1. Open Mongo Atlas > YOUR DATABASE > YOUR CLUSTER.
2. Open the Connect Wizard and copy the `Connection String`.
3. Create a new file `config.env` in the project filder for storing [`ENVIRONMENT_VARIABLES`](#environment-variables).
4. Create a new variable in this config file.
    ```env
    DATABASE=[CONNECTION STRING HERE]
    DATABASE_PASSWORD=[DATABASE USER PASSWORD]
    ```
5. Use a placeholder of your own in the Connection String instead of the user password like `<DATABASE_PASSWORD>`.
6. Form the correct Connection String in the file `server.js` by following the code below:
    ```javascript
    const mongoose = require('mongoose');
    const dotenv = require('dotenv');
    //...
    dotenv.config({
    	path: './config.env',
    });
    const DB = process.env.DATABASE.replace(
    	'<DATABASE_PASSWORD>',
    	process.env.DATABASE_PASSWORD,
    );
    mongoose
    	.connect(DB, {
    		useNewUrlParser: true,
    		useCreateIndex: true,
    		useFindAndModify: false,
    	})
    	.then(() => {
    		console.log('Database Connection Successful!');
    	});
    ```
7. Launch the node app and database will connect automatically.

## Performing CRUD Operations via Node.js App & Mongoose

### Creating Documents

1. In the controller, edit the create method:
    ```javascript
    //...
    async (req, res) => {
    	const newTour = new Tour({});
    	newTour.save(); // LEGACY METHOD
    	//...
    	try {
    		const newTour = await Tour.create(req.body);
    		res.status(201).json({
    			status: 'success',
    			data: {
    				tour: newTour,
    			},
    		});
    	} catch (err) {
    		res.status(400).json({
    			status: 'fail',
    			message: 'Invalid Data Sent!',
    		});
    	}
    };
    ```
2. Simple Graphical view of process of adding a new document can be simple as follows:

    ```c++
    // LEGACY METHOD
    Mongoose => Schema => Data Object Model => Document => Methods

    // MODERN METHOD
    Mongoose => Schema => Data Object Model => Methods
    ```

### Getting Documents

1. In the controller method, to get all tours on the get request.
    ```javascript
    const getAllTours = async (req, res) => {
    	const tours = await Tour.find();
    	res.status(200).json({
    		status: 'success',
    		results: tours.length,
    		data: { tours },
    	});
    };
    ```
2. This will return all the tours without any query or filtering.

### Updating Documents

1. For updating, we use the PATCH http method.
    ```javascript
    const tourToUpdate = await Tour.findByIdAndUpdate(
    	req.params.id,
    	req.body,
    	{
    		new: true, // New Updated Document will be returned
    		runValidators: true, // Run Schema's Validation Rules once again
    	},
    );
    res.status(200).json({
    	status: 'success',
    	data: {
    		tour: tourToUpdate,
    	},
    });
    ```
2. This will send back the updated tour with the updated data.

### Deleting Documents

1. We handle the delete request with the DELETE http method.
    ```javascript
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
    	status: 'success',
    	message: 'Tour Deleted!',
    	data: null,
    });
    ```
2. Since it returns null, so we do not have to save the value into any variable.

## Improving Modelling

1. This section is better understandable in the light of an example.
    ```javascript
    //...
    name: {
    	type: String,
    	required: [true, 'A Tour must have a Name.'],
    	unique: true,
    	trim: true,
    },
    //...
    ```
2. Each property type have different options that can be applied to the property. For example `String` data type has the option `trim:true`. This option removes the whitespace in the start and end of a string value.
3. `required` option accepts an array with first being a boolean and the next being the error message to return in case validation isn't passed.
4. In the example,
    ```javascript
    //...
    ratingsAverage: { type: Number, default: 4.5 },
    //...
    ```
    The `default` option allows a default value to be stored for every instance of the schema model (each document).
5. A property can have multiple values by:
    ```javascript
    //...
    images: [{ type: String }],
    //...
    ```
    This allows multiple values to be stored under the `images` property via an array.

## Writing an Importing/Erasing Script

1. During development, the process can be made more quick and smooth by using a small custom script that does the loading and off-loading of json data from a json file to the database.
2. Usually a better idea to make such script next to the dev-data json file.
3. Connect to the database.

    ```javascript
    const fs = require('fs');
    const mongoose = require('mongoose');
    const dotenv = require('dotenv');

    const Tour = require('./../../models/tourModel');

    dotenv.config({
    	path: './config.env',
    });
    const DB = process.env.DATABASE.replace(
    	'<DATABASE_PASSWORD>',
    	process.env.DATABASE_PASSWORD,
    );
    mongoose
    	.connect(DB, {
    		useNewUrlParser: true,
    		useCreateIndex: true,
    		useFindAndModify: false,
    	})
    	.then(() => {
    		console.log('Database Connection Successful!');
    	});
    ```

4. Read the JSON File.
    ```javascript
    // READ JSON FILE
    const tours = JSON.parse(
    	fs.readFileSync(
    		`${__dirname}/tours-simple.json`,
    		'utf-8',
    	),
    );
    ```
5. Create methods by following the code below:
    ```javascript
    // IMPORT DATA INTO DATABASE
    const importData = async () => {
    	try {
    		await Tour.create(tours);
    		console.log('Data Successfully Loaded!');
    	} catch (err) {
    		console.log(err);
    	}
    	process.exit();
    };
    //...
    // DELETE ALL EXISTING DATA FROM COLLECTION
    const deleteData = async () => {
    	try {
    		await Tour.deleteMany();
    		console.log('Data Successfully Deleted!');
    	} catch (err) {
    		console.log(err);
    	}
    	process.exit();
    };
    ```
6. You may control your script by using the `process` object as follows:
    ```javascript
    if (process.argv[2] === '--import') {
    	importData();
    } else if (process.argv[2] === '--delete') {
    	deleteData();
    }
    ```
    To control your script your command now must accept a third argument like this:
    ```bash
    node [script-filename] --import
    ```
    OR
    ```bash
    node [script-filename] --delete
    ```

## Improving the API by adding Features

To improve our API, we'll include different features such as filtering, advanced filtering, sorting, field limits, pagination, etc.
The standard process to implement these features is as follows:

```
GENERAL FILTERING
Controller Method
    => Building Query
        => Get Query Object
            => Define Excluded Fields
                => Remove Excluded Fields from Query Object

ADVANCED FILTERING
=> Create a new String by stringifying Query object
    => Replace Advanced Filtering Keywords in query with '$' in start
        => Create a new Object 'query' by using `find()` method.

SORTING
=> Check if there is 'sort' in query.
    => Get all sorting columns.
        => Update the 'query' object by using `sort()` method.
        => Minus in column names acts as excluder.

LIMITING FIELDS
=> Check if there is 'fields' in query
    => Get all required fields.
        => Update the 'query' object by using `select()` method.
        => Minus in column names acts as excluder.

PAGINATION
=> Get Page number from query.
=> Get Limit Value from query.
    => Compute value of `skip`.
        => Get specified documents by skipping `skip` amount of documents.
            => Error handle if page doesn't exist.

EXECUTE QUERY
=> Await `query` object and save it into another variable.
```

### Filtering Documents

1. First extract the query object from the request object.
    ```javascript
    const queryObj = { ...req.query };
    ```
2. Specify words to be excluded in an array.
    ```javascript
    const excludedFields = [
    	'page',
    	'sort',
    	'limit',
    	'fields',
    ];
    ```
3. Remove the exluded fields from the query object.
    ```javascript
    excludedFields.forEach((el) => delete queryObj[el]);
    ```
4. Proceed to next advancements.

### Advanced Filtering Documents

1. Get String for the `query` object.
    ```javascript
    let queryStr = JSON.stringify(queryObj);
    ```
2. Form the Mongo Query from the string query.
    ```javascript
    queryStr = queryStr.replace(
    	/\b(gte|gt|lte|lt)\b/g,
    	(match) => `$${match}`,
    );
    ```
3. Store the final query in a new object `query`.
    ```javascript
    let query = Tour.find(JSON.parse(queryStr));
    ```

### Sorting Documents

1. Check if there exists a sorting keyword.
    ```javascript
    if (req.query.sort) {
    }
    ```
2. Get all sorting keyword from the request object using `split()` method.
    ```javascript
    const sortBy = req.query.sort.split(',').join(' ');
    ```
3. Mutate the `query` object created before using `sort()`.
    ```javascript
    query = query.sort(sortBy);
    ```
4. Add Error handling in case there is not sort object.
    ```javascript
    else {
    		query = query.sort('-createdAt');
    	}
    ```

### Field Limiting

1. Check if there exists a fields keyword.
    ```javascript
    if (req.query.fields) {
    }
    ```
2. Get all fields from the request object using `split()` method.
    ```javascript
    const fields = req.query.fields.split(',').join(' ');
    ```
3. Mutate the `query` object created before using `select()`.
    ```javascript
    query = query.select(sortBy);
    ```
4. Add Error handling in case there is not sort object.

    ```javascript
    else {
    		query = query.select('-__v'); // Minus acts as Excluder
    	}
    ```

### Pagination & Limit Documents

1. Get `page` count from the query & Convert it into Number.
    ```javascript
    const page = req.query.page * 1 || 1;
    ```
2. Same for `limit`.
    ```javascript
    const limit = req.query.limit * 1 || 1;
    ```
3. Calculate value for `skip`.
    ```javascript
    const skip = (page - 1) * limit;
    ```
4. Mutate the `query` object. Get all required documents by skipping `skip` number of documents.
    ```javascript
    query = query.skip(skip).limit(limit);
    ```
5. Perform error handling for invalid page number.
    ```javascript
    if (req.query.page) {
    	const numTours = await Tour.countDocuments();
    	if (skip >= numTours)
    		throw new Error('This page does not exist');
    }
    ```

### Await the Query

1. Execute the query and store it into a new variable.
    ```javascript
    const tours = await query;
    res.status(200).json({
    	status: 'success',
    	results: tours.length,
    	data: { tours },
    });
    ```

### Aliasing Common Routes

Sometimes, it is better to make separate route for common routes to increase server performance and reduce resources being used at each request. This also reduces additional code by utilizing the already written code.

1. In the router, create a new route.
    ```javascript
    router
    	.route('/top-5-cheap')
    	.get(
    		MIDDLEWARE_FUNCTION,
    		REGULAR_CONTROLLER_METHOD,
    	);
    ```
2. Create a new `MIDDLEWARE_FUNCTION` in the controller. This method will be used to alter the `req` object before it is passed to the `REGULAR_CONTROLLER_METHOD`.
    ```javascript
    // Controller
    exports.aliasTopTours = (req, res, next) => {
    	req.query.limit = '5';
    	req.query.sort = '-ratingsAverage,price';
    	req.query.fields =
    		'name,price,ratingsAverage,summary,difficulty';
    	next();
    };
    ```
3. This way now whenever anyone accesses this new route, the query is already built and passed to the controller method.

## MongoDB Aggregation Pipeline

A very powerful MongoDB framework.
The concept is to define a pipeline that all documents from a certain collection go throught where they are processed step by step in order to transform them into aggregated results.
For example, we can use the aggregation pipeline for calculating averages, minimum, maximum, etc.

1. We can use the aggregation pipeline on our Mongoos Schema Model via the `aggregate()` method. This method accepts an array of Javacript Objects. Each object is called an "AGGREGATION STAGE".
2. Each Javascript Object starts with the name of the Aggregation Stage as below:
    ```javascript
    //...
    const tours = await Tour.aggregate([
    	{
    		$match:{ ratingsAverage: { $gte: 4.5 } },,
    	},
        {
    		$group: {
    		// _id: null,
    		    _id: { $toUpper: '$difficulty' },
    		    numTours: { $sum: 1 },
    			numRatings: {
    				$sum: '$ratingsQuantity',
    			},
    			avgRating: { $avg: '$ratingsAverage' },
    			avgPrice: { $avg: '$price' },
    			minPrice: { $min: '$price' },
    			maxPrice: { $max: '$price' },
    		},
    	},
        //...
    ]);
    ```
3. All the stages in the aggregation pipeline are executed one-by-one in the order they are defined in the array.

4. A few important stages for the aggregation pipeline are as follows:
    - `$match`: Similar to the `find()` method. Filters the documents to allow only those that match the specified condition(s) to pass to the next stage.
    - `$group`: Groups the documents by a specified value. Similar to the `GROUP BY` statement in SQL. It is mandatory to specify the `_id` field in this stage. This field contains the value by which we want to group the documents. Other fields can be specified as well to perform operations on them such as `SUM`, `AVG`, `MIN`, `MAX`, etc.
    - `$sort`: Similar to the `sort()` method. Sorts the documents by a specified field in ascending or descending order.
    - `$project`: Similar to the `select()` method. Used to include or exclude fields from the documents.
    - `$limit`: Similar to the `limit()` method. Limits the number of documents passed to the next stage.
    - `$unwind`: Deconstructs an array field from the input documents to output a document for each element. Each element of the array will be a separate document.

5. An example of a practical business application made using MongoDB Aggregation Pipeline is as follows:

    ```javascript
    // Get Monthly Plan
    exports.getMonthlyPlan = async (req, res) => {
    	try {
    		const year = req.params.year * 1; // 2021

    		const plan = await Tour.aggregate([
    			{
    				$unwind: '$startDates',
    			},
    			{
    				$match: {
    					startDates: {
    						$gte: new Date(`${year}-01-01`),
    						$lte: new Date(`${year}-12-31`),
    					},
    				},
    			},
    			{
    				$group: {
    					_id: { $month: '$startDates' },
    					numTourStarts: { $sum: 1 },
    					tours: { $push: '$name' },
    				},
    			},
    			{
    				$addFields: { month: '$_id' },
    			},
    			{
    				$project: {
    					_id: 0,
    				},
    			},
    			{
    				$sort: { numTourStarts: -1 },
    			},
    			{
    				$limit: 12,
    			},
    		]);

    		res.status(200).json({
    			status: 'success',
    			data: {
    				plan,
    			},
    		});
    	} catch (err) {
    		res.status(400).json({
    			status: 'fail',
    			message: err,
    		});
    	}
    };
    ```

## Virtual Properties

1. Virtual properties are document properties that you can get and set but that do not get persisted to MongoDB. The getters are useful for formatting or combining fields, while setters are useful for de-composing a single value into multiple values for storage.
2. For example, we can create a virtual property called `durationWeeks` that calculates the duration of a tour in weeks based on the `duration` field (which is in days).
    ```javascript
    tourSchema.virtual('durationInWeeks').get(function () {
    	// We used Regular Function instead of arrow function because we need access to `this` keyword
    	return this.duration / 7;
    }); // This Virtual property will be created each time we get data from the database.
    ```
3. To 'enable' virtual properties to be included in the output when using `res.json()` or `res.send()`, we need to set the `toJSON` and `toObject` options in the schema as follows:
    ```javascript
    const tourSchema = new mongoose.Schema(
    	{
    		// Schema Definition
    	},
    	{
    		toJSON: { virtuals: true },
    		toObject: { virtuals: true },
    	},
    );
    ```
4. Now, whenever we get a tour document from the database, the `durationInWeeks` virtual property will be included in the output.

## Mongoose Middlewares

Mongoose, just like Express, also supports middlewares. These middlewares are also called pre and post hooks.

### Document Middleware

1. Document middleware is executed before or after certain document methods. These methods are `save()` and `create()`.
2. Document middleware has access to the document being processed via the `this` keyword.
3. To define a document middleware, we use the `pre` and `post` methods on the schema.

    ```javascript
    // Pre Middleware
    tourSchema.pre('save', function (next) {
    	this.slug = slugify(this.name, { lower: true });
    	next();
    });

    // Post Middleware
    tourSchema.post('save', function (doc, next) {
    	console.log(doc);
    	next();
    });
    ```

4. In the above example, the pre middleware will run before a document is saved to the database and will create a slug from the name of the tour. The post middleware will run after the document is saved and will log the document to the console.

### Query Middleware

1. Query middleware is executed before or after certain query methods. These methods are `find()`, `findOne()`, `findById()`, etc.
2. Query middleware has access to the query being processed via the `this` keyword.
3. An example is implemented in the `tourModel.js` file in the models folder.

    ```javascript
    // QUERY MIDDLEWARE: runs before executing a query

    // This middleware is using `find` and not `findOne`
    // let timeTaken;
    // tourSchema.pre('find', function (next) {
    tourSchema.pre(/^find/, function (next) {
    	// timeTaken = Date.now();
    	this.start = Date.now();
    	this.find({ secretTour: { $ne: true } });
    	next();
    });

    tourSchema.post(/^find/, function (docs, next) {
    	// timeTaken = Date.now() - timeTaken;
    	console.log(
    		`Process took ${Date.now() - this.start}ms.`,
    	);
    	next();
    });
    ```

4. In the above example, the pre middleware will run before any `find` query is executed and will exclude all documents that have the `secretTour` field set to true. The post middleware will run after the query is executed and will log the time taken to execute the query.

### Aggregation Middleware

1. Aggregation middleware is executed before or after an aggregation operation is executed.
2. Aggregation middleware has access to the aggregation object being processed via the `this` keyword.
3. An example is implemented in the `tourModel.js` file in the models folder.
    ```javascript
    // AGGREGATION MIDDLEWARE: runs before executing an aggregation
    tourSchema.pre('aggregate', function (next) {
    	this.pipeline().unshift({
    		$match: { secretTour: { $ne: true } },
    	});
    	console.log(this.pipeline());
    	next();
    });
    ```

## Data Validation for Mongoose Models

Mongoose provides built-in validators for schema types, as well as the ability to create custom validation logic.

### Built-in Validators

1. A few methods not mentioned before are:
    - `min` and `max` for Number type.
    - `enum` for String type.
    - `match` for String type to match a regular expression.
2. Example:
    ```javascript
    //...
    maxLength: [
    	40,
    	'A Tour Name cannot be longer than 40 characters',
    ],
    //...
    enum: {
    	values: ['easy', 'medium', 'difficult'],
    	message:
    	    'A tour difficulty can either be easy, medium and difficult',
    },
    ```

### Third-Party Validators

1. We can use third-party validators such as the `validator` package.
2. First, install the package:
    ```bash
    npm i validator
    ```
3. Then, import the package in the model file and use its methods in the schema definition.
    ```javascript
    const validator = require('validator');
    //...
    email: {
    	type: String,
    	required: [true, 'User must have an email'],
    	unique: true,
    	lowercase: true,
    	validate: [validator.isEmail, 'Please provide a valid email'],
    },
    ```

### Custom Validators

1. One can also create custom validators by defining a `validate` property in the schema definition.

    ```javascript
    validate: {
    	validator: function (val) {
    	// this only points to current doc on NEW document creation.
    	// Means it wont work if only the discount price is being updated.
    	return val < this.price;
    	},
    	message:
    	    'Discount Price ({VALUE}) should be below the regular price',
    },
    ```

    - The `validator` property is a function that takes the value to be validated as an argument and returns true if the value is valid, or false if it is not.

# Implementing Proper Error Handling

## Using `ndb` for Debugging

1. `ndb` stands for "Node Debugger", it's a debugging tool developed by Google which provide a headless chrome window for debugging and be more productive.
2. ndb can be installed globally using the terminal command:
    ```bash
    npm i ndb --global
    ```
3. Add the script to your `package.json` file:
    ```json
    //...
    "debug": "ndb server.js",
    ```
4. Run the script in your terminal to begin debugging.
    ```bash
    npm run debug
    ```
5. This will open a new window also known as 'Headless Chrome' which provides tools such as setting breakpoints and also step-forward and step-backward functionality.

## Handling Unhandled Routes

1. In a api, there is only a limited routes that are handled/they act as the actual resource routes of the api. All other routes are useless and must be ignored.
2. Good thing is that Express offers middleware for this sort of handling. Such middleware is explained in the next section.
    ```javascript
    // The above middlewares/route-handlers didn't catch this route, so it must be undefined
    // `all() method handles all http methods
    // '*' means all the routes
    app.all('*', (req, res, next) => {
    	next(
    		new AppError(
    			`404! Page not Found at '${req.originalUrl}' on this server.`,
    			404,
    		),
    	);
    });
    ```
3. In express, middleware in which the `next()` method accepts an argument automatically treated as the error handling middleware. When such a middleware comes in the stack, express will skip all other middlewares and go directly to the error handling middleware. This is further explained in the next section.
4. In the above code, we created a new utility class `AppError` to generate errors with custom error messages.

    ```javascript
    class AppError extends Error {
    	constructor(message, statusCode) {
    		super(message);
    		this.statusCode = statusCode;
    		this.status = `${statusCode}`.startsWith('4')
    			? 'fail'
    			: 'error';
    		this.isOperational = true;
    		Error.captureStackTrace(this, this.constructor);
    		// When an object is created, it'll not pollute the original Error object's stack trace.
    	}
    }
    module.exports = AppError;
    ```

## Creating a Global Error Handling Middleware

1. In the `app.js` file, create a new middleware at the end of all other middlewares. This is a global error handling middleware. So it must accept 4 arguments:

    ```javascript
    //...
    app.use((err, req, res, next) => {
    	err.statusCode = err.statusCode || 500;
    	err.status = err.status || 'error';
    	res.status(err.statusCode).json({
    		status: err.status,
    		message: err.message,
    	});
    });
    ```

2. This special middleware will now catch all errors that are passed to the `next()` method in any other middleware or route handler.

## Refactoring the Global Error Handling Middleware

1. To improve the error handling middleware, we can create a new file `controllers/errorController.js` and move the error handling middleware there. This method can then be exported and imported in the `app.js` file.
2. In this file, we can also create different functions to handle different types of errors.

## Catching errors in Async Functions

1. To catch errors in async functions, we follow a standard procedure of making a new utility function that accepts an async function as an argument and returns a new function that catches any errors and passes them to the next middleware.
2. Create a new file `utils/catchAsync.js` and add the following code:
    ```javascript
    module.exports = (fn) => {
    	return (req, res, next) => {
    		fn(req, res, next).catch(next);
    	};
    };
    ```
3. Now, in the controller, import this function and wrap all async functions with it.
    ```javascript
    const catchAsync = require('./../utils/catchAsync');
    //...
    exports.getAllTours = catchAsync(
    	async (req, res, next) => {
    		//...
    	},
    );
    exports.getTour = catchAsync(async (req, res, next) => {
    	//...
    });
    //...
    ```
4. This way, any error that occurs in the async function will be caught and passed to the next middleware, which is the error handling middleware.
5. This is done instead of using simple try-catch blocks to improve code readability and maintainability.

## Using Correct HTTP Codes for Certain errors

1. In the resource controller, there are certain http status codes that must be used for certain errors. For example, when a resource is not found, the status code must be `404`.
    ```javascript
    exports.getTour = catchAsync(async (req, res, next) => {
    	//Tour.findOne({ _id: req.params.id})
    	const tour = await Tour.findById(req.params.id);
    	res.status(200).json({
    		status: 'success',
    		data: { tour },
    	});
    });
    ```
2. In the above code, if the tour with the given id is not found, the `tour` object will be `null`. So, we need to check for this and return a `404` status code.
    ```javascript
    if (!tour) {
    	return next(
    		new AppError('No tour found with that ID', 404),
    	);
    }
    ```
3. When the `next()` method is called with an argument, express will skip all other middlewares and go directly to the error handling middleware.
4. Same should be done for all other similar methods.

## Errors in Development Vs Production

1. In development, we want to see the full error details to help us debug the error. But in production, we want to show a generic message to the user and log the full error details for ourselves.
2. It starts with making changes in the error handling middleware in the `errorController.js` file.

    ```javascript
    const sendErrorDev = (err, req, res) => {
    	res.status(err.statusCode).json({
    		status: err.status,
    		error: err,
    		message: err.message,
    		stack: err.stack,
    	});
    };

    const sendErrorProd = (err, req, res) => {
    	// Operational, trusted error: send message to client
    	if (err.isOperational) {
    		res.status(err.statusCode).json({
    			status: err.status,
    			message: err.message,
    		});

    		// Programming or other unknown error: don't leak error details
    	} else {
    		// 1) Log error
    		console.error('ERROR 💥', err);

    		// 2) Send generic message
    		res.status(500).json({
    			status: 'error',
    			message: 'Something went very wrong!',
    		});
    	}
    };
    ```

3. Now, in the main error handling middleware, we can check the environment and call the appropriate function.

    ```javascript
    module.exports = (err, req, res, next) => {
    	err.statusCode = err.statusCode || 500;
    	err.status = err.status || 'error';

    	if (process.env.NODE_ENV === 'development') {
    		sendErrorDev(err, req, res);
    	} else if (process.env.NODE_ENV === 'production') {
    		let error = { ...err };
    		error.message = err.message;

    		// Handle specific errors here

    		sendErrorProd(error, req, res);
    	}
    };
    ```

4. Now, we can handle specific errors in the production environment by checking the error type and creating a new `AppError` with a custom message and status code.

    ```javascript
    if (error.name === 'CastError')
    	error = handleCastErrorDB(error);
    if (error.code === 11000)
    	error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
    	error = handleValidationErrorDB(error);
    ```

5. Each of the above mentioned methods can be defined as follows:
    ```javascript
    const handleCastErrorDB = (err) => {
    	const message = `Invalid ${err.path}: ${err.value}`;
    	return new AppError(message, 400);
    };
    const handleDuplicateFieldsDB = (err) => {
    	// THIS SOLUTION WAS SUGGESTED BY CHATGPT
    	// IT WORKS, BUT I PREFER THE ONE BELOW
    	// const match = err.message.match(/(["'])(.*?)\1/);
    	// console.log(match);
    	// const value = match ? match[2] : 'unknown';
    	const match = err.message.match(
    		/(["'])(\\?.)*?\1/,
    	)[0];
    	const message = `Duplicate Field Value: ${match}. Please use another value!`;
    	return new AppError(message, 400);
    };
    const handleValidationErrorDB = (err) => {
    	const errors = Object.values(err.errors).map(
    		(el) => el.message,
    	);
    	const message = `Invalid Input Data. ${errors.join('. ')}`;
    	return new AppError(message, 400);
    };
    ```

## Errors Outside Express

1. Sometimes, there are errors that occur outside the express framework. For example, an unhandled promise rejection or an uncaught exception.
2. To handle these errors, we can use the `process` object in Node.js.
3. For unhandled promise rejections, we can use the `unhandledRejection` event.
    ```javascript
    process.on('unhandledRejection', (err) => {
    	console.log(
    		'UNHANDLED REJECTION! 💥 Shutting down...',
    	);
    	console.log(err.name, err.message);
    	server.close(() => {
    		process.exit(1);
    	});
    });
    ```
4. For uncaught exceptions, we can use the `uncaughtException` event.
    ```javascript
    process.on('uncaughtException', (err) => {
    	console.log(
    		'UNCAUGHT EXCEPTION! 💥 Shutting down...',
    	);
    	console.log(err.name, err.message);
    	process.exit(1);
    });
    ```

- NOTE: The above code must be placed in the `server.js` file before any other code to ensure that it catches all errors.

# Implementing Security Measures

There are quite a few security measures that can be implemented to make the app more secure. These measures prevent from leaking sensitive data and also prevent from attacks such as NoSQL query injection, XSS, etc. Following packages are installed before working with the code snippets below:

- `bcryptjs`
- `nodemailer`
- `jsonwebtoken`

In the later section,

- `express-mongo-sanitize`
- `express-rate-limit`
- `helmet`
- `hpp`
- `xss-clean`

## Making Model Fields Secure

1. Using proper validation to the model makes a big difference. Below is an example of a proper implementation of a user Schema with proper validation rules.

    ```javascript
    const userSchema = new mongoose.Schema({
    	name: {
    		type: String,
    		required: [true, 'User Name is missing'],
    		trim: true,
    	},
    	email: {
    		type: String,
    		required: [
    			true,
    			'User Email Address is missing',
    		],
    		unique: true,
    		lowercase: true,
    		validate: [
    			validator.isEmail,
    			'Provide Email Address is invalid',
    		],
    		trim: true,
    	},
    	photo: {
    		type: String,
    	},
    	role: {
    		type: String,
    		enum: ['user', 'guide', 'lead-guide', 'admin'],
    		default: 'user',
    	},
    	password: {
    		type: String,
    		required: ['true', 'User Password is missing'],
    		minLength: [
    			8,
    			'Password must be atleast 8 characters',
    		],
    		trim: true,
    		select: false, // Never shows up in any select outputs
    	},
    	passwordConfirm: {
    		type: String,
    		required: [
    			'true',
    			'User Passwords do not match',
    		],
    		trim: true,
    		validate: {
    			// This Custom validator only works on save.
    			validator: function (el) {
    				return el === this.password;
    			},
    			message: 'User Passwords do not match',
    		},
    	},
    	passwordChangedAt: { type: Date },
    	passwordResetToken: String,
    	passwordResetExpires: Date,
    	active: {
    		type: Boolean,
    		default: true,
    		select: false,
    	},
    });
    ```

2. Make sure to never store the user password in the database. Always use hashing and encryption algorithms to hash the user password. This way, if a hacker gets access to the database somehow, they still do not have access to the users' passwords.

    ```javascript
    // Password Hashing Middleware
    userSchema.pre('save', async function (next) {
    	// Skip this middleware if Password wasn't modified
    	if (!this.isModified('password')) return next();

    	// Hash the Password with a cost of 12
    	this.password = await bcrypt.hash(
    		this.password,
    		12,
    	);
    	// Delete the PasswordConfirm field
    	this.passwordConfirm = undefined;
    	next();
    });
    ```

3. Below is a proper implementation of a middleware function that updates the user `passwordChangedAt` property:
    ```javascript
    userSchema.pre('save', function (next) {
    	if (!this.isModified('password') || this.isNew)
    		return next();
    	this.passwordChangedAt = Date.now() - 1000; // Ensures that the token is always created after the password has been changed
    	next();
    });
    ```
4. Below is an implementation of an INSTANCE METHOD on the User schema that is to compare user passwords. Basically used to perform login/reset actions to compare provided string with the user's hashed password stored in the database:
    ```javascript
    userSchema.methods.correctPassword = async function (
    	candidatePassword,
    	userPassword,
    ) {
    	// `this.password` won't be available
    	return await bcrypt.compare(
    		candidatePassword,
    		userPassword,
    	);
    };
    ```
5. Below is an instance method that checks if JWT is older than the value of the property of `changedPasswordAt`. This method is important for Authentication processes:
    ```javascript
    userSchema.methods.changedPasswordAfter = function (
    	JWTTimeStamp,
    ) {
    	if (this.passwordChangedAt) {
    		const changedTimestamp = parseInt(
    			this.passwordChangedAt.getTime() / 1000,
    			10, //Base-10
    		);
    		return JWTTimeStamp < changedTimestamp; //100 < 200
    	}
    	// Default False: Means password is not changed
    	return false;
    };
    ```
6. This Instance method provides a random token that is used for password reset purposes. This method also stores a HASHed version of this random token in the document along with an expiry date of this token:
    ```javascript
    userSchema.methods.createPasswordResetToken =
    	function () {
    		const token = crypto
    			.randomBytes(32)
    			.toString('hex');
    		this.passwordResetToken = crypto
    			.createHash('sha256')
    			.update(token)
    			.digest('hex');
    		this.passwordResetExpires =
    			Date.now() + 10 * 60 * 1000; // Minutes * Seconds * MilSeconds
    		return token;
    	};
    ```

## Authentication Processes

In this section, we discuss important methods related to `authenticating` a user to our system. These methods include signup, login, protect, frogotPassword, resetPassword, etc. Few setups to note before we continue into the section are as follows:

1. These methods lie in a new controller called `authController`.
2. Some methods will be called into other route Controllers such as `tourRoutes`, `userRoutes`.
3. Important environment variables are stored in the `config.env` file as usual and not in the code.
4. This is based on the working of JSON Web Tokens.

    ```
                ┌───────────────────────┐
                │       CLIENT          │
                └──────────┬────────────┘
                           │
             [1] Login Request (POST /login)
                           │  username, password
                           ▼
                ┌───────────────────────┐
                │        SERVER         │
                └──────────┬────────────┘
                           │
                Validate user credentials
                           │
             [2] Generate JWT:
                 HEADER + PAYLOAD + SIGNATURE
                 (signed with secret key)
                           │
                           ▼
                ┌───────────────────────┐
                │       CLIENT          │
                └──────────┬────────────┘
                           │
             [3] Receives token & stores
                 (localStorage, cookie, etc.)
                           │
             [4] Makes requests to
                 protected routes with:
                 Authorization: Bearer <token>
                           │
                           ▼
                ┌───────────────────────┐
                │        SERVER         │
                └──────────┬────────────┘
                           │
             [5] Verify Token:
                 - Decode HEADER & PAYLOAD
                 - Re-hash HEADER+PAYLOAD with secret
                 - Compare with SIGNATURE
                 - Check exp (expiration)
                           │
             [6] If valid, grant access
                 Else, return 401 Unauthorized
                           │
                           ▼
                ┌────────────────────────┐
                │       RESPONSE         │
                └────────────────────────┘
    ```

### Signing Up New Users

Signing up new users consists of following steps:

0. Perform validation for fields?
    - This is done automatically in the schema.

1. Get necessary details from the user and nothing more, and create a new user.
    ```javascript
    const newUser = await User.create({
    	name: req.body.name,
    	email: req.body.email,
    	password: req.body.password,
    	passwordConfirm: req.body.passwordConfirm,
    });
    ```
2. Sign the JWT with the user and the SECRET from the .env file.
    ```javascript
    const token = jwt.sign({ newUser._id }, process.env.JWT_SECRET, {
    	expiresIn: process.env.JWT_EXPIRES_IN,
    });
    ```
3. Define Cookie options.
    ```javascript
    const cookieOptions = {
    	expires: new Date(
    		Date.now() +
    			process.env.JWT_COOKIE_EXPIRES_IN *
    				24 *
    				60 *
    				60 *
    				1000,
    	),
    	httpOnly: true,
    	//secure: true, // Cookie will only be sent on an encrypted connection (HTTPS)
    };
    if (process.env.NODE_ENV === 'production')
    	cookieOptions.secure = true;
    ```
4. Remove user password from the output.
    ```javascript
    // Remove password from output
    user.password = undefined;
    ```
5. Append the cookie object with the response object and send the response with the token.
    ```javascript
    res.cookie('jwt', token, cookieOptions);
    res.status(statusCode).json({
    	status: 'success',
    	token,
    });
    ```

### Logging in the Existing Users

Similar to Signup process, logging in existing users is also comprised of a few steps.

1. Destructuring the `req.body` object.
    ```javascript
    const { email, password } = req.body;
    ```
2. Validate if fields exist and not empty.
    ```javascript
    if (!email || !password) {
    	return next(new AppError('Invalid Input', 400));
    }
    ```
3. Check if user exists with the provided email.

    ```javascript
    const user = await User.findOne({ email }).select(
    	'+password',
    );
    if (!user) {
    	//...Generate Error
    }
    ```

4. Compare password by calling the Instance Method defined in the schema.
    ```javascript
    const result = await user.correctPassword(
    	password,
    	user.password,
    );
    if (!result) {
    	//...Generate Error
    }
    ```

- The error handling work in Step 03 & 04 is combined to work together to save performance resources. This way there would be no comparison needed in case user doesn't exists with the provided email address.
    ```javascript
    if (
    	!user ||
    	!(await user.correctPassword(
    		password,
    		user.password,
    	))
    )
    ```

5. If all goes good, send the JWT to the client.
    ```javascript
    createAndSendToken(user, 200, res);
    ```

- This method `createAndSendToken` is the implementation of Step 02 and onwards in the Signup process.

### Implementing a Protect Method

The purpose of this method is to act as a middleware for some routes so that they can be only accessed by authorized users. It consists of the following steps:

1. Check if the request consists of a `authorization` header value and if this value starts with the word `Bearer`. Extract & Save the token in the token variable if all true else, throw error.

    ```javascript
    let token;
    if (
    	req.headers.authorization &&
    	req.headers.authorization.startsWith('Bearer')
    ) {
    	// Split the value string at ' '
    	// And take the 2nd value in the array
    	token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
    	return next(
    		new AppError(
    			'Unable to Login at the moment',
    			401,
    		),
    	);
    }
    ```

2. Verify the token using the `verify` method. We also want to store the decodedToken in a new Variable which is possible by converting the method into a promise. This is done with the help of the `promisify` method from the node `util` module.
    ```javascript
    const { promisify } = require('util');
    //...
    const decodedToken = await promisify(jwt.verify){
        token,process.env.JWT_SECRET
    };
    ```
3. Check if user exists against the `id` in the decoded token.
    ```javascript
    const user = await User.findById(decodedToken.id);
    if (!user) {
    	// Throw error
    }
    ```
4. Important Step: Check if User has changed their password after the token was issued. In other words, if JWT_Date > password_change_date.
    ```javascript
    if (user.changedPasswordAfter(decodedToken.iat)) {
    	//Throw Error
    }
    ```
5. Append the `user` object to the `req` object and send to next middleware.
    ```javascript
    req.user = user;
    next();
    ```

### Implementing a RestrictTo Method

This method acts as a middleware and restricts a certain route to specified users based on their `role` in the schema.

1. This method is rather different than all others and actually returns another function which is similar to the rest.
    ```javascript
    restrictTo = (...userRoles) => {
    	return (req, res, next) => {
    		// userRoles is an array: ['admin', 'user']
    		if (!userRoles.includes(req.user.role)) {
    			return next(
    				new AppError(
    					'Current User is not Authorized to perform this action',
    					403,
    				),
    			);
    		}
    		next();
    	};
    };
    ```
2. Step 01: Check if the arguement array `userRoles` includes the role of the currently logged in user, the user whose data is saved in the `req` object.
3. If it does, skip to next middleware, if not throw an error.

### Forget Password Functionality

The forget password functionality is divided into two separate methods.

- Sending the Email. - (`forgotPassword`())
- Resetting the Password with the URL in Email. - (`resetPassword`())

Both these methods are divided into the following steps:

1. Starting with the `forgotPassword` method, we first get the email address from the `req.body` object and get user from model.
    ```javascript
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
    	//Throw Error
    }
    ```
2. Generate a random Reset token by using the instance method on the schema. Call the `.save()` method on the `user` document that was just fetched.
    ```javascript
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    ```
3. Generate a reset URL and send it to the user's email address.
    ```javascript
    const resetURL = `${req.protocol}://${req.get(
    	'host',
    )}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
    try {
    	await sendEmail({
    		email: user.email,
    		subject:
    			'Your password reset token (valid for 10 min)',
    		message,
    	});
    	res.status(200).json({
    		status: 'success',
    		message: 'Token sent to email!',
    	});
    } catch (err) {
    	user.passwordResetToken = undefined;
    	user.passwordResetExpires = undefined;
    	await user.save({ validateBeforeSave: false });
    	return next(
    		new AppError(
    			'There was an error sending the email. Try again later!',
    			500,
    		),
    	);
    }
    ```

- The `sendEmail` method is defined ane explained in a separate section below.

4. Send a nice response to the client if all goes well.
    ```javascript
    res.status(200).json({
    	status: 'success',
    	message: 'Token sent to email!',
    });
    ```
5. Here begins the process after the user clicks the link in the email, the resetPassword method. Get the hashedToken from the URL params.
    ```javascript
    const hashedToken = crypto
    	.createHash('sha256')
    	.update(req.params.token)
    	.digest('hex');
    ```
6. Use this hashedToken to find the user and also check if the token is not expired.
    ```javascript
    const user = await User.findOne({
    	passwordResetToken: hashedToken,
    	passwordResetExpires: { $gt: Date.now() },
    });
    ```

- The passwordResetToken was hashed and stored in the database when it was created. So we need to hash the token from the URL to compare.

7. If user doesn't exist, throw error.
    ```javascript
    if (!user) {
    	//Throw Error
    }
    ```
8. Set new password and passwordConfirm Values and set the reset token & its expiry to undefined. Remember to call the `save()` method.
    ```javascript
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    ```
9. Update changedPasswordAt property for the user. Look into this method code in userModel.js.
    - It is a pre-save middleware.
    - It will only be executed when the password is modified and the document is not new.
    - So we don't need to call it here explicitly.
    - IT SAVES THE TIMES AS `Date.now() - 1000`[Subtracting 1 second] TO MAKE SURE THAT TOKEN IS SIGNED AFTER THE PASSWORD IS CHANGED.

10. Call the `createAndSendToken` method to create and send JWT.

### Update Password Functionality

This functionality allows the user to update their password by using their old password. In other words, a secure route handler that allows the user to change their password.

1. Check if fields exist in the `req.body` object.
    ```javascript
    const {
    		passwordCurrent,
    		password,
    		passwordConfirm,
    	} = req.body;
    if (
    		!passwordCurrent ||
    		!password ||
    		!passwordConfirm
    	)
        // Throw error
    ```
2. Get Current user from the database using the id from the `req.user` object (sent from the protect middleware).
    ```javascript
    const user = await User.findById(req.user._id).select(
    	'+password',
    );
    ```
3. Check if the POSTed password matches the user's original password. This is done by using the instance method `correctPassword()`.
    ```javascript
    if (
    		!(await user.correctPassword(
    			passwordCurrent,
    			user.password,
    		))
    	)
        // Throw error
    ```
4. If all is good, update the user's password.
    ```javascript
    user.password = password;
    user.passwordConfirm = passwordConfirm;
    await user.save();
    ```
5. Send JWT with the response.
    ```javascript
    createAndSendToken(user, 200, res);
    ```

## Advanced Postman Setup

1. Create Environments to work in. This way the domain url can be saved to an environment variable and that variable can then be used in requests instead of the actual url.
    ```
    {{URL}}
    ```
2. Routes that grant authorization to a user, can use `scripts` to automate saving the JWT recieved from the server to a new environment variable.
    ```javascript
    pm.environment.set('jwt', pm.response.json().token);
    ```
3. Protected routes can have an authorization technique chosen from the authorization drop-down -> **Bearer Token**.
    ```
    {{jwt}}
    ```

## Sending User's Emails using NodeMailer

1. Create a new Utility function in the `/utils` folder. Impor the `nodemailer` npm package into the module. First step of this function is to create the `transporter` object as below.
    ```javascript
    const transporter = nodemailer.createTransport({
    	// service: 'Gmail',
    	host: process.env.EMAIL_HOST,
    	port: process.env.EMAIL_PORT,
    	auth: {
    		user: process.env.EMAIL_USERNAME,
    		pass: process.env.EMAIL_PASSWORD,
    	},
    	// Activate the 'less secure app' option in Gmail when using gmail as service
    });
    ```
2. As obvious from the above code snippet, these details are to be stored in the `config.env` file.
3. Next step is to create another object `mailOptions`.
    ```javascript
    const mailOptions = {
    	from: 'Muhammad Aarish <admin@natours.com>',
    	to: options.email,
    	subject: options.subject,
    	text: options.message,
    	// html: options.html,
    };
    ```
4. Send the email.
    ```javascript
    await transporter.sendMail(mailOptions);
    ```

## Implementing updateMe & deleteMe Methods

### `updateMe()`

1. Perform Sanitization on the `req.body` object.
    ```javascript
    const filterObj = (obj, ...allowedFields) => {
    	let newObj = {};
    	Object.keys(obj).forEach((el) => {
    		if (allowedFields.includes(el)) {
    			newObj = obj[el];
    		}
    	});
    	return newObj;
    };
    //...
    const filteredBody = filterObj(
    	req.body,
    	'name',
    	'email',
    );
    if (req.body.password || req.body.passwordConfirm)// Throw Error
    ```
2. Update the user document using the `findByIdAndUpdate` method.
    ```javascript
    const user = await User.findByIdAndUpdate(
    	req.user._id,
    	filteredBody,
    	{ new: true, runValidators: true },
    );
    ```
3. Send the response.
    ```javascript
    res.status(200).json({
    	status: 'success',
    	data: { user },
    });
    ```

### `deleteMe()`

When a user wants to delete their account, we don't actually delete the document from the database. Instead, we set an `active` property to `false`. This way, the user can be reactivated later if needed.

1. Find and update the user with their `active` property.
    ```javascript
    await User.findByIdAndUpdate(req.user._id, {
    	active: false,
    });
    ```
2. Send the response to the client.
    ```javascript
    res.status(204).json({
    	status: 'success',
    	data: null,
    });
    ```

## Implementing Other Useful Techniques

### Rate Limiting

Malicious Users can try to send many requests to the server at the same time to make it slow-down or eventually crash the server. We can use an an npm package to limit number of requests from an IP.

1. In `app.js`, require the package `express-rate-limit`.
    ```javascript
    const rateLimit = require('express-rate-limit');
    ```
2. Create a `limiter` method.
    ```javascript
    // Limit Requests on same API
    const limiter = rateLimit({
    	max: 100, // max requests
    	windowMs: 60 * 60 * 1000, // 1 hour in milliseconds
    	message:
    		'Too many requests from this IP, please try again in an hour!',
    });
    ```
3. Use this new function as a middelware in the app.
    ```javascript
    app.use('/api/v1', limiter); // Apply to all routes that start with /api
    ```

### Security HTTP Headers

1. Require the npm package `helmet` in the app.
    ```javascript
    const helmet = require('helmet');
    ```
2. Use this method as a middleware. Make sure to put this middleware method above all other methods.
    ```javascript
    // Security HTTP Headers
    app.use(helmet());
    ```

### Data Sanitization

1. To sanitize the data coming from the client, we can use the npm packages `express-mongo-sanitize` and `xss-clean`.
2. Use these middlewares in the app.

    ```javascript
    // Body Parser, reading data from body into req.body
    app.use(express.json({ limit: '10kb' })); // Body size limit

    // Data Sanitization against NoSQL query injection
    app.use(mongoSanitize());

    // Data Sanitization against XSS (Cross Site Scripting) attacks
    // Removes HTML and JS code from input
    app.use(xss());
    ```

### HTTP Parameter Pollution

1. Use te package `hpp`.
    ```javascript
    const hpp = require('hpp');
    ```
2. Use the middleware in the app.
    ```javascript
    app.use(
    	hpp({
    		whitelist: [
    			'duration',
    			'ratingsAverage',
    			'ratingsQuantity',
    			'maxGroupSize',
    			'difficulty',
    			'price',
    		],
    	}),
    );
    ```
