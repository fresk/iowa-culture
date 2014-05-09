iowa-culture
============

to run dev server:

 - open terminal
 - `cd code/iowa-culture` to go into the project directory
 - `gulp` will start the default build task from gulpfile.js.  This starts autoreloading dev server
 - open chrome and go to http://emulate.phonegap.com
   - make sure ripple emulator extension is installed 
   - enter http://localhost:9000 to view app in emulator


to run a phonegap build online to update the application on actual phone:
 - open terminal
 - `cd code/iowa-culture` to go into the project directory
 - `./deploy.sh` will zip up the dist folder, upload and tell adobe to rebuild the app pkg (uses $PHONEGAP_PASSWORD, or change to your own account data)
