const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const dotenv = require("dotenv")

const app = express()
const Routes = require("./routes/route.js")

const PORT = process.env.PORT || 5000

dotenv.config();

app.use(express.json({ limit: '10mb' }))
app.use(cors())

mongoose
    .connect('mongodb+srv://sahizain9:MdjFHvnmSufQ0SBJ@cluster0.ili8uib.mongodb.net/', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(console.log("Connected to MongoDB"))
    .catch((err) => console.log("NOT CONNECTED TO NETWORK", err))

app.use('/', Routes);

app.listen(PORT, () => {
    console.log(`Server started at port no. ${PORT}`)
})