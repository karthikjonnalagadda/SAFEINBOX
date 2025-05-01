pipeline {
    agent any

    environment {
        IMAGE_NAME = 'karthikjonnalagadda/safeinbox'
    }

    stages {
        stage('Clone') {
            steps {
                git branch: 'main', url: 'https://github.com/karthikjonnalagadda/SAFEINBOX.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    docker.build("${IMAGE_NAME}")
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', 'dockerhub-creds') {
                        docker.image("${IMAGE_NAME}").push('latest')
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                sh 'docker run -d -p 5000:5000 ' + IMAGE_NAME
            }
        }
    }
}
