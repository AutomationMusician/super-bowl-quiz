#!/bin/bash
RemoteHome=/home/ec2-user
SuperBowlQuizFolder=../WebDevelopment/SuperBowlQuiz

copyFile() {
    file=$1
    scp ${SuperBowlQuizFolder}/${file} SuperBowlQuiz:${RemoteHome}/SuperBowlQuiz/${file}
}

copyFolder() {
    file=$1
    scp -r ${SuperBowlQuizFolder}/${file} SuperBowlQuiz:${RemoteHome}/SuperBowlQuiz
}

echo "Copying .env file"
scp ${SuperBowlQuizFolder}/aws.env SuperBowlQuiz:${RemoteHome}/SuperBowlQuiz/.env

copyFolder configs
copyFolder database_setup/dump
