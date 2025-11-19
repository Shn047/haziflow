// // --- CONFIGURATION ---
// const FASTAPI_URL = 'http://192.168.1.173:8000/api/v1/segment'; 
// const INTERNAL_API_KEY = 'my-secret-key-for-firefox-123'; 

// console.log("--- HanziFlow: background.js SCRIPT RUNNING ---");

// // --- MESSAGE LISTENER ---
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     console.log("--- HanziFlow: background.js received message:", request.action);
//     if (request.action === "segmentChinese") {
//         handleSegmentationRequest(request.text, sendResponse);
//         return true; 
//     }
// });

// // --- REQUEST HANDLER ---
// async function handleSegmentationRequest(text, sendResponse) {
//     console.log("--- HanziFlow: Text received for API call:", `"${text}"`);
//     console.log("--- HanziFlow: background.js: Sending request to local backend...");
    
//     try {
//         const backendResponse = await callRealAIBackend(text);
        
//         // Parse the model's segmentation output into frontend format
//         const formattedData = parseModelSegmentation(text, backendResponse);
        
//         console.log("--- HanziFlow: background.js: Successfully parsed model output");
//         sendResponse({ success: true, data: formattedData });

//     } catch (error) {
//         console.error("--- HanziFlow: background.js: CATCH BLOCK ERROR ---", error.message);
//         sendResponse({ success: false, error: error.message });
//     }
// }

// // --- API CALL FUNCTION ---
// async function callRealAIBackend(chineseText) {
//     const response = await fetch(FASTAPI_URL, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//             'X-API-Key': INTERNAL_API_KEY 
//         },
//         body: JSON.stringify({
//             content: chineseText 
//         })
//     });

//     if (!response.ok) {
//         let errorDetail = `API error: ${response.status}`;
//         try {
//             const errorData = await response.json();
//             errorDetail = errorData.detail || errorDetail; 
//         } catch (e) {
//             errorDetail = `API error: ${response.status} ${response.statusText}`;
//         }
//         console.error("--- HanziFlow: background.js: API response not OK:", errorDetail);
//         throw new Error(errorDetail);
//     }

//     return await response.json(); 
// }

// // --- SEGMENTATION PARSER ---
// function parseModelSegmentation(originalText, modelResponse) {
//     console.log("--- HanziFlow: Parsing model response:", modelResponse);
    
//     // Handle different response formats from the model
//     let segmentsString = '';
    
//     if (modelResponse.segments) {
//         // Format: {"segments": "角的連 結隨 時調 整"}
//         segmentsString = modelResponse.segments;
//     } else if (modelResponse.result) {
//         // Format: {"result": "角的連 結隨 時調 整"}
//         segmentsString = modelResponse.result;
//     } else if (typeof modelResponse === 'string') {
//         // Format: direct string "角的連 結隨 時調 整"
//         segmentsString = modelResponse;
//     } else {
//         console.warn("--- HanziFlow: Unknown response format, using character fallback");
//         // Fallback: split into individual characters
//         segmentsString = originalText.split('').join(' ');
//     }
    
//     // Clean and parse the segments
//     const segments = cleanAndParseSegments(segmentsString);
    
//     // Create the structured data for frontend
//     return {
//         segmented_sentence: segmentsString,
//         words: createWordObjects(segments),
//         usage_patterns: generateUsagePatterns(segments, originalText)
//     };
// }

// // --- SEGMENT CLEANING AND PARSING ---
// function cleanAndParseSegments(segmentsString) {
//     console.log("--- HanziFlow: Raw segments string:", segmentsString);
    
//     // Remove extra spaces and normalize
//     let cleaned = segmentsString
//         .replace(/\s+/g, ' ')          // Multiple spaces to single space
//         .replace(/^\\s+|\\s+$/g, '')   // Trim spaces
//         .trim();
    
//     console.log("--- HanziFlow: Cleaned segments string:", cleaned);
    
//     // Split by spaces to get individual segments
//     const segments = cleaned.split(' ').filter(segment => {
//         // Filter out empty strings and very short nonsense
//         return segment.length > 0 && segment !== ' ' && segment !== '\\s';
//     });
    
//     console.log("--- HanziFlow: Parsed segments array:", segments);
//     return segments;
// }

