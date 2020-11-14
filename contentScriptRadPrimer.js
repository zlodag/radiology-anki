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
const progress = document.createElement('progress');
progress.style.display = 'none';

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

const addAll = extra => {
	const msg = {
		diagnosis: container.querySelector('.question-answer.correct .answer-response').firstChild.textContent,
	};
	if (extra) {
		const extraNode = document.querySelector('.teaching-point').cloneNode(true);
		extraNode.querySelectorAll('img').forEach(imgNode => imgNode.remove());
		const answers = Array.from(document.querySelectorAll('.justification'), node => ({
			title: node.previousSibling.textContent,
			explanation: node.lastChild.wholeText,
			correct: node.parentNode.parentNode.parentNode.classList.contains('correct') ? 1 : node.parentNode.parentNode.parentNode.classList.contains('almost') ? 2 : 3,
		}));
		if (answers.length) {
			answers.sort((a, b) => a.correct - b.correct);
			const dl = document.createElement('dl');
			extraNode.append(dl);
			answers.forEach(answer => {
				let dt = document.createElement('dt');
				dt.innerText = (answer.correct === 1 ? '✓' : answer.correct === 2 ? '◒' : '✗') + ' ' + answer.title;
				dl.append(dt);
				let dd = document.createElement('dd');
				dd.innerText = answer.explanation;
				dl.append(dd);
			});
		}
		msg.extra = extraNode.innerHTML;
	}
	const imageIds = Array.from(container.querySelectorAll('.thumbs a.img'), link => link.rel);
	progress.value = 0;
	progress.max = imageIds.length * 2;
	progress.style.display = 'unset';
	Promise.all(imageIds.map(id => 
		fetch('https://app.radprimer.com/images/' + id + '?style=large')
		.finally(() => progress.value++)
		.then(response => response.blob())
		.then(data => new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onloadend = () => {
				resolve({
					filename: id + '.jpg',
					data: reader.result.split(',')[1],
				});
			};
			reader.readAsDataURL(data);
		}))
		.finally(() => progress.value++)
	)).then(images => {
		msg.images = images;
		sendMessage(msg);
	});
};

div.appendChild(createButton('Add all', () => addAll(false)));
div.appendChild(createButton('Add all + extra', () => addAll(true)));
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

div.appendChild(progress);

