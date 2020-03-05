import fileSystem from "file-system";
import { getKeyId, getSession } from "./sessionCreator.mjs";
import { addVaultSecretsWithToken } from "./secretsCreator.mjs";
import path from "path";
import { startOrStopModule } from "./moduleController.mjs";
import xmlhttprequest from "xmlhttprequest";
const xmlHttpRequest = xmlhttprequest.XMLHttpRequest

const fs = fileSystem.fs

const MODULE_NAME = "chat-reference-functions";
const MODULE_DESCRIPTION = "Module containing automatically generated functions to be used with the chat reference app.";

const FUNCTION_DIR = './functions';
const functionsDirectoryPath = path.resolve(path.resolve(), FUNCTION_DIR);

const makeFunctions = (session, keyId) => {
    return new Promise((resolve, reject) => {
        createModule(session.token, keyId).then(moduleId => {
            console.log("Attempting to stop module...");
            startOrStopModule(session.token, keyId, moduleId, false).then(() => {
                removeExistingFunctions(session.token, keyId, moduleId).then(removeResults => {
                    removeResults.forEach((result) => {
                        console.log(" -", result);
                    });
                    functionCreator(session.token, keyId, moduleId).then(createResults => {
                        createResults.forEach((result) => {
                            console.log(" -", result);
                        });
                        //If new functions added restart module
                        if (createResults.length > 0) {
                            console.log("Attempting to start module...");
                            startOrStopModule(session.token, keyId, moduleId, true).then(() => {
                                console.log("Function initialization complete.");
                                resolve();
                            }, reason => reject(reason));
                        } else {
                            resolve();
                        }
                    }, reason => reject(reason));
                }, reason => reject(reason));
            }, reason => reject(reason));
        }, reason => reject(reason));
    });
};

const makeSecrets = (secrets, session, subscribeKey, keyId) => {
    return new Promise((resolve, reject) => {
        const flattenedSecrets = {};
        Object.keys(secrets).forEach(partner => {
            Object.keys(secrets[partner]).forEach(apiVersion => {
                Object.keys(secrets[partner][apiVersion]).forEach(vaultSecret => {
                    flattenedSecrets[vaultSecret] = secrets[partner][apiVersion][vaultSecret];
                });
            });
        });
        addVaultSecretsWithToken(session.token, subscribeKey, keyId, flattenedSecrets).then(results => {
            results.forEach((result) => {
                console.log(result);
            });
            console.log("Vault initialization complete.");
            resolve();
        }, reason => reject(reason));
    });
};

export const checkAndCreateFunctions = (email, password, subscribeKey, vaultSecrets) => {
    return new Promise((resolve, reject) => {
        getSession(email, password).then(session => {
            getKeyId(session.token, session.userId, subscribeKey).then(keyId => {
                Promise.all([
                    makeFunctions(session, keyId),
                    makeSecrets(vaultSecrets, session, subscribeKey, keyId)
                ]).then(resolve, reason => reject(reason));
            }, reason => reject(reason));
        }, reason => reject(reason));
    });

};

const createModule = (token, keyId) => {
    return new Promise((resolve, reject) => {
        new Promise((resolveCheck, rejectCheck) => {
            const xhr = new xmlHttpRequest();
            const url = "https://admin.pubnub.com/api/v1/blocks/key/" + keyId + "/block";
            xhr.open("GET", url, true);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.setRequestHeader("X-Session-Token", token);
            xhr.onload = () => {
                if (xhr.status === 200) {
                    const json = JSON.parse(xhr.responseText);
                    resolveCheck(json.payload);
                } else {
                    console.log("Failed to retrieve list of existing modules. Response:", xhr.responseText);
                    rejectCheck(xhr.status);
                }
            };
            xhr.send();
        }).then(existingModules => {
            for (const existingModule of existingModules) {
                if (existingModule.name === MODULE_NAME) {
                    console.log("Module with name '" + MODULE_NAME + "' already exists. Continuing with this module with ID:", existingModule.id);
                    global.moduleId = existingModule.id;
                    resolve(existingModule.id);
                    return;
                }
            }

            console.log("Module with name '" + MODULE_NAME + "' doesn't exists for this key. Creating...");

            const xhr = new xmlHttpRequest();
            const url = "https://admin.pubnub.com/api/v1/blocks/key/" + keyId + "/block";
            xhr.open("POST", url, true);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.setRequestHeader("X-Session-Token", token);
            xhr.onload = () => {
                if (xhr.status === 200) {
                    const json = JSON.parse(xhr.responseText);
                    console.log("Created module with ID:", json.payload.id);
                    resolve(json.payload.id);
                } else {
                    console.log("Failed to create module. Response:", xhr.responseText);
                    reject(xhr.status);
                }
            };
            const data = JSON.stringify({
                "key_id": keyId,
                "name": MODULE_NAME,
                "description": MODULE_DESCRIPTION
            });
            xhr.send(data);
        });
    });
};

