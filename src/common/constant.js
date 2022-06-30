/*
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

export const CALL_HEADERS = {
    CALL_SOURCE_HEADER: 'agent-app',
    CUSTOMER_PROFILES_OPERATION_TARGET_PREFIX: 'AgentAppService.CustomerProfiles.'
};

export const SUPPORTED_APIS = {
    LIST_ACCOUNT_INTEGRATIONS: 'listAccountIntegrations',
    CREATE_PROFILE: 'createProfile',
    UPDATE_PROFILE: 'updateProfile',
    SEARCH_PROFILES: 'searchProfiles',
    LIST_PROFILE_OBJECTS: 'listProfileObjects',
    ADD_PROFILE_KEY: 'addProfileKey'
};

export const AGENT_APP = {
    CUSTOMER_PROFILES_APP_PATH_SUFFIX: 'customerprofiles-v2',
    CUSTOMER_PROFILES_WIDGET_ID: 'customerprofiles-container',
    AGENT_APP_API: 'agent-app/api'
};

export const CLIENT = {
    CLIENT_NAME: 'AmazonConnectCustomerProfilesClient',
    API_EVENT_TYPE: 'CustomerProfilesApiCall'
};