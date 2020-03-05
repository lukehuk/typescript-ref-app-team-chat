import { getKeyId, getSession } from "./sessionCreator.mjs";
import { startOrStopModule } from "./moduleController.mjs";
import xmlhttprequest from "xmlhttprequest";
const xmlHttpRequest = xmlhttprequest.XMLHttpRequest

//TODO dont create a new session each time
export const addVaultSecrets = (credentials, secrets) => {
    return new Promise((resolve, reject) => {
        getSession(credentials.email, credentials.password).then(session => {
            getKeyId(session.token, session.userId, credentials.subscribeKey).then(keyId => {
                addVaultSecretsWithToken(session.token, credentials.subscribeKey, keyId, secrets).then(results => {
                    results.forEach((result) => {
                        console.log(result);
                    });
                    if (!global.moduleId) {
                        reject("global.moduleId has not been set!");
                    }
                    startOrStopModule(session.token, keyId, global.moduleId, false).then(() => {
                        startOrStopModule(session.token, keyId, global.moduleId, true).then(() => {
                            resolve();
                        }, reason => reject(reason));
                    }, reason => reject(reason));
                }, reason => reject(reason));
            }, reason => reject(reason));
        }, reason => reject(reason));
    });
};

export const addVaultSecretsWithToken = (token, subscribeKey, pubnubKeyId, vaultSecrets) => {
    const promiseArray = [];

    for (const [vaultKey, vaultValue] of Object.entries(vaultSecrets)) {
        promiseArray.push(
            new Promise((resolve, reject) => {
                if (0 === vaultValue.length) {
                    reject("Value for secret key " + vaultKey + " cannot be length 0");
                }
                const xhr = new xmlHttpRequest();
                const url = "https://admin.pubnub.com/api/vault/" + subscribeKey + "/key/" + vaultKey + "?key_id=" + pubnubKeyId;
                xhr.open("PUT", url, true);
                xhr.setRequestHeader("Content-Type", "application/json");
                xhr.setRequestHeader("X-Session-Token", token);
                xhr.onload = () => {
                    if (xhr.status === 200) {
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
            })
        );
    }

    return Promise.all(promiseArray);
};