from bs4 import BeautifulSoup
from string import ascii_lowercase
OUTPUT = "atoz.html"
BASE_FILENAME = "wb1913_{0}.html"

for letter in ascii_lowercase:
	currFilename = BASE_FILENAME.format(letter)
	with open(currFilename) as f:
		html = f.read()
		soup = BeautifulSoup(html, "html.parser")
		bodyString = str(soup.body)
		bodyString = bodyString.replace("<body>", "").replace("</body>", "")
		with open(OUTPUT, "a") as outputFile:
			outputFile.write(bodyString[1:-1])