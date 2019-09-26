#!/usr/bin/env groovy
import groovy.json.JsonOutput

app = "blogchain"

// --- jenkins  ---
jenkinsSlave = "slave.ci.10clouds.com"
jenkinsSSHId = "b78d5aba-6e15-4e86-b4cc-3ecd0c2022c0"
jenkinsGithubCredentialsId = "ci10clouds.com"
// --- docker ---
dockerRegistry = "10clouds/${app}-backend"
dockerFilePath = "docker/production/backend/Dockerfile"
dockerCredentials = [credentialsId: "docker-hub", url: "https://index.docker.io/v1/"]
// --- github ---
deployLink = "https://ci.10clouds.com/job/blogchain/job/blogchain/parambuild?deploy=true"
gitHubOrgName = "10clouds"
// --- slack ---
slackChannel = "#blogchain-notifications"


properties([
    parameters([
        booleanParam(
            name: "provision",
            defaultValue: false,
            description: "Do you want to provision the server?"
        ),
        booleanParam(
            name: "deploy",
            defaultValue: false,
            description: "Do you want to deploy?"
        )
    ])
])

node(jenkinsSlave) {
    def repo = null

    stage('CleanWorkspace') {
        cleanWs()          
    }

    stage("Build") {
        try {
            githubNotify (
                status: "PENDING",
                context: "1. ${STAGE_NAME}",
                description: "Building backend"
            )
            repo = checkout scm
            sh """
                echo ${repo.GIT_BRANCH} > .appversion
                echo ${repo.GIT_COMMIT} > .gitcommit
            """

            withDockerRegistry(dockerCredentials) {
                sh "docker pull ${dockerRegistry} || true"
                sh "docker build --cache-from ${dockerRegistry} -t ${dockerRegistry}:${repo.GIT_COMMIT} --network=host --pull -f ${dockerFilePath} ."
            }

            githubNotify (
                status: "SUCCESS",
                context: "1. ${STAGE_NAME}",
                description: "Backend build successfully"
            )
        } catch (exception) {
            githubNotify (
                status: "FAILURE",
                context: "1. ${STAGE_NAME}",
                description: "Backend build failed"
            )
            slackSend (
                channel: slackChannel,
                color: "danger",
                message: [
                    "[<${env.RUN_DISPLAY_URL}|${env.BUILD_NUMBER}>] ",
                    "FAILED: *${app.toUpperCase()}* ",
                    "on stage *${STAGE_NAME}* ",
                    "on branch *${repo.GIT_BRANCH}*"
                ].join("")
            )
            throw exception
        }
    }
    
    stage("Testing") {
        try {
            githubNotify (
                status: "PENDING",
                context: "2. ${STAGE_NAME}",
                description: "Testing backend"
            )
            repo = checkout scm
            withDockerRegistry(dockerCredentials) {
                sh "docker-compose -f docker-compose.tests-ci.yml kill && docker-compose -f docker-compose.tests-ci.yml rm -f || true"
                sh "export GIT_COMMIT=${repo.GIT_COMMIT} && docker-compose -f docker-compose.tests-ci.yml up --force-recreate --abort-on-container-exit"
                sh "docker-compose -f docker-compose.tests-ci.yml kill && docker-compose -f docker-compose.tests-ci.yml rm -f || true"
            }
            githubNotify (
                status: "SUCCESS",
                context: "2. ${STAGE_NAME}",
                description: "Testing backend successfully"
            )
        } catch (exception) {
            githubNotify (
                status: "FAILURE",
                context: "2. ${STAGE_NAME}",
                description: "Backend tests failed"
            )
            slackSend (
                channel: slackChannel,
                color: "danger",
                message: [
                    "[<${env.RUN_DISPLAY_URL}|${env.BUILD_NUMBER}>] ",
                    "FAILED: *${app.toUpperCase()}* ",
                    "on stage *${STAGE_NAME}* ",
                    "on branch *${repo.GIT_BRANCH}*"
                ].join("")
            )
            throw exception
        }
    }

    stage("Push") {
        try {
            if(params.deploy || env.TAG_NAME != null || repo.GIT_BRANCH == "develop" || repo.GIT_BRANCH == "master") {
                withDockerRegistry(dockerCredentials) {
                    sh """
                        docker push ${dockerRegistry}:${repo.GIT_COMMIT}
                    """
                    if(env.TAG_NAME != null){
                        sh """
                            docker tag ${dockerRegistry}:${repo.GIT_COMMIT} ${dockerRegistry}:${env.TAG_NAME}
                            docker push ${dockerRegistry}:${env.TAG_NAME}
                        """
                    }

                    if(repo.GIT_BRANCH == "develop"){
                        sh """
                            docker tag ${dockerRegistry}:${repo.GIT_COMMIT} ${dockerRegistry}:develop
                            docker push ${dockerRegistry}:develop
                        """
                    }

                    if(repo.GIT_BRANCH == "master"){
                        sh """
                            docker tag ${dockerRegistry}:${repo.GIT_COMMIT} ${dockerRegistry}:latest
                            docker push ${dockerRegistry}:latest
                        """
                    }
                }
            }
        } catch (exception) {
            slackSend (
                channel: slackChannel,
                color: "danger",
                message: [
                    "[<${env.RUN_DISPLAY_URL}|${env.BUILD_NUMBER}>] ",
                    "FAILED: *${app.toUpperCase()}* ",
                    "on stage *${STAGE_NAME}* ",
                    "on branch *${repo.GIT_BRANCH}*"
                ].join("")
            )
            throw exception
        }
    }

    stage("Deploy") {
        try {
            if(params.deploy || repo.GIT_BRANCH == "develop" || repo.GIT_BRANCH == "master" || env.TAG_NAME != null) {
                def ansibleTags = "deploy"
                if(params.provision){
                    ansibleTags = "${ansibleTags},provisioning"
                }
                def ansibleHost = 'develop'
                def dockerTag = repo.GIT_COMMIT
                if (repo.GIT_BRANCH == "develop"){
                    ansibleHost = "develop"
                    dockerTag = 'develop'
                }

                if (repo.GIT_BRANCH == "master"){
                    ansibleHost = "staging"
                    dockerTag = 'latest'
                }
                if(env.TAG_NAME != null) {
                    dockerTag = env.TAG_NAME
                    ansibleHost = "production"
                }

                withCredentials([file(credentialsId: "${app}-env-${ansibleHost}", variable: 'env')]) {
                    sh "cp \$env ansible/playbooks/.env"
                    sshagent([jenkinsSSHId]) {
                        withDockerRegistry(dockerCredentials) {
                                dir('ansible'){
                                    sh "ansible-playbook -i hosts main.yml --tags ${ansibleTags} -e dockerTag=${dockerTag} -e env=${ansibleHost}"
                                }           
                        }
                    }
                }
            }
            if(env.CHANGE_ID != null && !params.deploy) {
                def body = [
                    body: """
                        #### PR built successfully
                        - Docker image [${dockerRegistry}:${repo.GIT_COMMIT}](https://hub.docker.com/r/${dockerRegistry}/tags/)
                        - [Deploy](${deployLink}) this change to [DEV](https://blogchain.dev.10clouds.io)
                    """.stripIndent()
                ]
                httpRequest (
                    url: "https://api.github.com/repos/${gitHubOrgName}/${app}/issues/${env.CHANGE_ID}/comments",
                    requestBody: JsonOutput.toJson(body),
                    authentication: jenkinsGithubCredentialsId,
                    httpMode: "POST",
                    contentType: "APPLICATION_JSON"
                )
            }
        } catch (exception) {
            slackSend (
                channel: slackChannel,
                color: "danger",
                message: [
                    "[<${env.RUN_DISPLAY_URL}|${env.BUILD_NUMBER}>] ",
                    "FAILED: *${app.toUpperCase()}* ",
                    "on stage *${STAGE_NAME}* ",
                    "on branch *${repo.GIT_BRANCH}*"
                ].join("")
            )
            throw exception
        }
    }

    stage("Notification") {
        slackSend (
            channel: slackChannel,
            color: "good",
            message: [
                "[<${env.RUN_DISPLAY_URL}|${env.BUILD_NUMBER}>] ",
                "SUCCESS: *${app.toUpperCase()}* ",
                "on branch *${repo.GIT_BRANCH}*"
            ].join("")
        )
    }
}
