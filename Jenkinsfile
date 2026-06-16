pipeline {
    agent any

    parameters {
        choice(
            name: 'ENVIRONMENT',
            choices: ['qa', 'uat', 'dev'],
            description: 'Ambiente a testear'
        )
        choice(
            name: 'TAGS',
            choices: ['@regression', '@smoke', '@api', '@flujocasamiento', '@firmarcaratular'],
            description: 'Qué suite de tests ejecutar'
        )
    }

    stages {
        stage('Clonar repositorio') {
            steps {
                git branch: 'develop',
                    url: 'https://github.com/cristianaostri/AutomationPrimary'
            }
        }

        stage('Instalar dependencias') {
            steps {
                sh 'npm install --legacy-peer-deps'
            }
        }

        stage('Ejecutar tests Cypress') {
            steps {
                sh """
                    npx cypress run \
                        --browser chrome \
                        --headless \
                        --env CYPRESS_ENV=${params.ENVIRONMENT},TAGS="${params.TAGS}"
                """
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'cypress/reports/**/*', allowEmptyArchive: true
            echo "📊 Reporte archivado — ${params.ENVIRONMENT} | ${params.TAGS}"
        }
        success {
            echo "✅ Tests OK en ${params.ENVIRONMENT} con ${params.TAGS}"
        }
        failure {
            echo "❌ Tests fallaron en ${params.ENVIRONMENT} con ${params.TAGS}"
        }
    }
}
