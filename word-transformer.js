const fs = require('fs');
const path = require('path');

try {
    // Read the 6000kor.txt file
    const rawData = fs.readFileSync(path.join(__dirname, '6000kor.txt'), 'utf8');
    
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

    const transformedWords = lines
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

    console.log(`Transformed ${transformedWords.length} words`);

    // Read the current korean-words.js file
    const koreanWordsPath = path.join(__dirname, 'korean-words.js');
    const currentContent = fs.readFileSync(koreanWordsPath, 'utf8');

    // Find the end of the dictionary array
    const arrayEndIndex = currentContent.indexOf('];');
    if (arrayEndIndex === -1) {
        throw new Error('Could not find end of dictionary array');
    }

    // Create the new content
    const newContent = currentContent.slice(0, arrayEndIndex) +
        ',\n\n  // Additional words from 6000kor.txt\n' +
        transformedWords.map(word => '  ' + JSON.stringify(word, null, 2)).join(',\n') +
        currentContent.slice(arrayEndIndex);

    // Write the updated content back to korean-words.js
    fs.writeFileSync(koreanWordsPath, newContent);
    console.log('Successfully updated korean-words.js with additional words');

} catch (err) {
    console.error('Error:', err);
} 