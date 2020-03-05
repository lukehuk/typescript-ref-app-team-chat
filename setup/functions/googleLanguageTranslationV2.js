export default (request) => {
    const vault = require('vault');
    const xhr = require('xhr');

    const response = {
        send: (responseBody) => {
            console.log("hi");
            const http_options = {
                "method": "POST",
                "headers": { "Content-Type": "application/json" },
                "body": JSON.stringify(responseBody)
            };

            const url = "https://ps.pndsn.com/v1/blocks/sub-key/sub-c-8fb3b036-071f-11ea-96c6-ead0b8c5d242/googprofan";
            return xhr.fetch(url, http_options).then((chainResponse) => {
                const chainResponseBody = JSON.parse(chainResponse.body);
                return request.ok(chainResponseBody)
            });
        }
    }
    const body = request.message;

    const googleCloudApiKey = "GOOGLE_API_KEY";
    const functionName = "googleLanguageTranslationV2";
    const apiUrl = "https://translation.googleapis.com/language/translate/v2";

    /**
     * Helper function to make error propagation easier by generating a standardized error object
     * @param statusCode - HTTP status code to return
     * @param functionErrorMessage - Function level error message, will be returned as a top-level property
     * @returns {{functionErrorMessage: *, statusCode: *}}
     */
    const makeError = (statusCode, functionErrorMessage) => {
        return { statusCode, functionErrorMessage };
    };

    /**
     * Helper function to make error propagation easier by generating a standardized error object
     * @param statusCode - HTTP status code to return
     * @param functionErrorMessage - Function level error message
     * @param apiErrorResponse - An error response object from an API call
     * @returns {{functionErrorMessage: *, apiErrorResponse: *, statusCode: *}}
     */
    const makeApiError = (statusCode, functionErrorMessage, apiErrorResponse) => {
        //We have to substring the error message as there is a log size limit for functions
        console.error(
            "Got error from API:",
            JSON.stringify(apiErrorResponse, Object.getOwnPropertyNames(apiErrorResponse)).substring(0, 1000)
        );
        return { statusCode, functionErrorMessage, apiErrorResponse };
    };

    /**
     * Called when an error response should be returned to the function caller
     * @param error - Error details object. If the object contains the property 'functionErrorMessage',
     * this value will be used as the main error. Otherwise, the error object will be stringified and used instead.
     */
    const handleError = (error) => {
        console.error("Responding with error:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
        let responseBody = body || {};
        responseBody.error = error.functionErrorMessage || JSON.stringify(error, Object.getOwnPropertyNames(error)) || "An unexpected error occurred";
        if (error.apiErrorResponse) {
            responseBody[functionName] = responseBody[functionName] || {};
            responseBody[functionName].output = error.apiErrorResponse;
        }
        response.status = error.statusCode;
        return response.send(responseBody);
    };

    /**
     * Called if the API call was successful
     * @param apiStatusCode - HTTP code returned from the API call
     * @param apiResponseBody - JSON response received from the API call
     */
    const handleSuccess = (apiStatusCode, apiResponseBody) => {
        let responseBody = body || {};
        responseBody[functionName] = responseBody[functionName] || {};
        responseBody[functionName].output = apiResponseBody;

        //Here we override the original content with the function modifications applied.
        if (apiResponseBody && apiResponseBody.data && apiResponseBody.data.translations[0]) {
            responseBody.content = apiResponseBody.data.translations[0].translatedText || responseBody.content;
        }

        console.log("Responding with body: ", JSON.stringify(responseBody));
        response.status = apiStatusCode;
        return response.send(responseBody);
    };

    /**
     * Get a secret from the PubNub Functions Vault
     * @param vaultKey - The vault secret key
     * @returns {Promise<String>} - The vault secret value
     */
    const getVaultSecret = (vaultKey) => {
        return new Promise((resolve, reject) => {
            vault.get(vaultKey)
                .then(resolve)
                .catch(vaultError => {
                    reject(makeError(
                        500,
                        "Vault '" + vaultKey + "' get failed. Error details: " + vaultError
                    ));
                });
        });
    };

    /**
     * Check required params have been provided in the request body
     * @returns boolean - True if the request body is valid
     */
    const isBodyValid = () => {
        return body
            && body.content
            && body[functionName]
            && body[functionName].language;
    };

    /**
     * Will call the third-party API when called. Returns a promise containing the API response.
     *
     * @param apiKey
     * @param requestBody
     * @returns {Promise<String>} - Stringified JSON response
     */
    const makeRequest = (apiKey, requestBody) => {
        return new Promise((resolve, reject) => {
            xhr.fetch(
                apiUrl + "?key=" + apiKey,
                {
                    "method": "POST",
                    "headers": { "Content-Type": "application/json" },
                    "body": requestBody,
                }
            ).then(apiResponse => {
                //We have to substring the response as there is a log size limit for functions
                console.log("Received response:", JSON.stringify(apiResponse).substring(0, 1000));
                resolve(apiResponse);
            }).catch(apiError => {
                reject(makeApiError(apiError.status, "Error calling API", apiError));
            });
        });
    };

    /**
     * Constructs the API request body using the parameters provided in the function request.
     * Returns a promise containing the API response.
     *
     * @param apiKey
     * @returns {Promise<String>} - Stringified JSON response
     */
    const callApi = (apiKey) => {
        return new Promise((resolve, reject) => {
            //If the required parameters have not been provided we can abort early
            if (isBodyValid()) {
                const content = body.content;
                const language = body[functionName].language ? body[functionName].language : "en";
                const document = {
                    target: language,
                    q: content
                };
                const makeApiRequest = (requestBody) => makeRequest(apiKey, requestBody);
                makeApiRequest(document).then(resolve, reject);
            } else {
                reject(makeError(400, "Missing required parameters"));
            }
        });
    };

    /**
     *  Main - PubNub On Request Functions expect a promise to be returned that resolves to a response object.
     *  This method therefore returns a series of nested asynchronous calls that will retrieve PubNub vault secrets
     *  and call the third-party API.
     */
    return getVaultSecret(googleCloudApiKey).then(apiKey => {
        return callApi(apiKey).then(apiResponse => {
            return handleSuccess(apiResponse.status, JSON.parse(apiResponse.body));
        }).catch(handleError);
    }).catch(handleError);
};
