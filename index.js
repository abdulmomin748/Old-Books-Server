const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const cors = require('cors');
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

        app.get('/productsCategoris', async(req, res) => {
            const result = await productsCategoriCollection.find({}).toArray();
            res.send(result);
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