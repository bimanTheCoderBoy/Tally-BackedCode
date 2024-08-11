import AsyncHandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";

import {executeCoder} from "../utils/executeCoder.js";

const executeCode = AsyncHandler(async (req, res) => {
    const { language, code, input,className } = req.body;
    if(!language||!code){
        throw new ApiError('Missing required fields',400);
      }
    const output = await executeCoder(language, code, input,className);
    res.json({ success: true, output: output.output, memoryUsed: output.memoryUsed, executionTime: output.executionTime });
});
























export { executeCode,executeCoder };
