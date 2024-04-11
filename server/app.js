
const express = require('express');
const cors = require('cors')
const database = require('./mongo')
const app = express();
const port = process.env.PORT || 8000;

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.get('/', cors(), (req, res) => {
    res.json({ message: "Server responded" })
})

app.get('/userdata', cors(), async (req, res) => {

    try {
        const allUsersData = await database.find({})
        res.json(allUsersData);
    }
    catch (e) {
        console.log(e)
    }

})

app.post('/userdata', cors(), async (req, res) => {
    const postData = req.body;
    try {
        await database.insertMany([postData]);
        res.json({ message: "Posted Successfully" });
    }
    catch (e) {
        console.log(e)
    }

})

app.listen(port, () => {
    console.log("Server is running on " + port);
})
