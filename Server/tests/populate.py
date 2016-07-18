#!/usr/bin/python
import random
import requests
import json
import time
import sys

start_time = time.time()
userNumber = (int(float(sys.argv[1])) or 200)


def randomName(capitalize):  
	bits=[]
	vowels="aeiou"
	letters="abcdefghijklmnopqrstuvwxyz"
	for ch in letters:
	    for v in vowels:
	        bits.append(ch+v)
	bits.remove("fu")
	bits.remove("hi")
	bits.remove("cu")
	bits.remove("co")
	bits.remove("mo")
	word=""
	rnd=len(bits)-1
	numOfBits=random.randint(2,3)
	for i in range(0,numOfBits):
	    word=word+bits[random.randint(1,rnd)]
	word=word+letters[random.randrange(0,25)]
	if (capitalize==True):
	    word=word.capitalize()
	return word

def createNewUser(username):
	url = "http://localhost:1337/users/new"
	payload = "username={0}&email={0}%40gmail.com&password=testtest".format(username)
	headers = {
	    'content-type': "application/x-www-form-urlencoded"
	    }
	return requests.request("POST", url, data=payload, headers=headers)


def postSurvey(token):
	url = "http://localhost:1337/survey"
	payload = "role%5B0%5D={0}&projectManager={1}&skill={2}&size={3}&timezone={4}".format(random.choice(['backend','frontend']),random.choice(['true','false']),random.randint(1,5),random.randint(3,5),random.randint(-12,12))
	headers = {
	    'authorization': "bearer {0}".format(token),
	    'content-type': "application/x-www-form-urlencoded"
	    }
	return  requests.request("POST", url, data=payload, headers=headers)

def joinMatchmaking(token):
	url = "http://localhost:1337/match/join"
	headers = { 'authorization': "bearer {0}".format(token) }
	return  requests.request("GET", url, headers=headers)

for i in range(1,userNumber):
	username = randomName(True)
	userResponse = createNewUser(username)
	token = json.loads(userResponse.text)['token']
	surveyResponse = postSurvey(token);
	matchmakingResponse = joinMatchmaking(token)
	printToken = False;
	
	print '{0}\t{1}\n\ttesttest'.format(i,username)
	if userResponse.status_code == 201:
		print '[x] Created\t{0}'.format(userResponse.status_code)
	else:
		print '\033[31m[ ] User not Created!\033[0m'
		print userResponse.text
		print '============================================================='
	if surveyResponse.status_code == 200:
		print '  --> Survey Created'
		if printToken:
			print '\nUser Token: {0}'.format(token)
	else:
		print '\033[31m||  something went wrong while creating survey\033[0m'
		print surveyResponse.text
		print '============================================================='
	if matchmakingResponse.status_code == 200:
		print '  --> Joined Matchmaking'
		if printToken:
			print '\nUser Token: {0}'.format(token)
	else:
		print '\033[31m||  something went wrong while applying for matchmaking\033[0m'
		print matchmakingResponse.text
		print '============================================================='
	print '______________'
endTime = (time.time() - start_time)
print("--- %s seconds ---" % endTime)
print("--- %s per User ---" % (endTime / userNumber))