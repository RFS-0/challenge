# Kubernetes deployment

This document describes how the jass challenge server can be deployed to the GKE (or probably any oder Kubernetes cluster).

## Steps

1. Build the docker image with this command:
    1. `docker build . -t jass-challenge`
2. Push the image to the google container registry (requires a project on GCP)
    1. Configure docker to point to your project:
        1. `gcloud auth configure-docker`
    2. Tag the docker image:
        1. `docker tag [SOURCE_IMAGE] [HOSTNAME]/[PROJECT-ID]/[IMAGE]`
        e.g. `docker tag jass-challenge gcr.io/<project-id>/jass-challenge`
    3. Push the image to the registry:
        1. `docker push [HOSTNAME]/[PROJECT-ID]/[IMAGE]` e.g. `docker push gcr.io/<project-id>/jass-challenge`
3. Configure `kubectl` to point to your project (if not done already):
    1. See [Configuring cluster access for kubectl](https://cloud.google.com/kubernetes-engine/docs/how-to/cluster-access-for-kubectl) for details
4. Update `jass-challenge-deployment.yaml` in this folder to point to the docker image you pushed to `gcr`:
    1. This line must be updated: `- image: gcr.io/<project_id>/<image_name>`
5. Execute the deployment with this command:
    1. `kubectl apply -f jass-challenge-deployment.yaml`
6. Start the service for this deployment with this command:
    1. `kubectl apply -f jass-challenge-service.yaml`
7. Get the public ip and the port for the service by executing:
    1. `kubectl get svc jass-challenge`