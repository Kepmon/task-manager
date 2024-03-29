[This app](https://task-manager-6f064.web.app/) is a [Frontend Mentor challenge](https://www.frontendmentor.io/challenges/kanban-task-management-web-app-wgQLt-HlbB) that I decided to take on, due to several reasons:
* To practice Vue and Typescript before moving on to learning Nuxt,
* I don't feel like I have a good eye for design and I didn't want to spend much time on designing the app, anyway, so I thought maybe this time I could actually use the ready-to-use design files that the Frontend Mentor's challenges are provided with,
* I thought this would be a good opportunity to practise the pixel-perfect approach,
* I thought such an app could be an interesting base for converting to the desktop app in the future, since I intend to learn Electron in the future, anyway.

At the current state, there are many things that still need to be added/improved. However, **the core functionality of the app works already**.
Nevertheless, I'm perfectly aware of a number of lacks and shortcomings that this app still suffers from, which I obviously will be fixing in the upcoming days. Many of them will be mentioned in the sections below.

Apart from the functionality "imposed" by the Frontend Mentor creators, I decided to connect this app to the Firebase backend, in order to allow the users to create an account and store their data.

## 📣 Important info
* You need to **create an account** in order to be able to use the app.
* I highly encourage you to create this account, but, if you really don't want to do this, for whatever reason, you can use this **test account**, with the following data:  

| Data          | Value    |
| ------------- |:----------------:|
| email         | test0@example.com|
| password      | test1234| 
* Since I didn't use either a proprietary backend or any SSR-serving tool, **_please, DO NOT provide any real data (e.g. personal email address or a password used elsewhere)_**, while creating an account, because your user data is still accessible for basically anyone, if they know where to find it. 
* However, you still need to pass the form validation, meaning the data you provide while signing up has to meet the following criteria:  

| Data          | Correct input    |
| ------------- |:----------------:|
| password      | min. 8 characters|
| email         | <span>example@</span><span>example.com</span>|
* The verification of an email address has never been turned on, so you may input any valid email address and you're not expected to confirm that this is your actual one.

## 💻 Technologies
![Vue](https://img.shields.io/badge/Vue-4FC08D?style=for-the-badge&logo=vuedotjs&logoColor=white)
![Tailwind-css](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Typescript](https://img.shields.io/badge/Typescript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFA611?style=for-the-badge&logo=firebase&logoColor=white)

##
_Some of the following sections were divided into collapsible subsections, so you can read only the one(s) you're actually interested in. This is because I anticipate, those would be long ones and I don't want to create this bad user experience by forcing you to read it all or scrolling through it. Also, I believe, the readibility of the whole README will be enhanced this way._

## 🎓 What did I learn
<details>
  <summary>1. Universal knowledge</summary>
  
  * **Experience matters**
    - before starting coding this project, I looked at it and thought "why is it at Guru level on this FrondendMentor thing? - it looks fairly easy..." - now I understand it is the experience that allows you to **reliably** evaluate that
    - I also thought, it would take me 1-2 months to write it - yeah... What's (a little bit) funny is that this was actually the lack of experience that made me coding it much longer that I expected
    - I probably shouldn't brag about that but I strongly believe I made (due to the lack of experience) all possible mistakes on this one. Every. Single. One. The good thing out of it is that now I have at least this experience, which, I hope, will shorten the time needed for finishing my next projects because I won't repeat the same mistakes. But I'll probably make new ones. And learn from it. And new ones. And learn... and so on 😅
  * **Think how to approach coding a big(ger) project **before** you write any code**
  * **Think about your database structure **before** starting implementing it**
  * **Maintability and scalability are a thing**
    - I remember my contributor (to this project) once told me "you'll see, the maintability will catch up with you eventually" and he was so right...
    - I can't even count how many times I had a component that was created with a particular intention and I hadn't actually intended to apply it anywhere else on my website, until one day I found out I actually needed it for one more thing and I was pretty surprised that I had to make almost no changes to it to make it work perfectly well in this new situation
    - Also, I can't cound how many times I had to repeat the same code in two places, when introducing changes, because I didn't give enough thought to the maintability 🙈
  * **If your gut is telling you some part of your code is a wrong approach, you'd better listen to it**
    - even if it's working now, it's not maintainable in the long run and it'll fall apart as soon as you start messing with it, what by the way reminds me of this meme:
    <img src="https://img-9gag-fun.9cache.com/photo/aze0zZb_700bwp.webp" alt="a funny meme about the difference between a programmer and a scientist" width="400" />  

    - more likely, it's not actually **fully** working, you just don't realize it yet
    - in the long run, it would be quicker to write it correctly from the very beginning, than refactoring it later on
  * **Automated tests probably make much more sense than I initially thought**
    - when writing the code for this project I faced so many situations where changing some part of existing code actually crushed half of my app due to a strong connection between different pieces of code
    - I didn't find a good way to track this, except for just manually testing the whole app. Which to me seemed impossible to do, due to way to many scenarios a user could use/navigate trough it. And this is still a fairly simple app. What about much more difficult ones?
    - that's why I believe, automated tests would be of great help in here, because if a change I made in my code impacted some other part of it, appropriate tests would just fail
  * **The type coercion and bang operator will take you so far...** - in the long run, you'll be probably much beter off if you just compare your variable to whatever you expect for it (not) to be... unless you want to practice your debugging skills 😉
  * If you can't come up with a short function name that would describe **everything** what's happening inside, that's probably not your language skills that are the problem but your function doing too many things - divide the function into smaller pieces, each having only one responsibility
  * my contributor was probably right saying I should have a branch per feature 😅
</details>

<details>
  <summary>2. Vue</summary>
  
  * Way too much to list.
  * However, I can briefly summarize everything I learnt on this one that **I was so wrong thinking that I knew Vue**, after writing my first website/app with it, only because I knew some syntax and my website worked.
  * This is actually a thought, but, concerning my previous point, it hit me when coding this project that it's probably better to know one technology well (enough) than knowing only some basics of a bunch of them - I wonder what "Vue developer" I would make if I stopped learning Vue at the previously mentioned point and jumped over to another framework or technology...
</details>

<details>
  <summary>3. TypeScript</summary>
  
  When I was starting with this project, I was a very begginer to TypeScript, so I had so much to learn.
  I strongly believe I'm still a beginner when it comes to this technology but I've certainly learnt a lot out of it, when coding this project. 
  Nevertheless, I will omit in the following list some syntax stuff, like `Omit`, `Pick`, `Record` or `keyof typeof` (which, by the way, has recently become my favorite combination of words 😅) and I'll just focus on some general knowledge that will certainly help me in my next projects.
  
  * **TypeScript is a king**
    - I remember not being really willing to learn it at first, but now, I can't imagine writing any website or (especially) an app without it
    - I strongly doubt this app would even exist if not for TypeScript 🙈
    - When coding this project I actually started contemplating about how is it even possible, someone would come up with a programming language that doesn't include types
  * "No overload matches this call (...)" simply means that there's some discrepancy between the object that TypeScript expected for you to pass and the one you actually passed - either one of them is wrongly typed or you passed a completely different object. Just go, look for this difference and fix it. [This VS Code extension](https://github.com/yoavbls/pretty-ts-errors) will certainly help you with that.
  * If TypeScript yells at you "a variable is possibly null", **it may be actually null** - type assertion isn't usually a way to go. Sometimes it is, though. But you'd better think it through before making it, maybe your function actually lacks a guard, not a type assertion?
</details>

## 💫 A more detailed info about the project
<details>
  <summary>1. As a user, you can...</summary>
  
  * Create and delete an account  
    - **however**, due to some Firebase's restritions, you need to input your password before deleting your account, so you better remember it if you have the intention of deleting your account
    - please, **don't delete the test account** 😉
  * Log in and out from the app
  * Change the app's theme
  * (On desktop view) hide/show sidebar
  * Create/edit/delete boards
    - that serve as main categories for your tasks - for example, if you're a web designer or a programmer, you may want to have a separate board for each of your projects
  * Create/edit/delete columns
    - that serve as categories for your tasks - for example, you may have "Todo"/"Doing"/"Done" columns to sort your tasks out
  * Create/edit/delete tasks
  * Move tasks between columns by either making an appropriate change in the "edit board" form or by dragging them between columns
  * Create and delete subtasks for each task
  * Toggle the completed status of each subtask
</details>

<details>
  <summary>2. User Experience</summary>
  Below, I listed some small adds-on that I decided to implement because I believe they would elevate the user experience.  
  
  * **Optimized timing of popups showing up**: I decided to shorten the "success" popups and prolong the "error" ones, because: 
    - as a user, you're not necessarly keen to see for example this "You logged in successfully" message for a prolonged time, everytime you log in 
    - **but**, if there's a problem with your logging in action, you should have time to be able to fully read the error message, since (in most cases), it'll tell you what's actually wrong  

  **UPDATE**  
  @solracss pointed out to me that I should actually completely remove the "success" popups, since there are always some visible changes to the UI, anyway (like redirecting a user to another page or an item being added/removed from the dashboard). After giving it some thought, I considered it to be a valid point, so I kept only the "error" popups, concurrently adding them for the board-related stuff. Only accessibility became more of an issue with this approach since I persisted on a screen-reader to read a popup, as a blind user can't really see the UI changes. But I believe, I handled it.
  * **Custom error messages for the auth actions**: I thought it would be helpful to a user if I adjust the error message for typical cases, being: 
    - a user with such credentials already exists (singing up)
    - a user with such credentials doesn't exist (logging in)
    - a user inputs a wrong password (logging in)  
In the remaining cases (probably some Firebase/server issues), a user just gets this general "Ooops, something went wrong (...)" message.  

**UPDATE**  
Again, @solracss pointed out to me that I shouldn't really do such a customization of error messages because I actually facilitate the hakers' job if they were up to guess the user credential, based on my error message. So, in the current approach, I replaced all previously mentioned custom messages with just "The user name or password are incorrect" and kept the "Ooops, (...)" message for the remaining cases.
  * **You may stay logged in in the app, if you want to**: As a user, you can just close the app's tab in a browser (without logging out) and you'll be back on your dashboard view (with the same current board being displayed), but:
    - due to security reasons, if you stay logged in for more than 30 days, you will be automatically logged out, so the next time you open the app, you'll have to log in again, to confirm it's still you 😉
    - to be able to make it working, I need to store your user data as well as your current board in localStorage
    - according to [this](https://supertokens.com/blog/cookies-vs-localstorage-for-sessions-everything-you-need-to-know) and [this](https://stackoverflow.com/a/63330885) sources, I don't need to put the cookies banner that informs you about me using localStorage for storing your "strictly necessary data", so you'll never find out about that unless you read this README or check your localStorage yourself
    - when you log out, your user object will be removed from the localStorage, however, the current board object still needs to stay there, so the proper board is displayed when you come back
    - all your stored data will be removed from localStorage when you delete your account

**_What about multiple users using the very same computer/browser for using the app?_**
* if you don't log out when quitting the app, the next person will see your dashboard when opening the app (I believe that's obvious)
* however, I believe you would actually log out when using, for example, a public computer
* the current board of each user is stored separately in localStorage (I assigned the user ID to its name), so if you do log out, the next user will see their current board, not yours

**_What if I delete my localStorage data or just clear the browser cache?_**
* if you only delete your current board value, it'll default it to the first one (being actually the last added, since I decided to sort them from the newest to oldest ones)
* if you only delete your user value, you'll be automatically logged out, **after closing the browser tab** (you'll still be able to use the app as long as you don't close the browser tab), so you'll have to log in again when coming back
* if you delete all your localStorage data or clear your browser data, both abovementioned will apply

* **Navigating through website**: Since this is more of app-like website, there are no many pages that you could navigate to - almost all your interactions with the app happen in dashboard, however: 
    - I made a separate `/privacy-policy` page - you can go to it as both authenticated and non-authenticated user by typing it's address in the browser address bar
    - but, if you click the "Privacy Policy" link on auth pages, the privacy policy content will show up as a popup, in case you already inputed some data into a form and you don't want to loose it when switching pages
    - as an authenticated user, there is no point of you going to auth pages, so if you try to do that, you'll be redirected back to your dashboard
    - as non-authenticated user, you shouldn't be able to go to the dashboard page, so - again - if you try to do that, you'll be redirected to the main (login) page
    - since Vue is an SPA, in theory you cannot refresh any page (except for the main page) - but I overcame that by hosting the website using the Firebase hosting service that just redirects all page requests to the main page. My routing, described above, will take care of the rest.
    - when being on the `/privacy-policy` page, there is this button for your convenience, that will take you to the main/dashboard page, depending on you being authenticated or non-authenticated user
    - if you go to any page that doesn't exist, you'll see the custom 404 page and you may go to the either home/dashboard page or the previous page, from it
    
    * **The app theme**: To be able to apply the light/dark theme for the app, I used `useDark` utility from `VueUse`, that comes with some nice features: 
    - the default theme depends on your browser/system preferences - if you have the preffered dark theme set, this will be your default theme for my app; if not - the default theme will be the light one
    - this utility also stores the theme you chose in localStorage, so it'll be the same everytime you open the app as long as you:
        - don't change it
        - don't change the browser
        - don't delete it from localStorage
        
Moreover, for your convience, I put the theme toggler on every page (except for the 404 one, since I believe you didn't come over there to switch the theme, and, in fact, you had actually no intention to come there, at all), so you can change it at any stage of using the app.
</details>


<details>
  <summary>3. Accessibility</summary>
  
  One of my main goals for this app was to make it fully accessible for both keyboard- and screen-reader-navigating users. I tried to do my best to achieve this goal, but there is still a room from improvement in here.

  At the current stage:
  * as a user, you can click the **"skip-to-content"** button, to navigate directly to your columns/tasks
  * **the app is fully accessible for keyboard-navigating users** - you don't really need a mouse to be able to use it
  * **adjusting the app for the screen-reader-navigating users** was a bit trickier but I spent a couple of days on improving it and managed to achieve the following functionality:
    - a screen reader reads all popup's messages
    - a screen reader announces the currently chosen board
    - a screen reader announces the add/edit modals as `dialog`
    - `aria-controls` and `aria-expanded` were added to relevant buttons
    - `aria-required` and `aria-invalid` were added to relevant input fields
    - when an input field is invalid, a screen reader announces what's wrong (however, since `aria-errormessage` doesn't seem to work on the NVDA reader ([related github issue](https://github.com/nvaccess/nvda/issues/8318)), I had to use `aria-label` to make it work)

  Unfortunately, regarding the screen readers functionality, certain issues came up, as well:
  * when open the `more-options` popup (by clicking the user/ellipsis icon), you **cannot navigate through its options using the arrow keys**, when using [NVDA](https://www.nvaccess.org/download/) - the screen reader completely ignores this whole popup. When using the Tab key though, you can navigate through the options but NVDA annouces each of them as "blank". This behavior is particularly confusing as:
    - it seems to be an issue only on chromium-based browsers (tested on Chrome, Brave, and Edge) - there are no problems with this functionality on Firefox
    - the buttons become working properly after first tabbing through each of them - at this point, you can use the arrow keys and they're correctly announced
    - with [this tool](https://chrome.google.com/webstore/detail/silktide-website-accessib/okcpiimdfkpkjcbihbmhppldhiebhhaf), the functionality also works perfectly fine (tested on Brave)  
    
  Therefore, I have no clue what's causing this issue and how could I fix it. I have a workaround in mind but, frankly, I really don't like the idea. So, I thought I'd leave it for now untill I get to know anything that could help me in improving that. Which I hope, will happen eventually.
  * I really don't like the screen reader behavior inside the "Delete this thing?" confirmation modals, even though this seems to be a correct one. The thing is, the first **focusable** element is focused, being the "delete" button in this case. Which, in practice means that the screen reader doesn't read the previous content ("Are you sure you want to delete (...)") unless a user specifically navigates upwards. I could obviously move the focus to the very first element inside this modal, being its title, but I think it would hurt the experience of keaboard-navigating users. That being so, I also decided to leave it termporarly and thinking about it "in the background", hoping for coming up with a good idea for providing a good experience for all users.
</details>

<details>
  <summary>4. Database Structure</summary>
  I feel like making this subsection as well since I changed my database structure like 5 or 6 times, before (I hope) I made it right, so I want to share what I've learnt along the way by describing how **I think** it should work.
  
  Obviously, I approached the database structure so many times because the performance of the app was of great importance in this case, since almost any user's interaction with it requires sending query to the database.
  
  Therefore, even though I know basically nothing about backend, I decided to do whatever it takes to make my app as performant as I'm able to achieve at the current state of my knowledge.
  
  Maybe I should start with the data structure that I believe would be best pictured by those interfaces:
  ```js
  interface Board {
    boardID: string
    createdAt: string
    name: string
  }

  interface BoardColumn {
    columnID: string
    createdAt: string
    name: string
  }

  interface Task {
    taskID: string
    createdAt: string
    title: string
    description: string
  }

  interface Subtask {
    subtaskID: string
    title: string
    isCompleted: boolean
    createdAt: string
  }
```

So, after making so many mistakes with it, I established it should work like that:  

  * I should have one main `users` collection
  * At the same time I shouldn't fetch them all to the Frontend to "pick" only the user that is currently logged in
  * Fortunately, the firebase's watcher onAuthStateChanged function could help me with that because it accepts the user object as a parameter and this one contains the user id
  * Having this id, I could use it for fetching the rest of the data that is stored as **subcollections**, meaning:
    - the `users` collection contains all user object
    - a `user` object contains the `boards` subcollection
    - I can use the user id to construct the path to their `boards`
    - each `board` contains `columns` subcollection
    - each `column` contains `tasks` subcollection
    - each task contains `subtasks` subcollection
  * This way, I always fetch the data that belong to particular user and don't have to worry about:
    - fetching too much data to be able to display the data belonging to a particular user
    - firing any loops (either on the client or on the server) to be able to filter this data, which, I believe, improves my app's performance
</details>

<details>
  <summary>5. What is it to be still improved?</summary>
  The foremost aspect to be improved ASAP is the code - there is way too much to mention everything, but I'll list some examples, anyway:  
  
  * cleaning up the code inside the stores, with particular emphasis on `tasksStore` that's just a big mess
  * many functions should be divided into smaller pieces of a single responsibility
  * certain components could be probably divided into the smaller ones, as well
  * certain variables should be in an appropriate store, instead of the component file
  * I should replace certain type assertions with guards
  * all `emit` functions should be typed
  
Apart from the code, it was brought to my attention that there are some issues with proper displaying of the app content on certain browsers (namely Firefox and Konqueror). Also, I don't have any Apple device, so I'm not sure about Safari. I'll try find some who could test it for me, though. 
 
As for Firefox, it should be an easy fix but this Konqueror thing may be more troublesome. Nevertheless, I'll try to do my best to fix all styling issues that I'm (or will be) aware of.

**Update:**
All UI issues in Firefox has been fixed.

Regarding this Konqueror browser, the issue was that the dark theme wasn't properly displayed. After a short while of debugging I realized this was because the `useDark` utility uses the `:is` pseudoclass to apply styles for the dark mode. And Konqueror obviously doesn't support this pseudoclass.

Funny story - I checked one of my previous websites, **written in Astro** in this browser, since Astro uses the `:where` pseudoclass for basically everything - as expected, it turned out that the styles weren't applied at all in this browser 😅

I have no intention to fix this, since I strongly believe the percent usage of this browser is... barely-existent. So if, for any reason, you happen to use this browser or any other one that seems to have troubles with properly displayed dark theme, just **use the light theme**.
</details>

<details>
  <summary>6. Possible future improvements</summary>
  I thought about certain features that could be added to the app to enhance the user experience. Those would be: 

  * **some kind of Q&A/tour** on how to navigate through the app, since, at times, I found some of the functionalities to not be very intuitive ones
  
  Apart from that, I'm also considering adding **dynamic imports** - not sure about this one though because it seems to me that: 

  * dynamic imports actually work better for long landing-page websites or multiple-page websites
  * whereas, in my app, the most "problematic" files are all used inside the dashboard view and if the user enters it, I need to load those files anyway
  * there is almost no other page where authenticated user could go, so I have no reason to assume, they wouldn't
  * even if I did assume that, I wonder if it wouldn't be too late to asynchronousily load all those components when the user is actually about to enter the page, especially for slower connections
  * I probably need to get to know more on that to be able to decide

  Nevertheless, I'm not sure whether I have time to apply the abovementioned in the upcoming days. That's why I labeled those as "possible" improvements. However, even if I'm not doing this anytime soon, I might still come back to this up in some unspecified future and add a new feature then.
</details>

## 🙏 Acknowledgments
A big thank you for @aleksanderwalczuk for:
* putting up with me during a significant part of the development of this app, 
* showing me some useful ready-to-use solutions,
* teaching me certain things about Vue and Typescript that I had had no idea about previously and that turned out to be so helpful along my whole way of developing this app,
* teaching me good practices of writing clean, maintanable, and scalable code.

Also, thank you @solracss for performing manual tests on my app and pointing out several issues that I overlooked.

## 📁 Sources

| Data          | Correct input    |
| ------------- |:----------------:|
| Close icon (PrivacyPolicy) | [SVG Repo - close bold](https://www.svgrepo.com/svg/500512/close-bold)|
| Arrow icon (PrivacyPolicy) | [SVG Repo - right arrow](https://www.svgrepo.com/svg/492503/right-arrow)|
| User icon (Dashboard)    | [SVG Repo - user circle](https://www.svgrepo.com/svg/507442/user-circle)|
| 404 image | [Storyset](https://storyset.com/illustration/oops-404-error-with-a-broken-robot/rafiki)
| Font | [Google Fonts](https://fonts.google.com/specimen/Plus+Jakarta+Sans?query=plus+jakarta+sans) |
| Privacy Policy content | [ChatGPT](https://chat.openai.com/) |