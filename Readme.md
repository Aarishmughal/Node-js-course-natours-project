## Express.JS

Express is a minimal Node.JS framework which means it is built on top of Node.JS. It allows us to develop applications much faster as it comes out-of-box with great features like:

- handling complex routing
- easier handling of requests
- adding middleware
- server-side rendering, etc.

It also allows organizing the application into MVC architecture.

### RESTful APIs

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

### Sending back Data Formatting: JSend

1. Format the data into a variable using `JSON.parse()`.
   ```javascript
   const dataToSend = JSON.parse(
     fs.readFileSync(`${__dirname}/.../tours-simple.json`, 'utf-8')
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

### Recieving Data from the Client: Middleware

Middlware is basically a function that can modify the incoming Request Data. It's called middleware because it stands between in the middle of the request and the response.

- Add a new `middleware` in the file.
  ```javascript
  //...
  app.use(express.json());
  //...
  ```

### Handling POST Data

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
     }
   );
   ```

### Sending and Handling Parameters

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
