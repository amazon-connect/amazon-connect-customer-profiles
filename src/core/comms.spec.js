import { ApiCommunication, DirectApiCommunication, ApiCommunicationThroughWidget, apiCommsBuilder } from "./comms";
import * as widgetHelper from "./widgetHelper";
import * as utils from "../helper/utils";
import { SUPPORTED_APIS, CLIENT } from "../common/constant";


const INSTANCE_URL = 'https://www.instanceurl.aws.com/';
const INSTANCE_API_ENDPOINT_URL = 'https://www.instanceurl.aws.com/agent-app/api';
const INSTANCE_CUSTOMER_PROFILES_WIDGET_URL = 'https://www.instanceurl.aws.com/connect/customerprofiles-v2';

const TEST_PARAMS = { 'a':1, 'b': 2 };

const API_MOCK_RESPONSE = 'TestResponse';
const CREATE_WIDGET_MOCK_RESPONSE = document.createElement('iframe');
CREATE_WIDGET_MOCK_RESPONSE.src = INSTANCE_CUSTOMER_PROFILES_WIDGET_URL;

const TOKEN_REGION = 'TokenRegion';
const TOKEN_VALUE = '12345';


describe("[Class:ApiCommunication] About api communication base class", () => {
    it("initializing sets the endpoint and instance urls", () => {
        const apiCommunication = new ApiCommunication(INSTANCE_URL, INSTANCE_API_ENDPOINT_URL);

        expect(apiCommunication.instanceUrl).toBe(INSTANCE_URL);
        expect(apiCommunication.instanceApiEndpointUrl).toBe(INSTANCE_API_ENDPOINT_URL);
    });

    it("initializing builds the endpoint when endpoint param is null", () => {
        const apiCommunication = new ApiCommunication(INSTANCE_URL);

        expect(apiCommunication.instanceUrl).toBe(INSTANCE_URL);
        expect(apiCommunication.instanceApiEndpointUrl).toBe(INSTANCE_API_ENDPOINT_URL);
    });

    it("apiCall method is not defined", () => {
        const apiCommunication = new ApiCommunication(INSTANCE_URL, INSTANCE_API_ENDPOINT_URL);

        expect(() => {apiCommunication.apiCall(SUPPORTED_APIS.CREATE_PROFILE, TEST_PARAMS);}).toThrow('apiCall not implemented error');
    });
});


