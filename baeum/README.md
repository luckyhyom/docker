## AWS 서버에 NestJS App 셋팅하기

```tsx
// git config 설정
git config --global user.name
git config --global user.email

git clone https://ID:TOKEN@github.com/luckyhyom/baeum-api.git

// docker없이 호스트에서 실행시키기 위해.. npm을 이용해 typeorm등의 패키지를 다운받기 위해 nodejs 다운로드
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
source ~/.bashrc
nvm list-remote
nvm install v13.6.0
nvm list
nvm use v13.6.0

npm install -g npm@latest

// 글로벌이 아닌, 프로젝트 폴더 안에만 모듈 다운로드
npm i

// docker로 db 띄우기
docker run -d --rm --name postgres -e POSTGRES_DB=baeum-api -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=super1234 -p 5432:5432 postgres

// .env 파일 생성후 정보 입력
vim .env

```

**etc-cert 폴더와 내부 파일들 권한 775로 설정**

docker-compose.yml

```tsx
version: "3"

services:
  nginxproxy:
    depends_on:
      - nginx
      - baeumdb
    image: nginx:alpine
    container_name: proxyserver
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./certbot-etc:/etc/letsencrypt
      - ./myweb:/usr/share/nginx/html

  nginx:
    image: nginx:latest
    container_name: mywebserver
    restart: always
    volumes:
      - ./myweb:/usr/share/nginx/html

  baeumdb:
    image: postgres
    env_file:
      - ./.env
    container_name: postgres
    restart: always
    volumes:
      - mydb:/var/lib/postgresql

  app:
    build:
      context: ./
      dockerfile: Dockerfile-baeum
    env_file:
      - ./.env
    depends_on:
      - baeumdb
    command:
      - bash
      - -c
      - |
        /app/wait-for-it.sh baeumdb:5432 -t 10
        npm run start
    container_name: nestjs-api
    restart: always

  certbot:
    depends_on:
      - nginxproxy
    image: certbot/certbot
    container_name: certbot
    volumes:
      - ./certbot-etc:/etc/letsencrypt
      - ./myweb:/usr/share/nginx/html
    command: certonly --webroot --webroot-path=/usr/share/nginx/html --email gyals0386@gmail.com --agree-tos --no-eff-email --keep-until-expiring -d makevalue.net -d www.makevalue.net

volumes:
  mydb:
```

depends_on 보완 파일 다운로드

```tsx
wget https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh
```

Dockerfile-baeum
```tsx
FROM node:lts-alpine3.14

# Korean Fonts
RUN apk --update add fontconfig
RUN mkdir -p /usr/share/fonts/nanumfont
RUN wget http://cdn.naver.com/naver/NanumFont/fontfiles/NanumFont_TTF_ALL.zip
RUN unzip NanumFont_TTF_ALL.zip -d /usr/share/fonts/nanumfont
RUN fc-cache -f && rm -rf /var/cache/*

# bash install
RUN apk add bash

# Language
ENV LANG=ko_KR.UTF-8 \
    LANGUAGE=ko_KR.UTF-8

# Set the timezone in docker
RUN apk --no-cache add tzdata && \
        cp /usr/share/zoneinfo/Asia/Seoul /etc/localtime && \
        echo "Asia/Seoul" > /etc/timezone

# Create Directory for the Container
WORKDIR /app

COPY ./ ./
RUN npm install

# wait-for-it.sh
# COPY wait-for-it.sh ./
RUN chmod +x wait-for-it.sh

# Docker Demon Port Mapping
EXPOSE 3000

# Node ENV
ENV NODE_ENV=production
```

.dockerignore

```tsx
# compiled output
/dist
/node_modules

# env
.env

# Logs
logs
*.log
npm-debug.log*
pnpm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# OS
.DS_Store

# Tests
/coverage
/.nyc_output

# IDEs and editors
/.idea
.project
.classpath
.c9/
*.launch
.settings/
*.sublime-workspace

# IDE - VSCode
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json
```

nginx.conf

```tsx
user nginx;
worker_processes  auto;

error_log  /var/log/nginx/error.log warn;
pid        /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" "$request_uri" "$uri"'
                      '"$http_user_agent" "$http_x_forwarded_for"';
    access_log  /var/log/nginx/access.log  main;
    sendfile on;
    keepalive_timeout 65;

    upstream docker-web {
        server nginx:80;
    }

    upstream docker-baeumapi {
        server app:3000;
    }

    server {
	listen 80;
	listen [::]:80;
	server_name makevalue.net www.makevalue.net;

        location ~ /.well-known/acme-challenge {
                allow all;
                root /usr/share/nginx/html;
        }

        location / {
        	return 301 https://$host$request_uri;
	}
    }

    server {
	listen 443 ssl;
        server_name makevalue.net www.makevalue.net;

        ssl_certificate /etc/letsencrypt/live/makevalue.net/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/makevalue.net/privkey.pem;
        include /etc/letsencrypt/options-ssl-nginx.conf; # 보안 강화를 위한 옵션 추가
        ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;   # 보안 강화를 위한 옵션 추가

        location /api/ {
            rewrite ^/api(.*)$ $1 break;
            proxy_pass         http://docker-baeumapi;
            proxy_redirect     off;
            proxy_set_header   Host $host;
            proxy_set_header   X-Real-IP $remote_addr;
            proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header   X-Forwarded-Host $server_name;
            proxy_set_header   X-Forwarded-Proto $scheme;
        }

        location / {
            proxy_pass         http://docker-web;
            proxy_redirect     off;
            proxy_set_header   Host $host;
            proxy_set_header   X-Real-IP $remote_addr;
            proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header   X-Forwarded-Host $server_name;
            proxy_set_header   X-Forwarded-Proto $scheme;
        }
    }
}
```