// // --- CREATE WORD OBJECTS FOR FRONTEND ---
// function createWordObjects(segments) {
//     return segments.map(segment => {
//         // You can enhance this with a dictionary lookup later
//         const translation = getTranslationForWord(segment);
//         const pos = guessPartOfSpeech(segment);
        
//         return {
//             word: segment,
//             translation: translation,
//             pos: pos,
//             pinyin: '' // Can be added later with pinyin library
//         };
//     });
// }

// // --- SIMPLE TRANSLATION LOOKUP (ENHANCE LATER) ---
// function getTranslationForWord(chineseWord) {
//     // Simple translation mapping - expand this with a real dictionary
//     const translationMap = {
//         '的': "'s/of",
//         '是': 'is/are',
//         '在': 'at/in',
//         '有': 'have/has',
//         '和': 'and',
//         '了': '(past tense marker)',
//         '我': 'I/me',
//         '你': 'you',
//         '他': 'he/him',
//         '她': 'she/her',
//         '它': 'it',
//         '我们': 'we/us',
//         '他们': 'they/them',
//         '这个': 'this',
//         '那个': 'that',
//         '什么': 'what',
//         '为什么': 'why',
//         '怎么': 'how',
//         '哪里': 'where',
//         '谁': 'who',
//         '时候': 'time/when',
//         '今天': 'today',
//         '明天': 'tomorrow',
//         '昨天': 'yesterday',
//         '天气': 'weather',
//         '很好': 'very good',
//         '喜欢': 'like',
//         '爱': 'love',
//         '看': 'look/see/watch',
//         '听': 'listen/hear',
//         '说': 'speak/say',
//         '吃': 'eat',
//         '喝': 'drink',
//         '去': 'go',
//         '来': 'come',
//         '做': 'do/make',
//         '工作': 'work',
//         '学习': 'study/learn',
//         '学校': 'school',
//         '老师': 'teacher',
//         '学生': 'student',
//         '朋友': 'friend',
//         '家庭': 'family',
//         '爸爸': 'father',
//         '妈妈': 'mother',
//         '哥哥': 'older brother',
//         '弟弟': 'younger brother',
//         '姐姐': 'older sister',
//         '妹妹': 'younger sister'
//     };
    
//     return translationMap[chineseWord] || chineseWord; // Return word itself if no translation found
// }

// // --- SIMPLE PART-OF-SPEECH GUESSING ---
// function guessPartOfSpeech(word) {
//     // Very basic POS guessing - can be enhanced later
//     if (word.length === 1 && ['的', '了', '着', '过', '啊', '呢', '吗', '吧'].includes(word)) {
//         return 'particle';
//     }
//     if (['我', '你', '他', '她', '它', '我们', '你们', '他们'].includes(word)) {
//         return 'pronoun';
//     }
//     if (['是', '有', '在', '做', '看', '听', '说', '吃', '喝', '去', '来'].includes(word)) {
//         return 'verb';
//     }
//     if (['很', '非常', '太', '更', '最'].includes(word)) {
//         return 'adverb';
//     }
//     if (['好', '大', '小', '多', '少', '新', '旧', '红', '绿', '蓝'].includes(word)) {
//         return 'adjective';
//     }
    
//     return 'noun'; // Default to noun
// }

// // --- GENERATE USAGE PATTERNS ---
// function generateUsagePatterns(segments, originalText) {
//     const patterns = [];
    
//     // Create basic usage patterns from the original sentence
//     if (segments.length > 0) {
//         patterns.push({
//             phrase: originalText,
//             explanation: "Original sentence with word segmentation applied",
//             example: `Segmented as: ${segments.join(' ')}`
//         });
//     }
    
//     // Add patterns for individual words that have common usage
//     segments.forEach(segment => {
//         const commonPattern = getCommonUsagePattern(segment);
//         if (commonPattern) {
//             patterns.push(commonPattern);
//         }
//     });
    
//     return patterns;
// }

// // --- COMMON USAGE PATTERNS ---
// function getCommonUsagePattern(word) {
//     const commonPatterns = {
//         '的': {
//             phrase: "的",
//             explanation: "Possessive particle or descriptive marker",
//             example: "我的书 (my book), 红色的花 (red flower)"
//         },
//         '是': {
//             phrase: "是",
//             explanation: "To be (am/is/are)",
//             example: "我是学生 (I am a student), 这是书 (This is a book)"
//         },
//         '在': {
//             phrase: "在",
//             explanation: "Indicates location or ongoing action",
//             example: "我在家 (I am at home), 他在看书 (He is reading)"
//         },
//         '了': {
//             phrase: "了",
//             explanation: "Indicates completed action or change of state",
//             example: "我吃了 (I ate), 天气冷了 (The weather got cold)"
//         },
//         '和': {
//             phrase: "和",
//             explanation: "And (connects nouns)",
//             example: "我和你 (you and I), 书和笔 (book and pen)"
//         }
//     };
    
