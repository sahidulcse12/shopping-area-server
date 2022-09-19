const express = require('express')
const cors = require('cors')
require('dotenv').config()
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

//use middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qjivliz.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


const run = async (req, res) => {
    try {
        await client.connect();
        const productCollection = client.db("ProductsRoom").collection("products");


        app.get('/product', async (req, res) => {

            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);

            const query = {};
            const cursor = productCollection.find(query);
            let products;

            if (page || size) {
                products = await cursor.skip(page * size).limit(size).toArray();
            } else {
                products = await cursor.toArray();
            }
            res.send(products)
        })


        app.get('/productCount', async (req, res) => {
            const count = await productCollection.estimatedDocumentCount();
            res.send({ count })
        })


        //use post for getting keys
        app.post('/productByKeys', async (req, res) => {
            const keys = req.body;
            const ids = keys.map(id => ObjectId(id));
            const query = { _id: { $in: ids } };
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            console.log(products);
            res.send(products);
        })

    } finally { }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log("listening on port ", port);
})
