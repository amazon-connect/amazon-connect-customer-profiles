/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { CLIENT, CALL_HEADERS } from "../common/constant";
import { createCustomerProfilesWidget } from "./widgetHelper";
import { isInitInConnectDomain, buildAgentAppApiUrl } from "../helper/utils";


/**
 * Base class for api communications used by the client.
 * 
 * The client supports 2 types of communications
 *      - DirectApiCommunication
 *          runs a fetch request via Hudson server
 *      - ApiCommunicationThroughWidget
 *          executes api query through a customerprofiles widget (iframe)
 * 
 * Why do we need ApiCommunicationThroughWidget?
 *      Hudson servers have disabled CORS. Custom agent-apps hosted on `non-connect url domains`,
 *  cannot make api calls through Hudson server.
 *  `ApiCommunicationThroughWidget`, gets around this by making calls through an iframe in the `connect url domain`.
 */
export class ApiCommunication {
    constructor(instanceUrl, instanceApiEndpointUrl) {
        this.instanceApiEndpointUrl = (instanceApiEndpointUrl == null) ? buildAgentAppApiUrl(instanceUrl) : instanceApiEndpointUrl;
        this.instanceUrl = instanceUrl;
    }

    // eslint-disable-next-line no-unused-vars
    apiCall(method, params) {
        throw new Error('apiCall not implemented error');
    }
}


/**
 * Handles direct api communication with the Hudson server using fetch call ( used inside connect url domain ).
 * 
 * This class also setups up the event listerner to receive and serve api requests from parent windows.
 * Parent window in a `non-connect url domains` can send api requests to event listener and receive the response.
 */
export class DirectApiCommunication extends ApiCommunication {
    constructor(instanceUrl, instanceApiEndpointUrl) {
        super(instanceUrl, instanceApiEndpointUrl);

        window.addEventListener("message", DirectApiCommunication.connectDomainApiEventListener);
    }

    apiCall(method, params) {
        return DirectApiCommunication.callApiViaHudson(this.instanceApiEndpointUrl, method, params);
    }

    /**
     * Method constructs the api request and uses `fetch` to call hudson server.
     * Credentials for these api calls are managed by `CCP` in `AmazonConnectStreams`.
     * 
     * Method uses fetch logic defined in connect if it is initialized, else uses default fetch.
     */
    static callApiViaHudson(endpointUrl, method, params) {
        const options = {
            method: 'post',
            body: JSON.stringify(params || {}),
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'x-amazon-call-source': CALL_HEADERS.CALL_SOURCE_HEADER,
                'x-amz-target': CALL_HEADERS.CUSTOMER_PROFILES_OPERATION_TARGET_PREFIX + method
            }
        };

        // Update header for local testing
        if (window.tokenRegion && window.tokenValue) {
            options.headers = {
                ...options.headers,
                'x-amz-bearer': JSON.stringify({ [window.tokenRegion]: window.tokenValue })
            };
        } else {
            options.credentials = 'include';
        }

        return window.connect.fetch(endpointUrl, options);
    }

    /**
     * Event listener logic to handle requests from parent window.
     * Parent window in a `non-connect url domains` can send api requests to event listener and receive the response.
     * 
     * Method expects the caller to pass a port from `MessageChannels`. The response is sent back through the port.
     */
    static async connectDomainApiEventListener(event) {
        if (event.data.source !== CLIENT.CLIENT_NAME ||
            event.data.event_type !== CLIENT.API_EVENT_TYPE) return;

        const port = event.ports[0];
        const { url, method, params } = event.data.api_data;

        const response = DirectApiCommunication.callApiViaHudson(url, method, params);

        response.then(function(resp) {
                port.postMessage({
                    source: CLIENT.CLIENT_NAME,
                    event_type: CLIENT.API_EVENT_TYPE,
                    api_response: {status: 200, statusText: "OK", data: resp}
                });
            })
            .catch(function(error_resp) {
                port.postMessage({
                    source: CLIENT.CLIENT_NAME,
                    event_type: CLIENT.API_EVENT_TYPE,
                    api_response: {status: error_resp.status, statusText: error_resp.statusText, data: {}}
                });
            });
    }
}


/**
 * Handles api communication through a widget ( used inside non-connect url domain ).
 * 
 * This class redirects all api calls through the customerprofiles widget.
 * Customerprofiles widget will have a client initialized using `DirectApiCommunication`,
 *  which sets up the event listener to receive requests.
 */
export class ApiCommunicationThroughWidget extends ApiCommunication {
    constructor(instanceUrl, instanceApiEndpointUrl) {
        super(instanceUrl, instanceApiEndpointUrl);
        this.widgetFrame = createCustomerProfilesWidget(instanceUrl);
    }

    apiCall(method, params) {
        if (!this.widgetFrame.isReady) {
            return Promise.reject({status: 500, statusText: "Client not ready", data: {}});
        }
        return ApiCommunicationThroughWidget.callApiViaWidget(this.instanceApiEndpointUrl, this.widgetFrame, method, params);
    }

    /**
     * Method calls api through customerProfiles widget.
     * 
     * MessageChannel is used for bi-directional communication.
     */
    static callApiViaWidget(instanceApiEndpointUrl, widgetFrame, method, params) {
        return new Promise((resolve, reject) => {
            try {
                const channel = new MessageChannel();
                const { port1, port2 } = channel;

                port1.onmessage = function(event) {
                    port1.close();

                    let api_response = event.data.api_response;

                    if (api_response.status == 200) {
                        resolve(api_response);
                    } else {
                        reject(api_response);
                    }
                };

                widgetFrame.contentWindow.postMessage({
                    source: CLIENT.CLIENT_NAME,
                    event_type: CLIENT.API_EVENT_TYPE,
                    api_data: {
                        url: instanceApiEndpointUrl,
                        method: method,
                        params: params
                    }
                }, widgetFrame.src, [port2]);
            } catch (e) {
                console.log('Error ', e);
                reject(e);
            }
        });
    }
}


/**
 * Builder method selecting the right api communication object.
 * 
 * If the client is initialized in a connect url domain return DirectApiCommunication
 * Else ApiCommunicationThroughWidget
 */
export function apiCommsBuilder(instanceUrl, instanceApiEndpointUrl, forceBuildDirectApiComms = false, forceBuildApiCommsThroughWidget = false) {
    if (forceBuildDirectApiComms && forceBuildApiCommsThroughWidget) {
        throw new Error('Cannot force build both api communication types at the same time.');
    }

    if (forceBuildDirectApiComms) {
        return new DirectApiCommunication(instanceUrl, instanceApiEndpointUrl);
    }

    if (forceBuildApiCommsThroughWidget) {
        return new ApiCommunicationThroughWidget(instanceUrl, instanceApiEndpointUrl);
    }

    if (isInitInConnectDomain(instanceUrl)) {
        return new DirectApiCommunication(instanceUrl, instanceApiEndpointUrl);
    }
    return new ApiCommunicationThroughWidget(instanceUrl, instanceApiEndpointUrl);
}
