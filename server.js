const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('public'));

app.use('/units', require('./routes/units'));
app.use('/assignments', require('./routes/assignments'));
app.use('/dashboard', require('./routes/dashboard'));

app.listen(3000, () => console.log('Running on http://localhost:3000'));