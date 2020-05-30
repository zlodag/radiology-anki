'use strict';

function createButton(onclick){
	const button = document.createElement('button');
	button.innerText = 'Add to Anki';
	button.onclick = onclick;
	return button;
}

function sendMessage(msg) {
	chrome.runtime.sendMessage(msg, response => {
		if (response.error) console.error(response.error);
		else console.log(response.result);
	});
}

function toDataURL(url, callback) {
	var xhr = new XMLHttpRequest();
	xhr.onload = function() {
		var reader = new FileReader();
		reader.onloadend = function() {
			callback(reader.result.split(',')[1]);
		}
		reader.readAsDataURL(xhr.response);
	};
	xhr.open('GET', url);
	xhr.responseType = 'blob';
	xhr.send();
}

const container = document.getElementById('container');
container.prepend(createButton(() => {
	let diagnosis = container.querySelector('.question-answer.correct .answer-response').firstChild.textContent
	const msg = {
		diagnosis: diagnosis,
	};
	const image = container.querySelector('.large-image>.image');
	if (image) {
		const image_id = image.id;
		msg.filename = image_id + '.jpg';
		toDataURL('https://app.radprimer.com/images/' + image_id + '?style=large', data => {
			msg.image_data = data;
			sendMessage(msg);
		});
	} else {
		sendMessage(msg);
	}
}));
