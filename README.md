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
**Volume**

- 폴더 공유
    - 컨테이너→호스트라면. 호스트의 폴더가 비어있는지 체크
- 호스트파일 컨테이너에 복사
- 도커볼륨 생성

mysql에 들어있는 파일은 직접 살펴볼 일이 없기때문에 호스트서버에서 관리하지 않아도 된다. 다만 컨테이너가 종료되어도 데이터는 유지해야하는데.. 이럴때 호스트PC와 연결하지 않고, 도커 볼륨으로 관리할 수 있다.

```tsx
db:
	image: mysql:5.7
	containder_name: mysqldb
	vollumes:
		- "mydb:/var/lib/mysql"
...
```

작업시 volum때문에 정상 작동이 안될 수 있으므로 모든 볼륨을 삭제하고 작업하는 것이 좋음 (염두해둘것)

```tsx
docker volmue prune
docker volmue prune -a --volume // 이미지, 볼륨, 네트워크 삭제
```


### nginx

어떤 버전이든 설정파일 이름은 nginx.conf
→ server 설정 찾기
→ include되어있다면 default 혹은 default.conf 같은 파일을 찾을 수 있음.

apache2는 httpd.conf


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

### Reverse Proxy 포트로 구분하기

docker-compose.yml

```tsx
version: "3"

services:
    nginxproxy:
        image: nginx:1.18.0
				# 호스트와 포트포워딩
        ports:
            - "8080:8080"
            - "8081:8081"
        restart: always
				# 프락시 설정이 있는 conf파일을 바운딩
        volumes:
            - "./nginx/nginx.conf:/etc/nginx/nginx.conf"

    nginx:
        depends_on:
            - nginxproxy
        image: nginx:1.18.0
        restart: always

    apache:
        depends_on:
            - nginxproxy
        image: httpd:2.4.46
        restart: always
```

**nginx/nginx.conf**

```tsx
user nginx; // www-data; 동일
worker_processes  auto;

// 에러로그 저장
error_log  /var/log/nginx/error.log warn;
pid        /var/run/nginx.pid;

events {
    worker_connections 1024; // 이벤트를 동시에 몇개까지 지원할것인지
}

http {
    include       /etc/nginx/mime.types;// 확장자가 무엇을 뜻하는지 기재한곳
    default_type  application/octet-stream;// 기재되지 않은 확장자는 표준 인코딩으로 기본 설정

		// nginx에서 사용하는 변수들
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';
    access_log  /var/log/nginx/access.log  main;
    sendfile on;
    keepalive_timeout 65;

    upstream docker-nginx {
				// docker-compose.yml에서 설정했던 이름. link 설정을 하지 않으면 이름 그대로 사용한다.
        server nginx:80;
    }

    upstream docker-apache {
        server apache:80;
    }

// 커스텀한 설정과 겹치지 않도록 삭제함
# include /etc/nginx/modules-enabled/*.conf;
// deault에 있던 server를 이 파일에 기재함
    server {
        listen 8080;

        location / {
            proxy_pass         http://docker-nginx; // 8080포트의 모든 경로에 대한 요청은 여기로 보낸다.
            proxy_redirect     off; // was(내부서버) 정보 숨기기
            proxy_set_header   Host $host; // 내가(프록시) 누구인지 기록
            proxy_set_header   X-Real-IP $remote_addr; // 클라이언트의 IP를 기록.
            proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for; // 여러단계의 프록시가 있을 경우 이전 프록시들을 기록
            proxy_set_header   X-Forwarded-Host $server_name; // 클라이언트의 호스트명 기록
        }
    }

    server {
        listen 8081;

        location / {
            proxy_pass         http://docker-apache;
            proxy_redirect     off;
            proxy_set_header   Host $host;
            proxy_set_header   X-Real-IP $remote_addr;
            proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header   X-Forwarded-Host $server_name;
        }
    }
}
```

