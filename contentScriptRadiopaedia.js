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

const header = document.getElementById("content-header");

header.appendChild(createButton(() => {
	sendMessage({
		"Diagnosis": header.firstElementChild.innerText,
	});
}));

const grid_items = document.getElementsByClassName('image-grid-item');

for (let i = 0; i < grid_items.length; i++) {
	const grid_item = grid_items[i];
	grid_item.appendChild(createButton(() => {
		const url = grid_item.firstElementChild.firstElementChild.dataset.imageGalleryThumbnailPath;
		sendMessage({
			"Diagnosis": header.firstElementChild.innerText,
			"image_url": url,
		});
	}));
}
