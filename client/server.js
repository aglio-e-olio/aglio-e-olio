const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const path = require('path');

app.use(express.static(path.join(__dirname, './build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './build/index.html'));
});

server.listen(process.env.PORT || 8080, () =>
  console.log('server is running on port 8080')
);h