[location 설정](https://lahuman.github.io/nginx_location_options/)

### Reverse Proxy 폴더로 구분하기

[reverseproxy.com:80/blog](http://reverseproxy.com:80/blog) → http://docker-nginx:80/blog
→ blog를 제외해서 루트폴더로 설정하기 http://docker-nginx:80/

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
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';
    access_log  /var/log/nginx/access.log  main;
    sendfile on;
    keepalive_timeout 65;

    upstream docker-nginx {
        server nginx:80;
    }

    upstream docker-apache {
        server apache:80;
    }

    server {
        listen 80;

				# latest 버전에서 index.html이 있는 경로 (설정파일은 nginx.conf)
        root /usr/share/nginx/html;

        location /blog {
            proxy_pass         http://docker-nginx;
            proxy_redirect     off;
            proxy_set_header   Host $host;
            proxy_set_header   X-Real-IP $remote_addr;
            proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header   X-Forwarded-Host $server_name;
				}

        location /community {
            proxy_pass         http://docker-apache;
            proxy_redirect     off;
            proxy_set_header   Host $host;
            proxy_set_header   X-Real-IP $remote_addr;
            proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header   X-Forwarded-Host $server_name;
        }
    }
	}
}
```

→ blog를 제외해서 루트폴더로 설정하기 http://docker-nginx:80/

새로운 서비스를 추가해서 기존 서버와 연결하고싶은데, 이런식으로 하면 기존 서버의 폴더에 community라는 새로운 폴더를 만들어야하고 이 폴더명에 맞도록 모든 설정을 바꿔야하는 일이 생길 수 있음. 그래서 프록시에서 폴더 경로로 다른 was를 찾을때 해당 경로이름은 제외하면서 was와 연결만 시켜줌

한마디로 proxy에서 어떤 경로를 사용하든 was의 루트폴더 변경없이 사용할수있게 하는 법.

```tsx
만약 루트가 ..../html 이고 blog로 연결된다면
/html/blog 이렇게 됨 (html 폴더 옆에 blog를 만드는 것이 아니다.)
루트를 기준으로 폴더를 탐색하는 것
```

```tsx
rewrite regex URL [flag];
# $1: 괄호로 감싼 부분(.*).. 즉 /blog부분 제외하고 전부 선택해서 다시쓰기
rewrite ^/blog(.*)$ $1 break;
```

### Error Page 설정

```tsx
error_page 403 404 405 505 /error.html;
location = /error.html {
	root /usr/share/nginx/html;
}
```

### 캐시 설정

```tsx
location ~* \.(ico|css|js|gif|jpe?g|png)& {
	expires max;
	add_header Pragma public;
	add_header Cache-Control "public, must-revalidate, proxy-revalidate";
}
```

### HTTPS(1)
docker-compose.yml

```tsx
version: "3"

services:
  webserver:
    image: nginx:latest
    container_name: proxy 
    restart: always
    ports:
      - "80:80"
      - "443:443" # https
    volumes:
      - ./myweb:/usr/share/nginx/html
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./certbot-etc:/etc/letsencrypt

  nginx:
    image: nginx:latest
    container_name: myweb
    restart: always
    volumes:
      - ./myweb:/usr/share/nginx/html # 하나의 폴더를 세 컨테이너가 공유한다.

  certbot:
    depends_on:
      - webserver
    image: certbot/certbot
    container_name: certbot
    volumes:
      - ./certbot-etc:/etc/letsencrypt
      - ./myweb:/usr/share/nginx/html
    command: certonly --dry-run --webroot --webroot-path=/usr/share/nginx/html --email test@test.com --agree-tos --no-eff-email --keep-until-expiring -d baeum.com -d www.baeum.com
```
nginx.conf

```tsx
...
server {
        location ~ /.well-known/acme-challenge {
                allow all;
                root /usr/share/nginx/html;
                try_files $uri =404;
        }
    }
```

### HTTPS(2)

—dry-run 옵션 제거

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

    server {
        listen 80;
        server_name makevalue.net www.makevalue.net;

        location ~ /.well-known/acme-challenge {
                allow all;
                root /usr/share/nginx/html;
                try_files $uri =404;
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

        location / {
            proxy_pass         http://docker-web;       # docker-web 컨테이너로 포워딩
            proxy_redirect     off;                     # 서버 응답 헤더의 주소 변경 (불필요)
            proxy_set_header   Host $host;
            proxy_set_header   X-Real-IP $remote_addr;
            proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header   X-Forwarded-Host $server_name;
				    proxy_set_header   X-Forwarded-Proto $scheme;
        }
    }
}
```

필요한 설정 파일 다운로드

```tsx
cd certbot-etc // ssl 인증 파일이 들어있는 폴더
curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > options-ssl-nginx.conf
curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > ssl-dhparams.pem
```

### crontab을 이용하여 인증서 재발급

—keep-until-expiring옵션을 —force-renewal 로 변경 (크론탭 설정 전에 —dry-run으로 먼저 테스트할것)

```tsx
crontab -e
// *: 주기 설정
* * * * * docker-compose -f 절대경로/docker-compose.yml restart certbot >> [log저장할 폴더의 경로/status_check.log] 2>&1
* * * * * rm -rf [로그파일 경로/로그파일] 2>&1
```
