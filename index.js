const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const cors = require("cors");
require('dotenv').config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('welcome to old books here')
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.tmuuwhy.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try{
        const productsCategoriCollection = client.db("oldBooksHere1").collection("productsCategories1");
        const productCollection = client.db("oldBooksHere1").collection("products");
        const bookingCollection = client.db("oldBooksHere1").collection('bookings');
        const userCollection = client.db("oldBooksHere1").collection('users');

        app.get('/productsCategoris', async(req, res) => {
            const result = await productsCategoriCollection.find({}).toArray();
            res.send(result);
        });
        
        app.get('/products/:id', async(req, res) => {
            const id = req.params.id;
            const query = {};
            const result = await productCollection.find(query).toArray();
            const matchProduct = result.filter(pItem => pItem.categoryId === id);
            res.send(matchProduct);
        })
        app.post('/bookings', async(req, res) => {
            const product = req.body;
            const result = await bookingCollection.insertOne(product);
            res.send(result);
            console.log(product, result);
        })

        app.post('/users', async(req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.send(result);
            console.log(user,result);
        })
        app.get('/users', async (req, res) => {
            const order = req.query.email;
            const query = {email: order};
            const result = await bookingCollection.find(query).toArray();
            console.log(result);
        })
    }
    finally{

    }
}
run().catch(err => console.log(err))


app.listen(port, () => {
    console.log(`old books here server running on port ${port}`);
});