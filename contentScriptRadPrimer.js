'use strict';

function createButton(text, onclick){
	const button = document.createElement('button');
	button.innerText = text;
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

function getImage(container) {
	return container.querySelector('.large-image>.image');
}

const container = document.getElementById('container');

const addToAnki = noteId => {
	const msg = {};
	if (noteId) {
		msg.noteId = noteId;
	} else {
		msg.diagnosis = container.querySelector('.question-answer.correct .answer-response').firstChild.textContent
	}
	const image = container.querySelector('.large-image>.image');
	if (image) {
		const image_id = image.id;
		msg.filename = image_id + '.jpg';
		toDataURL('https://app.radprimer.com/images/' + image_id + '?style=large', data => {
			msg.image_data = data;
			sendMessage(msg);
		});
	} else if (msg.diagnosis) {
		sendMessage(msg);
	}
}

const div = document.createElement('div');
container.prepend(div);
div.appendChild(createButton('Add to Anki', () => {
	let diagnosis = container.querySelector('.question-answer.correct .answer-response').firstChild.textContent
	const msg = {
		diagnosis: diagnosis,
	};
	const image = getImage(container);
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
const img = document.createElement('img');
img.setAttribute('height', '50px');
div.appendChild(createButton('Get image', () => {
	const image = getImage(container);
	if (image) {
		img.src = 'https://app.radprimer.com/images/' + image.id + '?style=large';
	}
}));
div.appendChild(img);
const form = document.createElement('form');
div.appendChild(form);

form.id = 'transfer_form';
div.appendChild(form);
const nid_input = document.createElement('input');
form.appendChild(nid_input);
nid_input.setAttribute("type", "number");
nid_input.setAttribute("placeholder", "Note ID");
nid_input.required = true;
nid_input.setAttribute("name", "nid");


const submit_button = document.createElement("input");
form.appendChild(submit_button);

submit_button.setAttribute("type", "submit");
submit_button.value = "Transfer image";

form.onsubmit = (event) => {
	event.preventDefault();
	addToAnki(parseInt(nid_input.value,10));
};

