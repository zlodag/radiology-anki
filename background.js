'use strict';

const default_field_deck = 'Default';
const default_field_note = 'Basic';
const default_field_diagnosis = 'Diagnosis';
const default_field_link = 'Link';
const default_field_image = 'Image';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	chrome.storage.sync.get({
		deck: default_field_deck,
		note: default_field_note,
		diagnosis: default_field_diagnosis,
		link: default_field_link,
		image: default_field_image,
	}, options => {
		let data;
		const addCardAction = {
			action:"guiAddCards",
			params: {
				note: {
					deckName: options.deck,
					modelName: options.note,
					fields: {},
				}
			}
		};
		if (message.diagnosis) addCardAction.params.note.fields[options.diagnosis] = message.diagnosis;
		if (message.link) addCardAction.params.note.fields[options.link] = message.link;
		if (message.filename) {
			const storeMediaParams = {filename: message.filename};
			if (message.image_url) storeMediaParams.url = message.image_url;
			else if (message.image_data) storeMediaParams.data = message.image_data;
			addCardAction.params.note.fields[options.image] = '<img src="' + message.filename + '">';
			data = {
				action:"multi",
				params: {
					actions: [
						{
							action: "storeMediaFile",
							params: storeMediaParams,
						},
						addCardAction,
					]
				}
			};
		} else data = addCardAction;
		data.version = 6;
		const xhr = new XMLHttpRequest();
		xhr.onreadystatechange = () => {
			if(xhr.readyState === 4) {
				sendResponse(JSON.parse(xhr.response));
			}
		};
		xhr.open("POST", "http://localhost:8765", true);
		xhr.send(JSON.stringify(data));
	});
	return true;
});
