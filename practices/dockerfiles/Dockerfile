# base Image
FROM httpd:alpine

LABEL author="gyals0386@gmail.com"
LABEL version="1.0.0"
LABEL description="This is about Baeum Project"

COPY ./2021_DEV_HTML /usr/local/apache2/htdocs

CMD ["/bin/sh", "-c", "httpd-foreground"]
