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

        stage('Deploy Container') {
            steps {
                echo "Stopping existing container (if any) and deploying new one..."
                script {
                    sh """
                        docker stop ${CONTAINER_NAME} || true
                        docker rm ${CONTAINER_NAME} || true
                        docker run -d -p 5000:5000 --name ${CONTAINER_NAME} ${IMAGE_NAME}
                    """
                }
            }
        }
    }

    post {
        failure {
            echo 'Pipeline failed! Please check the logs.'
        }
        success {
            echo 'Pipeline completed successfully!'
        }
    }
}
