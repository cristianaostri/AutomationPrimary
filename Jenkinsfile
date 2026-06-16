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
            choices: ['@regression', '@smoke', '@api', '@filtros'],
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
        stage('Limpiar reportes anteriores') {
            steps {
                sh 'rm -rf cypress/reports/temp_jsons || true'
            }
        }
        stage('Ejecutar tests Cypress') {
            steps {
                withCredentials([
                    string(credentialsId: 'API_USER', variable: 'API_USER'),
                    string(credentialsId: 'API_PASSWORD', variable: 'API_PASSWORD')
                ]) {
                    sh """npx cypress run --browser chrome --headless \
                      --env CYPRESS_ENV=${params.ENVIRONMENT},TAGS="${params.TAGS}",mainApiUrl=https://api.oneclearing.testing.primary/api/v1,apiUser=\${API_USER},apiPassword=\${API_PASSWORD}"""
                }
            }
        }
        stage('Copiar reporte') {
            steps {
                sh "cp cypress/reports/temp_jsons/index.html /reportes/reporte_${BUILD_NUMBER}_${params.TAGS}.html || true"
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
