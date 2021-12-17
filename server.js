import express from 'express'
import mongoose from 'mongoose'
import Messages from './dbMessages.js'
import Pusher from 'pusher';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 9000;

const pusher = new Pusher({
    appId: "1279899",
    key: "8c20d5f87dba0dee1f11",
    secret: "14e5fc4d615c81b862a3",
    cluster: "ap2",
    useTLS: true
  });
   


app.use(express.json())
app.use(cors());

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    next();
})

const connection_url = "mongodb://admin:Riya4798@watsappdb-shard-00-00.sg0xy.mongodb.net:27017,watsappdb-shard-00-01.sg0xy.mongodb.net:27017,watsappdb-shard-00-02.sg0xy.mongodb.net:27017/watsappdb?ssl=true&replicaSet=atlas-dn2hn0-shard-0&authSource=admin&retryWrites=true&w=majority";
mongoose.connect(connection_url, {
    
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;

db.once('open', () => {
    console.log("DB connected");


const msgCollection = db.collection('messagecontents');
//console.log(msgCollection);
const changeStream = msgCollection.watch()

changeStream.on("change", (change) => {
    console.log(change);

    if(change.operationType === "insert") {
        const messageDetails = change.fullDocument;
        pusher.trigger("messages", "inserted", {
            name: messageDetails.name,
            message: messageDetails.message,
            timestamp: messageDetails.timestamp,
            received: messageDetails.received,
        });
    }
    else {
        console.log("Error triggering pusher")
    }
});

    
});


app.get("/", (req,res) => res.status(200).send("hello"));

app.get('/messages/sync', (req,res) => {
    Messages.find((err, data) => {
        if(err) {
            res.status(500).send(err)
        } else {
            res.status(200).send(data)
        }
    })
})




app.post("/messages/new", (req,res) => {
    const dbMessage = req.body;
    Messages.create(dbMessage, (err,data) => {
        if(err) {
            res.status(500).send(err)
        } else {
            res.status(200).send(data)
        }
    })
})



app.listen(port, () => console.log(`Listen on ${port}`))

