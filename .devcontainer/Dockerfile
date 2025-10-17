FROM node:22-alpine

# install golang
WORKDIR /
RUN wget https://go.dev/dl/go1.25.2.linux-amd64.tar.gz \
    && tar -xzf go1.25.2.linux-amd64.tar.gz \
    && rm go1.25.2.linux-amd64.tar.gz
ENV PATH=$PATH:/go/bin
RUN go install github.com/go-delve/delve/cmd/dlv@latest \
    && go install golang.org/x/tools/gopls@latest \
    && go install honnef.co/go/tools/cmd/staticcheck@latest

# set workdir for project
WORKDIR /dev
