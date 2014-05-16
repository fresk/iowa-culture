 #!/bin.bash

cp phonegap/* dist/
zip -r dist dist

curl -u thomas@fresklabs.com:$PHONEGAP_PASSWORD -X PUT -F file=@./dist.zip https://build.phonegap.com/api/v1/apps/882278

