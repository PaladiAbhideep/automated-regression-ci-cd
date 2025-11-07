pipeline {
    agent {
        docker { image 'node:18' }
    }

    environment {
        // Secret text credential stored in Jenkins (create credential id 'dashboard-api-token')
        DASHBOARD_API_TOKEN = credentials('dashboard-api-token')
    }

    stages {
        stage('Checkout') {
            steps { checkout scm }
        }

        stage('Install') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Run Tests') {
            steps {
                // Runs Jest with junit reporter (test:ci script)
                sh 'npm run test:ci'
            }
            post {
                always {
                    // Publish any junit xml files produced by tests
                    junit '**/junit*.xml'
                }
            }
        }

        stage('Report to Dashboard') {
            steps {
                // report_results.js reads DASHBOARD_API_TOKEN from env
                sh 'node ./scripts/report_results.js'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
            post {
                success {
                    archiveArtifacts artifacts: 'build/**', fingerprint: true
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        failure {
            echo 'Build failed - check console and test results.'
        }
    }
}
