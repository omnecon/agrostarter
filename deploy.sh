#!/bin/bash
export AWS_ACCESS_KEY_ID=AKIAJG7PPNFI2XIZ2W7A;
export AWS_SECRET_ACCESS_KEY=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;
rm -rf ./dist
ng build --target=production --environment=prod
aws s3 sync ./dist/ s3://agruno-dev01 --delete
echo "Deployed updated successfully at: https://dev01.agruno.xyz/"; 
