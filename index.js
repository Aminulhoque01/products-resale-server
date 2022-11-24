const express = require('express');
const cors = require('cors');
const port = process.env.PROT || 5000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());

app.get('/', async(req, res)=>{
    res.send('product resale server running')
})

app.listen(port,()=>{
    console.log(`products resale running ${port}`);
})