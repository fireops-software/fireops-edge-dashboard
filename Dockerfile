FROM node:24-alpine AS build-stage

# get target platform
ARG BUILDPLATFORM
ARG TARGETOS
ARG TARGETARCH

# get target platform
ARG TARGETOS
ARG TARGETARCH

# install golang
WORKDIR /
RUN GO_VERSION=1.24.2 \
    && wget https://go.dev/dl/go$GO_VERSION.linux-amd64.tar.gz \
    && tar -xzf go$GO_VERSION.linux-amd64.tar.gz \
    && rm go$GO_VERSION.linux-amd64.tar.gz
ENV PATH=$PATH:/go/bin

# set workdir for project
WORKDIR /app
COPY . .
RUN GOOS=${TARGETOS} GOARCH=${TARGETARCH} go build -o fireops-dashboard main.go
RUN cd ui/fireops-dashboard && npm install && npx vite build

# Deploy the application binary into a lean image
FROM alpine:latest AS build-release-stage

WORKDIR /app

COPY --from=build-stage /app/fireops-dashboard /app
COPY --from=build-stage /app/ui/fireops-dashboard/dist/ /app/wwwroot

ENTRYPOINT ["/app/fireops-dashboard"]
