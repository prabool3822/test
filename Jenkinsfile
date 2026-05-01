pipeline {
    agent any

    environment {
        DOCKERHUB_USERNAME = "prabool3822"
        BACKEND_IMAGE = "${DOCKERHUB_USERNAME}/backend"
        FRONTEND_IMAGE = "${DOCKERHUB_USERNAME}/frontend"

        EC2_HOST = "13.233.168.37"
        EC2_USER = "ubuntu"
        APP_DIR = "/home/ubuntu/test"
    }

    stage('Checkout') {
        steps {
            echo "Code already checked out from SCM"
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
                    usernameVariable: 'USER',
                    passwordVariable: 'PASS'
                )]) {
                    sh 'echo $PASS | docker login -u $USER --password-stdin'
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
                        cd $APP_DIR || git clone https://github.com/prabool3822/test.git $APP_DIR
                        cd $APP_DIR
                        docker-compose down
                        docker pull $BACKEND_IMAGE:latest
                        docker pull $FRONTEND_IMAGE:latest
                        docker-compose up -d
                    "
                    '''
                }
            }
        }
    }
}
