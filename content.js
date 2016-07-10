//  Google searches, check for definition lookup
processWord(window.location.href);

// Required to catch instant search updates
var hashDetection = new hashHandler();

//TODO: handle this via jQuery window binding, as opposed to pinging
function hashHandler(){
    this.oldHash = window.location.hash;
    this.Check;

    var that = this;
    var detect = function(){
        if(that.oldHash!=window.location.hash){
            that.oldHash = window.location.hash;
            processWord(window.location.href)
        }
    };
    this.Check = setInterval(function(){ detect() }, 100);
}

// processes the word in the current URL
function processWord(URL) {
	var word = getWordFromURL(URL)
	if (word) {
    sendMessage(word);
	}
}

// Given a URL, determines if this was a request for definition
// Returns the word if it was found, else empty string
function getWordFromURL(url) {

  // get query param
  var a = url.split("q=");

  if (a.length < 2) {
    return ""
  } 

  // sanitize search query string:
  //  remove trailing parametersch
  //  un URL encode
  //  replace "+" with spaces
  // use the last q= parameter to support instant queries (which additional query parameters to the end of the URL)
  var searchQueryStringRaw = a[a.length-1].split("&")[0];		
  var searchQueryString = decodeURIComponent(searchQueryStringRaw).replace("+", " ");

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

// sends the new word to the extension for processing
function sendMessage(word) {
  console.log("sending message for word: " + word);
  chrome.runtime.sendMessage(word);
}