//     return commonPatterns[word] || null;
// }

// --- CONFIGURATION ---
const FASTAPI_URL = 'http://192.168.1.173:8000/api/v1/segment'; 
const INTERNAL_API_KEY = 'my-secret-key-for-firefox-123'; 

console.log("--- HanziFlow: background.js SCRIPT RUNNING ---");

// --- MESSAGE LISTENER ---
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("--- HanziFlow: background.js received message:", request.action);
    if (request.action === "segmentChinese") {
        handleSegmentationRequest(request.text, sendResponse);
        return true; 
    }
});

// --- REQUEST HANDLER ---
async function handleSegmentationRequest(text, sendResponse) {
    console.log("--- HanziFlow: Text received for API call:", `"${text}"`);
    console.log("--- HanziFlow: background.js: Sending request to local backend...");
    
    try {
        const backendResponse = await callRealAIBackend(text);
        
        // Parse the model's segmentation output into frontend format
        const formattedData = parseModelSegmentation(text, backendResponse);
        
        console.log("--- HanziFlow: background.js: Successfully parsed model output");
        sendResponse({ success: true, data: formattedData });

    } catch (error) {
        console.error("--- HanziFlow: background.js: CATCH BLOCK ERROR ---", error.message);
        sendResponse({ success: false, error: error.message });
    }
}

// --- API CALL FUNCTION ---
async function callRealAIBackend(chineseText) {
    const response = await fetch(FASTAPI_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-API-Key': INTERNAL_API_KEY 
        },
        body: JSON.stringify({
            content: chineseText 
        })
    });

    if (!response.ok) {
        let errorDetail = `API error: ${response.status}`;
        try {
            const errorData = await response.json();
            errorDetail = errorData.detail || errorDetail; 
        } catch (e) {
            errorDetail = `API error: ${response.status} ${response.statusText}`;
        }
        console.error("--- HanziFlow: background.js: API response not OK:", errorDetail);
        throw new Error(errorDetail);
    }

    return await response.json(); 
}

// --- SEGMENTATION PARSER ---
function parseModelSegmentation(originalText, modelResponse) {
    console.log("--- HanziFlow: Parsing model response:", modelResponse);
    
    // Handle different response formats from the model
    let segmentsString = '';
    
    if (modelResponse.segments) {
        segmentsString = modelResponse.segments;
    } else if (modelResponse.result) {
        segmentsString = modelResponse.result;
    } else if (typeof modelResponse === 'string') {
        segmentsString = modelResponse;
    } else {
        console.warn("--- HanziFlow: Unknown response format, using character fallback");
        segmentsString = originalText.split('').join(' ');
    }
    
    const segments = cleanAndParseSegments(segmentsString);
    
    return {
        segmented_sentence: segmentsString,
        words: createWordObjects(segments),
        usage_patterns: generateUsagePatterns(segments, originalText)
    };
}

// --- SEGMENT CLEANING AND PARSING ---
function cleanAndParseSegments(segmentsString) {
    console.log("--- HanziFlow: Raw segments string:", segmentsString);
    
    // Remove extra spaces and normalize
    let cleaned = segmentsString
        .replace(/\s+/g, ' ')          // Multiple spaces to single space
        .replace(/^\\s+|\\s+$/g, '')   // Trim spaces
        .trim();
    
    console.log("--- HanziFlow: Cleaned segments string:", cleaned);
    
    // Split by spaces to get individual segments
    const segments = cleaned.split(' ').filter(segment => {
        // Filter out empty strings and very short nonsense
        return segment.length > 0 && segment !== ' ' && segment !== '\\s';
    });
    
    console.log("--- HanziFlow: Parsed segments array:", segments);
    return segments;
}

// --- CREATE WORD OBJECTS FOR FRONTEND ---
function createWordObjects(segments) {
    return segments.map(segment => {
        // You can enhance this with a dictionary lookup later
        const translation = getTranslationForWord(segment);
        const pos = guessPartOfSpeech(segment);
        
        return {
            word: segment,
            translation: translation,
            pos: pos,
            pinyin: '' // Can be added later with pinyin library
        };
    });
}

