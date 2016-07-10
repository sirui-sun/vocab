// listen to messages passed from content extension, and add them to local storage
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
  		console.log("background task received request: " + request);
  		localStorageAccess.addWord(request);
});