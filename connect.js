let mongoose= require("mongoose")

let con_string= process.env.MONGO_URL ;

let connectDB= async()=>{
    try{
        mongoose.connect(con_string,{
        });
        console.log("Connected to MongoDB")
    }
    catch(err){
        console.log(err)
    }
}

module.exports= connectDB
