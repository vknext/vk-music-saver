import './index.scss';

const donateText = document.getElementById('donateText');
if (donateText) {
	donateText.innerText = chrome.i18n.getMessage('popup_donate');
}

const feedbackText = document.getElementById('feedbackText');
if (feedbackText) {
	feedbackText.innerText = chrome.i18n.getMessage('popup_feedback');
}
