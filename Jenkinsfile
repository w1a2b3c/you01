pipeline {
    agent any
    environment{
        EMAIL_TO = 'pawel.cholewa@o2.pl'
        DOCKER_IMAGE = "tetris"
        DOCKER_TAG = "latest"
        VERSION = "latest"
        ARTIFACT_NAME = "tetris_artifacts_${VERSION}"    
    }

    stages {
        stage('Checkout') {
            steps {
                checkout([$class: 'GitSCM', 
                    branches: [[name: '*/master']], 
                    userRemoteConfigs: [[url: 'https://github.com/cholewa-p/react-tetris']]])
            }
        }
        stage('Build') {
            steps {
                sh "docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} --target build ."
                
            }
            post {
                success {
                    echo 'Build succesful'
                }
                failure {
                    echo 'Build failed!'
                    emailext body: 'Check console output at $BUILD_URL to view the results. \n\n ${CHANGES} \n\n -------------------------------------------------- \n${BUILD_LOG, maxLines=100, escapeHtml=false}', 
                    to: "${EMAIL_TO}", 
                    subject: 'Build failed in Jenkins: $PROJECT_NAME - #$BUILD_NUMBER'
                }
            }
        }
        stage('Test') {
            steps {
                sh "docker build -t test_image:${VERSION} --target test ."
            }
            post {
                success {
                    echo 'All tests passed!'
                }
                failure {
                    echo 'Tests failed!'
                    emailext body: 'Check console output at $BUILD_URL to view the results. \n\n ${CHANGES} \n\n -------------------------------------------------- \n${BUILD_LOG, maxLines=100, escapeHtml=false}', 
                    to: "${EMAIL_TO}", 
                    subject: 'Tests failed in Jenkins: $PROJECT_NAME - #$BUILD_NUMBER'
                }
            }
        }
        stage('Deploy'){
            steps{
                sh "docker container prune --force"
                sh "docker run -d --name tetris_app test_image:${VERSION}" 
                sh "docker ps"
            }
            post {
                success {
                    echo 'Deployment successful!'
                }
                failure {
                    echo 'Deployment unsuccessful'
                    emailext body: 'Check console output at $BUILD_URL to view the results. \n\n ${CHANGES} \n\n -------------------------------------------------- \n${BUILD_LOG, maxLines=100, escapeHtml=false}', 
                    to: "${EMAIL_TO}", 
                    subject: 'Deployment failed in Jenkins: $PROJECT_NAME - #$BUILD_NUMBER'
                }
            }
        }
        stage('Publish'){
            script{
            steps{
                withCredentials([usernamePassword(credentialsId: 'DOCKERHUB', passwordVariable: 'PASS', usernameVariable: 'USER')]) {
                sh 'docker login -u=${USER} -p=${PASS}'
                }
                sh 'docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} cholewap/${DOCKER_IMAGE}:${DOCKER_TAG}'
                sh 'docker push cholewap/${DOCKER_IMAGE}:${DOCKER_TAG}'
                sh 'docker save ${DOCKER_IMAGE}:${DOCKER_TAG} > ${ARTIFACT_NAME}.tar'
                archiveArtifacts artifacts: "${ARTIFACT_NAME}.tar", fingerprint: true
            }
            }
                post {
                    success {
                    echo 'Image published'
                    }
                failure {
                    echo 'Publishing failed'
                    emailext body: 'Check console output at $BUILD_URL to view the results. \n\n ${CHANGES} \n\n -------------------------------------------------- \n${BUILD_LOG, maxLines=100, escapeHtml=false}', 
                    to: "${EMAIL_TO}", 
                    subject: 'Publishing failed in Jenkins: $PROJECT_NAME - #$BUILD_NUMBER'
                    }
                }
        }
    }
}