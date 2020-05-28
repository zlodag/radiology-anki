'use strict';

const default_field_diagnosis = 'Diagnosis';
const default_field_link = 'Link';
const default_field_image = 'Image';

// Saves options to chrome.storage
function save_options() {
  var field_diagnosis = document.getElementById('field_diagnosis').value;
  var field_link = document.getElementById('field_link').value;
  var field_image = document.getElementById('field_image').value;
  chrome.storage.sync.set({
    diagnosis: field_diagnosis,
    link: field_link,
    image: field_image,
  }, function() {
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

function restore_options() {
  chrome.storage.sync.get({
    diagnosis: default_field_diagnosis,
    link: default_field_link,
    image: default_field_image,
  }, function(items) {
    document.getElementById('field_diagnosis').value = items.diagnosis;
    document.getElementById('field_link').value = items.link;
    document.getElementById('field_image').value = items.image;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);