import xmlhttprequest from "xmlhttprequest";
const xmlHttpRequest = xmlhttprequest.XMLHttpRequest;

export const getSession = (email, password) => {
    return new Promise((resolve, reject) => {
        const xhr = new xmlHttpRequest();
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
};

export const getKeyId = (token, userId, subscribeKey) => {
    return new Promise((resolve, reject) => {
        const xhr = new xmlHttpRequest();
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
            const xhr = new xmlHttpRequest();
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
                    reject("Could not find subscribe key: " + subscribeKey);
                } else {
                    console.log("Failed to retrieve list of existing modules. Response:", xhr.responseText);
                    reject(xhr.status);
                }
            };
            xhr.send();
        });
    });
};
