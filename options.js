'use strict';

const default_field_host = 'http://localhost:8765/';
const default_field_deck = 'Default';
const default_field_note = 'Basic';
const default_field_diagnosis = 'Diagnosis';
const default_field_link = 'Link';
const default_field_image = 'Image';
const default_field_extra = 'Extra';
const default_close_after_adding = true;

function show_status(msg) {
	const status = document.getElementById('status');
	status.textContent = msg;
	setTimeout(function() {
		status.textContent = '';
	}, 750);
}

function save_options() {
	const host_input = document.getElementById('field_host');
	if (host_input.value[host_input.value.length - 1] !== '/') {
		host_input.value += '/';
	}
	chrome.storage.local.set({
		host: host_input.value,
		deck: document.getElementById('field_deck').value,
		note: document.getElementById('field_note').value,
		diagnosis: document.getElementById('field_diagnosis').value,
		link: document.getElementById('field_link').value,
		image: document.getElementById('field_image').value,
		extra: document.getElementById('field_extra').value,
		close_after_adding: document.getElementById('close_after_adding').checked,
	}, function() {
		show_status('Options saved');
	});
}

function restore_default_host() {
	document.getElementById('field_host').value = default_field_host;
	chrome.storage.local.set({host: default_field_host}, function() {
		show_status('Default host restored');
	});
}

function restore_options() {
	chrome.storage.local.get({
		host: default_field_host,
		deck: default_field_deck,
		note: default_field_note,
		diagnosis: default_field_diagnosis,
		link: default_field_link,
		image: default_field_image,
		extra: default_field_extra,
		close_after_adding: default_close_after_adding,
	}, function(items) {
		document.getElementById('field_host').value = items.host;
		document.getElementById('field_deck').value = items.deck;
		document.getElementById('field_note').value = items.note;
		document.getElementById('field_diagnosis').value = items.diagnosis;
		document.getElementById('field_link').value = items.link;
		document.getElementById('field_image').value = items.image;
		document.getElementById('field_extra').value = items.extra;
		document.getElementById('close_after_adding').checked = items.close_after_adding;
	});
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
document.getElementById('restore_default_host').addEventListener('click', restore_default_host);
