import AsyncHandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { spawn } from "child_process";
import fs from "fs";
import Docker from "dockerode";
import path from "path"
// Initialize Docker client
const docker = new Docker();

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
        // Add cases for other languages as needed
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

// Compile Java code locally and then run it in Docker
async function runJavaCode(code, input,className) {
    
    // const className = 'TempCode';
    const folder="f"+Math.floor(Math.random()*9999)+"f";
    const javaFileName = path.join(folder, 'TempCode.java');
    return new Promise((resolve, reject) => {
        // Write the Java code to a file
        fs.mkdirSync(folder, { recursive: true });
        fs.writeFileSync(javaFileName, code);
        
        // Compile the Java code
        const javacProcess = spawn('javac', [javaFileName]);
        
        javacProcess.on('close', async (code) => {
            if (code !== 0) {
                console.log(className)
                reject(new Error('Compilation failed'));
                return;
            }
           
            try {
                // After successful compilation, run the code inside Docker
                const output = await runJavaInDocker(folder,className, input);
                fs.unlinkSync(javaFileName);
                fs.unlinkSync(`${folder}/${className}.class`);
                if (fs.existsSync(folder)) {
                    await fs.promises.rm(folder, { recursive: true, force: true });
                }
                resolve(output);
            } catch (err) {
                fs.unlinkSync(javaFileName);
                fs.unlinkSync(`${folder}/${className}.class`);
                if (fs.existsSync(folder)) {
                    await fs.promises.rm(folder, { recursive: true, force: true });
                }
                resolve(err.message);
            }
        });
    });
}



async function runJavaInDocker(folder,className, input) {
    console.log(className+"twst ");
    return new Promise(async (resolve, reject) => {
        const tempDir = process.cwd(); // Use current working directory for Docker binding
        
        try {
            // Create Docker container for running the Java class
            const container = await docker.createContainer({
                Image: 'openjdk:18-slim',
                Cmd: ['sh', '-c', `echo "${input}" | java -cp ${folder} ${className}`],
                // Run the Java program
                Tty: false,
                HostConfig: {
                    AutoRemove: true, // Automatically remove after execution
                    Binds: [`${tempDir}:/usr/src/app`],
                    NetworkMode: 'none', // Disable network access
                    Memory: 512 * 1024 * 1024, // 512MB memory limit
                    CpuPeriod: 100000,
                    CpuQuota: 50000, // 50% of one CPU
                },
                WorkingDir: '/usr/src/app',
                OpenStdin: true, // Open stdin for the container
                StdinOnce: true, // Close stdin after the first write
            });

            // Start the container
            await container.start();

            // Attach to the container's stdin, stdout, and stderr
            const stream = await container.attach({
                stream: true,
                stdin: true,
                stdout: true,
                stderr: true,
            });

            let output = '';

            // Collect the output
            stream.on('data', (data) => {
                output += data.toString();
            });
            console.log(folder);
            // Send input to the container's stdin
            // if (input) {
            //     stream.write(input);
            //     stream.end(); // Close stdin
            // }

            // Set a timeout for execution
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Execution timed out')), 5000) // 5 seconds timeout
            );

            // Wait for execution to finish or timeout
            await Promise.race([
                new Promise((resolve, reject) => {
                    container.wait((err, data) => {
                        if (err) reject(err);
                        else resolve(data);
                    });
                }),
                timeoutPromise
            ]);

            resolve(output);
        } catch (err) {
            resolve(`Error running Docker container: ${err.message}`);
        }
    });
}





//just compiler
async function runJavaCompile(code) {
   
    const folder="f"+Math.floor(Math.random()*9999)+"f";
    const javaFileName = path.join(folder, 'TempCode.java');
    return new Promise((resolve, reject) => {
        // Write the Java code to a file
        fs.mkdirSync(folder, { recursive: true });
        fs.writeFileSync(javaFileName, code);

        // Compile the Java code
        const javacProcess = spawn('javac', [javaFileName]);
        let output="";
        javacProcess.on('data', (data) => {
            output += data.toString();
        });
        javacProcess.on('close', async (code) => {
            if (code !== 0) {
                
                resolve(output);
                return;
            }

            try {
                // After successful compilation, run the code inside Docker
                // const output = await runJavaInDocker(folder,className, input);
                fs.unlinkSync(javaFileName);
               // fs.unlinkSync(`${folder}/${className}.class`);
                // if (fs.existsSync(folder)) {
                //     await fs.promises.rm(folder, { recursive: true, force: true });
                // }
                resolve(folder);
            } catch (err) {
                fs.unlinkSync(javaFileName);
               // fs.unlinkSync(`${folder}/${className}.class`);
                // if (fs.existsSync(folder)) {
                //     await fs.promises.rm(folder, { recursive: true, force: true });
                // }
                reject(err);
            }
        });
    });
}

export {executeCoder,runJavaCompile,runJavaInDocker}