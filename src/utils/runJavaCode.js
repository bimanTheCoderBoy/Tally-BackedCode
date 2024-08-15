import { spawn } from "child_process";
import fs from "fs";
import Docker from "dockerode";
import path from "path"
// Initialize Docker client
const docker = new Docker();
export async function runJavaCode(code, input,className) {
    
    // const className = 'TempCode';
    const folder="f"+Math.floor(Math.random()*9999)+"f";
    const javaFileName = path.join(folder, 'TempCode.java');
    return new Promise((resolve, reject) => {
        // Write the Java code to a file
        fs.mkdirSync(folder, { recursive: true });
        fs.writeFileSync(javaFileName, code);
        
        // Compile the Java code
        const javacProcess = spawn('javac', [javaFileName]);
        let compileError='';
        javacProcess.stderr.on('data', (data) => {
            compileError += data.toString();
        });
        javacProcess.on('close', async (code) => {
            if (code !== 0) {
                fs.unlinkSync(javaFileName);
                if (fs.existsSync(folder)) {
                    await fs.promises.rm(folder, { recursive: true, force: true });
                }
                resolve('Compilation Error: '+compileError);
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



export async function runJavaInDocker(folder,className, input) {
    
    return new Promise(async (resolve, reject) => {
        // const tempDir = process.cwd();
        const tempDir = process.env.HOST_URL; 
        
        try {
            // Create Docker container for running the Java class
            const container = await docker.createContainer({
                Image: 'openjdk:18-slim',
                Cmd: ['sh', '-c', `echo "${input}" | java -cp ${folder} ${className}`],
                // Run the Java program
                Tty: false,
                HostConfig: {
                    AutoRemove: true, 
                    Binds: [`${tempDir}:/usr/src/app`],
                    NetworkMode: 'none', 
                    Memory: 512 * 1024 * 1024,
                    CpuPeriod: 100000,
                    CpuQuota: 50000, 
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
            ])

            resolve(output);
        } catch (err) {
            resolve(`Error running Docker container: ${err.message}`);
        }
    });
}





//just compiler
export async function runJavaCompile(code) {
   
    const folder="f"+Math.floor(Math.random()*9999)+"f";
    const javaFileName = path.join(folder, 'TempCode.java');
    return new Promise((resolve, reject) => {
        // Write the Java code to a file
        fs.mkdirSync(folder, { recursive: true });
        fs.writeFileSync(javaFileName, code);

        // Compile the Java code
        const javacProcess = spawn('javac', [javaFileName]);
        let output="";
        javacProcess.stderr.on('data', (data) => {
            output += data.toString();
        });
        javacProcess.on('close', async (code) => {
            if (code !== 0) {
                fs.unlinkSync(javaFileName);
                if (fs.existsSync(folder)) {
                    await fs.promises.rm(folder, { recursive: true, force: true });
                }
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


export const runTestCaseJava=async (code, className, testCases) => {
    let result = [];
    const folder = await runJavaCompile(code, className);
    for (let i = 0; i < testCases.length; i++) {
      const tcinput = testCases[i].input;
      const tcoutput = testCases[i].output;
      let actualOutput = await runJavaInDocker(folder, className, tcinput);
      actualOutput = actualOutput.replace(/[\x00-\x1F\x7F-\x9F]/g, "");
      if (actualOutput == tcoutput) {
        result.push({
          input: tcinput,
          actualOutput: actualOutput,
          axpectedOutput: tcoutput,
          status: "passed",
        });
      } else {
        result.push({
          input: tcinput,
          actualOutput: actualOutput,
          axpectedOutput: tcoutput,
          status: "failed",
        });
      }
    }
    try {
      if (fs.existsSync(folder)) {
        // fs.unlinkSync(`${folder}/TempCode.java`);
        // fs.unlinkSync(`${folder}/${className}.class`);
        await fs.promises.rm(folder, { recursive: true, force: true });
      }
    } catch (error) {
      console.log(error);
    }
    return result;
  };