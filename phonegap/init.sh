#!/bin/sh


cordova create IowaCulture io.fresk.iowa-culture IowaCulture;
cd IowaCulture;
cordova platform add ios;
cordova plugin add org.apache.cordova.console;
cordova plugin add org.apache.cordova.statusbar;
cordova plugin add org.apache.cordova.geolocation;

rm ./config.xml
rm -r ./www

cp ../Icon* ./
cp ../config.xml ./config.xml
cp -r ../../dist ./www

cordova build ios

open ./platforms/ios/IowaCulture.xcodeproj

