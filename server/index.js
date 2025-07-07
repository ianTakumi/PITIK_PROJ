const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 5000; // o kahit anong port

app.use(cors());
app.use(bodyParser.json());

app.post('/send-data', (req, res) => {
  const data = req.body;
  console.log('Data received from ESP32:', data);
  res.send({ status: 'OK', message: 'Data received' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
