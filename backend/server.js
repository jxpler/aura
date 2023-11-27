const express = require('express');
const app = express();
const port = 5000;

app.get('/', (req, res) => {
    res.send('Express hello!');

});

app.listen(port, () => {
    console.log(`Server online, port: ${port}`);
});