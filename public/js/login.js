/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert.js';
export const login = async (email, password) => {
	try {
		const res = await axios({
			method: 'POST',
			url: '/api/v1/users/login',
			data: {
				email,
				password,
			},
		});
		if (res.data.status === 'success') {
			showAlert(
				'success',
				'Logged in successfully!',
				2,
			);
			window.setTimeout(() => {
				location.assign('/');
			}, 2000);
		}
	} catch (err) {
		showAlert('error', err.response.data.message, 5);
	}
};

export const logout = async () => {
	try {
		const res = await axios({
			method: 'GET',
			url: '/api/v1/users/logout',
		});
		if (res.data.status === 'success') {
			window.setTimeout(() => {
				location.assign('/');
			}, 100);
		}
	} catch (err) {
		showAlert(
			'error',
			'Error logging out! Try again.',
			5,
		);
	}
};
