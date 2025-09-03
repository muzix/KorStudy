const fs = require('fs');
const path = require('path');

try {
    // Read the 5324kor.txt file
    const rawData = fs.readFileSync(path.join(__dirname, '5324kor.txt'), 'utf8');
    
    // Split lines handling both \r\n and \n
    const lines = rawData.split(/\r?\n/).slice(1); // Skip header line
    
    console.log(`Read ${lines.length} lines from file`);

    // Function to generate romanized pronunciation
    function getRomanization(korean) {
        // Simple romanization rules
        const romanizationMap = {
            'ㄱ': 'g', 'ㄴ': 'n', 'ㄷ': 'd', 'ㄹ': 'r', 'ㅁ': 'm',
            'ㅂ': 'b', 'ㅅ': 's', 'ㅇ': '', 'ㅈ': 'j', 'ㅊ': 'ch',
            'ㅋ': 'k', 'ㅌ': 't', 'ㅍ': 'p', 'ㅎ': 'h',
            'ㅏ': 'a', 'ㅑ': 'ya', 'ㅓ': 'eo', 'ㅕ': 'yeo', 'ㅗ': 'o',
            'ㅛ': 'yo', 'ㅜ': 'u', 'ㅠ': 'yu', 'ㅡ': 'eu', 'ㅣ': 'i'
        };
        
        // This is a simplified romanization - you might want to use a proper library
        let result = '';
        for (let char of korean) {
            if (romanizationMap[char]) {
                result += romanizationMap[char];
            } else {
                result += char.toLowerCase();
            }
        }
        return result;
    }

    // Function to categorize words based on their meaning
    function getCategories(meaning) {
        const categories = ["Vocabulary"];
        const meaningLower = meaning.toLowerCase();
        
        // Add categories based on meaning
        if (meaningLower.includes("food") || meaningLower.includes("eat") || meaningLower.includes("drink")) {
            categories.push("Food");
        }
        if (meaningLower.includes("time") || meaningLower.includes("day") || meaningLower.includes("year")) {
            categories.push("Time");
        }
        if (meaningLower.includes("person") || meaningLower.includes("people") || meaningLower.includes("family")) {
            categories.push("People");
        }
        if (meaningLower.includes("go") || meaningLower.includes("come") || meaningLower.includes("move")) {
            categories.push("Verbs");
        }
        if (meaningLower.includes("big") || meaningLower.includes("small") || meaningLower.includes("good") || meaningLower.includes("bad")) {
            categories.push("Adjectives");
        }
        if (meaningLower.includes("hello") || meaningLower.includes("bye") || meaningLower.includes("thank")) {
            categories.push("Greetings");
        }
        if (meaningLower.includes("school") || meaningLower.includes("study") || meaningLower.includes("learn")) {
            categories.push("Education");
        }
        if (meaningLower.includes("house") || meaningLower.includes("room") || meaningLower.includes("building")) {
            categories.push("Places");
        }
        
        // Add "Common" category for basic words
        if (categories.length === 1 && meaning.split(' ').length <= 3) {
            categories.push("Common");
        }
        
        return categories;
    }

    // First transform all words
    const allWords = lines
        .filter(line => line.trim()) // Remove empty lines
        .map(line => {
            try {
                const parts = line.split('\t').map(s => s.trim());
                if (parts.length < 2) {
                    console.log('Skipping invalid line:', line);
                    return null;
                }
                const [korean, meaning] = parts;
                
                return {
                    korean,
                    pronunciation: getRomanization(korean),
                    translation: meaning,
                    example: "", // You might want to add example sentences later
                    categories: getCategories(meaning)
                };
            } catch (err) {
                console.log('Error processing line:', line);
                console.error(err);
                return null;
            }
        })
        .filter(word => word !== null); // Remove any failed transformations

    // Remove duplicates by korean word
    const seen = new Set();
    const transformedWords = allWords.filter(word => {
        if (seen.has(word.korean)) {
            console.log('Skipping duplicate word:', word.korean);
            return false;
        }
        seen.add(word.korean);
        return true;
    });

    console.log(`Transformed ${transformedWords.length} words`);

    // Create the dictionary content
    const dictionaryContent = 
        'const koreanDictionary = [\n' +
        transformedWords.map(word => '  ' + JSON.stringify(word, null, 2)).join(',\n') +
        '\n];\n';

    // Write to korean-words.js
    const koreanWordsPath = path.join(__dirname, 'korean-words.js');
    fs.writeFileSync(koreanWordsPath, dictionaryContent);
    console.log('Successfully created korean-words.js with', transformedWords.length, 'words');

} catch (err) {
    console.error('Error:', err);
} 