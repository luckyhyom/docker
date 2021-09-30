FROM continuumio/miniconda 
COPY ./ /app
WORKDIR /app
RUN pip install flask pymysql cryptography

CMD ["python", "main.py"]
