export const notFound = (req, res) => {
     res.status(404).json({error:"Route not found"});
  
};
export const errorHandler =(err,req,res,next)=>{
    console.error(err);
    const status=err.status||500;
    const message=status===500?'Interval server Error':err.message;
    res.status(status).json({error:message});
}
