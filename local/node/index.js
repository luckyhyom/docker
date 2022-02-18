const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('this is from docker container');
});
app.get('/default', (req, res) => {
  res.send('default!');
});

app.listen(port, () => {
  console.log('good!');
})
/**
 * 컨테이너는 자신의 소스코드를 보고있기 때문에 로컬에서 수정해도 알수가 없다.
 * nodemon을 정상작동하게 하고 싶다면, 컨테이너가 로컬의 소스코드를 보게끔 하여 수정됨을 인지할수있게 한다.
 * https://www.daleseo.com/docker-volumes-bind-mounts/
 */