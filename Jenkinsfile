pipeline {
    agent any

    environment {
        DOCKERHUB_USERNAME = "prabool3822"
        BACKEND_IMAGE = "${DOCKERHUB_USERNAME}/portfolio-backend"
        FRONTEND_IMAGE = "${DOCKERHUB_USERNAME}/portfolio-frontend"

        EC2_HOST = "13.233.168.37"
        EC2_USER = "ubuntu"
        APP_DIR = "/home/ubuntu/test"
    }

    stages {
        stage('Checkout') {
            steps {
                echo "Code already checked out by Jenkins SCM"
            }
        }

        stage('Build Images') {
            steps {
                sh '''
                docker build -t $BACKEND_IMAGE:latest ./backend
                docker build -t $FRONTEND_IMAGE:latest ./frontend
                '''
            }
        }

        stage('Login Docker') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                    echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                    '''
                }
            }
        }

        stage('Push Images') {
            steps {
                sh '''
                docker push $BACKEND_IMAGE:latest
                docker push $FRONTEND_IMAGE:latest
                '''
            }
        }

        stage('Deploy') {
            steps {
                sshagent(['ec2-ssh-key']) {
                    sh '''
                    ssh -o StrictHostKeyChecking=no $EC2_USER@$EC2_HOST "
                        if [ ! -d $APP_DIR ]; then
                            git clone https://github.com/prabool3822/test.git $APP_DIR
                        fi

                        cd $APP_DIR
                        git pull origin main

                        docker-compose down
                        docker pull $BACKEND_IMAGE:latest
                        docker pull $FRONTEND_IMAGE:latest
                        docker-compose up -d
                        docker ps
                    "
                    '''
                }
            }
        }
    }
}
