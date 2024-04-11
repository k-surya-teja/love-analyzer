
require('dotenv').config()

const mongoose  = require('mongoose')

mongoose.connect(process.env.MONGODB_URI)
.then(()=>{
    console.log('Database Connected')
})
.catch((e)=>{
    console.log(e)
})


const mongoSchema = mongoose.Schema(
    {
        name1 : {
            type : String,
            required : true,
        },
        name2 : {
            type : String,
            required : true
        },
        relation : {
            type : String,
            required : true
            
        }
    }
)

const collection = mongoose.model('collection',mongoSchema)

module.exports = collection