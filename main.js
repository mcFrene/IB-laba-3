const fs = require("fs");

const alphabet = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ";
const encryptionKey = "ДИФФЕРЕНЦИАЛЬНОЕУРАВНЕНИЕ"

const PATH = {
    rawText: "./rawText.txt",
    preparedText: "./result/preparedText.txt",  
    encryptedText: "./result/encryptedText.txt",
    resultStat: "./result/resultStat.txt", 
}

function getText(path){
    return fs.promises.readFile(path, { encoding: "utf-8" });
}

async function writeText(path, data, consoleMessage = ""){
    fs.promises.access(path, fs.constants.F_OK)
        .then(() => {})
        .catch(() => fs.promises.writeFile(path, data))
        .then(() =>  { if(consoleMessage) console.log(consoleMessage) })
}

function analyzeText(text){
    let result = {};
    for(let s of text){
        if(s in result)
            result[s]++;
        else
            result[s] = 1;
    }
    return result;
}

async function textPrepare(){
    const text = (await getText(PATH.rawText)).toString()
        .toUpperCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-—_`~()»«?]/g,"")
        .replace(/\s+/g, "")
        .replace(/Ё/g, "Е")
        .replace(/Й/g, "И")
        .replace(/Ъ/g, "Ь")
    writeText(PATH.preparedText, text, "preparedText writed");

    return text.toString();
}

function getKeyIndexes(key, alphabet){
    let keyIndexes = [];
    
    for(let s of key){
        keyIndexes.push(alphabet.split("").findIndex(el => el === s))
    }
    return keyIndexes;
}


function getResultStat(stat){
    const len = Object.values(stat).reduce((prev, cur) => prev + cur);
    let result = {
        len: len,
        index: Number((Object.values(stat).reduce((prev, cur) => prev + cur*(cur-1), 0) / (len * (len-1))).toFixed(4)),
        symbols: []
    };
    for(let s in stat){
        result.symbols.push({[s]: Number((stat[s] / len).toFixed(4))});
    }
    result.symbols.sort((a, b) => Object.values(b)[0] - Object.values(a)[0]);
    writeText(PATH.resultStat, JSON.stringify(result), "resultStat writed");
}

function encryptText(text, alphabet, keyIndexes){
    let result = [];
    let currentIndex;

    for(let i=0; i<text.length; i++){
        currentIndex = (keyIndexes[i % keyIndexes.length] + alphabet.split("").findIndex(el => el === text[i])) % alphabet.length;
        result.push(alphabet[currentIndex]);
    }

    writeText(PATH.encryptedText, result.join(""), "encryptedText writed");
    return result.join("");
}

async function main(){
    const text = await textPrepare();
    const keyIndexes = getKeyIndexes(encryptionKey, alphabet);

    const encryptedText = encryptText(text, alphabet, keyIndexes);

    getResultStat(analyzeText(encryptedText));
}

main();
