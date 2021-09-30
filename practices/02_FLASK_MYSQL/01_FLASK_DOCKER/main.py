from flask import Flask
import pymysql

app = Flask(__name__)

MYSQL_HOST = 'mysqldb'
MYSQL_PORT = 3306

def conn_mysqldb():
    MYSQL_CONN = pymysql.connect(
        host=MYSQL_HOST,
        port=MYSQL_PORT,
        user='root',
        passwd='12345678',
        db='baeumdb',
        charset='utf8'
    )
    return MYSQL_CONN


@app.route('/')
def hello_world():
    mysql_db = conn_mysqldb()
    db_cursor = mysql_db.cursor()
    sql = "SHOW TABLES"
    # print (sql)
    db_cursor.execute(sql)
    user = db_cursor.fetchone()
    print (user, MYSQL_HOST)
    return 'SUCCESS'


if __name__ == '__main__':
    app.run(host='0.0.0.0', port='8080')
