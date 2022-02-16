# 도커는 파일에 있는 명령어를 순차적으로 실행하여 이미지를 빌드한다.
# API 코드 복사, 환경 구성, 등..
# 레이어 형태로 작성
# 빈번하게 변경되는 것을 가장 나중에 작성하기. (변경된 부분 외에는 캐시를 이용하여 새로운 이미지를 만드는 시간을 단축한다.)

FROM node:16-alpine

WORKDIR /app

COPY package.json package-lock.json ./
# ci: package-lock을 이용함
RUN npm ci

COPY index.js .

# ENTRYPOINT [ "node", "index.js" ]

# npm start로 명령을 추상화시킨다.
ENTRYPOINT [ "npm", "start" ]



