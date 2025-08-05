const express = require('express');
const fs = require('fs');
const app = express();

const PORT = 3000;
app.use(express.json());
// app.get('/', (req, res) => {
//   res
//     .status(200)
//     .json({ message: 'Hello from the server side!', app: 'Natours' });
// });

// app.post('/', (req, res) => {
//   res
//     .status(200)
//     .json({ message: 'Post Request from Server!', app: 'Natours' });
// });
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, 'utf-8')
);
app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { tours },
  });
});
app.get('/api/v1/tours/:id', (req, res) => {
  const idToGet = Number(req.params.id);
  //   if (idToGet > tours.length) {    // Check if idToGet is greater than Tours Count
  const tour = tours.find((el) => el.id === idToGet);
  if (!tour) {
    z; // Check if tour (to get) actually exists or not
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  console.log(tour);
  res.status(200).json({
    status: 'success',
    data: { tour },
  });
});
app.post('/api/v1/tours', (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);

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
});

app.listen(PORT, () => {
  console.log(`App is Listening on: ${PORT}`);
});
