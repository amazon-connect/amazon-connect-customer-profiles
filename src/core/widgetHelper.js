/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { AGENT_APP, CLIENT } from "../common/constant";
import { buildCustomerProfilesWidgetUrl } from "../helper/utils";


export function createCustomerProfilesWidget(instanceUrl) {
    const customerProfilesWidgetUrl = buildCustomerProfilesWidgetUrl(instanceUrl);
    var widget_frame = findExistingWidget();

    if (widget_frame == null) {
        createDivForWidgetIfAbsent();
        window?.connect?.agentApp.initApp(
            CLIENT.CLIENT_NAME,
            AGENT_APP.CUSTOMER_PROFILES_WIDGET_ID,
            customerProfilesWidgetUrl,
            {
                style: 'display: none',
            }
        );
        widget_frame = findExistingWidget();
        widget_frame?.addEventListener("load", function(e) /* istanbul ignore next */ {
            console.log('[AmazonConnectCustomerProfiles] Client ready for use.');
            this.isReady = true;
        });
    } else {
        // Incase the agent-app already has a customer-profiles widget, mark it as isReady
        // TODO: Is there a way to know for sure if the iframe is loaded?
        widget_frame.isReady = true;
    }
    return widget_frame;
}


export function findExistingWidget() {
    return document.querySelector(`iframe[id="${CLIENT.CLIENT_NAME}"`);
}


export function createDivForWidgetIfAbsent() {
    if (!document.querySelector(`div[id="${AGENT_APP.CUSTOMER_PROFILES_WIDGET_ID}"]`)) {
        console.info("[AmazonConnectCustomerProfiles] Creating new div element to initialize CustomerProfiles widget");
        let div = document.createElement('div');
        div.setAttribute("id", AGENT_APP.CUSTOMER_PROFILES_WIDGET_ID);
        document.body.appendChild(div);
    }
}