describe("[Class:DirectApiCommunication] About direct api communication class", () => {
    afterEach(() => {
        jest.clearAllMocks();
        window.connect = null;
    });

    it("initializing sets the endpoints, instance urls and sets up eventlistener for remote calls", () => {
        jest.spyOn(window, 'addEventListener');

        const apiCommunication = new DirectApiCommunication(INSTANCE_URL, INSTANCE_API_ENDPOINT_URL);

        expect(apiCommunication.instanceUrl).toBe(INSTANCE_URL);
        expect(apiCommunication.instanceApiEndpointUrl).toBe(INSTANCE_API_ENDPOINT_URL);
        expect(window.addEventListener).toBeCalledWith('message', DirectApiCommunication.connectDomainApiEventListener);
    });

    it("callApiViaHudson when window.connect defined use fetch from window.connect", () => {
        window.connect = {};
        window.connect.fetch = jest.fn().mockReturnValue(API_MOCK_RESPONSE);

        DirectApiCommunication.callApiViaHudson(INSTANCE_API_ENDPOINT_URL, SUPPORTED_APIS.CREATE_PROFILE, TEST_PARAMS);
        const expectedApiOptions = buildExpectedApiOptions(JSON.stringify(TEST_PARAMS), SUPPORTED_APIS.CREATE_PROFILE);

        expect(window.connect.fetch).toHaveBeenCalledTimes(1);
        expect(window.connect.fetch)
            .toHaveBeenCalledWith(
                INSTANCE_API_ENDPOINT_URL,
                expectedApiOptions);
    });

    it("callApiViaHudson when testing in local dev environment, use credentials from env variable", () => {
        window.connect = {};
        window.connect.fetch = jest.fn().mockReturnValue(API_MOCK_RESPONSE);

        window.tokenRegion = TOKEN_REGION;
        window.tokenValue = TOKEN_VALUE;

        DirectApiCommunication.callApiViaHudson(INSTANCE_API_ENDPOINT_URL, SUPPORTED_APIS.CREATE_PROFILE, TEST_PARAMS);
        const expectedBearerToken = JSON.stringify({[TOKEN_REGION]: TOKEN_VALUE});
        const expectedApiOptionsInDevEnv = buildExpectedApiOptionsInLocalTestEnv(JSON.stringify(TEST_PARAMS), SUPPORTED_APIS.CREATE_PROFILE, expectedBearerToken);

        expect(window.connect.fetch).toHaveBeenCalledTimes(1);
        expect(window.connect.fetch)
            .toHaveBeenCalledWith(
                INSTANCE_API_ENDPOINT_URL,
                expectedApiOptionsInDevEnv);

        window.tokenRegion = null;
        window.tokenValue = null;
    });

    it("connectDomainApiEventListener when valid event call api and return result to port", async () => {
        DirectApiCommunication.callApiViaHudson = jest.fn().mockReturnValue(Promise.resolve(API_MOCK_RESPONSE));
        const mockPort = {};
        mockPort.postMessage = jest.fn();

        const mockEvent = buildMockEvent(CLIENT.CLIENT_NAME, CLIENT.API_EVENT_TYPE, mockPort, SUPPORTED_APIS.CREATE_PROFILE, TEST_PARAMS);

        await DirectApiCommunication.connectDomainApiEventListener(mockEvent);

        expect(DirectApiCommunication.callApiViaHudson).toHaveBeenCalledTimes(1);
        expect(DirectApiCommunication.callApiViaHudson).toHaveBeenCalledWith(
            INSTANCE_API_ENDPOINT_URL,
            SUPPORTED_APIS.CREATE_PROFILE,
            TEST_PARAMS);

        const expectedPortPostMessage = {
            source: CLIENT.CLIENT_NAME,
            event_type: CLIENT.API_EVENT_TYPE,
            api_response: {
                status: 200,
                statusText: "OK",
                data: "TestResponse"
            }
        };
        
        await new Promise(r => setTimeout(r, 2000));
        expect(mockPort.postMessage).toHaveBeenCalledTimes(1);
        expect(mockPort.postMessage).toHaveBeenCalledWith(expectedPortPostMessage);
    });

    it("connectDomainApiEventListener when valid event, but on api call failure return unpacked error response", async () => {
        DirectApiCommunication.callApiViaHudson = jest.fn().mockReturnValue(Promise.reject({status: 400, statusText: "Error"}));
        const mockPort = {};
        mockPort.postMessage = jest.fn();

        const mockEvent = buildMockEvent(CLIENT.CLIENT_NAME, CLIENT.API_EVENT_TYPE, mockPort, SUPPORTED_APIS.CREATE_PROFILE, TEST_PARAMS);

        await DirectApiCommunication.connectDomainApiEventListener(mockEvent);

        expect(DirectApiCommunication.callApiViaHudson).toHaveBeenCalledTimes(1);
        expect(DirectApiCommunication.callApiViaHudson).toHaveBeenCalledWith(
            INSTANCE_API_ENDPOINT_URL,
            SUPPORTED_APIS.CREATE_PROFILE,
            TEST_PARAMS);

        const expectedPortPostMessage = {
            source: CLIENT.CLIENT_NAME,
            event_type: CLIENT.API_EVENT_TYPE,
            api_response: {
                status: 400,
                statusText: "Error",
                data: {}
            }
        };
        
        await new Promise(r => setTimeout(r, 2000));

        expect(mockPort.postMessage).toHaveBeenCalledTimes(1);
        expect(mockPort.postMessage).toHaveBeenCalledWith(expectedPortPostMessage);
    })

    it("connectDomainApiEventListener when invalid event source do nothing", () => {
        DirectApiCommunication.callApiViaHudson = jest.fn().mockReturnValue(API_MOCK_RESPONSE);
        const mockPort = {};
        mockPort.postMessage = jest.fn();

        const mockEvent = buildMockEvent('InvalidEventSource', CLIENT.API_EVENT_TYPE, mockPort, SUPPORTED_APIS.CREATE_PROFILE, TEST_PARAMS);

        DirectApiCommunication.connectDomainApiEventListener(mockEvent);

        expect(DirectApiCommunication.callApiViaHudson).toHaveBeenCalledTimes(0);
        expect(mockPort.postMessage).toHaveBeenCalledTimes(0);
    });

    it("connectDomainApiEventListener when invalid event type do nothing", () => {
        DirectApiCommunication.callApiViaHudson = jest.fn().mockReturnValue(API_MOCK_RESPONSE);
        const mockPort = {};
        mockPort.postMessage = jest.fn();

        const mockEvent = buildMockEvent(CLIENT.CLIENT_NAME, 'InvalidEventType', mockPort, SUPPORTED_APIS.CREATE_PROFILE, TEST_PARAMS);

        DirectApiCommunication.connectDomainApiEventListener(mockEvent);
        
        expect(DirectApiCommunication.callApiViaHudson).toHaveBeenCalledTimes(0);
        expect(mockPort.postMessage).toHaveBeenCalledTimes(0);
    });
});


