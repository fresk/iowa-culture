#!/bin/sh


#cordova create IowaCulture io.fresk.iowa-culture IowaCulture;
cd IowaCulture;
#cordova platform add ios;
#cordova plugin add org.apache.cordova.console;
#cordova plugin add org.apache.cordova.statusbar;
#cordova plugin add org.apache.cordova.geolocation;
cordova plugin add org.apache.cordova.console;
cordova plugin add org.apache.cordova.statusbar;
cordova plugin add org.apache.cordova.geolocation;
cordova plugin add org.apache.cordova.network-information;
cordova plugin add org.apache.cordova.inappbrowser;


rm ./config.xml
rm -r ./www

cp ../Icon* ./
cp ../config.xml ./config.xml
cp -r ../../dist ./www

cordova build ios

open ./platforms/ios/IowaCulture.xcodeproj

