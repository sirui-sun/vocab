// TODO: do this via Angular
// TODO: how to hvae Jquery get loaded via HTTPS rather than in the package
// TODO: utility functions file, right now for creation of object
// TODO: use OOP for word storage object

var words = localStorageAccess.getWords();
updateView();

function updateView() {
	// for each word, render the word
	for (var i=0;i<words.length;i++) {
		currentWord = words[i];
		console.log(currentWord.shouldBeDisplayedNow());
		console.log(currentWord.shouldBeDisplayedNow());
		
		if (currentWord.shouldBeDisplayedNow() == true) {
			renderWord(currentWord);
		}
	}	

	// in debug mode, show all the words and their states
	if (DEBUG_MODE) {
		$('#debug').remove();
		$('#words-container').append("<div id='debug'>Debug:</div>")

		for (var i=0;i<words.length;i++) {
			$("#debug").append($("<p><b>Word: " + words[i]["word"] + "</b></p>"));
			$("#debug").append($("<p>Timestamp: " + words[i]["timestamp"] + "</p>"));
			$("#debug").append($("<p>Interval: " + words[i]["interval"] + "</p><br>"));
		}
	}
}

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		var toAdd = new Word(request);
  		// console.log("background task received request: " + request.word);
  		words.push(toAdd);
  		updateView();
});


function renderWord(word) {
	$("#words").append("<p>" + word.word + "</p>");
}