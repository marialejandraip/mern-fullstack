const express = require('express');
const connectdb = require('./config/db');

const app = express();

//Connect db
connectdb();

app.get('/', (req, res)=> res.send('<h1>Hola mundo</h1>'))

//Define routes
app.use('/api/users', require('./routes/api/user'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));

const PORT = process.env.PORT || 8000;

app.listen(PORT, ()=> console.log(`Server started on ${PORT}`));
