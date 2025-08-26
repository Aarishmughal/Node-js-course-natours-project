const express = require('express');
const tourController = require('./../controllers/tourController');
// const {
//   getAllTours,
//   getTour,
//   createTour,
//   updateTour,
//   deleteTour,
// } = require('./../controllers/tourController');
const router = express.Router();

router.route('/stats').get(tourController.getTourStats);
router
	.route('/monthly-plan/:year')
	.get(tourController.getMonthlyPlan);

router
	.route('/top-5-cheap')
	.get(
		tourController.aliasTopTours,
		tourController.getAllTours,
	);
// router.param('id', tourController.checkId);
router
	.route('/')
	.get(tourController.getAllTours)
	.post(tourController.createTour);
router
	.route('/:id')
	.get(tourController.getTour)
	.patch(tourController.updateTour)
	.delete(tourController.deleteTour);

module.exports = router;
