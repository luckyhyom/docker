const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('this is from docker container.')
});

app.listen(port, () => {
  console.log('good!');
})