// --- SIMPLE TRANSLATION LOOKUP (ENHANCE LATER) ---
function getTranslationForWord(chineseWord) {
    // Simple translation mapping - expand this with a real dictionary
    const translationMap = {
        '的': "'s/of",
        '是': 'is/are',
        '在': 'at/in',
        '有': 'have/has',
        '和': 'and',
        '了': '(past tense marker)',
        '我': 'I/me',
        '你': 'you',
        '他': 'he/him',
        '她': 'she/her',
        '它': 'it',
        '我们': 'we/us',
        '他们': 'they/them',
        '这个': 'this',
        '那个': 'that',
        '什么': 'what',
        '为什么': 'why',
        '怎么': 'how',
        '哪里': 'where',
        '谁': 'who',
        '时候': 'time/when',
        '今天': 'today',
        '明天': 'tomorrow',
        '昨天': 'yesterday',
        '天气': 'weather',
        '很好': 'very good',
        '喜欢': 'like',
        '爱': 'love',
        '看': 'look/see/watch',
        '听': 'listen/hear',
        '说': 'speak/say',
        '吃': 'eat',
        '喝': 'drink',
        '去': 'go',
        '来': 'come',
        '做': 'do/make',
        '工作': 'work',
        '学习': 'study/learn',
        '学校': 'school',
        '老师': 'teacher',
        '学生': 'student',
        '朋友': 'friend',
        '家庭': 'family',
        '爸爸': 'father',
        '妈妈': 'mother',
        '哥哥': 'older brother',
        '弟弟': 'younger brother',
        '姐姐': 'older sister',
        '妹妹': 'younger sister'
    };
    
    return translationMap[chineseWord] || chineseWord; // Return word itself if no translation found
}

// --- SIMPLE PART-OF-SPEECH GUESSING ---
function guessPartOfSpeech(word) {
    // Very basic POS guessing - can be enhanced later
    if (word.length === 1 && ['的', '了', '着', '过', '啊', '呢', '吗', '吧'].includes(word)) {
        return 'particle';
    }
    if (['我', '你', '他', '她', '它', '我们', '你们', '他们'].includes(word)) {
        return 'pronoun';
    }
    if (['是', '有', '在', '做', '看', '听', '说', '吃', '喝', '去', '来'].includes(word)) {
        return 'verb';
    }
    if (['很', '非常', '太', '更', '最'].includes(word)) {
        return 'adverb';
    }
    if (['好', '大', '小', '多', '少', '新', '旧', '红', '绿', '蓝'].includes(word)) {
        return 'adjective';
    }
    
    return 'noun'; // Default to noun
}

// --- GENERATE USAGE PATTERNS ---
function generateUsagePatterns(segments, originalText) {
    const patterns = [];
    
    // Create basic usage patterns from the original sentence
    if (segments.length > 0) {
        patterns.push({
            phrase: originalText,
            explanation: "Original sentence with word segmentation applied",
            example: `Segmented as: ${segments.join(' ')}`
        });
    }
    
    // Add patterns for individual words that have common usage
    segments.forEach(segment => {
        const commonPattern = getCommonUsagePattern(segment);
        if (commonPattern) {
            patterns.push(commonPattern);
        }
    });
    
    return patterns;
}

// --- COMMON USAGE PATTERNS ---
function getCommonUsagePattern(word) {
    const commonPatterns = {
        '的': {
            phrase: "的",
            explanation: "Possessive particle or descriptive marker",
            example: "我的书 (my book), 红色的花 (red flower)"
        },
        '是': {
            phrase: "是",
            explanation: "To be (am/is/are)",
            example: "我是学生 (I am a student), 这是书 (This is a book)"
        },
        '在': {
            phrase: "在",
            explanation: "Indicates location or ongoing action",
            example: "我在家 (I am at home), 他在看书 (He is reading)"
        },
        '了': {
            phrase: "了",
            explanation: "Indicates completed action or change of state",
            example: "我吃了 (I ate), 天气冷了 (The weather got cold)"
        },
        '和': {
            phrase: "和",
            explanation: "And (connects nouns)",
            example: "我和你 (you and I), 书和笔 (book and pen)"
        }
    };
    
    return commonPatterns[word] || null;
}