const express = require('express');
const viewsController = require('./../controllers/viewsController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.get(
	'/me',
	authController.protect,
	viewsController.getAccount,
);
// Test Route
router.post(
	'/submit-user-data',
	authController.protect,
	viewsController.updateUserData,
);
// ALL ROUTES GET CHECKED FOR LOGGED IN USER
router.use(viewsController.isLoggedIn);

router.get('/', viewsController.getOverview);
router.get('/tours/:slug', viewsController.getTour);
router.get('/login', viewsController.getLoginForm);
router.get('/signup', viewsController.getSignupForm);

module.exports = router;
