'use strict';

const default_field_host = 'http://localhost:8765/';
const default_field_deck = 'Default';
const default_field_note = 'Basic';
const default_field_diagnosis = 'Diagnosis';
const default_field_link = 'Link';
const default_field_image = 'Image';
const default_field_extra = 'Extra';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	chrome.storage.local.get({
		host: default_field_host,
		deck: default_field_deck,
		note: default_field_note,
		diagnosis: default_field_diagnosis,
		link: default_field_link,
		image: default_field_image,
		extra: default_field_extra,
	}, options => {
		chrome.permissions.request({origins: [options.host]}, granted => {
			if (granted) {
				let data;
				const addCardAction = {
					action:'guiAddCards',
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
				if (message.images) {
					data = {
						action:'multi',
						params: {
							actions: message.images.map(image => ({action: 'storeMediaFile', params: image}))
						}
					};
					addCardAction.params.note.fields[options.image] = (message.stem || '') + message.images.map(image => '<div><img src="' + image.filename + '"></div>').join('');
					if (message.extra) addCardAction.params.note.fields[options.extra] = message.extra;
					data.params.actions.push(addCardAction);
				} else if (message.filename) {
					const storeMediaParams = {filename: message.filename};
					if (message.image_url) storeMediaParams.url = message.image_url;
					else if (message.image_data) storeMediaParams.data = message.image_data;
					addCardAction.params.note.fields[options.image] = '<div><img src="' + message.filename + '"></div>';
					data = {
						action:'multi',
						params: {
							actions: [
								{
									action: 'storeMediaFile',
									params: storeMediaParams,
								},
							]
						}
					};					
					if (message.noteId) {
						data.params.actions.push({
							action:'notesInfo',
							params: {
								notes: [message.noteId]
							}
						});
					} else {
						data.params.actions.push(addCardAction);
					}
				} else data = addCardAction;

				const xhr_func = (data, callback) => {
					const xhr = new XMLHttpRequest();
					xhr.onreadystatechange = () => {
						if (xhr.readyState === 4) {
							if (xhr.status === 200) {
								callback(JSON.parse(xhr.response));
							} else {
								sendResponse({error: 'Status: ' + xhr.status});
							}
						}
					};
					xhr.open('POST', options.host, true);
					data.version = 6;
					xhr.send(JSON.stringify(data));
				};

				if (message.noteId) {
					xhr_func(data, response => {
						if (response.error || !Array.isArray(response.result[1])) {
							sendResponse(response);
						} else {
							const oldField = response.result[1][0].fields[options.image].value;
							console.log('Old field:');
							console.log(oldField);
							const newField = oldField + addCardAction.params.note.fields[options.image];
							console.log('New field: ');
							console.log(newField);
							xhr_func({
								action:'updateNoteFields',
								params: {
									note: {
										id: message.noteId,
							            fields: {
							                [options.image]: newField,
							            },
							        }
								}
							}, sendResponse);
						}
					});
				} else {
					xhr_func(data, sendResponse);
				}
			} else {
				sendResponse({error: 'Permissions not granted for host: ' + options.host});
			}
		});
	});
	return true;
});
