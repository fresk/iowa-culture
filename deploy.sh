 #!/bin.bash

cp phonegap/* dist/
zip -r dist dist

curl -u thomas@fresklabs.com -X PUT -F file=@./dist.zip https://build.phonegap.com/api/v1/apps/882278

curl -u thomas@fresklabs.com -X POST -d 'data={"keys":{"ios": {"id":"160475","key_pw":"bUdthDry","keystore_pw":"$bUdthDry"}}}' https://build.phonegap.com/api/v1/apps/882278/build