describe("[Class:ApiCommunicationThroughWidget] About api communication through widgets", () => {
    beforeEach(() => {
        CREATE_WIDGET_MOCK_RESPONSE.isReady = true;
        jest.spyOn(widgetHelper, 'createCustomerProfilesWidget').mockReturnValue(CREATE_WIDGET_MOCK_RESPONSE);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it("initializing sets the endpoints, instance urls and sets up widget", () => {
        const apiCommunication = new ApiCommunicationThroughWidget(INSTANCE_URL, INSTANCE_API_ENDPOINT_URL);
        
        expect(apiCommunication.instanceUrl).toBe(INSTANCE_URL);
        expect(apiCommunication.instanceApiEndpointUrl).toBe(INSTANCE_API_ENDPOINT_URL);
        expect(apiCommunication.widgetFrame).toBe(CREATE_WIDGET_MOCK_RESPONSE);
    });

    it("callApiViaWidget ensure accurately calls widget and returns the value on successful api call", () => {
        const mockPort1 = {'id': 1};
        mockPort1.close = jest.fn();

        const mockPort2 = {'id': 2};
        
        const mockWidgetFrame = {contentWindow: {}};
        mockWidgetFrame.contentWindow.postMessage = jest.fn();
        mockWidgetFrame.src = INSTANCE_CUSTOMER_PROFILES_WIDGET_URL;
        
        global.MessageChannel = jest.fn().mockImplementation(() => { return {'port1': mockPort1, 'port2': mockPort2}; });

        const result = ApiCommunicationThroughWidget.callApiViaWidget(INSTANCE_API_ENDPOINT_URL, mockWidgetFrame, SUPPORTED_APIS.CREATE_PROFILE, TEST_PARAMS);

        // Ensure method adds onmessage method for port1
        expect('onmessage' in mockPort1).toBeTruthy();

        // Ensure widget postmessage call is accurate.
        const expectedPortPostMessage = {
            source: CLIENT.CLIENT_NAME,
            event_type: CLIENT.API_EVENT_TYPE,
            api_data: {
                url: INSTANCE_API_ENDPOINT_URL,
                method: SUPPORTED_APIS.CREATE_PROFILE,
                params: TEST_PARAMS
            }
        };
        expect(mockWidgetFrame.contentWindow.postMessage).toHaveBeenCalledTimes(1);
        expect(mockWidgetFrame.contentWindow.postMessage).toHaveBeenCalledWith(expectedPortPostMessage, INSTANCE_CUSTOMER_PROFILES_WIDGET_URL, [mockPort2]);

        // Ensure response is received accurately
        const mockEvent = {
            'data': {'api_response': {'status': 200, 'data': API_MOCK_RESPONSE}}
        };
        mockPort1.onmessage(mockEvent);
        result.then(data => {
            expect(data).toBe({'status': 200, 'data': API_MOCK_RESPONSE});
        }).catch(data => {
            // Do nothing
        });
    });

    it("callApiViaWidget ensure accurately calls widget and returns the value on unsuccessful api call", () => {
        const mockPort1 = {'id': 1};
        mockPort1.close = jest.fn();

        const mockPort2 = {'id': 2};
        
        const mockWidgetFrame = {contentWindow: {}};
        mockWidgetFrame.contentWindow.postMessage = jest.fn();
        mockWidgetFrame.src = INSTANCE_CUSTOMER_PROFILES_WIDGET_URL;
        
        global.MessageChannel = jest.fn().mockImplementation(() => { return {'port1': mockPort1, 'port2': mockPort2}; });

        const result = ApiCommunicationThroughWidget.callApiViaWidget(INSTANCE_API_ENDPOINT_URL, mockWidgetFrame, SUPPORTED_APIS.CREATE_PROFILE, TEST_PARAMS);

        // Ensure method adds onmessage method for port1
        expect('onmessage' in mockPort1).toBeTruthy();

        // Ensure widget postmessage call is accurate.
        const expectedPortPostMessage = {
            source: CLIENT.CLIENT_NAME,
            event_type: CLIENT.API_EVENT_TYPE,
            api_data: {
                url: INSTANCE_API_ENDPOINT_URL,
                method: SUPPORTED_APIS.CREATE_PROFILE,
                params: TEST_PARAMS
            }
        };
        expect(mockWidgetFrame.contentWindow.postMessage).toHaveBeenCalledTimes(1);
        expect(mockWidgetFrame.contentWindow.postMessage).toHaveBeenCalledWith(expectedPortPostMessage, INSTANCE_CUSTOMER_PROFILES_WIDGET_URL, [mockPort2]);

        // Ensure response is received accurately
        const mockEvent = {
            'data': {'api_response': {'status': 400, 'data': API_MOCK_RESPONSE}}
        };
        mockPort1.onmessage(mockEvent);
        result.then(data => {
            // Do nothing
        }).catch(data => {
            expect(data).toStrictEqual({'status': 400, 'data': API_MOCK_RESPONSE});
        });
    });

    it("apiCall routes logic through callApiViaWidget", () => {
        ApiCommunicationThroughWidget.callApiViaWidget = jest.fn().mockReturnValue(API_MOCK_RESPONSE);
        const apiCommunication = new ApiCommunicationThroughWidget(INSTANCE_URL, INSTANCE_API_ENDPOINT_URL);

        apiCommunication.apiCall(SUPPORTED_APIS.CREATE_PROFILE, TEST_PARAMS);
        
        expect(ApiCommunicationThroughWidget.callApiViaWidget).toHaveBeenCalledTimes(1);
        expect(ApiCommunicationThroughWidget.callApiViaWidget).toHaveBeenCalledWith(INSTANCE_API_ENDPOINT_URL, CREATE_WIDGET_MOCK_RESPONSE, SUPPORTED_APIS.CREATE_PROFILE, TEST_PARAMS);
        ApiCommunicationThroughWidget.callApiViaWidget.mockRestore();
    });

    it("return error response if widget in client not ready", () => {
        ApiCommunicationThroughWidget.callApiViaWidget = jest.fn().mockReturnValue(API_MOCK_RESPONSE);
        const apiCommunication = new ApiCommunicationThroughWidget(INSTANCE_URL, INSTANCE_API_ENDPOINT_URL);

        apiCommunication.widgetFrame.isReady = false;

        expect(apiCommunication.apiCall(SUPPORTED_APIS.CREATE_PROFILE, TEST_PARAMS)).rejects.toEqual({
            "data": {},
            "status": 500,
            "statusText": "Client not ready",
        });
    });
});


describe("[Builder:apiCommsBuilder] About api communications builder", () => {
    it("when force build for both communication types throw error", () => {
        expect(() => {apiCommsBuilder(INSTANCE_URL, INSTANCE_API_ENDPOINT_URL, true, true);}).toThrow('Cannot force build both api communication types at the same time.');
    });

    it("when force build DirectApiCommunication", () => {
        const apiComms = apiCommsBuilder(INSTANCE_URL, INSTANCE_API_ENDPOINT_URL, true);
        expect(apiComms instanceof DirectApiCommunication).toBeTruthy();
    });

    it("when force build ApiCommunicationThroughWidget", () => {
        const apiComms = apiCommsBuilder(INSTANCE_URL, INSTANCE_API_ENDPOINT_URL, false, true);
        expect(apiComms instanceof ApiCommunicationThroughWidget).toBeTruthy();
    });

    it("If window is in the same url domain as the instance - return DirectApiCommunication", () => {
        delete window.location;
        window.location = new URL(INSTANCE_API_ENDPOINT_URL);
        const apiComms = apiCommsBuilder(INSTANCE_URL, INSTANCE_API_ENDPOINT_URL, false, false);
        expect(apiComms instanceof DirectApiCommunication).toBeTruthy();
    });


    it("If window is outside url domain of the instance - return ApiCommunicationThroughWidget", () => {
        delete window.location;
        window.location = new URL('https://randomurl.com/find');
        const apiComms = apiCommsBuilder(INSTANCE_URL, INSTANCE_API_ENDPOINT_URL, false, false);
        expect(apiComms instanceof ApiCommunicationThroughWidget).toBeTruthy();
    });
});


function buildExpectedApiOptions(body_content, api_method) {
    return {
        method: 'post',
        body: body_content,
        headers: {
            Accept: 'application/json',
                'Content-Type': 'application/json',
                'x-amazon-call-source': 'agent-app',
                'x-amz-target': 'AgentAppService.CustomerProfiles.' + api_method
        },
        credentials: 'include'
    };
}


function buildExpectedApiOptionsInLocalTestEnv(body_content, api_method, bearerToken) {
    return {
        method: 'post',
        body: body_content,
        headers: {
            Accept: 'application/json',
                'Content-Type': 'application/json',
                'x-amazon-call-source': 'agent-app',
                'x-amz-target': 'AgentAppService.CustomerProfiles.' + api_method,
                'x-amz-bearer': bearerToken
        }
    };
}


function buildMockEvent(eventSource, eventType, port, api_method, api_params) {
    const mockEvent = {};
    mockEvent.ports = [port];
    mockEvent.data = {
        source: eventSource,
        event_type: eventType,
        api_data: {
            url: INSTANCE_API_ENDPOINT_URL,
            method: api_method,
            params: api_params
        }
    };
    return mockEvent;
}


