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

function getBaseMessage(){
	return {
		diagnosis: header.firstElementChild.innerText,
		link: document.URL.split('?')[0],
	};
}

const header = document.getElementById('content-header');
header.appendChild(createButton(() => sendMessage(getBaseMessage())));
const grid_items = document.getElementsByClassName('image-grid-item');
for (let i = 0; i < grid_items.length; i++) {
	const grid_item = grid_items[i];
	grid_item.appendChild(createButton(() => {
		const msg = getBaseMessage();
		msg.image_url = grid_item.querySelector('[data-image-gallery-thumbnail-path]').dataset.imageGalleryThumbnailPath;
		msg.filename = msg.image_url.match(/[^/]+$/)[0];
		sendMessage(msg);
	}));
}
