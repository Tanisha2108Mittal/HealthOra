let mongoose= require("mongoose")

let con_string= process.env.MONGO_URL || "mongodb+srv://tanishamittal3867_db_user:pRYME4WZ5dofuTnl@user-feedbackcluster0.ssc24l7.mongodb.net/feedbackDB";

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