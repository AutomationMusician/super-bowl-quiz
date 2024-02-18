#!/bin/bash
SCRIPT_DIR=$(dirname $0)

RemoteRoot=/home/ec2-user/SuperBowlQuiz/
LocalRoot=$SCRIPT_DIR/../

scp -r ${LocalRoot}/configs/questions.json SuperBowlQuiz:${RemoteRoot}/configs/
