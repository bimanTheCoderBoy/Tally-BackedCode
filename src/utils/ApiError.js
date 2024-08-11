
class ApiError extends Error{
    constructor(message, status){
        super(message);
        this.status=status;
        this.success=false;
    }
}

export default ApiError;