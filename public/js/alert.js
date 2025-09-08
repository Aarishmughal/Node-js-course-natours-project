export const hideAlert = () => {
	const el = document.querySelector('.alert');
	if (el) el.parentElement.removeChild(el);
};
export const showAlert = (type, msg, timeoutInSeconds) => {
	hideAlert();
	const markup = `<div class="alert alert--${type}">${msg}</div>`;
	document
		.querySelector('body')
		// Inside of `body`, but before all other content
		.insertAdjacentHTML('afterbegin', markup);
	window.setTimeout(hideAlert, timeoutInSeconds * 1000);
};
