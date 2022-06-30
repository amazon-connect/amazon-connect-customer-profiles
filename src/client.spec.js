import { CustomerProfilesAgentAppClient } from "./client";
import * as comms from "./core/comms";
import { SUPPORTED_APIS } from "./common/constant";


const API_MOCK_RESPONSE = "testResponse";
const MOCK_COMMS_OBJECT = {};

const INSTANCE_URL = 'https://www.instanceurl.aws.com/';
const INSTANCE_API_ENDPOINT_URL = 'https://www.instanceurl.aws.com/agent-app/api';

const TEST_PARAMS = { 'a':1, 'b': 2 };


describe("[Class:CustomerProfilesAgentAppClient] About customer profiles client for agent-app", () => {
    beforeAll(() => {
        MOCK_COMMS_OBJECT.apiCall = jest.fn().mockReturnValue(API_MOCK_RESPONSE);
        jest.spyOn(comms, 'apiCommsBuilder').mockReturnValue(MOCK_COMMS_OBJECT);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("init with forceBuildDirectApiComms is true, call apiCommsBuilder with forceBuildDirectApiComms is true", () => {
        const client = new CustomerProfilesAgentAppClient(INSTANCE_URL, INSTANCE_API_ENDPOINT_URL, true);

        expect(comms.apiCommsBuilder).toHaveBeenCalledTimes(1);
        expect(comms.apiCommsBuilder)
            .toHaveBeenCalledWith(
                INSTANCE_URL, INSTANCE_API_ENDPOINT_URL, true
            );
    })

    it("init with forceBuildDirectApiComms is missing, call apiCommsBuilder without forceBuildDirectApiComms", () => {
        const client = new CustomerProfilesAgentAppClient(INSTANCE_URL, INSTANCE_API_ENDPOINT_URL);

        expect(comms.apiCommsBuilder).toHaveBeenCalledTimes(1);
        expect(comms.apiCommsBuilder)
            .toHaveBeenCalledWith(
                INSTANCE_URL, INSTANCE_API_ENDPOINT_URL
            );
    })

    it("listAccountIntegrations passes parameters accurately", () => {
        const client = new CustomerProfilesAgentAppClient(INSTANCE_URL, INSTANCE_API_ENDPOINT_URL);
        client.listAccountIntegrations(TEST_PARAMS);

        expect(MOCK_COMMS_OBJECT.apiCall).toHaveBeenCalledTimes(1);
        expect(MOCK_COMMS_OBJECT.apiCall)
            .toHaveBeenCalledWith(
                SUPPORTED_APIS.LIST_ACCOUNT_INTEGRATIONS,
                TEST_PARAMS);
    });

    it("createProfile passes parameters accurately", () => {
        const client = new CustomerProfilesAgentAppClient(INSTANCE_URL, INSTANCE_API_ENDPOINT_URL);
        client.createProfile(TEST_PARAMS);

        expect(MOCK_COMMS_OBJECT.apiCall).toHaveBeenCalledTimes(1);
        expect(MOCK_COMMS_OBJECT.apiCall)
            .toHaveBeenCalledWith(
                SUPPORTED_APIS.CREATE_PROFILE,
                TEST_PARAMS);
    });

    it("updateProfile passes parameters accurately", () => {
        const client = new CustomerProfilesAgentAppClient(INSTANCE_URL, INSTANCE_API_ENDPOINT_URL);
        client.updateProfile(TEST_PARAMS);

        expect(MOCK_COMMS_OBJECT.apiCall).toHaveBeenCalledTimes(1);
        expect(MOCK_COMMS_OBJECT.apiCall)
            .toHaveBeenCalledWith(
                SUPPORTED_APIS.UPDATE_PROFILE,
                TEST_PARAMS);
    });

    it("searchProfiles passes parameters accurately", () => {
        const client = new CustomerProfilesAgentAppClient(INSTANCE_URL, INSTANCE_API_ENDPOINT_URL);
        client.searchProfiles(TEST_PARAMS);

        expect(MOCK_COMMS_OBJECT.apiCall).toHaveBeenCalledTimes(1);
        expect(MOCK_COMMS_OBJECT.apiCall)
            .toHaveBeenCalledWith(
                SUPPORTED_APIS.SEARCH_PROFILES,
                TEST_PARAMS);
    });

    it("listProfileObjects passes parameters accurately", () => {
        const client = new CustomerProfilesAgentAppClient(INSTANCE_URL, INSTANCE_API_ENDPOINT_URL);
        client.listProfileObjects(TEST_PARAMS);

        expect(MOCK_COMMS_OBJECT.apiCall).toHaveBeenCalledTimes(1);
        expect(MOCK_COMMS_OBJECT.apiCall)
            .toHaveBeenCalledWith(
                SUPPORTED_APIS.LIST_PROFILE_OBJECTS,
                TEST_PARAMS);
    });

    it("addProfileKey passes parameters accurately", () => {
        const client = new CustomerProfilesAgentAppClient(INSTANCE_URL, INSTANCE_API_ENDPOINT_URL);
        client.addProfileKey(TEST_PARAMS);

        expect(MOCK_COMMS_OBJECT.apiCall).toHaveBeenCalledTimes(1);
        expect(MOCK_COMMS_OBJECT.apiCall)
            .toHaveBeenCalledWith(
                SUPPORTED_APIS.ADD_PROFILE_KEY,
                TEST_PARAMS);
    });
});