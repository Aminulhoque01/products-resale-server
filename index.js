const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const port = process.env.PROT || 5000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.8qoxdwe.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const categoriesProductCollection = client.db('resaleProduct').collection('category');
        const ProductCollection = client.db('resaleProduct').collection('product');
        const bookingCollection = client.db('resaleProduct').collection('booking');
        const paymentsCollection = client.db('resaleProduct').collection('payment');


        app.get('/product-categories', async (req, res) => {

            const query = {};
            const categories = await categoriesProductCollection.find(query).toArray();
            
            res.send(categories)
        });


        app.get('/product-categories/:id', async (req, res) => {
            const id = req.params.id;
            const query = {category_id: id};
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

            const query ={
                itemsPrice: parseInt(booking.itemsPrice),
                email:booking.email,
            }
            alreadyBooked= await bookingCollection.find(query).toArray();

            if(alreadyBooked){
                const message = `You already have a booking this ${booking.itemsPrice}`;
                return res.send({acknowledged:false, message})
            }
            const result = await bookingCollection.insertOne(booking);
            res.send(result);
        });



        app.get('/bookings/:id', async(req,res)=>{
            const id = req.params.id;
            const query = {_id:ObjectId(id)}
            const booking = await bookingCollection.find(query);
            res.send(booking)
        });

       

        app.post('/create-payment-intent', async(req,res)=>{
            const booking = req.body;
            
            const price = parseInt(booking.itemsPrice);
            
            const amount= price*100;
           
            const paymentIntent = await stripe.paymentIntents.create({
                currency:'usd',
                amount: amount,
                "payment_method_types":[
                    "card"
                ]
            });
            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        });

        app.post('/payments', async(req,res)=>{
            const payment = req.body;
            const result = await paymentsCollection.insertOne(payment);
            const id = payment.bookingId
            const filter = {_id:ObjectId(id)};
            const updateDoc= {
                $set:{
                    paid:true,
                    transactionId:payment.transactionId

                }
            }
            const updateResult = await bookingCollection.updateOne(filter,updateDoc)
            res.send(result);
        })



        app.get('/bookings', async(req,res)=>{
            const email=req.query.email;
            const query= {email:email};
            const booking = await bookingCollection.find(query).toArray();
            res.send(booking);
        })


        app.post('/addProducts', async(req,res)=>{
            const addProduct = req.body;
            const result = await categoriesProductCollection.insertOne(addProduct)
            res.send(result);
        });

        app.get('/addProducts', async(req,res)=>{
           const query={};
            const result = await categoriesProductCollection.find(query).toArray();
            res.send(result);
        })
        
        app.delete('/addProducts/:id', async(req,res)=>{
            const id = req.params.id;
            const filter= {_id:ObjectId(id)};
            const result = await categoriesProductCollection.deleteOne(filter);
            res.send(result)
        })
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