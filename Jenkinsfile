pipeline {
    agent any

    environment {
        DASHBOARD_API_TOKEN = credentials('dashboard-api-token')
    }

    stages {
        stage('Checkout Code') {
            steps {
                echo 'Checking out code...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing dependencies...'
                bat 'npm install'
            }
        }

        stage('Run Regression Tests') {
            steps {
                echo 'Running Jest regression tests...'
                bat 'npm run test:ci'
            }
        }

        stage('Publish Test Results') {
    steps {
        echo 'Publishing JUnit test report...'
        catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
            junit allowEmptyResults: true, testResults: '**/junit*.xml'
        }
    }
}



        stage('Send Results to Dashboard') {
            steps {
                echo 'Reporting results to backend...'
                bat 'node scripts\\report_results.js'
            }
        }

        stage('Archive Artifacts') {
            steps {
                echo 'Archiving build artifacts...'
                archiveArtifacts artifacts: '**/junit*.xml', fingerprint: true
            }
        }
    }

    post {
        always {
            echo 'Cleaning up workspace...'
            cleanWs()
        }
    }
}
