updateView();
prepareModal();

function prepareModal() {
	// Get the modal
	var modal = document.getElementById('definitionsModal');

	// Get the <span> element that closes the modal
	var span = document.getElementsByClassName("close")[0];

	// When the user clicks on <span> (x), close the modal
	span.onclick = function() {
    	closeDefinitionsModal();
	}

	// When the user clicks anywhere outside of the modal, close it
	window.onclick = function(event) {
    	if (event.target == modal) {
        	closeDefinitionsModal();
    	}
	}
}


// update view based on the latest data in localStorage
function updateView() {
	words = localStorageAccess.getWords();
	$('#words').remove();
	$('#words-container').append("<div class='container' id='words'></div>");

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
	$('#words').append(newEl(el="div", classes="jumbotron word", ids=thisWord, content=""));
	
	// Render the word
	thisEl = $(vsprintf('#%s', [thisWord]));
	thisEl.append(newEl(el="h1", classes="", ids="", content=thisWord));

	// Row for definition
	definitionRowId = vsprintf("definition-row-%s", [thisWord]);
	thisEl.append(newEl(el="div", classes="row", id=definitionRowId, content=""));
	definitionRow = $('#' + definitionRowId);

	definitionRow.append(newEl(el="div", classes="col-md-2 col-md-offset-5", ids="col_define_" + thisWord, content=""));
	downwardArrowEl = '<span class="glyphicon glyphicon-new-window definitionChevron"></span>'
	$("#col_define_" + thisWord).append(newEl(el="div", classes="btn btn-link define-button col-centered", ids="define_" + thisWord, content="Show definition " + downwardArrowEl));

	// Row of buttons
	btnRowId = vsprintf("btn-row-%s", [thisWord])
	thisEl.append(newEl(el="div", classes="row", id=btnRowId, content=""));
	buttonRow = $("#" + btnRowId);

	buttonRow.append(newEl(el="div", classes="col-md-2 col-md-offset-4", ids="col_gotIt_" + thisWord, content=""));
	$("#col_gotIt_" + thisWord).append(newEl(el="div", classes="btn btn-success gotIt-button", ids="gotIt_" + thisWord, content="Got It"));

	buttonRow.append(newEl(el="div", classes="col-md-2", ids="col_forget_" + thisWord, content=""));
	$("#col_forget_" + thisWord).append(newEl(el="div", classes="btn btn-danger forget-button", ids="forget_" + thisWord, content="I forget"));
	
	// Bind the appropriate actions
	$("#forget_" + thisWord).on("click", {word: thisWord}, onForgetButtonClicked);
	$("#gotIt_" + thisWord).on("click", {word: thisWord}, onGotItButtonClicked);
	$("#define_" + thisWord).on("click", {word: thisWord}, onDefineButtonClicked);	
		
	// delete button
	thisEl.append(vsprintf('<div class="btn btn-link delete-button" id="delete_%s"><small>Stop showing this word</small></div>', [thisWord])); // forget button
	$("#delete_" + thisWord).on("click", {word: thisWord}, onDeleteButtonClicked);
}

function newEl(el, classes, ids, content) {
	return vsprintf('<%s class="%s" id="%s">%s</%s>', [el, classes, ids, content, el]);
}

function onGotItButtonClicked (event) {
	thisWord = event.data.word;
	localStorageAccess.incrementIntervalForWord(thisWord);
	updateView();
}

function onForgetButtonClicked (event) {
	thisWord = event.data.word;
	// when the forget button is clicked, maintain the same interval, but update 
	// the word's timestamp to current time
	localStorageAccess.updateTimestampForWord(thisWord, new Date());
	updateView();
}

function onDeleteButtonClicked (event) {
	thisWord = event.data.word;
	localStorageAccess.removeWord(thisWord);
	updateView();
}

// to do: what happens if dictionary loading is very slow
function onDefineButtonClicked (event) {
	thisWord = event.data.word;
	renderDefinitionsModal(thisWord, Dictionary.define(thisWord));
}

function renderDefinitionsModal(word, definitions) {
	var modal = document.getElementById('definitionsModal');
	modal.style.display = "block";
	var modalContent = $("#modal-content");
	modalContent.append("<div id='definitionsModal-word'>" + word + "</div>");

	for (var i=0;i<definitions.length;i++) {
		modalContent.append(generateDefinitionsDiv(definitions[i]));
	}
}

// definitions: [partOfSpeech, definition]
function generateDefinitionsDiv(definition) {
	var PoS = definition[0];
	var Def = definition[1];
	return "<div class='definitionsModal-definition'><i>" + PoS + "</i>  " + Def + "</div>";
}

function closeDefinitionsModal() {
	var modal = document.getElementById('definitionsModal');
	modal.style.display = "none";
	$("#modal-content").empty();
}