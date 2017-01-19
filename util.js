// are we in debug mode?
var DEBUG_MODE = false;

// Spaced repetition intervals, in seconds =======================================
// 		Current formula: 20 minutes, 1 day, 2 days, 4 days, 7 days, 
// 		11 days, 14 days, 21 days , 35 days, 70 days, 105 days
var intervals = [0, 1/72, 1, 2, 4, 7, 11, 14, 21, 35, 70, 105];

// intervals for iterating over spaces array
var MIN_INTERVAL = 0;
var MAX_INTERVAL = intervals.length;

//  Word state ===================================================================
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
	return shouldBeDisplayedNow(this.timestamp, this.interval);
};

function shouldBeDisplayedNow(timestamp, interval) {
	var now = new Date();
	var toCheck = new Date(timestamp);
	toCheck.setDate(toCheck.getDate() + intervals[interval]);
	return now > toCheck;
}

// Word definition ===============================================================
// var WordDefinition = function(word, partOfSpeech, )


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
	    // TO DO: what happens if a word that's already been in the list is added again?
	    // TO DO: if you use lambdas, then you wouldn't have to write the for loop twice right?
	    addWord: function(word, timestamp=null, interval=null) {
	    	var toAdd = new Word(word, timestamp, interval);
	    	// initial case
	    	if (!localStorage[WORD_LIST_KEY]) {
		    	localStorage[WORD_LIST_KEY] = JSON.stringify([toAdd]);
		    // nth word case
  			} else {
			    if (this.getWord(word) != null) { return; } // the repeat word case
  				var currentWordList = JSON.parse(localStorage[WORD_LIST_KEY]);
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
			   		break;
			   	}
			}
			localStorage[WORD_LIST_KEY] = JSON.stringify(currentWordList);
		},

		// updates an existing word with new values
		updateWord: function(word, timestamp, interval) {
			this.removeWord(word);
			this.addWord(word, timestamp, interval);
		},

		// searches through the list for a word and returns it
		getWord: function(word) {
			var wordsList = JSON.parse(localStorage[WORD_LIST_KEY]);
			for(var i=0;i<wordsList.length;i++) {
				if (word == wordsList[i].word) return wordsList[i];
			}
		},

		// increments the interval for the word
		incrementIntervalForWord: function(word) {
			var w = localStorage[WORD_LIST_KEY];
			if (!w) return;
			var currWord = this.getWord(word);
			if (!currWord) return;

			// update the word in local storage to reflect incremented interval
			// updates the interval until we are at a point where we shouldn't display the word
			var newInterval = currWord.interval;
			while (shouldBeDisplayedNow(currWord.timestamp, newInterval) && newInterval < MAX_INTERVAL) {
				newInterval++;
			}
			this.updateWord(currWord.word, currWord.timestamp, newInterval);			
		},

		// updates the timestamp for a certain word
		updateTimestampForWord: function(word, timestamp) {
			var w = localStorage[WORD_LIST_KEY];
			if (!w) return;
			var currWord = this.getWord(word);
			if (!currWord) return;

			this.updateWord(currWord.word, new Date(), currWord.interval);
		}
		
  	};	// end public interface    
})();

// Module for accessing local storage ============================================
// TODO: read up on JS module pattern
var Dictionary = (function() {
	
	return {
		// get words from local storage
	    define: function(word) {
			if(!dict) { return ""; } // not loaded
			
			// get word from dictionary
			return dict[word.toLowerCase()];
	    }
  	};	// end public interface    
})();