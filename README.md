# CS 480x Final Project: The Cite Site

### Link to website
https://cs480x-finalproj.herokuapp.com/

### Link to screencast
https://drive.google.com/file/d/1XXTSnp6-5avM_cMBkNQ-78uAGHj7czQd/view?usp=sharing
### Link to process book
https://docs.google.com/presentation/d/1cQQQJsY07G3MfgyOrK9SuGxIeXiW2jEE8WgqjSec03E/edit?usp=sharing

## Program Structure: 
- In the views folder we have the html used for the webpages in the project.
- In the public folder there is the following:
  - javascript folder with the separate scripts treeSquare.js for the treemap and the main index.js, which contains the
  code that handles the behaviour of the html: takes the word the user typed in the box and uses it to request the
  similar topics and the citations from Wikimedia. With this data we create the treemap and the list on its right.
  - stylesheets folder contains the css that define the syle of the webpage and the charts.
- The routes folder contains the server routers. The main one is index.js, which deals with all requests to the wikipedia
REST API (documentation available here: https://en.wikipedia.org/api/rest_v1/)
  
# To Run
On UNIX: `DEBUG=final-project:* npm run devstart`  
On Windows: `set DEBUG=final-project:* & npm run devstart`

# Pushing to Heroku
1) Push all desired code to master branch of git repo
2) Run `git push heroku master`
3) Run `heroku open`

If build fails, run `heroku logs` to see error

# Technical Achievements
- Fully integrated Wikipedia REST API
- Made a way to give treemap children proper relative size without creating a heirarchy of entire database of wikipedia 
pages
- Learned how to use Promises!
# Design Achievment
- Made cool timeline
- Treemap follows screen when scrolling down to keep context
- Searching new page starts you back at the top of the timeline
- Linked timeline to treemap