const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const cors = require("cors");
require('dotenv').config();
const port = process.env.PORT || 5000;
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('welcome to old books here')
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.tmuuwhy.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri,process.env.STRIPE_SECRET_KEY);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try{
        const productsCategoriCollection = client.db("oldBooksHere1").collection("productsCategories1");
        const productCollection = client.db("oldBooksHere1").collection("products");
        const bookingCollection = client.db("oldBooksHere1").collection('bookings');
        const userCollection = client.db("oldBooksHere1").collection('users');
        const paymentsCollection = client.db("oldBooksHere1").collection('payments');
        const advertiseCollection = client.db("oldBooksHere1").collection('advertises');

        app.post('/advertises', async(req, res) => {
            const advertiseItem = req.body;
            
            const id = advertiseItem._id;
            const filter = {_id: ObjectId(id)};
            const updateDoc = {
                $set: {
                    advertised: true,
                }
            }
            const checkAdvertised = await productCollection.updateOne(filter, updateDoc);
            const result = await advertiseCollection.insertOne(advertiseItem);
            console.log(result,filter);
        })
        app.get('/advertises', async(req, res) => {
            const result = await advertiseCollection.find({}).toArray();
            res.send(result);
        });

        app.get('/productsCategoris', async(req, res) => {
            const result = await productsCategoriCollection.find({}).toArray();
            res.send(result);
        });
        

        app.get('/products/:id', async(req, res) => {
            

            const id = req.params.id;
            // const alreadyPaidId = {_id: ObjectId(id)};
            // const alreadyPaid = await bookingCollection.findOne(alreadyPaidId)
            // console.log(alreadyPaid);
            const query = {categoryId: id};
            const result = await productCollection.find(query).toArray();
            const matchProduct = result.filter(pItem => pItem.isPaid === false);
            res.send(matchProduct);
        })
        app.get('/products', async (req, res) => {
            const order = req.query.email;
            const query = {email: order};
            const result = await productCollection.find(query).toArray();
            res.send(result);
            // console.log(order,query,result);
        })
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productCollection.insertOne(product);
            res.send(result);
            // console.log(paidResult);
        })
        app.delete('/products/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await productCollection.deleteOne(query);
            res.send(result);
            console.log(id,query,result);    
        })

        
        app.get('/users/seller/:email', async(req, res) => {
            const email = req.params.email;
            const query = {email};
            const user = await userCollection.findOne(query);
            // console.log(email,query, user);
            res.send({isSeller: user?.role === 'seller'});
        })
        app.get('/users/buyer/:email', async(req, res) => {
            const email = req.params.email;
            const query = {email};
            const user = await userCollection.findOne(query);
            // console.log(email,query, user);
            res.send({isBuyer: user?.role === 'buyer'});
        })

        app.get('/bookings/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await bookingCollection.findOne(query);
            res.send(result);
            console.log(result);
        })

        app.post('/create-payment-intent', async(req, res) => {
            const booking = req.body;
            const price = booking.productPrice;
            const amount = price * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                currency: "usd",
                amount: amount,
                "payment_method_types": [
                    "card"
                  ],
            });
            res.send({ clientSecret: paymentIntent.client_secret,});
        })
        app.post('/payments', async (req, res) => {
            const payment = req.body;
            const result = await paymentsCollection.insertOne(payment);
            const id = payment.bookingId;
            const filter = {_id: ObjectId(id)};
            const updateDoc = {
                $set: {
                    paid: true,
                }
            }
            
            const isPaidDoc = {
                $set:{
                    isPaid: true
                }
            }
            const checkIsPaid = await productCollection.updateOne(filter, isPaidDoc);
            const updateDocResult = await bookingCollection.updateOne(filter, updateDoc)
            res.send(result);
            console.log(filter);
        })
        

        app.get('/bookings', async(req, res) => {
            const bookingEmail = req.query.email;
            const query = {email: bookingEmail};
            const result = await bookingCollection.find(query).toArray();
            res.send(result)
            // console.log(result);
        })
        app.post('/bookings', async(req, res) => {
            const product = req.body;
            const result = await bookingCollection.insertOne(product);
            res.send(result);
            // console.log(product, result);
        })
        


        app.get('/users', async(req, res) => {
            const userEmail = req.query.email;
            const query = {email: userEmail};
            
            const user = await userCollection.findOne(query);
            if(user?.role !== "buyer"){
               return res.send({});
            }
            res.send(user)
            // console.log(user);
        })
        app.post('/users', async(req, res) => {
            const existEmail = req.query.email;
            const existUserQuery = {email: existEmail}
            const userExist = await userCollection.findOne(existUserQuery);
            console.log(userExist);
            if(userExist){
                return res.send({message: 'user allready exist'})
            }
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.send(result);
            // console.log(user,result);
            
        })
        
    }
    finally{

    }
}
run().catch(err => {console.error(err)})


app.listen(port, () => {
    console.log(`old books here server running on port ${port}`);
});