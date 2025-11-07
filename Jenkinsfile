pipeline {
    agent any
    environment {
        DASHBOARD_API_TOKEN = credentials('dashboard-api-token')
    }
    stages {
        stage('Checkout') {
            steps { checkout scm }
        }

        stage('Install') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'npm ci'
                    } else {
                        bat 'npm ci'
                    }
                }
            }
        }

        stage('Run Tests') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'npm run test:ci'
                    } else {
                        bat 'npm run test:ci'
                    }
                }
            }
            post {
                always {
                    junit '**/junit*.xml'
                }
            }
        }

        stage('Report to Dashboard') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'node ./scripts/report_results.js'
                    } else {
                        bat 'node .\\scripts\\report_results.js'
                    }
                }
            }
        }

        stage('Build') {
            steps {
                script {
                    if (isUnix()) {
                        sh 'npm run build'
                    } else {
                        bat 'npm run build'
                    }
                }
            }
            post {
                success {
                    archiveArtifacts artifacts: 'build/**', fingerprint: true
                }
            }
        }
    }
    post {
        always { cleanWs() }
        failure { echo 'Build failed - check console and test results.' }
    }
}
