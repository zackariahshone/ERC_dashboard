const mongoose = require('mongoose');
require('dotenv').config()
const uri = "mongodb+srv://zackariahshone:Zs72756AR4010!@nonprofitcluster.oe6muis.mongodb.net/?retryWrites=true&w=majority&appName=nonProfitCluster";

const db = 'mongodb://localhost:27017/ercDB';
const connection = mongoose.connect(db);
 
mongoose.set(
    {
        autoIndex:false
    }
    );

    const conSuccess = mongoose.connection
    conSuccess.once('open', _ => {
      console.log('Database connected:', db)
    })  
    
module.exports = connection
