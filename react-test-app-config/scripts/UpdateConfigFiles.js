'use strict'

const fs = require('fs');
const path = require('path');
const winston = require('winston');
const readXlsxFile = require('read-excel-file/node')

function updateVariables(value, tokenHash) {
  let tokenStartIdx = String(value).indexOf("#{", 0);

  while (tokenStartIdx !== -1) {
      let tokenEndIdx = String(value).indexOf("}", tokenStartIdx + 2);
      let tokenValue = String(value).substring(tokenStartIdx + 2, tokenEndIdx);
      
      // Check if tokenValue doesn't exist in tokenHash then set to "DOES NOT EXIST"
      let foundKey = "";
      for (let key in tokenHash) {
          if (key === tokenValue) {
              foundKey = key;
          }
      }

      if (foundKey) {
          // Check if value contains a Token variable and replace the value
          if (tokenHash && Object.keys(tokenHash).length > 0) {
              for (let key in tokenHash) {
                  if (key === tokenValue) {
                      console.log("Updating token: " + key);
                      value = value.replace("#{" + tokenValue + "}", tokenHash[key]);
                      break;
                  }
              }
          }
      } else {
          console.log("WARNING: Token not found: " + tokenValue);
          value = value.replace("#{" + tokenValue + "}", "TOKEN: #{" + tokenValue + "} WAS NOT FOUND");
      }

      // Check if value has any more tokens
      if (String(value).indexOf("#{", 0)) {
          tokenStartIdx = -1;
      } else {
          tokenStartIdx = String(value).indexOf("#{", tokenStartIdx);
      }
  }

  return value;
}


function updateJsonEntry(entry, jsonPathArr, idx, value, variableName, fileAltered) {
  let key = jsonPathArr[idx];

  if (idx < jsonPathArr.length - 1) {
      if (!isNaN(key)) {
          try {
              entry = entry[parseInt(key)];
          } catch (error) {
              let msg = "Array " + key + " does not exist in JSON! Path " + variableName;
              throw new Error(msg);
          }
      } else {
          if (!(key in entry)) {
              let msg = "Key '" + key + "' does not exist in JSON! Path " + variableName;
              throw new Error(msg);
          }
          entry = entry[key];
      }

      console.log("entry: " + entry);
      idx++;
      fileAltered = updateJsonEntry(entry, jsonPathArr, idx, value, variableName, fileAltered);
  } else {
      if (!isNaN(key)) {
          if (!(parseInt(key) in entry)) {
              let msg = "Array " + key + " does not exist in JSON! Path " + variableName;
              throw new Error(msg);
          }
          var jValue = entry[parseInt(key)];
      } else {
          if (!(key in entry)) {
              let msg = "Key '" + key + "' does not exist in JSON! Path " + variableName;
              throw new Error(msg);
          }
          var jValue = entry[key];
      }

      console.log("Type jValue: " + typeof jValue);

      // handle data type
      if (typeof jValue === 'string') {
          entry[key] = String(value);
          fileAltered = true;
      } else if (typeof jValue === 'boolean') {
          if (isNaN(value)) {
              value = false;
          }
          entry[key] = Boolean(value);
          fileAltered = true;
      } else if (Number.isInteger(jValue)) {
          entry[key] = parseInt(value);
          fileAltered = true;
      } else if (typeof jValue === 'number') {
          entry[key] = parseFloat(value);
          fileAltered = true;
      } else {
          entry[key] = value;
          fileAltered = true;
      }

      console.log("Final Entry: " + entry);
  }
  return fileAltered;
}

// Pass required args
// root_dir, excel_doc, environment_name
var rootDir;
var excelDoc;
var envName;
var altLogFileDir;
var alternateParameterValues;  
var alternateParameterValuesSepChar;    
var ignoreConfigFiles;
var jsonFileListParamName;
var backupFiles;

