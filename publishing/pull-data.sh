#!/bin/bash
SCRIPT_DIR=$(dirname $0)

RemoteRoot=/home/ec2-user/SuperBowlQuiz/
LocalRoot=$SCRIPT_DIR/../

copyFolder() {
    folder=$1
    mkdir -p ${LocalRoot}/${folder}
    scp -r SuperBowlQuiz:${RemoteRoot}/${folder}/* ${LocalRoot}/${folder}/
}

copyFolder database_setup/dump/
