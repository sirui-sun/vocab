// TODO: do this via Angular
// TODO: how to hvae Jquery get loaded via HTTPS rather than in the package
// TODO: utility functions file, right now for creation of object

updateView();

// update view based on the latest data in localStorage
function updateView() {
	words = localStorageAccess.getWords();
	$('#words').remove();
	$('#words-container').append("<div id='words'></div>");

	// for each word, render the word
	for (var i=0;i<words.length;i++) {
		currentWord = words[i];
		if (currentWord.shouldBeDisplayedNow() == true) {
			renderWord(currentWord);
		}
	}	

	// in debug mode, show all the words and their states
	if (DEBUG_MODE) {
		$('#debug').remove();
		$('#words-container').append("<div id='debug'>Debug:</div>");
		var debugEl = $('#debug');

		for (var i=0;i<words.length;i++) {
			debugEl.append($("<p><b>Word: " + words[i]["word"] + "</b></p>"));
			debugEl.append($("<p>Timestamp: " + words[i]["timestamp"] + "</p>"));
			debugEl.append($("<p>Interval: " + words[i]["interval"] + "</p><br>"));
		}
	}
}

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
  		localStorageAccess.addWord(request);
  		updateView();
});


function renderWord(word) {
	thisWord = word.word;
	$("#words").append("<div id=" + thisWord + "></div>");
	
	thisEl = $("#" + thisWord);
	thisEl.append("<p>" + thisWord + "</p>");

	// got it button
	thisEl.append("<button type='button' id=gotIt_" + thisWord + ">Got it</button>");
	$("#gotIt_" + thisWord).on("click", {word: thisWord}, onGotItButtonClicked);

	// I forget button
	thisEl.append("<button type='button' id=forget_" + thisWord + ">I forget</button>");
	$("#forget_" + thisWord).on("click", {word: thisWord}, onForgetButtonClicked);

	// delete button
	thisEl.append("<button type='button' id=delete_" + thisWord + ">Delete</button>");
	$("#delete_" + thisWord).on("click", {word: thisWord}, onDeleteButtonClicked);
}

function onGotItButtonClicked (event) {
	thisWord = event.data.word;
	alert("Got " + thisWord);
}

function onForgetButtonClicked (event) {
	thisWord = event.data.word;
	alert("forget: " + thisWord);
}

function onDeleteButtonClicked (event) {
	thisWord = event.data.word;
	localStorageAccess.removeWord(thisWord);
	updateView();
}