try {

  process.argv.forEach(function (val, index, array) {
    console.log(index + ': ' + val);
    switch(index) {
      case 2:
        rootDir = val;
        break;
      case 3:
        excelDoc = val;
        break;
      case 4:
        envName = val;
        break;
      case 5:
        altLogFileDir = val;
        break;
      case 6:
        alternateParameterValues = val;
        break;
      case 7:
        alternateParameterValuesSepChar = val;
        break;
      case 8:
        ignoreConfigFiles = val;
        break;
      case 9:
        jsonFileListParamName = val;
        break;
      case 10:
        backupFiles = val;
        break;    
      default:
    }
  });

  console.log("rootDir: " + rootDir);
  console.log("excelDoc: " + excelDoc);
  console.log("envName: " + envName);

  //Set variables
  var defaultColName = "Default";
  const findReplaceIndicatorString = "[FROM->TO]";
  const jsonFileListDefaultVariableName = "JSONFILELIST";
  var jsonFileListVariableName = jsonFileListDefaultVariableName;
  if (jsonFileListParamName) {
    jsonFileListVariableName = jsonFileListParamName;
  }    

  var variableColIdx = 0;
  var saveBackup = false;
  var ignoreConfigFiles = false;
  if (envName === undefined){
    envName = "Default";
  }    

  // Set saveBackup bool
  if (backupFiles !== undefined){
    if (backupFiles.toLowerCase() === 'true'){
      saveBackup = true;
    }  
  }    

  // Verify Excel file exists else exit
  if (!(fs.existsSync(excelDoc))){
    msg = `Could not find Excel file: ${excelDoc}`;
    logger.log('error', msg);
    process.exit(1);
  }

  // Verify root_dir exists else exit
  if (!(fs.existsSync(rootDir))){
    msg = `Could not find root_dir: ${rootDir}`;
    logger.log('error', msg);
    process.exit(1);
  }  

  // Setup Logging
  var now = new Date();
  var dt = now.toISOString();
  console.log("dt: " + dt);
  var logFileName = 'ConfigUpdate_' + dt + '.log';
  var errLogFileName = 'ConfigUpdate_Error_' + dt + '.log';

  let currentDirectory = process.cwd(); 
  let logFileDir = currentDirectory;

  if (altLogFileDir !== undefined) {
    logFileDir = altLogFileDir;
  }

  console.log("currentDirectory: " + currentDirectory); 
  var logfilePath = path.join(logFileDir, logFileName); 
  var errLogfilePath = path.join(logFileDir, errLogFileName);
  console.log("logfilePath: " + logfilePath);
  console.log("Started...");

  //
  // Remove the file, ignoring any errors
  //
  try { fs.unlinkSync(logfilePath); }
  catch (ex) { }

  //
  // Create a new winston logger instance with two tranports: Console, and File
  //
  const logger = winston.createLogger({
    level: 'info', // Adjust this to your desired log level
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: [
      new winston.transports.Console(), // Log to console
      new winston.transports.File({ filename: errLogfilePath, level: 'error' }), // Log errors to a separate file
      new winston.transports.File({ filename: logfilePath }) // Log everything to a combined file
    ]
  });

  var msg;
  logger.log('info', 'Started...');

  setTimeout(function () {
      //
      // Remove the file, ignoring any errors
      //
      try { fs.unlinkSync(logfilePath); }
      catch (ex) { }
    }, 1000);

  // Load Excel file
  readXlsxFile(excelDoc).then((rows) => {
    const numOfRows = rows.length;
    var headerRow = rows[0];
    const numOfColumns = headerRow.length;
    var startingRow = 1;

    if (!(numOfRows > startingRow)){
          msg = `Could not find any records in Excel file: ${excelDoc}`;
          logger.log('error', msg);
          process.exit(1);
    }

    msg = `Total records: ${numOfRows}`;
    console.log(msg);
    logger.log('error', msg);

    var defaultColIdx = -1;
    var valueColumnName = envName;
    var valueColumnIdx = -1;
    var fileColumnIdx = -1;
    var fileColumnName = "File";

    // Get column indexes
    for (let i = 0; i < headerRow.length; i++){
      console.log("value: " + headerRow[i]);    
      if (headerRow[i] === defaultColName) { defaultColIdx = i; }
      if (headerRow[i] === envName) { valueColumnIdx = i; }
      if (headerRow[i] === fileColumnName) { fileColumnIdx = i; }
    }

    // Create hashtable of variables and values
    let tokenValueHash = {};
    let jsonFileSublist = null;
    let usingDefaultJsonFileListVariableName = false;

    console.log("Loading variable values...");

    // Loop to get values from excel file
    for (let i = 1; i < numOfRows; i++) {

      let variableName = rows[i][variableColIdx];
      let value = rows[i][valueColumnIdx];
      let specifiedFile = rows[i][fileColumnIdx];
      let defaultValue = rows[i][defaultColIdx];

      // If value is empty then use defaultValue
      if (!value || value === undefined) {
        value = defaultValue;
      }

      if (jsonFileListParamName) {
        // Skip default variable name
        if (variableName === jsonFileListDefaultVariableName) {
            continue;
        }
      }

      // Continue if we have usingDefaultJsonFileListVariableName
      if (usingDefaultJsonFileListVariableName) {
        continue;
      }

      // if variable_name is JSONFILELIST or jsonFileListParamName then get value for jsonFileSublist
      if (variableName === jsonFileListVariableName) {
        if (variableName === jsonFileListDefaultVariableName) {
            usingDefaultJsonFileListVariableName = true;
        }
        jsonFileSublist = value.split('\n');
        continue;
      }

      if (typeof value === 'string' && value.includes("#{")) {
        value = updateVariables(value, tokenValueHash);
      }

      // if key is not duplicate then add, else update
      if (!(variableName in tokenValueHash)) {
          tokenValueHash[variableName] = value;
      } else {
          tokenValueHash[variableName] = value;
      }
    }

    // if we have alternateParameterValues then add to hash table
    if (alternateParameterValues) {
      console.log("Loading alternate/additional token values...");
      console.log(`Token values: ${alternateParameterValues}`);
      var alternateParameterValuesArray = alternateParameterValues.split(alternateParameterValuesSepChar);
      for (let parameterValue of alternateParameterValuesArray) {
          let paramEndIdx = parameterValue.indexOf('}');
          let paramName = parameterValue.substring(2, paramEndIdx - 2);
          let paramValue = parameterValue.substring(0, paramEndIdx + 1);

          if (!(paramName in tokenValueHash)) {
              tokenValueHash[paramName] = paramValue;
          } else {
              tokenValueHash[paramName] = paramValue;
          }
      }
    }

    console.log(`Processing values for Environment: ${envName}`);

    /////////////////////////////
    //// Process .json files ////
    /////////////////////////////

    console.log("Setting jsonFileList...");
    console.log("Processing .json files...");
    var jsonFileList = [];
  
    // For .json files run the Json update
    // If JSONFILELIST variable exists then get .json files specified
    if (jsonFileSublist) {
      console.log("Processing .json file sublist...");
      for (let filePath of jsonFileSublist) {
        if (!fs.existsSync((path.join(rootDir, filePath.trim())))) {
          msg = "WARNING: " + path.join(rootDir, filePath.trim()) + " does not exist.";
          //logger.warning(msg);
          continue;
        
        }

        let file = path.join(rootDir, filePath.trim());
        console.log("Adding file: " + file + " to sublist.");
        jsonFileList.push(file);
      }
    }

    // Create findReplaceList empty list
    var findReplaceList = [];

    // Iterate through .json files and perform value replacement
    var fileAltered = false;
    for (let file of jsonFileList) {
      console.log("Processing .json file: " + file);    
      var fileExt = path.extname(file);
      fileAltered = false;

      if (saveBackup) {
          let backupFileName = path.basename(file) + "_" + dt + fileExt;
          let backupFile = path.join(path.dirname(file), backupFileName);
          fs.copyFileSync(file, backupFile);
          console.log("Save backup file: " + backupFile);
      }

      var isJsonFile = false;
      if (fileExt === ".json") {
          try {
              var entry = JSON.parse(fs.readFileSync(file, "utf8"));
              isJsonFile = true;
          } catch (e) {
              console.log("JSON file issue: " + e);
              continue;
          }
      }

      // Loop to get values from Excel sheet
      for (let i = 1; i < numOfRows; i++) {
        let variableName = rows[i][variableColIdx];     
        
        // If variable is INSTALLSHIELDPARAMSET or JSONFILELIST or specified jsonFileListParam then continue
        if (variableName === "INSTALLSHIELDPARAMSET" || variableName === "JSONFILELIST") continue;
        if (jsonFileListParamName && variableName === jsonFileListParamName) continue;
        
        let value = rows[i][valueColumnIdx];
        let specifiedFile = rows[i][fileColumnIdx];
        let defaultValue = rows[i][defaultColIdx];
        
        // If value is empty then use defaultValue
        if (!value || value === undefined) {
          value = defaultValue;
        }
        
        // If a file is specified for this variable record, and not current file, continue to next variable.
        let bSpecifiedFile = false;
        if (specifiedFile && !(specifiedFile === undefined)) {
            let specifiedFileList = specifiedFile.split(',');
            for (let filePath of specifiedFileList) {
                if (path.join(rootDir, filePath).toLowerCase() === file.toLowerCase()) {
                    bSpecifiedFile = true;
                    if (!fs.existsSync(path.join(rootDir, filePath))) {
                        let msg = path.join(rootDir, filePath) + " does not exist.";
                        console.log(msg);
                        continue;
                    }
                    break;
                }
            }
        }
        
        if (!bSpecifiedFile) continue;
        
        // Check and update $value if it contains a variable, i.e. #{SOMEVARIABLE}, with the variable value
        if (typeof value === 'string') {
            if (value.includes("#{" )) {
                value = updateVariables(value, tokenValueHash);
            }
        }
        
        // If $variableName is Empty, then check if this is a Find/Replace operation
        if (!variableName || !variableName === undefined) {
            if (!value || value === undefined) continue;
            if (value.includes(findReplaceIndicatorString)) {
                console.log("FindReplace: " + value);
                findReplaceList.push(value);
                continue;
            } else {
                let msg = "ERROR: VariableName is empty and Value " + value + " does not contain the " + findReplaceIndicatorString + " replacement token string.";
                console.log(msg);
                continue;
            }
        }
        
        let jsonPath = variableName;
        
        // Handle array specification in JSON path
        if (jsonPath.includes('[') && jsonPath.includes(']')) {
          if (jsonPath.indexOf('[') === 0) {
            jsonPath = jsonPath.replace('[', '');
          }
          else {
            jsonPath = jsonPath.replace('[', '.');
          }            
          jsonPath = jsonPath.replace(']', '');
        }
        
        let jsonPathArr = jsonPath.split('.');
        let index = 0;
        fileAltered = updateJsonEntry(entry, jsonPathArr, index, value, variableName, fileAltered);
        console.log("Update JSON path '" + variableName + "' with '" + value + "' in file: " + file);
      }

      // Save file
      if (fileAltered) {
        fs.writeFileSync(file, JSON.stringify(entry));
      }

      // If findReplaceList then
      if (findReplaceList.length > 0) {
        fileAltered = false;
        var fileData;
        
        try {
            fileData = fs.readFileSync(file, 'utf8');
        } catch (err) {
            console.error(err);
        }
        
        for (let item of findReplaceList) {
            let splitIdx = item.indexOf(findReplaceIndicatorString);
            if (splitIdx < 0) continue;
            
            let findStr = item.substring(0, splitIdx);
            if (fileData.includes(findStr)) {
                let replaceStr = item.substring(splitIdx + findReplaceIndicatorString.length);
                fileData = fileData.replace(findStr, replaceStr);
                fileAltered = true;
                console.log("Find/Replace for string '" + findStr + "' with '" + replaceStr + "' in file: " + file);
            }
        }
        
        if (fileAltered) {
            try {
                fs.writeFileSync(file, fileData);
            } catch (err) {
                console.error(err);
            }
        }
      }

    }
      
    console.log("Succeeded!")
    
  });

}
catch(err) {
  console.log(err.name + "  " + err.message);
}




