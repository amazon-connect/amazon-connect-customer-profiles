# amazon-connect-customer-profiles

## Description

The Amazon Connect CustomerProfiles JavaScript library (CustomerProfilesJS) gives you the power to build your own CustomerProfiles widget.

The library uses Connect authentication token to make API calls to CustomerProfiles service. The client supports all CustomerProfile apis enabled on connect instance.

The client supports the following apis
- SearchProfiles
- CreateProfile
- UpdateProfile
- AddProfileKey
- ListProfileObjects
- ListAccountIntegrations

For more details on the apis, check out [CustomerProfiles](https://docs.aws.amazon.com/cli/latest/reference/customer-profiles/index.html) available via the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html).

## Getting started

### Pre-requisite

- AmazonConnectCustomerProfiles depends on CCP widget from [AmazonConnectStreams](https://github.com/amazon-connect/amazon-connect-streams)
- To utilize AmazonConnectCustomerProfiles, start by allow listing your existing web application in the AWS Connect console. To allow list a domain URL follow the [app integration guide](https://docs.aws.amazon.com/connect/latest/adminguide/app-integration.html).
- Access to CustomerProfile apis can be controlled using [Connect security profiles](https://docs.aws.amazon.com/connect/latest/adminguide/assign-security-profile-customer-profile.html).

### Usage

#### Build your own with NPM

amazon-connect-customer-profiles is available from npmjs.com. If you'd like to download it here, you can use either of the files like `dist/amazon-connect-customer-profiles*`.

Run npm run release to generate new release files.

```
$ git clone https://github.com/amazon-connect/amazon-connect-customer-profiles.git
$ cd amazon-connect-customer-profiles
$ npm install
$ npm run release
```

Find build artifacts in **dist** directory - This will generate a file called `amazon-connect-customer-profiles.js` and the minified version of the same `amazon-connect-customer-profiles-min.js`.


#### Install using NPM
Install using `npm`:
```
npm install amazon-connect-customer-profiles
```

### Initialization

The order of initialization matters:
- Embed `connect-streams` javascript library before embedding `amazon-connect-customer-profiles`.
- Initialize `Connect CCP` before initializing `CustomerProfilesClient`

```html,js
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <script type="text/javascript" src="connect-streams-min.js"></script>
    <script type="text/javascript" src="amazon-connect-customer-profiles-min.js"></script>
  </head>
  <body>
    <div id="container-div" style="width: 400px; height: 800px;"></div>
    <script type="text/javascript">
      let instanceName = 'https://test.my.connect.aws';

      // Initialize streams API
      var containerDiv = document.getElementById("container-div");
      connect.core.initCCP(
        containerDiv,
       	...
      );

      // Initialize customerProfilesJS client
      client = new connect.CustomerProfilesClient(instanceName);

    </script>
  </body>
</html>
```

## Requests

CustomerProfilesJS client supports the following api methods.

Initialize the client
```js
client = connect.CustomerProfilesClient(instanceName, endpoint);
```

### CreateProfile

[CreateProfile](https://docs.aws.amazon.com/customerprofiles/latest/APIReference/API_CreateProfile.html) - creates a standard profile.

```js
client.createProfile({
	"DomainName": "<DOMAIN_NAME>",
	"FirstName": "<FIRST_NAME>"
});
```

### UpdateProfile

[UpdateProfile](https://docs.aws.amazon.com/customerprofiles/latest/APIReference/API_UpdateProfile.html) - Updates the properties of a profile. The ProfileId is required for updating a customer profile.

```js
client.updateProfile({
	"ProfileId": "<PROFILE_ID>",
	"FirstName": "<FIRST_NAME>",
	"LastName": "<LAST_NAME>",
	"DomainName": "<DOMAIN_NAME>"
});
```

### SearchProfile

[SearchProfile](https://docs.aws.amazon.com/customerprofiles/latest/APIReference/API_SearchProfiles.html) - Searches for profiles within a domain.

```js
client.searchProfiles({
	"DomainName": "<DOMAIN_NAME>",
	"KeyName": "_profileId",
	"Values": [ "<PROFILE_ID>" ]
});
```

### AddProfileKey

[AddProfileKey](https://docs.aws.amazon.com/customerprofiles/latest/APIReference/API_AddProfileKey.html) - Associates a new key value with a specific profile, such as a Contact Trace Record (CTR) ContactId.

```js
client.addProfileKey({
	"DomainName": "<DOMAIN_NAME>",
	"ProfileId": "<PROFILE_ID>",
	"KeyName": "_phone",
	"Values": [ "<PHONE_NUMBER>" ]
});
```

### ListProfileObjects

[ListProfileObjects](https://docs.aws.amazon.com/customerprofiles/latest/APIReference/API_ListProfileObjects.html) - Returns a list of objects associated with a profile of a given ProfileObjectType.

```js
client.listProfileObjects({
	"DomainName": "<DOMAIN_NAME>",
	"ObjectTypeName": "CTR",
	"ProfileId": "<PROFILE_ID>",
	"MaxResults": 10
});
```

### ListAccountIntegrations

[ListAccountIntegrations](https://docs.aws.amazon.com/customerprofiles/latest/APIReference/API_ListAccountIntegrations.html) - Lists all of the integrations associated to a specific URI in the AWS account.

```js
client.listAccountIntegrations({
	"Uri": "<URI>"
});
```

## Response

All api calls through the client returns a promise. The promise resolves/rejects to provide the results from the api call.
200 status api status code is resolved and all other status codes are rejected.

Client response contains the following fields
- `status`: api call status code
- `statusText`: api call status text
- `data`: api response data

```json
{
	"status": 200,
	"statusText": "OK",
	"data": {<api_response>}
}
```

### Reading response
You can use [Promise chaining](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises#chaining) to read results from client response.

```js
client.createProfile({
	"DomainName": "<DOMAIN_NAME>",
	"FirstName": "<FIRST_NAME>"
}).then((res) => {
	console.log('Success response: ' + JSON.stringify(res));
}).catch((errorResp) => {
    console.log('Error response: ' + JSON.stringify(errorResp));
});
```

## Troubleshooting

### Error message: `Failed to execute ‘postMessage’ on ‘DOMWindow’: The target origin provided`

This indicates that the customer-profiles hidden widget used by the client is not loaded. Ensure user has successfully signed in to connect instance and reload the page.


## Contributing

See [CONTRIBUTING](CONTRIBUTING.md) for more information.

## License

CustomerProfilesJS is distributed under the
[Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0),
see LICENSE for more information.
