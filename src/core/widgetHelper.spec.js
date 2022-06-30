import { buildCustomerProfilesWidgetUrl, findExistingWidget, createCustomerProfilesWidget, createDivForWidgetIfAbsent } from "./widgetHelper";
import { AGENT_APP, CLIENT } from "../common/constant";


const INSTANCE_URL_ENDING_WITH_SLASH = 'https://www.instanceurl.aws.com/connect/';
const INSTANCE_URL_ENDING_WITHOUT_SLASH = 'https://www.instanceurl.aws.com/connect';
const CUSTOMER_PROFILES_WIDGET_URL = 'https://www.instanceurl.aws.com/connect/customerprofiles-v2';
const OTHER_WIDGET_URL = 'https://www.instanceurl.aws.com/connect/other';
const OTHER_NAME = 'OtherName';

const IFRAME = document.createElement('iframe');
IFRAME.src = CUSTOMER_PROFILES_WIDGET_URL;
IFRAME.id = CLIENT.CLIENT_NAME;
const IFRAME_2 = document.createElement('iframe');
IFRAME_2.src = OTHER_WIDGET_URL;
IFRAME_2.id = OTHER_NAME;
const DIV = document.createElement('div');
DIV.setAttribute("id", AGENT_APP.CUSTOMER_PROFILES_WIDGET_ID);


describe("About using widget helper functions", () => {
    beforeAll(() => {
        mockConnectStreamInitApp();
    });

    afterEach(() => {
        jest.clearAllMocks();
        removeMockWidgetsAndDivs();
    });

    it("reuse existing widget if already present", () => {
        document.body.appendChild(IFRAME);
        expect(createCustomerProfilesWidget(INSTANCE_URL_ENDING_WITH_SLASH)).toBe(IFRAME);
        expect(window.connect.agentApp.initApp).toHaveBeenCalledTimes(0);
    });

    it("create new widget if not present", () => {
        expect(createCustomerProfilesWidget(INSTANCE_URL_ENDING_WITH_SLASH)).toBe(IFRAME);
        expect(window.connect.agentApp.initApp).toHaveBeenCalledTimes(1);
        expect(window.connect.agentApp.initApp)
            .toHaveBeenCalledWith(
                CLIENT.CLIENT_NAME,
                AGENT_APP.CUSTOMER_PROFILES_WIDGET_ID,
                CUSTOMER_PROFILES_WIDGET_URL,
                {
                    style: 'display: none',
                });
    });

    it("create new widget if non customer profile widget present", () => {
        document.body.appendChild(IFRAME_2);
        expect(createCustomerProfilesWidget(INSTANCE_URL_ENDING_WITH_SLASH)).toBe(IFRAME);
        expect(window.connect.agentApp.initApp).toHaveBeenCalledTimes(1);
        expect(window.connect.agentApp.initApp)
            .toHaveBeenCalledWith(
                CLIENT.CLIENT_NAME,
                AGENT_APP.CUSTOMER_PROFILES_WIDGET_ID,
                CUSTOMER_PROFILES_WIDGET_URL,
                {
                    style: 'display: none',
                });
    });

    it("find widget iframe when present", () => {
        window.connect.agentApp.initApp('Test', 'Test', CUSTOMER_PROFILES_WIDGET_URL);
        expect(findExistingWidget(CUSTOMER_PROFILES_WIDGET_URL)).toBe(IFRAME);
    });

    it("return null when widget iframe not present", () => {
        expect(findExistingWidget(CUSTOMER_PROFILES_WIDGET_URL)).toBeNull();
    });

    it("createDivForWidgetIfAbsent when div not present create one", () => {
        const logSpy = jest.spyOn(console, 'info');
        createDivForWidgetIfAbsent();
        expect(logSpy).toHaveBeenCalledWith("[AmazonConnectCustomerProfiles] Creating new div element to initialize CustomerProfiles widget");
    });

    it("createDivForWidgetIfAbsent when div present reuse div instead of creating a new one", () => {
        const logSpy = jest.spyOn(console, 'info');
        document.body.appendChild(DIV);
        createDivForWidgetIfAbsent();
        expect(logSpy).not.toHaveBeenCalled();
    });
});


function mockConnectStreamInitApp() {
    window.connect = {};
    window.connect.agentApp = {};
    window.connect.agentApp.initApp = jest.fn(mockInitApp);
}

function removeMockWidgetsAndDivs() {
    if (document.body.contains(IFRAME)) {
        document.body.removeChild(IFRAME);
    }

    if (document.body.contains(IFRAME_2)) {
        document.body.removeChild(IFRAME_2);
    }

    let div = document.querySelector(`div[id="${AGENT_APP.CUSTOMER_PROFILES_WIDGET_ID}"`);
    if (div) {
        document.body.removeChild(div);
    }
}


function mockInitApp(name, id, source) {
    if (source === CUSTOMER_PROFILES_WIDGET_URL) {
        document.body.appendChild(IFRAME);
    } else {
        document.body.appendChild(IFRAME_2);
    }
}
