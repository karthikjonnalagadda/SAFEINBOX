pipeline {
    agent any

    environment {
        IMAGE_NAME = 'karthikjonnalagadda/safeinbox'
        CONTAINER_NAME = 'safeinbox-container'
    }

    stages {
        stage('Clone Repository') {
            steps {
                echo 'Cloning Git repository...'
                git branch: 'main', url: 'https://github.com/karthikjonnalagadda/SAFEINBOX.git'
            }
        }

        stage('Clean Previous Docker Setup') {
            steps {
                echo 'Stopping and removing existing containers (if any)...'
                bat '''
                    docker stop %CONTAINER_NAME%
                    docker rm %CONTAINER_NAME%
                    docker rmi %IMAGE_NAME%
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "Building Docker image: ${IMAGE_NAME}"
                script {
                    docker.build("${IMAGE_NAME}")
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                echo "Pushing image to Docker Hub: ${IMAGE_NAME}:latest"
                script {
                    docker.withRegistry('https://index.docker.io/v1/', 'dockerhub-creds') {
                        docker.image("${IMAGE_NAME}").push('latest')
                    }
                }
            }
        }

        stage('Run Docker Container') {
            steps {
                echo "Running Docker container: ${CONTAINER_NAME}"
                bat '''
                    docker run -d -p 5000:5000 --name %CONTAINER_NAME% %IMAGE_NAME%
                '''
            }
        }

        stage('Show Running Containers') {
            steps {
                echo 'Currently running containers:'
                bat 'docker ps'
            }
        }

        stage('Show Container Logs') {
            steps {
                echo 'Fetching latest logs from the container...'
                bat 'docker logs --tail 100 %CONTAINER_NAME%'
            }
        }
    }

    post {
        failure {
            echo 'Pipeline failed. Attempting to clean up container...'
            bat '''
                docker stop %CONTAINER_NAME%
                docker rm %CONTAINER_NAME%
            '''
        }
        always {
            echo 'Cleaning up dangling images (if any)...'
            bat 'docker image prune -f'
        }
        success {
            echo 'Pipeline completed successfully!'
        }
    }
}
