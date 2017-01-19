from bs4 import BeautifulSoup
import json
INPUT = "atoz.html"
OUTPUT = "dict.json"

dictionary = {}

# Adds words to dictionary, given a HTML file of word definitions in the following format:
# <p><b>[word]</b> (<i>[part of speech]</i>) [definition] </p>

def AddWordToDictionary(word, partOfSpeech, definition):
	entry = (partOfSpeech, definition)
	if word in dictionary:
		dictionary[word].append(entry)
	else:
		dictionary[word] = [entry]

with open(INPUT) as f:
	html = f.read()
	soup = BeautifulSoup(html, "html.parser")
	for wordSoup in soup.find_all('p'):

		# get the word in question, convert all words to lowercase
		word = wordSoup.b.string.lower()
		
		# get the part of speech
		partOfSpeech = wordSoup.i.string

		# get the definition
		definition = wordSoup.contents[3][2:]

		# add to ongoing dictionary
		AddWordToDictionary(word, partOfSpeech, definition)

with open(OUTPUT, 'w') as g:
	g.write("var dict = " + json.dumps(dictionary))