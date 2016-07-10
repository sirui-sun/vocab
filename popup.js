// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var WORD_LIST_KEY = "words";

/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */

function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var url = tab.url;

    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url);
  });

  // Most methods of the Chrome extension APIs are asynchronous. This means that
  // you CANNOT do something like this:
  //
  // var url;
  // chrome.tabs.query(queryInfo, function(tabs) {
  //   url = tabs[0].url;
  // });
  // alert(url); // Shows "undefined", because chrome.tabs.query is async.
}

/**
 * @param {string} searchTerm - Search term for Google Image search.
 * @param {function(string,number,number)} callback - Called when an image has
 *   been found. The callback gets the URL, width and height of the image.
 * @param {function(string)} errorCallback - Called when the image is not found.
 *   The callback gets a string that describes the failure reason.
 */
function getImageUrl(searchTerm, callback, errorCallback) {
  // Google image search - 100 searches per day.
  // https://developers.google.com/image-search/
  var searchUrl = 'https://ajax.googleapis.com/ajax/services/search/images' +
    '?v=1.0&q=' + encodeURIComponent(searchTerm);
  var x = new XMLHttpRequest();
  x.open('GET', searchUrl);
  // The Google image search API responds with JSON, so let Chrome parse it.
  x.responseType = 'json';
  x.onload = function() {
    // Parse and process the response from Google Image Search.
    var response = x.response;
    if (!response || !response.responseData || !response.responseData.results ||
        response.responseData.results.length === 0) {
      errorCallback('No response from Google Image search!');
      return;
    }
    var firstResult = response.responseData.results[0];
    // Take the thumbnail instead of the full image to get an approximately
    // consistent image size.
    var imageUrl = firstResult.tbUrl;
    var width = parseInt(firstResult.tbWidth);
    var height = parseInt(firstResult.tbHeight);
    console.assert(
        typeof imageUrl == 'string' && !isNaN(width) && !isNaN(height),
        'Unexpected respose from the Google Image Search API!');
    callback(imageUrl, width, height);
  };
  x.onerror = function() {
    errorCallback('Network error.');
  };
  x.send();
}

function updateStatus(string) {
  document.getElementById('status').textContent = string;
}

// Given a URL, adds that word to the list of practice words
function processWord(url) {
  var word = getWordFromURL(url);
  if (word) {
    addToLocalStorage(word);
    updateStatus("word is " + word);
  } else {
    updateStatus("No word detected");
  }
}

// Given a URL, determines if this was a request for definition
// Returns the word if it was found, else empty string
function getWordFromURL(url) {
  // get query param
  var a = url.split("q=");
  if (a.length != 2) {
    return ""
  } 

  // sanitize search query string:
  //  remove trailing parameters
  //  un URL encode
  //  replace "+" with spaces
  var searchQueryStringRaw = a[1].split("&")[0];
  var searchQueryString = decodeURIComponent(searchQueryStringRaw).replace("+", " ");

  console.log(searchQueryStringRaw);

  // if search query was of format "define: [word]", return word
  var terms = searchQueryString.split(":");
  if (terms.length == 2 && terms[0] == "define") {
    var definitionTarget = terms[1];
    
    // trim starting space, if necessary
    if (definitionTarget[0] == " " && definitionTarget.length > 1) {
      definitionTarget = definitionTarget.substring(1, definitionTarget.length);
    }
    return definitionTarget;
  }
  return "";
}

document.addEventListener('DOMContentLoaded', function() {
  getCurrentTabUrl(processWord);
  console.log(localStorage["words"]);
});

chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
  if (changeInfo.status == 'complete' && tab.active) {
    console.log("hello world");
  }
})

// adds an element to local storage
// todo: rebuild storage with jS OOP principles (prototypes?)
function addToLocalStorage(word) {
  var toAdd = {
    "word": word,
    "stage": 0,
    "timestamp": 0
  };

  if (!localStorage[WORD_LIST_KEY]) {
    console.log("writing first entry");
    console.log(toAdd);
    localStorage[WORD_LIST_KEY] = JSON.stringify([toAdd]);
  } else {
    var currentWordList = JSON.parse(localStorage[WORD_LIST_KEY]);
    currentWordList.push(toAdd);
    localStorage[WORD_LIST_KEY] = JSON.stringify(currentWordList);
  }
}
