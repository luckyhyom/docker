### 명령어 요약

```tsx
docker login
docker search httpd --limit=5
docker pull 패키지명:버전(default=latest) // 태그 미입력시 자동으로 latest태그가 붙음
docker create --name myitem ubuntu // 컨테이너 생성 및 네임 설정
docker start 컨테이너ID
docker restart ID
docker stop ID
docker kill 컨테이너ID // stop은 마지막 명령을 완료하지만 kill은 즉시 강제종료
docker pause ID
docker unpause ID

docker ps // 옵션 -a: 정지된 컨테이너도 출력 -q: 아이디만 출력
docker image ls -q // 이미지 아이디만 출력

// 삭제
docker rm 컨테이너명
docker rmi 이미지명:태그
docker rmi 이미지ID

// -d: 백그라운드, -p: 포트포워딩, -v: 폴더 바운딩(절대경로), alpine태그: 초경량 패키지
docker run -it --name myubuntu ubuntu // --rm: 종료 시 컨테이너 삭제
docker run -d -p 9999:80 --name apacheweb httpd:alpine // 이미지가 없으면 자동으로 pull함

// 실행 정보
docker system df // 도커가 사용하고있는 저장매체 현황, 리눅스도 df로 확인
docker container stats // 실행중인 컨테이너 사용 리소스 확인

// 컨테이너,이미지 정보
docker inspect 이미지명 // 이미지 세부정보 및 레이블 확인하기 (이러한 이유로 주석대신 레이블 활용하기)
docker history 이미지명 // 이미지가 어떻게 쌓여있는지

docker commit // 컨테이너 변경사항을 이미지 파일로 생성
docker diff 컨테이너ID // 원본 이미지와 비교하여 변경사항 (순서x)
docker logs 컨테이너ID // 컨테이너 내부 표준출력 로그 확인. (ex: 서버)

docker cp 컨테이너안의 파일을 호스트PC에 옮기기

// 실행중인 컨테이너 소스가 궁금할 때 웹의경우 쉘이 대기중인 상태가 아니므로 쉘 실행 명령 넣어야함
// exec 명령언 신규 명령을 실행시키는 것이고, attache는 컨테이너에 연결
docker exec -it apacheweb /bin/sh
docker attache 컨테이너ID

// 모든 컨테이너, 이미지 삭제
docker stop $(docker ps -a -q)
docker rm $(docker ps -a -q)
docker rmi -f $(docker image ls -q)

// 실행중인것 외에 삭제
docker container prune
docker image prune
docker system prune // 시스템 설정

---
// 이미지 만들기
docker build (옵션) (도커파일이 존재하는 경로)

// tag: 이미지 네임 설정, 1.1: 태그명(버전,등 명시용)
// -f: 도커파일 직접 지정, --pull: 생성시 base 이미지 새로 받기
docker build --tag myimage:1.0.1 ./
docker build --tag my_image:1.1 -f Dockerfile2222 --pull ./

# 내가 만든 이미지 웹서버 컨테이너 실행하기
# 도커 명령어로 CMD 덮어쓰기. -it: 커맨드를 같이 입력하기 위해 bash에 터미널 연결. httpd-foreground 명령어 수행
# docker run -dit -p 9999:80 my_image:1.0.0 /bin/sh -c httpd-foreground --name mytest
```

### Docker Compose

컨테이너 실행 설정이 기록된 파일을 이용하여 여러개의 컨테이너를 실행시킬 수 있다.

-: 배열

**docker-compose.yaml**

```tsx
# stable version
version: "3"

# 설정할 컨테이너들
services:
  app:
    build:
      context: ./01_FLASK_DOCKER
      dockerfile: Dockerfile
    links:
      - "db:baeumdb"
    ports:
      - "80:8080" 
    container_name: appcontainer
		# 컨테이너 실행 순서
    depends_on:
      - db

  db:
    image: mysql:5.7
    restart: always
    volumes:
      - ./mysqldata:/var/lib/mysql
    environment:
      - MYSQL_ROOT_PASSWORD=12345678
      - MYSQL_DATABASE=baeumdb
    ports: 
      - "3306:3306"
    container_name: dbcontainer
```
### nginx

```tsx
/etc/nginx/
	- nginx.conf (sites-enabled 폴더의 파일을 include)
	- sites-enabled (sites-available 폴더의 파일을 심볼릭 링크로 복사해놓음)
	- sites-available (mysite.com.conf, mysite2.com.conf, 등이 있고, 현재 사용되는 설정들만 enabled폴더에 심볼릭 링크 해놓기)
```

**/etc/nginx/sites-available/default**

```tsx
# Default server configuration
#
server {
	listen 80 default_server; //default_server: 모든 웹서버 요청 허용
	listen [::]:80 default_server;
	...

	root /var/www/html; // 기본 주소만 입력했을때 기본 폴더 설정.

	# Add index.php to the list if you are using PHP
	index index.html index.htm index.nginx-debian.html;

	server_name _; // 구매한 도메인이 있다면 입력 hyom.com www.hyom.com
	
	...
}
```

```tsx
	root /var/www/html; // 기본 주소만 입력했을때 기본 폴더 설정.

	# Add index.php to the list if you are using PHP
	index index.html index.htm index.nginx-debian.html;

	server_name _;

	// 루트폴더 변경. index파일명은 따로 설정하지 않으면 위와 동일. 마치 변수같다.
	// www.mysite.com/blog/index.html -> /var/www/blog/index.html
	location /blog {
		root /var/www
	}

	location / {
		# First attempt to serve request as file, then
		# as directory, then fall back to displaying a 404.
		try_files $uri $uri/ =404;
	}
```
