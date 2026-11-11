import express from 'express';
const app = express();
app.use(express.json());
app.get("/",(req,res)=>{
    res.send("Hello jani kia hal hain api chal rahi hain").status(200);

});
const PORT=process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})
