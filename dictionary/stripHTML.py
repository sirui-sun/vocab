from bs4 import BeautifulSoup
import json
INPUT = "atoz.html"
OUTPUT = "dict.json"

dictionary = {}

def AddWordToDictionary(word, partOfSpeech, definition):
	entry = "{0}|{1}".format(partOfSpeech, definition)
	if word in dictionary:
		dictionary[word].append(entry)
	else:
		dictionary[word] = [entry]

with open(INPUT) as f:
	html = f.read()
	soup = BeautifulSoup(html, "html.parser")
	for wordSoup in soup.find_all('p'):
		word = wordSoup.b.string.encode("utf-8").lower()
		partOfSpeech = str(wordSoup.i.string).replace("\"", "'")
		definition = wordSoup.encode("utf-8").split("</i>) ")[1].split("</p>")[0].replace("\"", "'")
		AddWordToDictionary(word, partOfSpeech, definition)

with open(OUTPUT, 'w') as g:
	g.write("var dict = " + json.dumps(dictionary))