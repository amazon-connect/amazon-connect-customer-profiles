/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import { AGENT_APP } from "../common/constant";

export function getUrlDomain(url) {
    let urlObj = (new URL(url));
    return urlObj.hostname.replace('www.','');
}


export function isInitInConnectDomain(connectInstanceUrl) {
    const connectInstanceUrlDomain = getUrlDomain(connectInstanceUrl);
    const currentUrlDomain = getUrlDomain(window.location.href);

    return connectInstanceUrlDomain === currentUrlDomain;
}


export function buildCustomerProfilesWidgetUrl(instanceUrl) {
    let instanceUrlNew = instanceUrl;

    if (instanceUrlNew.charAt(instanceUrlNew.length - 1) != '/') {
        instanceUrlNew = instanceUrlNew + '/';
    }

    return instanceUrlNew + AGENT_APP.CUSTOMER_PROFILES_APP_PATH_SUFFIX;
}

export function buildAgentAppApiUrl(instanceUrl) {
    let instanceUrlNew = instanceUrl;

    if (instanceUrlNew.charAt(instanceUrlNew.length - 1) != '/') {
        instanceUrlNew = instanceUrlNew + '/';
    }

    return instanceUrlNew + AGENT_APP.AGENT_APP_API;
}
