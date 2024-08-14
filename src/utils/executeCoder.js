import ApiError from "../utils/ApiError.js";
import {runJavaCode} from "../utils/runJavaCode.js";
import {runPythonCode}  from "../utils/runPythonCode.js";
import { runCCode,runCppCode } from "./runCCppCode.js";
async function executeCoder(language, code, input,className) {
   
    function cleanOutput(output) {
        return output.replace(/[\x00-\x1F\x7F-\x9F]/g, "");
    }
    // Start time
    const startTime = process.hrtime();
    // Initial memory usage
    const startMemoryUsage = process.memoryUsage();
    let output;

    switch (language) {
        case 'java':
            output = await runJavaCode(code, input,className);
            break;
        case 'python':
             output = await runPythonCode(code, input);
            break;
        case 'c++':
            output = await runCppCode(code, input);
            break;
        case 'c':
            
            output = await runCCode(code, input);
            break;
        default:
            throw new ApiError('Unsupported language', 404);
    }
    
    // End time
    const endTime = process.hrtime(startTime);
    const executionTime = (endTime[0] * 1000 + endTime[1] / 1e6) + " ms";

    // After execution memory usage
    const endMemoryUsage = process.memoryUsage();
    const memoryUsed = ((endMemoryUsage.rss - startMemoryUsage.rss) / 1024 / 1024).toFixed(2) + " MB";

    return {output:cleanOutput( output), executionTime, memoryUsed };
}


export {executeCoder}