import { spawn } from "child_process";
import fs from "fs";
import Docker from "dockerode";
import path from "path"
// Initialize Docker client
const docker = new Docker();
export async function runCCode(code, input) {
    const folder = "f" + Math.floor(Math.random() * 9999) + "f";
    const cFileName = path.join(folder, 'TempCode.c');
    const outputFileName = path.join(folder, 'TempCode.exe');
    console.log(folder, cFileName, outputFileName);
    return new Promise((resolve, reject) => {
        // Write the C code to a file
        fs.mkdirSync(folder, { recursive: true });
        fs.writeFileSync(cFileName, code);

        // Compile the C code
        const gccProcess = spawn('gcc', ['-o', outputFileName, cFileName]);
        let compileError = '';

        gccProcess.stderr.on('data', (data) => {
            compileError += data.toString();
        });

        gccProcess.on('close', async (code) => {
            if (code !== 0) {
                fs.unlinkSync(cFileName);
                if (fs.existsSync(folder)) {
                    await fs.promises.rm(folder, { recursive: true, force: true });
                }
                resolve('Compilation Error: ' + compileError);
                return;
            }

            try {
                const output = await runExecutableInDocker(folder, 'TempCode.exe', input);
                resolve(output);
            } catch (err) {
                resolve(err.message);
            } finally {
                fs.unlinkSync(cFileName);
                fs.unlinkSync(outputFileName);
                if (fs.existsSync(folder)) {
                    await fs.promises.rm(folder, { recursive: true, force: true });
                }
            }
        });
    });
}


export async function runCppCode(code, input) {
    const folder = "f" + Math.floor(Math.random() * 9999) + "f";
    const cppFileName = path.join(folder, 'TempCode.cpp');
    const outputFileName = path.join(folder, 'TempCode.out');

    return new Promise((resolve, reject) => {
        // Write the C++ code to a file
        fs.mkdirSync(folder, { recursive: true });
        fs.writeFileSync(cppFileName, code);

        // Compile the C++ code
        const gppProcess = spawn('g++', ['-o', outputFileName, cppFileName]);
        let compileError = '';

        gppProcess.stderr.on('data', (data) => {
            compileError += data.toString();
        });

        gppProcess.on('close', async (code) => {
            if (code !== 0) {
                fs.unlinkSync(cppFileName);
                if (fs.existsSync(folder)) {
                    await fs.promises.rm(folder, { recursive: true, force: true });
                }
                resolve('Compilation Error: ' + compileError);
                return;
            }

            try {
                const output = await runExecutableInDocker(folder, 'TempCode.out', input);
                resolve(output);
            } catch (err) {
                resolve(err.message);
            } finally {
                fs.unlinkSync(cppFileName);
                fs.unlinkSync(outputFileName);
                if (fs.existsSync(folder)) {
                    await fs.promises.rm(folder, { recursive: true, force: true });
                }
            }
        });
    });
}


async function runExecutableInDocker(folder, executableName, input) {
    const tempDir = process.cwd();

    return new Promise(async (resolve, reject) => {
        try {
            const container = await docker.createContainer({
                Image: 'gcc:latest',
                Cmd: ['sh', '-c', `echo "${input}" | ./${folder}/${executableName}`],
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
                        if (err) reject(err);
                        else resolve(data);
                    });
                }),
                timeoutPromise,
            ]);

            resolve(output);
        } catch (err) {
            resolve(`Error running Docker container: ${err.message}`);
        }
    });
}

