1. Launch AWS Linux Image
    - type: t2.micro
    - Use "super-bowl-quiz" security group
    - 20 GiB root volume
1. Install docker:
    ```sh
    sudo yum install docker
    sudo usermod -a -G docker ec2-user
    id ec2-user
    newgrp docker
    ```
1. Install docker-compose
    ```sh
    curl -SL https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-linux-x86_64 -o ~/docker-compose
    chmod +x ~/docker-compose
    sudo mv ~/docker-compose /usr/local/bin/docker-compose
    sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
    ```
1. Install git: `sudo yum install git`
1. Clone github repo: `git clone https://github.com/AutomationMusician/SuperBowlQuiz.git`
