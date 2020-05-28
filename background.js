'use strict';

const default_field_diagnosis = 'Diagnosis';
const default_field_link = 'Link';
const default_field_image = 'Image';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => chrome.storage.sync.get({
	diagnosis: default_field_diagnosis,
	link: default_field_link,
	image: default_field_image,
}, options => {

	let data;
	const addCardAction = {
		action:"guiAddCards",
		params: {
			note: {
				deckName: "Personal",
				modelName: "Trivia",
				fields: {
					[options.diagnosis]: message.Diagnosis,
					[options.link]:'https://radiopaedia.org/articles/' + sender.url.match(/[^/]+$/)[0].split('?')[0],
				}
			}
		}
	};
	if(message.image_url) {
		const filename = message.image_url.match(/[^/]+$/)[0];
		addCardAction.params.note.fields[options.image] = '<img src="' + filename + '">';
		data = {
			action:"multi",
			params: {
				actions: [
					{
					    action: "storeMediaFile",
					    params: {
					        filename: filename,
					        url: message.image_url,
					    }
					},
					addCardAction,
				]
			}
		};
    } else {
		data = addCardAction;
	}
	data.version = 6;
	const xhr = new XMLHttpRequest();
	xhr.onreadystatechange = () => {
		if(xhr.readyState === 4) {
			sendResponse(JSON.parse(xhr.response));
		}
	};
	xhr.open("POST", "http://localhost:8765", true);
	xhr.send(JSON.stringify(data));
	return true;
}));
