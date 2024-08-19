
import ApiError from './ApiError.js'


// // Function to tokenize code
// const tokenizeCode = (code) => {
//     if (typeof code !== 'string') {
//         throw new ApiError('Input must be a string', 400);
//     }

//     // Remove comments
//     code = code.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');

//     // Normalize code by converting to lowercase and removing extra whitespace
//     code = code.replace(/\s+/g, ' ').trim().toLowerCase();

//     // console.log('Normalized Code:', code);

//     // Tokenize based on common programming delimiters
//     const tokens = code.split(/[\s{}();,]+/).filter(token => token.length > 0);
//     // console.log('Tokens:', tokens);

//     return tokens;
// };

// // Function to calculate similarity
// const calculateSimilarity = (tokens1, tokens2) => {
//     const set1 = new Set(tokens1);
//     const set2 = new Set(tokens2);

//     // console.log('Set1:', set1);
//     // console.log('Set2:', set2);

//     const intersection = [...set1].filter(token => set2.has(token)).length;
//     const union = new Set([...set1, ...set2]).size;

//     // console.log('Intersection:', intersection);
//     // console.log('Union:', union);

//     return union === 0 ? 0 : intersection / union; // Jaccard similarity coefficient
// };

// // Function to check for plagiarism
// const checkPlagiarism = async (userCode, savedCodes, threshold = 0.8) => {
//     if (typeof userCode !== 'string') {
//         throw new TypeError('User code must be a string');
//     }

//     // console.log('User Code:', userCode);

//     const userTokens = tokenizeCode(userCode);
//     // console.log('User Tokens:', userTokens);

//     let isPlagiarized = false;

//     savedCodes.forEach((savedCode, index) => {
//         // console.log(`\nComparing with saved code ${index + 1}:`);
//         // console.log('Saved Code:', savedCode);

//         const savedTokens = tokenizeCode(savedCode);
//         // console.log('Saved Tokens:', savedTokens);

//         const similarity = calculateSimilarity(userTokens, savedTokens);

//         // console.log(`Similarity Score with saved code ${index + 1}: ${similarity}`);

//         if (similarity > threshold) {
//             // console.log(`Plagiarism detected with saved code ${index + 1}`);
//             isPlagiarized = true;
//         } 
//         // else {
//             // console.log(`No plagiarism detected with saved code ${index + 1}`);
//             // isPlagiarized = false;
//         // }
//     });

//     return isPlagiarized;
// };

// // const isPlagiarized = checkPlagiarism(userCode, savedCodes);
// // console.log(`\nPlagiarism Detected: ${isPlagiarized}`); // Output based on similarity


// Function to check for plagiarism
const checkPlagiarism = (userCode, savedCodes, threshold = 0.8) => {
    if (typeof userCode !== 'string') {
        throw new TypeError('User code must be a string');
    }

    const userTokens = tokenizeCode(userCode);
    let isPlagiarized = false;

    for (let savedCode of savedCodes) {
        const savedTokens = tokenizeCode(savedCode);
        const similarity = calculateSimilarity(userTokens, savedTokens);

        if (similarity > threshold) {
            isPlagiarized = true;
            break; // Exit loop early if plagiarism is detected
        }
    }

    return isPlagiarized;
};

// Example tokenization function (customize as needed)
const tokenizeCode = (code) => {
    // Example: Simple tokenization by splitting code into words/keywords
    return code.split(/\s+/).filter(token => token.length > 0);
};

// Example similarity calculation function (customize as needed)
const calculateSimilarity = (tokensA, tokensB) => {
    // Example: Calculate the Jaccard similarity between two token sets
    const setA = new Set(tokensA);
    const setB = new Set(tokensB);

    const intersection = new Set([...setA].filter(x => setB.has(x)));
    const union = new Set([...setA, ...setB]);

    return intersection.size / union.size;
};





export default checkPlagiarism