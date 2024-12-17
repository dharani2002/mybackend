const asyncHandler=(requestHandler)=>{
    return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err))
    }
}


export {asyncHandler}

// const asyncHandler=()=>{}
// const asyncHandler=(function)=>{}
// const asyncHandler=(function)=>()=>{}
//high order function that passes fiunction to another function


/*
const asyncHandler =(fn)=>async (req,res,next)=>{
    try{
    await fn(req,res,next)

    }catch(error){
        res.status(error.code || 500).json({
            success:false,
            message:error.message
        })
    }
}
*/