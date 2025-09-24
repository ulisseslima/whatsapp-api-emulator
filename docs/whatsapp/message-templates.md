https://developers.facebook.com/docs/whatsapp/message-templates/creation#step-1--create-template-using-the-whatsapp-manager

Sending Message Templates
=========================

You can use the `/messages` endpoint to send message templates to your customers. A message template can be text-based, [media-based](https://developers.facebook.com/docs/whatsapp/api/messages/message-templates/media-message-templates), or [interactive](https://developers.facebook.com/docs/whatsapp/api/messages/message-templates/interactive-message-templates).

To learn more about message templates, see [Messages, Business-Initiated Messages](https://developers.facebook.com/docs/whatsapp/overview/messages#business-initiated-messages).

[](https://developers.facebook.com/docs/whatsapp/message-templates/creation#)

Before You Start
----------------

Make sure that you have completed the actions in the [Messages --- Prerequisites documentation](https://developers.facebook.com/docs/whatsapp/api/messages#prereq).

[](https://developers.facebook.com/docs/whatsapp/message-templates/creation#)

Step 1: Create Template Using the WhatsApp Manager
--------------------------------------------------

Message templates are created in the WhatsApp Manager, which is part of your WhatsApp Account in the [Facebook Business Manager](https://business.facebook.com/). Your message templates will be reviewed to ensure they do not violate WhatsApp policies. Once approved, your business will have its own namespace where the message templates live.

When creating a message template, you must have the following:

1.  Message template name --- Can only contain lowercase alphanumeric characters and underscores ( _ ). No other characters or white space are allowed.
2.  Components of the message template --- Fill in the template with the text and/or media components, including parameter placeholders, as required. Make sure it contains no newlines, tabs, or more than 4 consecutive spaces and meets the length restrictions as called out in the Business Manager or [WhatsApp Business Management API](https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates#creating-message-templates).
3.  All other [translations](https://developers.facebook.com/docs/whatsapp/message-templates/creation#translations) your business desires.

When creating a message template, you can add a sample template by clicking the Add Sample button. This helps us during the review and approval process, so we can understand what kind of message you plan to send. Make sure these are examples and do not include any confidential or personal information.

See [Create Message Templates for your WhatsApp Business API Account](https://www.facebook.com/business/help/2055875911147364) for more detailed steps for creating message templates.

#### Examples

Creating a welcome message where the message template name is `welcome` and the message is

  "Welcome {{1}}. We look forward to serving you on WhatsApp."

Creating an order confirmation message where the message template name is `order_confirmation` and the message is

  "Your order {{1}} for a total of {{2}} is confirmed. The expected delivery is {{3}}."

### Translations

WhatsApp does not do any translations for your business. All message template translations must be entered by you in same format described here. The element name is the same for all translations. For more information, see:

-   [Translations](https://developers.facebook.com/docs/whatsapp/api/messages/message-templates#translations)
-   [Supported languages](https://developers.facebook.com/docs/whatsapp/api/messages/message-templates#supported-languages)

[](https://developers.facebook.com/docs/whatsapp/message-templates/creation#)

Step 2: Make `POST` Request to `/messages`
------------------------------------------

Once you have your template, you can send it to your customers via the `template` object:

POST /v1/messages {  "to":  "*recipient_wa_id*",  "type":  "template",  "template":  {  "namespace":  "*your-namespace*",  "name":  "*your-template-name*",  "language":  {  "code":  "*your-language-and-locale-code*",  "policy":  "deterministic"  },  "components":  [{  "type":  "body",  "parameters":  [  {  "type":  "text",  "text":  "*your-text-string*"  },  {  "type":  "currency",  "currency":  {  "fallback_value":  "$100.99",  "code":  "USD",  "amount_1000":  100990  }  },  {  "type":  "date_time",  "date_time"  :  {  "fallback_value":  "February 25, 1977",  "day_of_week":  5,  "day_of_month":  25,  "year":  1977,  "month":  2,  "hour":  15,  "minute":  33  }  },  {  "type":  "date_time",  "date_time"  :  {  "fallback_value":  "February 25, 1977",  "timestamp":  1485470276  }  }  ]  }]  }  }

Only `URL`, `QUICK_REPLY`, and `PHONE_NUMBER` button types are supported.

If a template contains a button type not on this list, the API will return an error.

### Parameters

-   [Parameters common to all message requests](https://developers.facebook.com/docs/whatsapp/api/messages#parameters)
-   [Parameters for message templates](https://developers.facebook.com/docs/whatsapp/api/messages#message-templates): `template` object, `components` object, `parameters` object, and the `language` object.
-   Language: [Language policy options](https://developers.facebook.com/docs/whatsapp/api/messages/message-templates#language-policy-options), [`language` object](https://developers.facebook.com/docs/whatsapp/api/messages#language), [Localizable parameters](https://developers.facebook.com/docs/whatsapp/api/messages/message-templates#local).

[](https://developers.facebook.com/docs/whatsapp/message-templates/creation#)

Step 3: Check Your API Response
-------------------------------

A successful response includes a `messages` object with an `id`.

{  "messages":  [{  "id":  "gBEGkYiEB1VXAglK1ZEqA1YKPrU"  }]  }

An unsuccessful response contains an error object with an error string, error code and other information. See [Error and Status Codes](https://developers.facebook.com/docs/whatsapp/api/errors) for more information.

[](https://developers.facebook.com/docs/whatsapp/message-templates/creation#)

User preferences for marketing messages
---------------------------------------

Starting November 22, 2024, we will begin gradually rolling out user preferences for marketing messages. This feature may not be available to WhatsApp users in some regions initially.

WhatsApp provides a setting, Offers and announcements, that allows WhatsApp users to indicate their interest level in marketing messages sent from your business, and to stop or resume delivery of marketing messages from your business entirely.

|\
 | ![](https://scontent.fcgh10-1.fna.fbcdn.net/v/t39.2365-6/499661558_686750450817076_8407823728923343264_n.png?_nc_cat=107&ccb=1-7&_nc_sid=e280be&_nc_eui2=AeHnOeWYJVhfbCsT0b53iZX8Ix8z4Ur6iDsjHzPhSvqIO2sSZ2BnBtP8GzKQq2wu81V3ilomOdo6ih2PziQA1Uqv&_nc_ohc=1ZnoH1bSMI8Q7kNvwECPVfP&_nc_oc=Adn2_D-iQwclngpZvH9gGf4O2hzLqOtHSiv3siCVHC0v8pQMFggsV7adg4vWuR2oNIStHUkutcBo14GGPkwgB6n_&_nc_zt=14&_nc_ht=scontent.fcgh10-1.fna&_nc_gid=LQpGTt_QjdGAveMc0uluow&oh=00_Afb8SjpCgrziv6pml1esrnLJiaPZpYo7uCUBDssL_zNDHQ&oe=68ED2D78) | ![](https://scontent.fcgh10-1.fna.fbcdn.net/v/t39.2365-6/497928479_674388312073388_4498328545588580050_n.png?_nc_cat=104&ccb=1-7&_nc_sid=e280be&_nc_eui2=AeHVsfoqIfB9M3l9jjGlD4VZ_L9CuJwB1ML8v0K4nAHUwuYkmxmLl_0iCtjmtSnwqdpIbDod-JjmkH2bnt6-lmhS&_nc_ohc=2bYLMrp8bycQ7kNvwFfCVms&_nc_oc=AdnQi-LkpFoszK56DDsNaDoEWfGdPbil3HKCG8qR5grwQ6wILPo_2NUXWVxzyILgVv6QbcJzGjE_kUSnAkBGZGfY&_nc_zt=14&_nc_ht=scontent.fcgh10-1.fna&_nc_gid=LQpGTt_QjdGAveMc0uluow&oh=00_AfahvMAIU0DuoZIFdkPTk5HvhIdO0X3cnTdVnqncSn8n7g&oe=68ED22CD) |  |

### Interested/Not Interested feedback

WhatsApp users can use the setting to indicate how interested they are in receiving marketing template messages from your business.

If a user chooses Not interested, it can affect [per-user marketing template messaging limits](https://developers.facebook.com/docs/whatsapp/message-templates/creation#per-user-marketing-template-message-limits) between you and the user. Choosing this option also displays the second modal, which gives the user the option to stop delivery of marketing messages from your business.

### Stop/Resume controls

WhatsApp users can use the setting to stop or resume delivery of marketing template messages from your business using the Stop and Resume buttons in the Offers and announcements overlay.

If you attempt to send a marketing template to a WhatsApp user who has stopped marketing template messages from your business, the API will process the request but not send the message. Instead, the API will trigger a message webhook with (error) `code` set to `498`:

{
  "statuses": [
    {
      "errors": [
        {
          "code": 498,
          "href": "https://developers.facebook.com/docs/whatsapp/api/errors/",
          "title": "Unable to deliver the message. This recipient has chosen to stop receiving marketing messages on WhatsApp from your business"
        }
      ],
      "id": "<WHATSAPP_MESSAGE_ID>",
      "message": {
        "recipient_id": "<WHATSAPP_USER_PHONE_NUMBER>"
      },
      "status": "failed",
      "timestamp": <WEBHOOK_SENT_TIMESTAMP>,
      "type": "message"
    }
  ]
}

To be notified whenever a WhatsApp user stops or resumes delivery of marketing template messages from your business, subscribe to the [user_preferences webhook](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/user_preferences).

[](https://developers.facebook.com/docs/whatsapp/message-templates/creation#)

Per-User Marketing Template Message Limits
------------------------------------------

Starting April 1, 2025, we will temporarily pause delivery of all marketing template messages to WhatsApp users who have a United States phone number (a number composed of a +1 dialing code and a US area code). This pause is intended to allow us to focus on building a better consumer experience in the US, which will ultimately lead to improved outcomes for businesses.

Attempting to send a template message to a WhatsApp user with a US phone number after this date will [result in an error](https://developers.facebook.com/docs/whatsapp/message-templates/creation#how-we-notify-via-error-code).

### What is it?

WhatsApp may limit the number of marketing template messages a person receives from any business in a given period of time, starting with delivering fewer marketing conversations to those users who are less likely to engage with them. In most WhatsApp markets, this is determined based on a number of factors, including a dynamic view of an individual's marketing message read rate.

For individuals with United States phone numbers (numbers composed of a +1 dialing code and a US area code), where WhatsApp is growing quickly but at an earlier stage, WhatsApp will not deliver any marketing template messages to focus on building the consumer experience.

### Why it's important

WhatsApp has found that per-user marketing template limits maximize message engagement and improve the user experience, measured through improvements in user read rates and sentiment. This limit helps WhatsApp users find business messaging more valuable and feel less like they receive too many business messages.

### How this Applies to Your Business

The limit only applies to marketing template messages that would normally open a new [marketing conversation](https://developers.facebook.com/docs/whatsapp/pricing). If a marketing conversation is already open between you and a WhatsApp user, you may send one additional marketing template message. Further marketing template messages can only be sent in an open marketing conversation if the person responds to any message.

Example:

-   The first marketing template message is delivered and opens a new 24-hour marketing conversation. The per-user marketing template message limit applies.
-   A second marketing template message can be sent in an existing conversation.
-   Each time the WhatsApp user responds in an existing conversation window, you can send one additional marketing template message. You can also send unlimited non-template messages.

### How We Notify via Error Code

If a marketing template message is not sent due to per-user marketing template limit enforcement, a messages webhook will be triggered with status set to failed and (error) code set to `131049` (for Cloud API) or `1026` (for On-Premises API).

If you do receive this error code and suspect it is due to the limit, avoid immediately resending the template message. Doing so will only result in another error response since the limit may be in effect for differing periods of time. Instead, retry sending the message in increasingly larger time increments until it is delivered.

We will continue to refine our approach, and we appreciate your partnership as we invest in making WhatsApp the best possible experience for your business and your customers.