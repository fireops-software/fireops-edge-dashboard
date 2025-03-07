FROM node:22-alpine AS build-stage

# install golang
WORKDIR /
RUN wget https://go.dev/dl/go1.23.3.linux-amd64.tar.gz \
    && tar -xzf go1.23.3.linux-amd64.tar.gz \
    && rm go1.23.3.linux-amd64.tar.gz
ENV PATH=$PATH:/go/bin

# set workdir for project
WORKDIR /app
COPY . .
RUN go build -o fireops-dashboard main.go
RUN cd ui/fireops-dashboard && npm install && npx vite build

# Deploy the application binary into a lean image
FROM alpine:latest AS build-release-stage

WORKDIR /app

COPY --from=build-stage /app/fireops-dashboard /app
COPY --from=build-stage /app/ui/fireops-dashboard/dist/ /app/wwwroot

ENTRYPOINT ["/app/fireops-dashboard"]
