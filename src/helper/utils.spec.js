import { isInitInConnectDomain, getUrlDomain, transformResponse, buildCustomerProfilesWidgetUrl, buildAgentAppApiUrl } from "./utils";


const INSTANCE_URL_ENDING_WITH_SLASH = 'https://instanceurl.aws.com/connect/';
const INSTANCE_URL_ENDING_WITHOUT_SLASH = 'https://instanceurl.aws.com/connect';
const CUSTOMER_PROFILES_WIDGET_URL = 'https://instanceurl.aws.com/connect/customerprofiles-v2';
const AGENT_API_URL = 'https://instanceurl.aws.com/connect/agent-app/api';

const NEW_INSTANCE_URL_ENDING_WITH_SLASH = 'https://instanceurl.my.connect.aws/';
const NEW_INSTANCE_URL_ENDING_WITHOUT_SLASH = 'https://instanceurl.my.connect.aws';
const NEW_CUSTOMER_PROFILES_WIDGET_URL = 'https://instanceurl.my.connect.aws/customerprofiles-v2';
const NEW_AGENT_API_URL = 'https://instanceurl.my.connect.aws/agent-app/api';

const INSTANCE_URL_WITH_WWW = "https://www.instanceurl.aws.com/connect/agent-app";
const INSTANCE_URL_DOMAIN = "instanceurl.aws.com";

const STATUS = 200;
const STATUS_TEXT = "OK";
const OK = true;

describe("About utils helper class", () => {
    it("getUrlDomain returns domain when url does not have www.", () => {
        expect(getUrlDomain(INSTANCE_URL_ENDING_WITH_SLASH)).toBe(INSTANCE_URL_DOMAIN);
    });

    it("getUrlDomain returns domain when url has www.", () => {
        expect(getUrlDomain(INSTANCE_URL_WITH_WWW)).toBe(INSTANCE_URL_DOMAIN);
    });

    it("isInitInConnectDomain returns true when window location is connect instance url", () => {
        delete window.location;
        window.location = new URL(INSTANCE_URL_ENDING_WITH_SLASH);
        expect(isInitInConnectDomain(INSTANCE_URL_WITH_WWW)).toBeTruthy();
    });

    it("isInitInConnectDomain returns false when window location is not connect instance url", () => {
        delete window.location;
        window.location = new URL('https://randomurl.com/find');
        expect(isInitInConnectDomain(INSTANCE_URL_WITH_WWW)).toBeFalsy();
    });

    it("build customer profiles widget url from instance url", () => {
        expect(buildCustomerProfilesWidgetUrl(INSTANCE_URL_ENDING_WITH_SLASH)).toBe(CUSTOMER_PROFILES_WIDGET_URL);
        expect(buildCustomerProfilesWidgetUrl(INSTANCE_URL_ENDING_WITHOUT_SLASH)).toBe(CUSTOMER_PROFILES_WIDGET_URL);
        expect(buildCustomerProfilesWidgetUrl(NEW_INSTANCE_URL_ENDING_WITH_SLASH)).toBe(NEW_CUSTOMER_PROFILES_WIDGET_URL);
        expect(buildCustomerProfilesWidgetUrl(NEW_INSTANCE_URL_ENDING_WITHOUT_SLASH)).toBe(NEW_CUSTOMER_PROFILES_WIDGET_URL);
    });

    it("build agent app api url from instance url", () => {
        expect(buildAgentAppApiUrl(INSTANCE_URL_ENDING_WITH_SLASH)).toBe(AGENT_API_URL);
        expect(buildAgentAppApiUrl(INSTANCE_URL_ENDING_WITHOUT_SLASH)).toBe(AGENT_API_URL);
        expect(buildAgentAppApiUrl(NEW_INSTANCE_URL_ENDING_WITH_SLASH)).toBe(NEW_AGENT_API_URL);
        expect(buildAgentAppApiUrl(NEW_INSTANCE_URL_ENDING_WITHOUT_SLASH)).toBe(NEW_AGENT_API_URL);
    });

});
