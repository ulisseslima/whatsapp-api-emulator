Messages
========

`/v1/messages`

Use the `messages` node to send text, media, contacts, locations, and interactive messages, as well as message templates to your customers.

See the following guides for information regarding the specific types of messages you can send: [Text Messages](https://developers.facebook.com/docs/whatsapp/api/messages/text), [Media Messages](https://developers.facebook.com/docs/whatsapp/api/messages/media), [Contacts and Location Messages](https://developers.facebook.com/docs/whatsapp/api/messages/contacts-location-messages), [Interactive Messages](https://developers.facebook.com/docs/whatsapp/guides/interactive-messages), [Message Templates](https://developers.facebook.com/docs/whatsapp/message-templates/creation), [Media Message Templates](https://developers.facebook.com/docs/whatsapp/api/messages/message-templates/media-message-templates), and [Interactive Message Templates](https://developers.facebook.com/docs/whatsapp/api/messages/message-templates/interactive-message-templates).

[](https://developers.facebook.com/docs/whatsapp/on-premises/reference/messages#)

Before You Start
----------------

You need:

-   Authenticate yourself and receive an authentication token that enables you to access the service. See the [Login and Authentication documentation](https://developers.facebook.com/docs/whatsapp/on-premises/reference/users/login) for more information on how to do this.
-   To verify the WhatsApp account you wish to message and get its WhatsApp user ID, See the [Contacts documentation](https://developers.facebook.com/docs/whatsapp/on-premises/reference/contacts) for more information on how to do this.
-   Meet the [cut-off control](https://developers.facebook.com/docs/whatsapp/overview/messages#cut-off-control) service requirements for messages.

Starting in v2.39 and above, you do not have to call the [contacts node](https://developers.facebook.com/docs/whatsapp/on-premises/reference/contacts) before sending a message.

### Constraints

-   The following types of message are supported: text, message templates, images, documents and audio.
-   A text message can be a max of 4096 characters long.

[](https://developers.facebook.com/docs/whatsapp/on-premises/reference/messages#)

Creating
--------

You send messages by making a `POST` call to the `/messages` node regardless of message type. The content of the JSON message body differs for each type of message (text, image, etc.).

### Parameters

These are the main parameters used in `/messages` POST requests:

| Name | Description |
| --- | --- |
|

`audio`

*object*

 |

Required when `type=audio`.

A [`media` object](https://developers.facebook.com/docs/whatsapp/on-premises/reference/messages#media-object) containing audio.

 |
|

`biz_opaque_callback_data`

*string*

 |

Optional.

An arbitrary string, useful for tracking.

For example, you could pass the message template ID in this field to track your customer's journey starting from the first message you send. You could then track the ROI of different message template types to determine the most effective one.

Any app subscribed to the `messages` webhook field on the WhatsApp Business Account can get this string, as it is included in [`statuses` object](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/components#statuses-object) within webhook payloads.

Cloud API does not process this field, it just returns it as part of sent/delivered/read message webhooks.

Maximum 512 characters.

*[Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api) only*.

 |
|

`contacts`

*object*

 |

Required when `type=contacts`.

A [`contacts` object](https://developers.facebook.com/docs/whatsapp/on-premises/reference/messages#contacts-object).

 |
|

`context`

*object*

 |

Required if [replying to](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-messages#replies) any message in the chat thread.

An object containing the ID of a previous message you are replying to. For example:

`{"message_id":"MESSAGE_ID"}`

*[Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api) only*.

 |
|

`document`

*object*

 |

Required when `type=document`.

A [`media` object](https://developers.facebook.com/docs/whatsapp/on-premises/reference/messages#media-object) containing a document.

 |
|

`hsm`

*object*

 |

Contains an [`hsm` object](https://developers.facebook.com/docs/whatsapp/api/messages#hsm-object).
Note: the `hsm` object was deprecated in v2.39 — prefer using the `template` object instead.

*[On-Premises API](https://developers.facebook.com/docs/whatsapp/on-premises) only*.

 |
|

`image`

*object*

 |

Required when `type=image`.

A [`media` object](https://developers.facebook.com/docs/whatsapp/on-premises/reference/messages#media-object) containing an image.

 |
|

`interactive`

*object*

 |

Required when `type=interactive`.

An [`interactive` object](https://developers.facebook.com/docs/whatsapp/on-premises/reference/messages#interactive-object). The components of each `interactive` object generally follow a consistent pattern: `header`, `body`, `footer`, and `action`.

 |
|

`location`

*object*

 |

Required when `type=location`.

A [`location` object](https://developers.facebook.com/docs/whatsapp/on-premises/reference/messages#location-object).

 |
|

`message_activity_sharing`

*boolean*

 |

Optional

Controls whether event activity is shared for each message. This parameter will override the WhatsApp Business Account level setting. Values: `false` , `true`.

*[MM Lite API](https://developers.facebook.com/docs/whatsapp/marketing-messages-lite-api) only*.

 |
|

`messaging_product`

*string*

 |

Required

Messaging service used for the request. Use `"whatsapp"`.

*[Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api) only*.

 |
|

`preview_url`

*boolean*

 |

Required if `type=text`.

Allows for URL previews in text messages --- See the [Sending URLs in Text Messages](https://developers.facebook.com/docs/whatsapp/api/messages/text#urls). This field is optional if not including a URL in your message. Values: `false` (default), `true`.

*[On-Premises API](https://developers.facebook.com/docs/whatsapp/on-premises) only. Cloud API users can use the same functionality with the `preview_url` field inside a [text object](https://developers.facebook.com/docs/whatsapp/on-premises/reference/messages#text-object)*.

 |
|

`recipient_type`

*string*

 |

Optional.

Currently, you can only send messages to individuals. Set this as `individual`.

Default: `individual`

 |
|

`status`

*string*

 |

A message's status. You can use this field to mark a message as `read`. See the following guides for information:

-   Cloud API: [Mark Messages as Read](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/mark-message-as-read)
-   On-Premises API: [Mark Messages as Read](https://developers.facebook.com/docs/whatsapp/on-premises/guides/mark-as-read)

 |
|

`sticker`

*object*

 |

Required when `type=sticker`.

A [`media` object](https://developers.facebook.com/docs/whatsapp/on-premises/reference/messages#media-object) containing a sticker.

Cloud API: Static and animated third-party outbound stickers are supported in addition to all types of inbound stickers. A static sticker needs to be 512x512 pixels and cannot exceed 100 KB. An animated sticker must be 512x512 pixels and cannot exceed 500 KB.

On-Premises API: Only static third-party outbound stickers are supported in addition to all types of inbound stickers. A static sticker needs to be 512x512 pixels and cannot exceed 100 KB. Animated stickers are not supported.

 |
|

`template`

*object*

 |

Required when `type=template`.

A [`template` object](https://developers.facebook.com/docs/whatsapp/on-premises/reference/messages#template-object).

 |
|

`text`

*object*

 |

Required for text messages.

A [`text` object](https://developers.facebook.com/docs/whatsapp/on-premises/reference/messages#text-object).

 |
|

`to`

*string*

 |

Required.

WhatsApp ID or phone number of the customer you want to send a message to. See [Phone Number Formats](https://developers.facebook.com/docs/whatsapp/cloud-api/reference/phone-numbers#phone-number-formats).

If needed, On-Premises API users can get this number by calling the [`contacts` endpoint](https://developers.facebook.com/docs/whatsapp/api/contacts).

 |
|

`type`

*string*

 |

Optional.

The type of message you want to send. If omitted, defaults to `text`.

 |

### Text Object

| Name | Description |
| --- | --- |
|

`body`

 |

Required.

Contains the text of the message, which can contain URLs and formatting.

 |

### Media Object

For the On-Premises API, the media object id is returned when the media is successfully uploaded to the WhatsApp Business on-premises/reference client via the [`media` endpoint](https://developers.facebook.com/docs/whatsapp/on-premises/reference/media).

| Name | Description |
| --- | --- |
|

`id`

*string* |

Required when `type` is `audio`, `document`, `image`, `sticker`, or `video` and you are not using a link.

The media object ID. Do not use this field when message `type` is set to `text`.

 |
|

`link`

*string* |

Required when `type` is `audio`, `document`, `image`, `sticker`, or `video` and you are not using an uploaded media ID (i.e. you are hosting the media asset on your public server).

The protocol and URL of the media to be sent. Use only with HTTP/HTTPS URLs.

Do not use this field when message `type` is set to `text`.

Cloud API users only:

-   See [Media HTTP Caching](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-messages#media-http-caching) if you would like us to cache the media asset for future messages.
-   When we request the media asset from your server you must indicate the media's [MIME type](https://l.facebook.com/l.php?u=https%3A%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FGlossary%2FMIME_type%3Ffbclid%3DIwZXh0bgNhZW0CMTEAYnJpZBExcVM1ZktJMmZBdXBFTEY3YwEej-akHXD3lXxd2ulJvIuDjlGWD1RBS4NR8tM1iIjquU4FFn73RzjafOAHsj4_aem_xBUd3zS7X8YWxiXuKrSYoQ&h=AT2qeuH7qOy2KxDUnQb5VARfeksthtzzC1EWLo8-yBimzOp65F5m2nypoBFcKrLkbtxa16dIPCf4hMfrXkYgsO6jTOxysHvOHmWu26KY3fZqCsjuShcSMYKUltwaBwVNKERGyV79Jn5uPg) by including the `Content-Type` HTTP header. For example: `Content-Type: video/mp4`. See [Supported Media Types](https://developers.facebook.com/docs/whatsapp/cloud-api/reference/media#supported-media-types) for a list of supported media and their MIME types.

 |
|

`caption`

*string* |

Optional.

Media asset caption. Do not use with `audio` or `sticker` media.

On-Premises API users:

-   For v2.41.2 or newer, this field is is limited to 1024 characters.
-   Captions are currently not supported for `document` media.

 |
|

`filename`

*string* |

Optional.

Describes the filename for the specific document. Use only with `document` media.

The extension of the filename will specify what format the document is displayed as in WhatsApp.

 |
|

`provider`

*string* |

Optional. On-Premises API only.

This path is optionally used with a `link` when the HTTP/HTTPS link is not directly accessible and requires additional configurations like a bearer token. For information on configuring providers, see the [Media Providers documentation](https://developers.facebook.com/docs/whatsapp/api/settings/media-providers).

 |

### Contacts Object

Inside `contacts`, you can nest the following objects: `addresses`, `emails`, `name`, `org`, `phone`, and `urls`. Pluralized objects are to be wrapped in an array as shown in the example below.

| Name | Description |
| --- | --- |
|

`addresses`

*object* |

Optional.

Full contact address(es) formatted as an `addresses` object. The object can contain the following fields:

`street`*string* -- Optional. Street number and name.

`city`*string* -- Optional. City name.

`state`*string* -- Optional. State abbreviation.

`zip`*string* -- Optional. ZIP code.

`country`*string* -- Optional. Full country name.

`country_code`*string* -- Optional. Two-letter country abbreviation.

`type`*string* -- Optional. Standard values are `HOME` and `WORK`.

 |
|

`birthday`

 |

Optional.

`YYYY-MM-DD` formatted string.

 |
|

`emails`

*object* |

Optional.

Contact email address(es) formatted as an `emails` object. The object can contain the following fields:

`email`*string* -- Optional. Email address.

`type`*string* -- Optional. Standard values are `HOME` and `WORK`.

 |
|

`name`

*object* |

Required.

Full contact name formatted as a `name` object. The object can contain the following fields:

`formatted_name`*string* -- Required. Full name, as it normally appears.

`first_name`*string* -- Optional*. First name.

`last_name`*string* -- Optional*. Last name.

`middle_name`*string* -- Optional*. Middle name.

`suffix`*string* -- Optional*. Name suffix.

`prefix`*string* -- Optional*. Name prefix.

*At least one of the optional parameters needs to be included along with the `formatted_name` parameter.

 |
|

`org`

*object* |

Optional.

Contact organization information formatted as an `org` object. The object can contain the following fields:

`company`*string* -- Optional. Name of the contact's company.

`department`*string* -- Optional. Name of the contact's department.

`title`*string* -- Optional. Contact's business title.

 |
|

`phones`

*object* |

Optional.

Contact phone number(s) formatted as a `phone` object. The object can contain the following fields:

`phone`*string* -- Optional. Automatically populated with the `wa_id` value as a formatted phone number.

`type`*string* -- Optional. Standard Values are `CELL`, `MAIN`, `IPHONE`, `HOME`, and `WORK`.

`wa_id`*string* -- Optional. WhatsApp ID.

 |
|

`urls`

*object* |

Optional.

Contact URL(s) formatted as a `urls` object. The object can contain the following fields:

`url`*string* -- Optional. URL.

`type`*string* -- Optional. Standard values are `HOME` and `WORK`.

 |

Example of a `contacts` object with pluralized objects nested inside:

"contacts":  [  {  "addresses":  [  {  "city":  "city name",  "country":  "country name",  "country_code":  "code",  "state":  "Contact's State",  "street":  "Contact's Street",  "type":  "Contact's Address Type",  "zip":  "Contact's Zip Code"  }  ],  "birthday":  "birthday",  "emails":  [  {  "email":  "email",  "type":  "HOME"  },  {  "email":  "email",  "type":  "WORK"  }  ],  "name":  {  "first_name":  "first name value",  "formatted_name":  "formatted name value",  "last_name":  "last name value",  "suffix":  "suffix value"  },  "org":  {  "company":  "company name",  "department":  "dep name",  "title":  "title"  },  "phones":  [  {  "phone":  "Phone number",  "wa-id":  "WA-ID value",  "type":  "MAIN"  },  {  "phone":  "Phone number",  "type":  "HOME"  },  {  "phone":  "Phone number",  "type":  "WORK"  }  ],  "urls":  [{  "url":  "some url",  "type":  "WORK"  }]  }  ]

### Location Object

| Name | Description |
| --- | --- |
|

`latitude`

 |

Required.

Location latitude in decimal degrees.

 |
|

`longitude`

 |

Required.

Location longitude in decimal degrees.

 |
|

`name`

 |

Required.

Name of the location.

 |
|

`address`

 |

Required.

Address of the location.

 |

### Template Object

Inside `template`, you can nest the [`components`](https://developers.facebook.com/docs/whatsapp/on-premises/reference/messages#components-object) and the [`language`](https://developers.facebook.com/docs/whatsapp/on-premises/reference/messages#language) objects.

Beginning in `v2.27.8`, a template's `namespace` must be the namespace associated with the WABA that owns the phone number in the current WhatsApp Business on-prem client. Otherwise, the message will fail to send.

In addition, from `v2.41` and onwards, `namespace` will be an optional field.

| Name | Description |
| --- | --- |
|

`name`

 |

Required.

Name of the template.

 |
|

`language`

*object* |

Required.

Contains a `language` object. Specifies the language the template may be rendered in.

The `language` object can contain the following fields:

`policy`*string* -- Required. The language policy the message should follow. The only supported option is `deterministic`. See [Language Policy Options](https://developers.facebook.com/docs/whatsapp/api/messages/message-templates#language-policy-options).

`code`*string* -- Required. The code of the language or locale to use. Accepts both `language` and `language_locale` formats (e.g., `en` and `en_US`). For all codes, see [Supported Languages](https://developers.facebook.com/docs/whatsapp/api/messages/message-templates#supported-languages).

 |
|

`components`

*array of objects* |

Optional.

Array of [`components` objects](https://developers.facebook.com/docs/whatsapp/on-premises/reference/messages#components-object) containing the parameters of the message.

 |
|

`namespace`

 |

Optional. Only used for [On-Premises API.](https://developers.facebook.com/docs/whatsapp/on-premises)

Namespace of the template.

 |

#### Components Object

Inside `components`, you can nest the [`parameters` object](https://developers.facebook.com/docs/whatsapp/on-premises/reference/messages#parameters-object). Additionally, you can set `type` to [`button`](https://developers.facebook.com/docs/whatsapp/on-premises/reference/messages#buttons).

| Name | Description |
| --- | --- |
|

`type`

*string*

 |

Required.

Describes the `component` type.

Example of a `components` object with an array of `parameters` object nested inside:

  "components":  [{  "type":  "body",  "parameters":  [{  "type":  "text",  "text":  "name"  },  {  "type":  "text",  "text":  "Hi there"  }]  }]

Supported Options:

-   `header`
-   `body`
-   `button`

For text-based templates, we only support the `type=body`.

 |
|

`sub_type`

*string*

 |

Required when `type=button`. Not used for the other types.

Type of button to create. Supported Options:

-   `quick_reply`: Refers to a previously created quick reply button that allows for the customer to return a predefined message.
-   `url`: Refers to a previously created button that allows the customer to visit the URL generated by appending the `text` parameter to the predefined prefix URL in the template.
-   `catalog`: Refers to a previously created catalog button that allows for the customer to return a full product catalog.

 |
|

`parameters`

*array of objects*

 |

Required when `type=button`.

Array of [`parameter` objects](https://developers.facebook.com/docs/whatsapp/on-premises/reference/messages#parameter-object) with the content of the message.

For components of type=button, see the [`button` parameter object](https://developers.facebook.com/docs/whatsapp/on-premises/reference/messages#button-parameter-object).

 |
|

`index`

 |

Required when `type=button`. Not used for the other types.**

Position index of the button. You can have up to 10 buttons using index values of 0 to 9.

 |

#### Parameter Object

| Name | Description |
| --- | --- |
|

`type`

 |

Required.

Describes the `parameter` type.\
Values: `text`, `currency`, `date_time`, `image`, `document`, `video`

Example of a `parameter` object with a `text` value:

{  "type":  "text",  "text":  "Customer"  }

Example of a `parameter` object with a media type value of `document`:

{  "type":  "document",  "document":{  "id":  "doc_id",  "filename":  "doc_name"  }  }

This is also known as a [Media message template](https://developers.facebook.com/docs/whatsapp/api/messages/message-templates/media-message-templates) and they only support PDF documents.

For more information about `currency` and `date_time`, see the [Localizable Parameters](https://developers.facebook.com/docs/whatsapp/api/messages/message-templates#local) section.

 |

#### Button Type

Inside the [`components` object](https://developers.facebook.com/docs/whatsapp/on-premises/reference/messages#components-object), you can set `type` to `button`. These are the button parameters:

| Name | Description |
| --- | --- |
|

`sub_type`

 |

Required.

Type of button being created.\
Values: `quick_reply`, `url`, `copy_code (available from 2.49 and onwards)`

 |
|

`index`

 |

Required.

Position index of the button. You can have up to 10 buttons using index values of `0-9`.

 |
|

`parameters`

 |

Required.

The parameters for the button, which are set at creation time in your Business Manager. Include the following parameters:

-   `type` (Required): Indicates the type of parameter for the button. Supported values are `payload` , `text` and `coupon_code`.
-   `payload` (Required for `quick_reply` buttons): Developer-defined payload that will be returned when the button is clicked in addition to the display text on the button.
-   `text` (Required for `url` buttons): Developer provided suffix that will be appended to a previously created dynamic URL button.
-   `coupon_code` (Required for copy_code buttons) (available from 2.49 and onwards): Developer provided coupon code which gets copied when the copy code button is clicked.

 |

Example of `button` type with sub_type `quick_reply`:

  {  "type":  "button",  "sub_type":  "quick_reply",  "index":  0,  "parameters":  [{  "type":  "payload",  "payload":  "Yes-Button-Payload"  }]  }

Example of `button` type with sub_type `copy_code`

  {  "type":  "button",  "sub_type":  "copy_code",  "index":  0,  "parameters":  [{  "type":  "coupon_code",  "coupon_code":  "DISCOUNT20"  }]  }

### Hsm Object

The `hsm` object was deprecated in v2.39. Please use the `template` object instead.

| Name | Description |
| --- | --- |
|

`namespace`

 |

Required.

The namespace to be used. Beginning with `v2.2.7`, if the namespace does not match up to the `element_name`, the message fails to send.

 |
|

`element_name`

 |

Required.

The element name that indicates which template to use within the namespace. Beginning with `v2.2.7`, if the `element_name` does not match up to the namespace, the message fails to send.

 |
|

`language`

 |

Required.

Allows for the specification of a deterministic language. See the [Language](https://developers.facebook.com/docs/whatsapp/on-premises/reference/messages#language) section for more information.

This field used to allow for a `fallback` option, but this has been deprecated with `v2.27.8`.

 |
|

`localizable_params`

 |

Required.

This field is an array of values to apply to variables in the template. See the [Localizable Parameters](https://developers.facebook.com/docs/whatsapp/on-premises/reference/messages#local) section for more information.

 |

### Interactive Object

The `interactive` object generally contains 4 main components: `header`, `body`, `footer`, and `action`. Additionally, some of those components can contain one or more different objects:

-   Inside `header`, you can nest `media` objects.
-   Inside `action`, you can nest `section` and `button` objects.

| Name | Description |
| --- | --- |
|

`type`

*string* |

Required.

The type of interactive message you want to send. Supported values:

-   `list`: Use it for List Messages.
-   `button`: Use it for Reply Buttons.
-   `product`: Use it for Single-Product Messages.
-   `product_list`: Use it for Multi-Product Messages.
-   `catalog_message`: Use it for Catalog Messages.
-   `flow`: Use it for Flows Messages.

 |
|

`header`

*object* |

Required for type `product_list`. Optional for other types.

Header content displayed on top of a message. You cannot set a `header` if your `interactive` object is of `product` type.

The `header` object contains the following fields:

`document`*object* -- Required if `type` is set to `document`. Contains the `media` object with the document.

`image`*object* -- Required if `type` is set to `image`. Contains the `media` object with the image.

`video`*object* -- Required if `type` is set to `video`. Contains the `media` object with the video.

`text`*string* -- Required if `type` is set to `text`. Text for the header. Formatting allows emojis, but not markdown. Maximum length: 60 characters.

`type`*string* -- Required. The header type you would like to use. Supported values are:

`text` -- for List Messages, Reply Buttons, and Multi-Product Messages.

`video` -- for Reply Buttons.

`image` -- for Reply Buttons.

`document` -- for Reply Buttons.

 |
|

`body`

*object* |

Optional for type `product`. Required for other message types.

An object with the body of the message.

The `body` object contains the following field:

`text`*string* -- Required if body is present. The content of the message. Emojis and markdown are supported. Maximum length: 1024 characters.

 |
|

`footer`

*object* |

Optional.

An object with the footer of the message.

The `footer` object contains the following field:

`text`*string* -- Required if footer is present. The footer content. Emojis, markdown, and links are supported. Maximum length: 60 characters.

 |
|

`action`

*object* |

Required.

An `action` object with what you want the user to perform after reading the message. See [`action` object](https://developers.facebook.com/docs/whatsapp/on-premises/reference/messages#action-object) for full information.

 |

#### Action Object

| Name | Description |
| --- | --- |
|

`button`

*string* |

Required for List Messages.

Button content. It cannot be an empty string and must be unique within the message. Emojis are supported, markdown is not. Maximum length: 20 characters.

 |
|

`buttons`

*object* |

Required for Reply Button Messages.

A `button` object. The object can contain the following parameters:

`type` -- The only supported option is `reply` for Reply Button Messages.

`title` -- Button title. It cannot be an empty string and must be unique within the message. Emojis are supported, markdown is not. Maximum length: 20 characters.

`id` -- Unique identifier for your button. This ID is returned in the webhook when the button is clicked by the user. Maximum length: 256 characters.

You cannot have leading or trailing spaces when setting the ID.

 |
|

`sections`

*array of objects* |

Required for List Messages and Multi-Product Messages.

Array of `section` objects. There is a minimum of 1 and maximum of 10. See [`section` object](https://developers.facebook.com/docs/whatsapp/on-premises/reference/messages#section-object).

 |
|

`catalog_id`

*string* |

Required for Single-Product Messages and Multi-Product Messages.

Unique identifier of the Facebook catalog linked to your WhatsApp Business Account. This ID can be retrieved via Commerce Manager.

 |
|

`product_retailer_id`

*string* |

Required for Single-Product Messages and Multi-Product Messages.

Unique identifier of the product in a catalog. Maximum 100 characters for both Single-Product and Multi-Product messages.

To get this ID, go to [Commerce Manager](https://business.facebook.com/commerce/), select your Facebook Business account, and you will see a list of shops connected to your account. Click the shop you want to use. On the left-side panel, click Catalog > Items, and find the item you want to mention. The ID for that item is displayed under the item's name.

 |
|

`mode`

*string* |

Optional for Flows Messages.

The current mode of the Flow, either `draft` or `published`.

Default: `published`

 |
|

`flow_message_version`

*string* |

Required for Flows Messages.

Must be `3`.

 |
|

`flow_token`

*string* |

Required for Flows Messages.

A token that is generated by the business to serve as an identifier.

 |
|

`flow_id`

*string* |

Required for Flows Messages.

Unique identifier of the Flow provided by WhatsApp.

 |
|

`flow_cta`

*string* |

Required for Flows Messages.

Text on the CTA button, eg. "Signup".

Maximum length: 20 characters (no emoji).

 |
|

`flow_action`

*string* |

Optional for Flows Messages.

`navigate` or `data_exchange`. Use `navigate` to predefine the first screen as part of the message. Use `data_exchange` for advanced use-cases where the first screen is provided by [your endpoint](https://developers.facebook.com/docs/whatsapp/flows/guides/implementingyourflowendpoint).

Default: `navigate`

 |
|

`flow_action_payload`

*object* |

Optional for Flows Messages.

Required only if `flow_action` is `navigate`. The object can contain the following parameters:

`screen`*string* -- Required. The `id` of the first screen of the Flow.

`data`*object* -- Optional. The input data for the first screen of the Flow. Must be a non-empty object.

 |

#### Section Object

| Name | Description |
| --- | --- |
|

`title`

*string* |

Required if the message has more than one `section`.

Title of the section. Maximum length: 24 characters.

 |
|

`rows`

*array of objects* |

Required for List Messages.

Contains a list of row objects. Limited to 10 rows across all sections.

Each `row` object contains the following fields:

`title`*string* -- Required. Maximum length: 24 characters.

`ID`*string* -- Required. Maximum length: 200 characters.

`description`*string* -- Optional. Maximum length: 72 characters.

 |
|

`product_items`

*array of objects* |

Required for Multi-Product Messages.

Array of `product` objects. There is a minimum of 1 product per section and a maximum of 30 products across all sections.

Each `product` object contains the following field:

`product_retailer_id`*string* -- Required for Multi-Product Messages. Unique identifier of the product in a catalog. To get this ID, go to [Commerce Manager](https://business.facebook.com/commerce/), select your account and the shop you want to use. Then, click Catalog > Items, and find the item you want to mention. The ID for that item is displayed under the item's name.

 |

### Examples

Audio messages:

POST /v1/messages {  "recipient_type":  "individual",  "to":  "whatsapp-id",  "type":  "audio",  "audio":  {  "id":  "*your-media-id*",  }  }

Document messages, using `filename`:

POST /v1/messages {  "recipient_type":  "individual",  "to":  "whatsapp-id",  "type":  "document",  "document":  {  "id":  "*your-media-id*",  "filename":  "*your-document-filename*"  }  }

Document messages, using `link`:

POST /v1/messages {  "recipient_type":  "individual",  "to":  "whatsapp-id",  "type":  "document",  "document":  {  "link":  "http(s)://*the-url*"  "provider":  {  "name"  :  "*provider-name*"  }  }  }

Video messages, using `link`:

POST /v1/messages {  "recipient_type":  "individual",  "to":  "whatsapp-id",  "type":  "video",  "video":  {  "link":  "http(s)://*the-url*"  "provider":  {  "name"  :  "*provider-name*"  }  }  }  }

Text messages:

POST /v1/messages {  "recipient_type":  "individual",  "to":  "whatsapp-id",  "type":  "text",  "text":  {  "body":  "*your-message-content*"  }  }

Interactive messages (lists):

POST /v1/messages {  "recipient_type":  "individual",  "to":  "whatsapp-id",  "type":  "interactive",  "interactive":{  "type":  "list",  "header":  {  "type":  "text",  "text":  "your-header-content-here"  },  "body":  {  "text":  "your-text-message-content-here"  },  "footer":  {  "text":  "your-footer-content-here"  },  "action":  {  "button":  "cta-button-content-here",  "sections":[  {  "title":"your-section-title-content-here",  "rows":  [  {  "id":"unique-row-identifier-here",  "title":  "row-title-content-here",  "description":  "row-description-content-here",  }  ]  },  {  "title":"your-section-title-content-here",  "rows":  [  {  "id":"unique-row-identifier-here",  "title":  "row-title-content-here",  "description":  "row-description-content-here",  }  ]  },  ...  ]  }  }  }

Interactive messages (reply buttons):

POST /v1/messages {  "recipient_type":  "individual",  "to":  "whatsapp-id",  "type":  "interactive",  "interactive":  {  "type":  "button",  "header":  {  # optional  "type":  "text"  |  "image"  |  "video"  |  "document",  "text":  "your text"  # OR  "document":  {  "id":  "your-media-id",  "filename":  "some-file-name"  }  # OR  "document":  {  "link":  "the-provider-name/protocol://the-url",  "provider":  {  "name":  "provider-name",  },  "filename":  "some-file-name"  },  # OR  "video":  {  "id":  "your-media-id"  }  # OR  "video":  {  "link":  "the-provider-name/protocol://the-url",  "provider":  {  "name":  "provider-name"  }  }  # OR  "image":  {  "id":  "your-media-id"  }  # OR  "image":  {  "link":  "http(s)://the-url",  "provider":  {  "name":  "provider-name"  }  }  },  # end header  "body":  {  "text":  "your-text-body-content"  },  "footer":  {  # optional  "text":  "your-text-footer-content"  },  "action":  {  "buttons":  [  {  "type":  "reply",  "reply":  {  "id":  "unique-postback-id",  "title":  "First Button's Title"  }  },  {  "type":  "reply",  "reply":  {  "id":  "unique-postback-id",  "title":  "Second Button's Title"  }  }  ]  }  # end action  }  # end interactive  }

Interactive messages (Multi and Single-Product Messages):

{  "recipient_type":  "individual",  "to"  :  "{{Recipient-WA-ID}}",  "type":  "interactive",  "interactive":  {  "type":  "product",  "body":  {  "text":  "body text"  },  "footer":  {  "text":  "footer text"  },  "action":  {  "

      _id":  "catalog-ID",  "product_retailer_id":  "product-ID"  }  }  }

Interactive messages (Multi-Product Messages):

{  "recipient_type":  "individual",  "to"  :  "whatsapp-id",  "type":  "interactive",  "interactive":  {  "type":  "product_list",  "Header":{  "type":  "text",  "text":  "text-header-content"  },  "body":{  "text":  "text-body-content"  },  "footer":{  "text":"text-footer-content"  },  "action":{  "catalog_id":"catalog-id",  "sections":  [  {  "title":  "section-title",  "product_items":  [  {  "product_retailer_id":  "product-SKU-in-catalog"  },  {  "product_retailer_id":  "product-SKU-in-catalog"  },  ...  ]},  {  "title":  "the-section-title",  "product_items":  [  {  "product_retailer_id":  "product-SKU-in-catalog"  }  ...  ]},  ...  ]  },  }  }

Interactive messages (Catalog Messages):

{  "recipient_type":  "individual",  "to"  :  "whatsapp-id",  "type":  "interactive",  "interactive":  {  "type":  "catalog_message",  "body":{  "text":  "text-body-content"  },  "footer":{  "text":"text-footer-content"  },  "action":{  "name":  "catalog_message",  "parameters":{  "thumbnail_product_retailer_id":  "product-SKU-in-catalog"  }  },  }  }

Interactive messages (Flows):

{  "recipient_type":  "individual",  "to":  "{{Recipient-WA-ID}}",  "type":  "interactive",  "interactive":  {  "type":  "flow",  "header":  {  "type":  "text",  "text":  "Flow message header"  },  "body":  {  "text":  "Flow message body"  },  "footer":  {  "text":  "Flow message footer"  },  "action":  {  "name":  "flow",  "parameters":  {  "flow_message_version":  "3",  "flow_token":  "AQAAAAACS5FpgQ_cAAAAAD0QI3s",  "flow_id":  "<FLOW_ID>",  "flow_cta":  "Book!",  "flow_action":  "navigate",  "flow_action_payload":  {  "screen":  "<SCREEN_ID>",  "data":  {  # optional  "user_name":  "name",  "user_age":  25  }  }  }  }  }  }

The following shows an example of `payload` in a response; the meta and error objects are omitted for brevity.

{  "messages":  [{  "id":  "*message-id*"  }]  }

If the request is successful, you receive a response with a message ID. If the request returns an `errors` section, check the originating message and correct the errors before resending the request. For more information about errors, see [WhatsApp Business on-premises/reference Client Error Codes](https://developers.facebook.com/docs/whatsapp/on-premises/errors#error) and [HTTP Status Codes](https://developers.facebook.com/docs/whatsapp/on-premises/errors#http).

Applies to businesses in Brazil, Colombia, and Singapore, starting September 12, 2023. Applies to all businesses starting October 12, 2023.

If the request is held for quality assessment, the response will contain a `message_status` property with a message indicating that the message was not sent immediately and will be sent or dropped after quality has been validated. *This property will only exist if the message is held.*

  {  "messages":  [{  "id":  "*message-id*",  "message_status":  "Message has been held because quality assessment is pending",  }]  }

[](https://developers.facebook.com/docs/whatsapp/on-premises/reference/messages#)

Formatting in Text Messages
---------------------------

WhatsApp allows some formatting in messages. To format all or part of a message, use these formatting symbols:

| Formatting | Symbol | Example |
| --- | --- | --- |
|

Bold

 |

Asterisk (*)

 |

Your total is *$10.50*.

 |
|

*Italics*

 |

Underscore (_)

 |

Welcome to _WhatsApp_!

 |
| ~~Strike-through~~ |

Tilde (~)

 |

This is ~better~ best!

 |
|

`Code`

 |

Three backticks (```)

 |

```print 'Hello World';```

 |

[](https://developers.facebook.com/docs/whatsapp/on-premises/reference/messages#)

Performance
-----------

In this context, performance represents the number of messages that can be sent in any given second using the WhatsApp Business on-premises/reference client. The maximum achievable performance depends on a variety of factors, the most important factor being your client setup choice and whether a message is being sent to a new user or an existing user ---encryption sessions setup take a little longer when messaging a new user.

| Client Setup | Supported Text Messages Per Second |
| --- | --- |
|

Single Shard

 |

70

 |
|

Multi Shard (32 shards)

 |

250

 |

[](https://developers.facebook.com/docs/whatsapp/on-premises/reference/messages#)

FAQ
---

[Why is my delivery rate not 100%?](https://developers.facebook.com/docs/whatsapp/on-premises/reference/messages#faq_550341502008168)

[How long does a message stay in WhatsApp?](https://developers.facebook.com/docs/whatsapp/on-premises/reference/messages#faq_1536348526473805)

[Can messages be formatted?](https://developers.facebook.com/docs/whatsapp/on-premises/reference/messages#faq_1731118056945893)

[How do I know if a user has blocked my business?](https://developers.facebook.com/docs/whatsapp/on-premises/reference/messages#faq_1874919319191147)

[Is the order of message delivery guaranteed?](https://developers.facebook.com/docs/whatsapp/on-premises/reference/messages#faq_173242556636267)

[Are there any specific headers that need to be set on requests?](https://developers.facebook.com/docs/whatsapp/on-premises/reference/messages#faq_230167687740110)

[How do I handle cases where I need to send customer care response after 24h?](https://developers.facebook.com/docs/whatsapp/on-premises/reference/messages#faq_715120295540784)

[](https://developers.facebook.com/docs/whatsapp/on-premises/reference/messages#)

Learn more
----------

-   [Login and Authentication documentation](https://developers.facebook.com/docs/whatsapp/on-premises/reference/users/login)
-   [Contacts documentation](https://developers.facebook.com/docs/whatsapp/on-premises/reference/contacts)
-   [WhatsApp Business on-premises/reference Client Error Codes](https://developers.facebook.com/docs/whatsapp/on-premises/errors#error)
-   [HTTP Status Codes](https://developers.facebook.com/docs/whatsapp/on-premises/reference/errors#http)