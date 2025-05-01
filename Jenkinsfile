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

        stage('Check Docker Version') {
            steps {
                echo 'Checking Docker version...'
                powershell 'docker --version'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "Building Docker image: ${IMAGE_NAME}:${BUILD_ID}"
                script {
                    def shortCommit = powershell(script: "git rev-parse --short HEAD", returnStdout: true).trim()
                    env.IMAGE_TAG = "${BUILD_ID}-${shortCommit}"
                    docker.build("${IMAGE_NAME}:${IMAGE_TAG}")
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                echo "Pushing image to Docker Hub: ${IMAGE_NAME}:${IMAGE_TAG}"
                script {
                    docker.withRegistry('https://index.docker.io/v1/', 'dockerhub-creds') {
                        docker.image("${IMAGE_NAME}:${IMAGE_TAG}").push()
                        docker.image("${IMAGE_NAME}:${IMAGE_TAG}").push('latest')
                    }
                }
            }
        }

        stage('Deploy Container') {
            steps {
                echo "Stopping existing container (if any) and deploying new one..."
                script {
                    powershell """
                        docker stop ${CONTAINER_NAME} || echo 'No container to stop.'
                        docker rm ${CONTAINER_NAME} || echo 'No container to remove.'
                        docker run -d --restart unless-stopped -p 5000:5000 --name ${CONTAINER_NAME} ${IMAGE_NAME}:${IMAGE_TAG}
                    """
                }
            }
        }

        // Optional: Frontend deployment
        // stage('Deploy Frontend') {
        //     steps {
        //         echo "Deploying React frontend..."
        //         // Add your React build & deployment steps here
        //     }
        // }
    }

    post {
        failure {
            echo 'Pipeline failed! Displaying container logs (if available)...'
            script {
                powershell "docker logs ${CONTAINER_NAME} || echo 'No logs available.'"
            }
        }
        success {
            echo "Pipeline completed successfully! Deployed image: ${IMAGE_NAME}:${IMAGE_TAG}"
        }
    }
}
