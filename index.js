const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PROT || 5000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());

// data mil 
// const categories= require('./data/categories.json');
// const product= require('./data/products.json');




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.8qoxdwe.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const categoriesProductCollection = client.db('resaleProduct').collection('category');
        const ProductCollection = client.db('resaleProduct').collection('product');
        const bookingCollection = client.db('resaleProduct').collection('booking');


        app.get('/product-categories', async (req, res) => {

            const query = {};
            const categories = await categoriesProductCollection.find(query).toArray();
            
            res.send(categories)
        });


        app.get('/product-categories/:id', async (req, res) => {
            const id = req.params.id;
            const query = {category_id: id};
            // const same = {}
            const category = await categoriesProductCollection.find(query).toArray();

            res.send(category);
        })


        

        app.get('/product', async (req, res) => {
           const query = {};
            const products = await ProductCollection.find(query).toArray()
            res.send(products);
        })


        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { id: id };
            const products = await ProductCollection.findOne(query)
            res.send(products);
        })

        app.post('/bookings', async(req,res)=>{
            const booking= req.body;
            console.log(booking);
            const result = await bookingCollection.insertOne(booking);
            res.send(result);
        });
        

    }
    finally {

    }
}
run().catch(error => {
    console.log(error)
})





app.get('/', async (req, res) => {
    res.send('product resale server running')
})

app.listen(port, () => {
    console.log(`products resale running ${port}`);
})