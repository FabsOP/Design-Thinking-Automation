# Automating the Design Thinking Process Through Digital Tools

### What is Design Thinking
Design thinking is a human-centred problem solving approach that emphasizes empathy, collaboration, and iterative testing to develop creative, user-friendly solutions.

### The Problem
Design thinking workshops often struggle with unequal participation , where dominant voices overshadow others, hindering collaboration and limiting diverse ideas.

### A Solution
This project proposes a digital tool that interfaces with Miro, a popular online collaborative whiteboard platform. The tool monitors participant engagement and provides real-time feedback to facilitators to identify and address participation imbalances, promoting a more inclusive workshop.

### Poster
![Design Thinking Automation (DTA) Poster_page-0001](https://github.com/user-attachments/assets/d239ffcc-dea7-4601-a18c-c1ab02e88ce1)


To learn more about my project and the widgets, please visit my thesis website:  
https://projects.cs.uct.ac.za/honsproj/cgi-bin/view/2024/oryanpaulo.zip/  
  

## My Miro App
### How to start locally

- Run `npm init` to initialise 
- Run `npm i` to install dependencies from the package.json.
- Run `npm run start` to start the server \


### Installing the app on your miro team
  Your URL should be similar to this example:
 ```
 http://localhost:3000
 ```
- Paste the URL under **App URL** in your
  [app settings](https://developers.miro.com/docs/build-your-first-hello-world-app#step-3-configure-your-app-in-miro).
  -install to dev team
- Open a board; you should see your app in the app toolbar or in the **Apps**
  panel.

#### Testing the Monitoring App
To fully test the app's functionality:

Create Multiple Miro Accounts
Simulate multiple participants by creating several Miro accounts. This will allow you to test how the app handles multiple users interacting with the board.

Simulate User Activity
Log in to each account and perform various activities (e.g., creating items, moving objects) to see how your app tracks and monitors engagement.
