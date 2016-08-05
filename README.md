[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/Flet/semistandard)  [![Build Status](https://travis-ci.org/weeklydev/weeklydev.io.svg?branch=development)](https://travis-ci.org/weeklydev/weeklydev.io)

# WeeklyDev.io
This is the source to the WeeklyDev.io API and Member's Panel Frontend

# Installation
To pull the repo, use `git clone https://github.com/weeklydev/weeklydev.io.git`

Install [MongoDB](https://docs.mongodb.com/manual/installation/) and run it.

CD into the server directory and run `npm i` to install all the dependencies. The client is a work in progress still.

To run the projects, run `npm run watch` in the Server directory. It will watch your code for changes and restart the process, and compile es6 with babel. This will also start the api server on 
http://localhost:1337.

# Installation (with Docker)

* Clone this repository: `$ git clone https://github.com/weeklydev/weeklydev.io.git`
* Install docker: https://www.docker.com/
* Run `$ docker-compose up --build` (where **`--build`** will rebuild changes)

The application is up and running
- `Client`  => http://localhost:3000
- `Server`  => http://localhost:1337

## Overall Goals

- Create a well-designed and functional landing page that clearly explains our vision of a place where developers can collaborate and interact with each other fluidly just by signing up.
- Create a blog/news/updates page to quickly present any changes or topics we wish to discuss.
- Integrate login with Reddit, & GitHub
- Provide a simple sign-up form w/ Questionnaire that allows developers to quickly and easily sign up to be on a team.
- Automate team generation based on Questionnaire results
- Have a place to present completed projects and allow users to vote on those projects.

## User Stories
**As a user I...**
- can view, update, and edit my responses to the questionnaire I filled out upon sign up
- can view, update, and edit my personal information like my email (username)
- can create a new team and select which role I want to be in
- can find a team that is searching for the role I select (Front, Back, PM)
- can be placed onto a team automatically with a “Choose what’s best for me” option
- must click a link in my email or my user menu if I’ve been invited to join a team through matchmaking
- can look through a history of my completed projects, and previous teams I’ve been a part of along with what role I was
- can set if I am actively wanting to be placed on a team

**As an admin I…**
- can add and remove users from a team
- can manually build teams
- can search through a list of users and remove them from their team

## DB Models

**Users**
- ID (OID)
- Username (String)
- Email (String)
- Password (String)
- Current Team ID (Team OID)
- Questionnaire Response (Questionnaire OID)
- Admin (Boolean)
- Active (Boolean)

**Questionnaire Responses**
- ID (OID)
- User ID (User OID)
- Preferred Role (Frontend, Backend)
- Willing to be Project Manager (Boolean) * Not in questionnaire, asked during match making…?
- Skill Level (INT 1 to 5)
- Project Size Preference (Small, Medium, Large)
- Timezone (User’s UTC offset)

**Teams**
- ID (OID)
- Project ID (OID)
- Project Submission ID (OID, Null initially)
- Project Manager (User OID)
- Lead Frontend (User OID)
- Frontend (User OID)
- Lead Backend (User OID)
- Backend (User OID)

**Projects**
- ID (OID)
- Title (String)
- Details (String)
- Deadline (String)
- Date Created (Timestamp)

**Project Submissions**
- ID (OID)
- Project ID (OID)
- Team ID (OID)
- Thumbnail URL (String)
- Gallery Images (String Array)
- Github Repo URL (String)
- Submitted On (Timestamp)
