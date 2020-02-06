const fs = require('file-system').fs;
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const FUNCTION_DIR = './functions';
const MODULE_NAME = "Geolocation Demo";
const MODULE_DESCRIPTION = "Module containing geolocation demo functions";

checkAndCreateFunctions(
    "luke.heavens@pubnub.com",
    "Pn098123987!",
    "pub-c-63969f70-7602-43e5-b857-ac84fb694054",
    "sub-c-8fb3b036-071f-11ea-96c6-ead0b8c5d242",
    {
        "foo": "foo",
        "bar": "bar"
    }
);

//TODO stop module if running first? Start module after functions made
//TODO function config

function checkAndCreateFunctions(email, password, publishKey, subscribeKey, vaultSecrets) {
    getSession(email, password).then(session => {
        getKeyId(session.token, session.userId, publishKey, subscribeKey).then(keyId => {
            createModule(session.token, keyId).then(moduleId => {
                createFunctions(session.token, keyId, moduleId).then(results => {
                    results.forEach((result) => {
                        console.log(result);
                    });
                    //If new functions added restart module
                    // if (results.length > 0) {
                        startStopModule(session.token, keyId, moduleId, false).then(() => {
                            startStopModule(session.token, keyId, moduleId, true).then(() => {
                                console.log("Function initialization complete.");
                            });
                        });
                    // }
                });
            });
            addVaultSecrets(session.token, subscribeKey, keyId, vaultSecrets).then(results => {
                results.forEach((result) => {
                    console.log(result);
                });
            });
        });
    });
}

function getKeyId(token, userId, publishKey, subscribeKey) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const url = "https://admin.pubnub.com/api/accounts?user_id=" + userId;
        xhr.open("GET", url, true);
        xhr.setRequestHeader("X-Session-Token", token);
        xhr.onload = () => {
            if (xhr.status === 200) {
                const json = JSON.parse(xhr.responseText);
                console.log("Using owner account ID:", json.result.accounts[0].id);
                resolve(json.result.accounts[0].id);
            } else {
                console.log("Failed to retrieve owner ID. Response:", xhr.responseText);
                reject(xhr.status);
            }
        };
        xhr.send();
    }).then(accountId => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const url = "https://admin.pubnub.com/api/apps?owner_id=" + accountId;
            xhr.open("GET", url, true);
            xhr.setRequestHeader("X-Session-Token", token);
            xhr.onload = () => {
                if (xhr.status === 200) {
                    const json = JSON.parse(xhr.responseText);
                    for (const app of json.result) {
                        for (const keySet of app.keys) {
                            if (keySet.subscribe_key === subscribeKey) {
                                console.log("Using key ID:", keySet.id);
                                resolve(keySet.id);
                                return;
                            }
                        }
                    }
                } else {
                    console.log("Failed to retrieve list of existing modules. Response:", xhr.responseText);
                    reject(xhr.status);
                }
            };
            xhr.send();
        });
    });
}

function getSession(email, password) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const url = "https://admin.pubnub.com/api/me";
        xhr.open("POST", url, false);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onload = () => {
            if (xhr.status === 200) {
                const json = JSON.parse(xhr.responseText);
                console.log("Created session token:", json.result.token, "for user ID:", json.result.user_id);
                resolve({
                    token: json.result.token,
                    userId: json.result.user_id
                });
            } else {
                console.log("Failed to get session token. Response:", xhr.responseText);
                reject(xhr.status);
            }
        };
        const data = JSON.stringify({
            "email": email,
            "password": password
        });
        xhr.send(data);
    });
}


