/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { apiCommsBuilder } from "./core/comms";
import { SUPPORTED_APIS } from "./common/constant";


export class CustomerProfilesAgentAppClient {
    constructor(instanceUrl, instanceApiEndpointUrl=null, forceBuildDirectApiComms=false) {
        if (forceBuildDirectApiComms) {
            this.comms = apiCommsBuilder(instanceUrl, instanceApiEndpointUrl, forceBuildDirectApiComms=true);
        } else {
            this.comms = apiCommsBuilder(instanceUrl, instanceApiEndpointUrl);
        }
    }

    listAccountIntegrations(params) {
        return this.comms.apiCall(SUPPORTED_APIS.LIST_ACCOUNT_INTEGRATIONS, params);
    }

    createProfile(params) {
        return this.comms.apiCall(SUPPORTED_APIS.CREATE_PROFILE, params);
    }

    updateProfile(params) {
        return this.comms.apiCall(SUPPORTED_APIS.UPDATE_PROFILE, params);
    }

    searchProfiles(params) {
        return this.comms.apiCall(SUPPORTED_APIS.SEARCH_PROFILES, params);
    }

    listProfileObjects(params) {
        return this.comms.apiCall(SUPPORTED_APIS.LIST_PROFILE_OBJECTS, params);
    }

    addProfileKey(params) {
        return this.comms.apiCall(SUPPORTED_APIS.ADD_PROFILE_KEY, params);
    }
}

global.connect = global.connect || {};
connect.CustomerProfilesClient = CustomerProfilesAgentAppClient
export const CustomerProfilesClient = CustomerProfilesAgentAppClient
