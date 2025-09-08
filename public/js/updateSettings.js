import axios from 'axios';
import { showAlert } from './alert.js';
// type is either 'data' or 'password'
export const updateSettings = async (data, type) => {
	try {
		const res = await axios({
			method: 'PATCH',
			url: `/api/v1/users/${type === 'password' ? 'updateMyPassword' : 'updateMe'}`,
			data,
		});
		if (res.data.status === 'success') {
			showAlert(
				'success',
				'Settings Updated successfully!',
				2,
			);
			window.setTimeout(() => {
				location.assign('/me');
			}, 2000);
		}
	} catch (err) {
		showAlert('error', err.response.data.message, 5);
	}
};