function createModule(token, keyId) {
    return new Promise((resolve, reject) => {
        new Promise((resolveCheck, rejectCheck) => {
            const xhr = new XMLHttpRequest();
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
        }).then((existingModules) => {
            for (const existingModule of existingModules) {
                if (existingModule.name === MODULE_NAME) {
                    console.log("Module with name '" + MODULE_NAME + "' already exists. Continuing with this module with ID:", existingModule.id);
                    resolve(existingModule.id);
                    return;
                }
            }

            console.log("Module with name '" + MODULE_NAME + "' doesn't exists for this key. Creating...");

            const xhr = new XMLHttpRequest();
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
}

function createFunctions(token, keyId, moduleId) {
    return new Promise((resolveCheck, rejectCheck) => {
        const xhr = new XMLHttpRequest();
        const url = "https://admin.pubnub.com/api/v1/blocks/key/" + keyId + "/block/" + moduleId;
        xhr.open("GET", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
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
    }).then((existingFunctions) => {
        const existingFunctionNames = existingFunctions.map(existingFunction => existingFunction.name);

        const dir = fs.opendirSync(FUNCTION_DIR);
        let file;
        let promiseArray = [];
        //For each file in the functions directory, read the contents and call create function
        while ((file = dir.readSync()) !== null) {
            if (!file.isFile()) {
                continue;
            }
            let functionCode = fs.readFileSync(FUNCTION_DIR + "/" + file.name).toString('utf-8');
            const functionName = file.name.split(".")[0];
            if (existingFunctionNames.includes(functionName)) {
                console.log("A function with name '" + functionName + "' already exists. Skipping.");
            } else {
                promiseArray.push(
                    createFunction(token, keyId, moduleId, functionName, functionCode)
                );
            }
        }
        dir.closeSync();
        return Promise.all(promiseArray);
    });
}

function createFunction(token, keyId, moduleId, functionName, functionCode) {
    functionCode.replace(/'/g, "\\'").replace(/"/g, "\\\"");
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const url = "https://admin.pubnub.com/api/v1/blocks/key/" + keyId + "/event_handler";
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("X-Session-Token", token);
        xhr.onload = () => {
            if (xhr.status === 200) {
                const json = JSON.parse(xhr.responseText);
                resolve("Created function " + functionName + " with result: " + json.payload);
            } else {
                console.log("Failed to create function", functionName, "response:", xhr.responseText);
                reject(xhr.status);
            }
        };
        const data = JSON.stringify(
            {
                "type": "on-rest",
                "key_id": keyId,
                "block_id": moduleId,
                "channels": "eventHandlerChannel",
                "code": functionCode,
                "event": "js-on-rest",
                "log_level": "debug",
                "name": functionName,
                "path": "functions/" + functionName,
                "output": "output-0.5823105682419438"
            }
        );
        xhr.send(data);
    });
}

function startStopModule(token, keyId, moduleId, shouldBeRunning) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const desiredState = shouldBeRunning ? "start" : "stop";
        const url = "https://admin.pubnub.com/api/v1/blocks/key/" + keyId + "/block/" + moduleId + "/" + desiredState;
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("X-Session-Token", token);
        xhr.onload = () => {
            if (xhr.status === 200) {
                const json = JSON.parse(xhr.responseText);
                console.log("Successfully requested " + desiredState + " of module " + moduleId + " with result: " + json.payload);
                resolve();
            } else {
                console.log("Failed to", desiredState, "module", moduleId, "response:", xhr.responseText);
                reject(xhr.status);
            }
        };
        xhr.send();
    });
}

function addVaultSecrets(token, subscribeKey, pubnubKeyId, vaultSecrets) {
    const promiseArray = [];
    for (const [vaultKey, vaultValue] of Object.entries(vaultSecrets)) {
        promiseArray.push(new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const url = "https://admin.pubnub.com/api/vault/" + subscribeKey + "/key/" + vaultKey + "?key_id=" + pubnubKeyId;
            xhr.open("PUT", url, true);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.setRequestHeader("X-Session-Token", token);
            xhr.onload = () => {
                if (xhr.status === 200) {
                    const json = JSON.parse(xhr.responseText);
                    resolve("Created vault key " + vaultKey);
                } else {
                    console.log("Failed to create vault key", vaultKey, "response:", xhr.responseText);
                    reject(xhr.status);
                }
            };
            const data = JSON.stringify(
                {
                    "subscribeKey": subscribeKey,
                    "key_id": pubnubKeyId,
                    "keyName": vaultKey,
                    "value": vaultValue
                }
            );
            xhr.send(data);
        }));
    }
    return Promise.all(promiseArray);
}