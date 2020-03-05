import xmlhttprequest from "xmlhttprequest";
const xmlHttpRequest = xmlhttprequest.XMLHttpRequest

const requestModuleStateChange = (shouldBeRunning, keyId, moduleId, token) => {
    return new Promise((resolve, reject) => {
        const xhr = new xmlHttpRequest();
        const desiredState = shouldBeRunning ? "start" : "stop";
        const url = "https://admin.pubnub.com/api/v1/blocks/key/" + keyId + "/block/" + moduleId + "/" + desiredState;
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("X-Session-Token", token);
        xhr.onload = () => {
            if (xhr.status === 200) {
                console.log("Successfully requested", desiredState, "of module", moduleId, "awaiting state change...");
                resolve();
            } else {
                //Special case where module exists but is empty and therefore can't be stopped
                if (xhr.status === 400 && JSON.parse(xhr.responseText).error_code === "STOP_BLOCK_EMPTY") {
                    resolve();
                } else {
                    console.log("Failed to", desiredState, "module", moduleId, "response:", xhr.responseText);
                    reject(xhr.status);
                }
            }
        };
        xhr.send();
    });
};

const waitForStateChange = (keyId, moduleId, token, resolve, reject) => {
    const xhr = new xmlHttpRequest();
    const url = "https://admin.pubnub.com/api/v1/blocks/key/" + keyId + "/block/" + moduleId;
    xhr.open("GET", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("X-Session-Token", token);
    xhr.onload = () => {
        if (xhr.status === 200) {
            const json = JSON.parse(xhr.responseText).payload[0];
            if (json.intended_state === json.state) {
                console.log("Module is now in state", json.state);
                resolve();
            } else {
                console.log("Waiting for module to be in", json.intended_state);
                setTimeout(() => {
                    waitForStateChange(keyId, moduleId, token, resolve, reject);
                }, 1000);
            }
        } else {
            console.log("Failed to get status information for module", moduleId, "response:", xhr.responseText);
            reject(xhr.status);
        }
    };
    xhr.send();
};

export const startOrStopModule = (token, keyId, moduleId, shouldBeRunning) => {
    return new Promise((resolve, reject) => {
        requestModuleStateChange(shouldBeRunning, keyId, moduleId, token).then(() => {
            waitForStateChange(keyId, moduleId, token, resolve, reject);
        }, reason => reject(reason));
    });
};