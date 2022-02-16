FROM node:16-alpine

WORKDIR /app

COPY package.json package-lock.json ./
# ci: package-lock을 이용함
RUN npm ci

COPY index.js .

ENTRYPOINT [ "node", "index.js" ]

# 레이어 형태로 작성
# 빈번하게 변경되는 것을 가장 나중에 작성하기. (변경된 부분 외에는 캐시를 이용하여 새로운 이미지를 만드는 시간을 단축한다.)