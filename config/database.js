const mongoose=require("mongoose");

const mongoDB ="mongodb://localhost/SMA_ADHYAKSA_1_JAMBI";

mongoose.connect(
    mongoDB,
    {
        useNewUrlParser:true,
        useUnifiedTopology: true
    }
)
    .then(()=>console.log("Aplikasi Dijalankan..."));

mongoose.Promise=global.Promise;

module.exports=mongoose;