const getExistingFunctions = (token, keyId, moduleId) => {
    return new Promise((resolveCheck, rejectCheck) => {
        const xhr = new xmlHttpRequest();
        const url = "https://admin.pubnub.com/api/v1/blocks/key/" + keyId + "/block/" + moduleId;
        xhr.open("GET", url, true);
        xhr.setRequestHeader("X-Session-Token", token);
        xhr.onload = () => {
            if (xhr.status === 200) {
                const json = JSON.parse(xhr.responseText);
                resolveCheck(json.payload[0].event_handlers);
            } else {
                console.log("Failed to retrieve list of existing functions. Response:", xhr.responseText);
                rejectCheck(xhr.status);
            }
        };
        xhr.send();
    });
};

const removeExistingFunctions = (token, keyId, moduleId) => {
    return getExistingFunctions(token, keyId, moduleId).then(existingFunctions => {
        const existingFunctionNames = existingFunctions.map(existingFunction => existingFunction.name);
        if (existingFunctionNames.length > 0) {
            console.log("Found the following functions:", existingFunctionNames, "these functions will be removed.");
            const promiseArray = [];
            existingFunctions.forEach(existingFunction => {
                promiseArray.push(
                    removeFunction(token, keyId, existingFunction.id, existingFunction.name)
                );
            });
            return Promise.all(promiseArray);
        } else {
            return Promise.resolve([]);
        }
    });
};

const removeFunction = (token, keyId, functionId, name) => {
    return new Promise((resolve, reject) => {
        const xhr = new xmlHttpRequest();
        const url = "https://admin.pubnub.com/api/v1/blocks/key/" + keyId + "/event_handler/" + functionId;
        xhr.open("DELETE", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("X-Session-Token", token);
        xhr.onload = () => {
            if (xhr.status === 200) {
                resolve("Deleted function " + name);
            } else {
                console.log("Failed to delete function", name, "response:", xhr.responseText);
                reject(xhr.status);
            }
        };
        xhr.send();
    });
};

const listFilesInDirectoryRecursively = async (dir, fileFunctionPromises = [], fileFunction) => {
    const files = await fs.promises.readdir(dir);
    for (const file of files) {
        const stat = await fs.promises.stat(path.join(dir, file));
        if (stat.isDirectory()) {
            fileFunctionPromises = await listFilesInDirectoryRecursively(path.join(dir, file), fileFunctionPromises, fileFunction);
        } else {
            fileFunctionPromises.push(
                fileFunction(file, path.join(dir, file))
            );
        }
    }
    return fileFunctionPromises;
};

const functionCreator = (token, keyId, moduleId) => {
    //For each file in the functions directory, read the contents and call create function
    return listFilesInDirectoryRecursively(functionsDirectoryPath, [], (file, filePath) => {
        let functionCode = fs.readFileSync(filePath).toString('utf-8');
        const functionName = file.split(".")[0];
        return createFunction(token, keyId, moduleId, functionName, functionCode);
    }).then(promiseArray => {
        if (promiseArray.length > 0) {
            console.log("Found", promiseArray.length, "functions found. Creating...");
            return Promise.all(promiseArray);
        } else {
            console.log("No functions found. No functions will be created.");
            return Promise.resolve([]);
        }
    });
};

const createFunction = (token, keyId, moduleId, functionName, functionCode) => {
    functionCode.replace(/'/g, "\\'").replace(/"/g, "\\\"");
    return new Promise((resolve, reject) => {
        const xhr = new xmlHttpRequest();
        const url = "https://admin.pubnub.com/api/v1/blocks/key/" + keyId + "/event_handler";
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("X-Session-Token", token);
        xhr.onload = () => {
            if (xhr.status === 200) {
                resolve("Created function " + functionName);
            } else {
                console.log("Failed to create function", functionName, "response:", xhr.responseText);
                reject(xhr.status);
            }
        };
        const data = JSON.stringify(
            // {
            //     "type": "before-publish",
            //     "key_id": keyId,
            //     "block_id": moduleId,
            //     "channels": "*",
            //     "code": functionCode,
            //     "event": "js-before-publish",
            //     "log_level": "debug",
            //     "name": functionName,
            //     "output": "output-0.5823105699919438"
            // }
            {
                "type": "on-rest",
                "key_id": keyId,
                "block_id": moduleId,
                "code": functionCode,
                "event": "js-on-rest",
                "log_level": "debug",
                "name": functionName,
                "path": functionName,
                "output": "output-0.5823105699919438"
            }
        );
        xhr.send(data);
    });
};