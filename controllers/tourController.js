const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    'utf-8'
  )
);
exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    requestedAt: req.requestTime,
    data: { tours },
  });
};
exports.getTour = (req, res) => {
  const idToGet = Number(req.params.id);
  //   if (idToGet > tours.length) {    // Check if idToGet is greater than Tours Count
  const tour = tours.find(
    (el) => el.id === idToGet
  );
  if (!tour) {
    // Check if tour (to get) actually exists or not
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
};
exports.createTour = (req, res) => {
  const newId =
    tours[tours.length - 1].id + 1;
  const newTour = Object.assign(
    { id: newId },
    req.body
  );
  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours), // `tours` is a plain javascript object. We want to save it as JSON
    (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          status: 'error',
          message:
            'Failed to save the new tour.',
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
};
exports.updateTour = (req, res) => {
  const idToGet = Number(req.params.id);
  const tour = tours.find(
    (el) => el.id === idToGet
  );
  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  res.status(204).json({
    status: 'success',
    data: {
      tour: '<Updated Tour Placeholder>',
    },
  });
};
exports.deleteTour = (req, res) => {
  const idToGet = Number(req.params.id);
  const tour = tours.find(
    (el) => el.id === idToGet
  );
  if (!tour) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
};
