# Express.JS

Express is a minimal Node.JS framework which means it is built on top of Node.JS. It allows us to develop applications much faster as it comes out-of-box with great features like:

- handling complex routing
- easier handling of requests
- adding middleware
- server-side rendering, etc.

It also allows organizing the application into MVC architecture.

## Table of Contents

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
