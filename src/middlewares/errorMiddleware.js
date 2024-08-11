
import ApiError from '../utils/ApiError.js';

const errorMiddleware = (error, req, res, next)=>{
    if(error instanceof ApiError){
        res.status(error.status).json({
            message: error.message,
            success: error.success
        });
    }
    else{
        res.status(500).json({
            message:error.message|| "Internal server error",
            success: false
        });
    }
}

export default errorMiddleware;