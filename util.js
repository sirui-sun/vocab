// are we in debug mode?
var DEBUG_MODE = true;

// Spaced repetition intervals, in seconds =======================================
// 		Current formula: 20 minutes, 1 day, 2 days, 4 days, 7 days, 
// 		11 days, 14 days, 21 days , 35 days, 70 days, 105 days
var intervals = [1/72, 1, 2, 4, 7, 11, 14, 21, 35, 70, 105];

// intervals for iterating over spaces array
var MIN_INTERVAL = 0;
var MAX_INTERVAL = intervals.length;

// Object for saving Word state ==================================================
var Word = function(word, timestamp, interval) {
	this.word = word;
	
	if (timestamp) {
		this.timestamp = new Date(timestamp);
	} else {
		this.timestamp = new Date();
	}

	if (interval) {
		this.interval = interval;
	} else {
		this.interval = MIN_INTERVAL;
	}
};

// increment this word's interval
Word.prototype.incrementInterval = function() {
	if(this.interval < MAX_INTERVAL) {
		this.interval += 1;
	}
};

// should this word be displayed in the UI?
Word.prototype.shouldBeDisplayedNow = function() {
	var now = new Date();
	var toCheck = new Date(this.timestamp);
	toCheck.setDate(toCheck.getDate() + intervals[this.interval]);
	return now > toCheck;
};

// Module for accessing local storage ============================================
// TODO: read up on JS module pattern
var localStorageAccess = (function() {
	var WORD_LIST_KEY = 'words';

	return {
		// get words from local storage
	    getWords: function () {
			w = localStorage[WORD_LIST_KEY];
			if (w) {
				wordsList = JSON.parse(localStorage[WORD_LIST_KEY]);
				return wordsList.map(function(obj) { return new Word(obj.word, obj.timestamp, obj.interval) });
			}
			return [];
	    },

	    // add words to local storage
	    addWord: function(word) {
	    	var toAdd = new Word(word);
	    	// initial case
	    	if (!localStorage[WORD_LIST_KEY]) {
		    	localStorage[WORD_LIST_KEY] = JSON.stringify([toAdd]);
  			
		    // nth word case
  			} else {
			    var currentWordList = JSON.parse(localStorage[WORD_LIST_KEY]);
			    for(var i=0;i<currentWordList.length;i++) {
			    	if (word == currentWordList[i].word) { return; }
			    }
			    console.log("adding word: " + word + ", currentWordList: " + currentWordList);
			    currentWordList.push(toAdd);
			    localStorage[WORD_LIST_KEY] = JSON.stringify(currentWordList);
			}
		},

		// removes words from local storage (used for debug purposes)
		removeWord: function(word) {
			var currentWordList = JSON.parse(localStorage[WORD_LIST_KEY]);
			for(var i=0;i<currentWordList.length;i++) {
			   	if (word == currentWordList[i].word) { 
			   		currentWordList.splice(i, 1);
			   		break
			   	}
			}
			localStorage[WORD_LIST_KEY] = JSON.stringify(currentWordList);
		}
	
		// end public interface    
  	};
})();