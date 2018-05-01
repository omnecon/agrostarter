rm -rf ./dist
ng build
aws s3 sync ./dist/ s3://agruno-dev01 --delete 
