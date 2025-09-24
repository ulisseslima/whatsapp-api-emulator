https://developers.facebook.com/docs/whatsapp/on-premises/guides/webhooks

Webhooks for the On-Premises API
================================

Subscribe to Webhooks to get notifications about messages your business receives and customer profile updates. See [Overview, Webhooks](https://developers.facebook.com/docs/whatsapp/overview/webhooks) for more information on WhatsApp Business Platform webhooks.

Webhooks set up will not affect the phone number on your WhatsApp Business App. Only after you [migrate your number over to the WhatsApp Business Platform](https://developers.facebook.com/docs/whatsapp/overview/phone-number#migrate) can you no longer use that number on your WhatsApp Business App.

Before You Start
----------------

You will need:

-   Code that supports HTTPS and has a valid SSL certificate
-   A callback URL endpoint that is configured to accept inbound requests from the Coreapp
-   A callback URL endpoint that returns an `HTTPS 200 OK` response when a notification is received

### Retry

If a notification isn't delivered for any reason or if the webhook request returns a HTTP status code other than `200`, we retry delivery. We continue retrying delivery with increasing delays up to a certain timeout (typically 24 hours, though this may vary), or until the delivery succeeds.

[](https://developers.facebook.com/docs/whatsapp/on-premises/guides/webhooks#)

Set Your Callback URL Endpoint
------------------------------

Send a `PATCH` request to the the `/v1/settings/application` endpoint with the `webhooks` parameter set to your callback URL endpoint. Other commonly configured parameters are `sent_status` and `callback_persist`.

### Example Request

PATCH /v1/settings/application {  "callback_persist":  true,  "sent_status":  true,  //  Either use this or webhooks.message.sent, but webhooks.message.sent property is preferred as sent_status will be deprecated soon "webhooks":  {  "url":  "webhook.your-domain",  "message":  {  //  Available on v2.41.2 and above "sent":  false,  "delivered":  true,  "read":  false  },  }  }

On success, the response contains `200 OK` with a `null` or a JSON object.

Visit the [Application Settings Reference](https://developers.facebook.com/docs/whatsapp/on-premises/reference/settings/app#parameters) for more information about configuring your app, and additional webhooks parameters.

[](https://developers.facebook.com/docs/whatsapp/on-premises/guides/webhooks#)

Webhook Notification Payload
----------------------------

Whenever a trigger event occurs, the WhatsApp Business Platform sees the event and sends a notification to a Webhook URL you have previously specified. You can get two types of notifications:

-   Received messages: This alert lets you know when you have received a message. These can also be called "inbound notifications" throughout the documentation.
-   Message status and pricing notifications: This alert lets you know when the status of a message has changed ---for example, the message has been read or delivered. These can also be called "outbound notifications" throughout the documentation.

See [Components](https://developers.facebook.com/docs/whatsapp/on-premises/webhooks/components) for information on each field.

### Error Notification

{  "errors":  [  {  "code":  <error-code>,  "title":  "<error-title>",  "details":  "<error-description>",  "href":  "location for error detail"  },  {  ...  }  ]  }

[](https://developers.facebook.com/docs/whatsapp/on-premises/guides/webhooks#)

Sample App Endpoints
--------------------

To test your Webhoooks, you can create a sample app with an endpoint for receiving notifications.

-   [Sample App Endpoints using Glitch ![](https://scontent.fcgh10-2.fna.fbcdn.net/v/t39.2365-6/276034258_1045248339390233_3876773921429146148_n.png?_nc_cat=110&ccb=1-7&_nc_sid=e280be&_nc_eui2=AeF5re_g93vA4Dckq2VQi1A32eYV3ZjFDiXZ5hXdmMUOJbnOGfDNcc7IeGe23aAv0IU8H-MPO3BHw2HGCBABed0D&_nc_ohc=Wx5jGsKnAbgQ7kNvwGhrpqC&_nc_oc=AdnoysNKYSuJJgMym7W-vilkJIUXmpKnWoLKpFFP4x7XVFVSnP0Q94Wt8RGNQD5ywlPa5qs1Zs24igOX4FbV5K0a&_nc_zt=14&_nc_ht=scontent.fcgh10-2.fna&_nc_gid=3oblbJ735RDzro6edaCDAw&oh=00_AfbErTzyoXtpP6Jwwr9LIJ0eR3bWUTrLW9-aDqllafV-xg&oe=68ED3475)](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/sample-app-endpoints)