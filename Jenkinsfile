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
                sh 'npm ci'
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
            publishHTML([
                allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'cypress/reports',
                reportFiles: 'index.html',
                reportName: "Reporte | ${params.ENVIRONMENT.toUpperCase()} | ${params.TAGS}"
            ])
            echo "📊 Reporte publicado para ${params.ENVIRONMENT} - ${params.TAGS}"
        }
        success {
            echo "✅ Tests OK en ${params.ENVIRONMENT}"
        }
        failure {
            echo "❌ Tests fallaron en ${params.ENVIRONMENT} con tag ${params.TAGS}"
        }
    }
}
