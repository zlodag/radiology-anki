'use strict';

function sendMessage(msg) {
	chrome.runtime.sendMessage(msg, response => {
		if (response.error) console.error(response.error);
		else console.log(response.result);
	});
}

const header = document.getElementById("content-header");
const button = document.createElement('button');
button.onclick = () => {
	sendMessage({
		"Diagnosis": header.firstElementChild.innerText,
	});
};
button.innerText = 'Add to Anki';
header.appendChild(button);

const grid_items = document.getElementsByClassName('image-grid-item');

for (let i = 0; i < grid_items.length; i++) {
	const el = grid_items[i];
	const b = document.createElement('button');
	b.onclick = () => {
		const url = el.firstElementChild.firstElementChild.dataset.imageGalleryThumbnailPath;
		url.match(/[^/]+$/)[0]
		// const id = parseInt(el.getAttribute('ref'), 10);
		sendMessage({
			"Diagnosis": header.firstElementChild.innerText,
			"image_url": url,
		});
		// alert('You clicked url: ' + url);
	};
	b.innerText = 'Add to Anki';
	el.appendChild(b);
}