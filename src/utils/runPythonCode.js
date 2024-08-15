import { spawn } from "child_process";
import fs from "fs";
import Docker from "dockerode";
import path from "path"
// Initialize Docker client
// const docker = new Docker({ socketPath: '/var/run/docker.sock' });
const docker = new Docker();
export async function runPythonCode(code, input) {


    const folder = "f" + Math.floor(Math.random() * 9999) + "f";
    const pythonFileName = path.join(folder, 'TempCode.py');
    
    return new Promise(async (resolve, reject) => {
        // Write the Python code to a file
        fs.mkdirSync(folder, { recursive: true });
        fs.writeFileSync(pythonFileName, code);

        // const tempDir = process.cwd(); 
        const tempDir = process.env.HOST_URL; 
       
        try {
            // Create Docker container for running the Python script
            const container = await docker.createContainer({
                Image: 'python:3.10-slim',
                Cmd: ['sh', '-c', `echo "${input}" | python3 ${folder}/TempCode.py`],
                Tty: false,
                HostConfig: {
                    AutoRemove: true,
                    Binds: [`${tempDir}:/app`],
                    NetworkMode: 'none',
                    Memory: 512 * 1024 * 1024,
                    CpuPeriod: 100000,
                    CpuQuota: 50000,
                },
                WorkingDir: '/app',
                OpenStdin: true,
                StdinOnce: true,
            });

            await container.start();

            const stream = await container.attach({
                stream: true,
                stdin: true,
                stdout: true,
                stderr: true,
            });
           
            let output = '';
            stream.on('data', (data) => {
                output += data.toString();
            });


            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Execution timed out')), 5000)
            );

            await Promise.race([
                new Promise((resolve, reject) => {
                    container.wait((err, data) => {
                        console.log(err,"           ",data)
                        if (err) reject(err);

                        else resolve(data);
                        
                    });
                }),
                timeoutPromise,
            ]);

            resolve(output);
        } catch (err) {
            resolve(`Error running Docker container: ${err.message}`);
        } finally {
            if (fs.existsSync(folder)) {
                await fs.promises.rm(folder, { recursive: true, force: true });
            }
        }
    });
}



export const runPythonTestCase=async(code,testCases)=>{
    let result = [];
    
    for (let i = 0; i < testCases.length; i++) {
      const tcinput = testCases[i].input;
      const tcoutput = testCases[i].output;
      
      let actualOutput = await runPythonCode(code, tcinput);
      actualOutput = actualOutput.replace(/[\x00-\x1F\x7F-\x9F]/g, "");
      console.log(actualOutput);
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
   
    return result;
}