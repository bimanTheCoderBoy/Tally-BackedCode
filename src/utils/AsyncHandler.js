const AsyncHandler = (originalFunction) => {
    return async(req, res, next) => {
        try{
            await originalFunction(req, res, next);
        }
        catch(error){
            next(error);
        }
    }
}

export default AsyncHandler;