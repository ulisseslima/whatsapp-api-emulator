https://developers.facebook.com/docs/whatsapp/api/messages/message-templates/interactive-message-templates/

Sending Interactive Message Templates
=====================================

Interactive message templates expand the content you can send recipients beyond the standard message template and media messages template types to include interactive buttons using the [`components`](https://developers.facebook.com/docs/whatsapp/api/messages#components-object) object.

There are two types of predefined buttons offered:

-   Call-to-Action --- Allows your customer to call a phone number and visit a website
-   Quick Reply --- Allows your customer to return a simple text message

These buttons can be attached to text messages or media messages. Once your interactive message templates have been created and approved, you can use them in notification messages as well as customer service/care messages.

[](https://developers.facebook.com/docs/whatsapp/api/messages/message-templates/interactive-message-templates/#)

Before You Start
----------------

You need to:

-   Meet all the prerequisites listed in the [Before You Start section](https://developers.facebook.com/docs/whatsapp/api/messages#before-you-start) of the [Messages documentation](https://developers.facebook.com/docs/whatsapp/api/messages).
-   Have [created an interactive message template on Business Manager](https://developers.facebook.com/docs/whatsapp/message-templates/creation#step-1--create-template-using-the-whatsapp-manager). You can either add a call-to-action button or a quick reply button.

Once the message template is approved, you can use the API to send a message.

### Constraints

-   For call-to-action templates, you can add 2 buttons, up to one button of each type (call phone number and visit website).
-   For quick reply templates, you can add up to 3 buttons.

[](https://developers.facebook.com/docs/whatsapp/api/messages/message-templates/interactive-message-templates/#)

Step 1: Make `POST` Request to [`/messages`](https://developers.facebook.com/docs/whatsapp/api/messages)
--------------------------------------------------------------------------------------------------------

POST /v1/messages {  "to":  "*recipient_wa_id*",  "type":  "template",  "template":  {  "namespace":  "*your-namespace*",  "language":  {  "policy":  "deterministic",  "code":  "*your-language-and-locale-code*"  },  "name":  "*your-template-name*",  "components":  [  {  "type"  :  "header",  "parameters":  [  {  "type":  "text",  "text":  "replacement_text"  }  ]  # end header  },  {  "type"  :  "body",  "parameters":  [  {  "type":  "text",  "text":  "replacement_text"  },  {  "type":  "currency",  "currency"  :  {  "fallback_value":  "$100.99",  "code":  "USD",  "amount_1000":  100990  }  },  {  "type":  "date_time",  "date_time"  :  {  "fallback_value":  "February 25, 1977",  "day_of_week":  5,  "day_of_month":  25,  "year":  1977,  "month":  2,  "hour":  15,  "minute":  33,  #OR  "timestamp":  1485470276  }  },  {  ...  # Any additional template parameters  }  ]  # end body  },  # The following part of this code example includes several possible button types,  # not all are required for an interactive message template API call.  {  "type":  "button",  "sub_type"  :  "quick_reply",  "index":  "0",  "parameters":  [  {  "type":  "payload",  # Business Developer-defined payload  "payload":"aGlzIHRoaXMgaXMgY29vZHNhc2phZHdpcXdlMGZoIGFTIEZISUQgV1FEV0RT"  }  ]  },  {  "type":  "button",  "sub_type"  :  "url",  "index":  "1",  "parameters":  [  {  "type":  "text",  # Business Developer-defined dynamic URL suffix  "text":  "9rwnB8RbYmPF5t2Mn09x4h"  }  ]  },  {  "type":  "button",  "sub_type"  :  "url",  "index":  "2",  "parameters":  [  {  "type":  "text",  # Business Developer-defined dynamic URL suffix  "text":  "ticket.pdf"  }  ]  }  ]  }  }

### Parameters

-   [Parameters common to all message requests](https://developers.facebook.com/docs/whatsapp/api/messages#parameters)
-   [Parameters for message templates](https://developers.facebook.com/docs/whatsapp/api/messages#message-templates):
    -   [`template` object](https://developers.facebook.com/docs/whatsapp/api/messages#template-object)
    -   [`components` object](https://developers.facebook.com/docs/whatsapp/api/messages#components-object): for interactive message templates, include the [`button` type](https://developers.facebook.com/docs/whatsapp/api/messages#buttons) and the `sub_type` field
    -   [`parameters` object](https://developers.facebook.com/docs/whatsapp/api/messages#parameters-object)

[](https://developers.facebook.com/docs/whatsapp/api/messages/message-templates/interactive-message-templates/#)

Step 2: Check Your API Response
-------------------------------

A successful response includes a `messages` object with an `id`.

{  "messages":  [{  "id":  "gBEGkYiEB1VXAglK1ZEqA1YKPrU"  }]  }

An unsuccessful response contains an error object with an error string, error code and other information.

If a template is sent to an account that is incapable of receiving the template, the `1026 (ReceiverIncapable)` error will be sent in the error object to the configured Webhook server.

See [Error and Status Codes](https://developers.facebook.com/docs/whatsapp/api/errors) for more information on errors.

[](https://developers.facebook.com/docs/whatsapp/api/messages/message-templates/interactive-message-templates/#)

Optional Step 3: Handle User Action
-----------------------------------

When a user clicks a quick reply button, a responjse is sent back to the business. See [Callback from a Quick Reply Button Click](https://developers.facebook.com/docs/whatsapp/api/messages/message-templates/interactive-message-templates/#callback-from-a-quick-reply-button-click) for information. Users can also choose to not click the button and just send you a free form message.

### Callback from a Quick Reply Button Click

When your customer clicks on a quick reply button, a response is sent. Below is an example of the callback format. Note: A customer may not click a button and either reply to the interactive template message or just send you a message. Make sure that you are able to support this type of scenario as well. See the [Webhooks documentation](https://developers.facebook.com/docs/whatsapp/api/webhooks) for more information.

{  "contacts":  [  {  "profile":  {  "name":  "Kerry Fisher"  },  "wa_id":  "16505551234"  }  ],  "messages":  [  {  "button":  {  "payload":  "No-Button-Payload",  "text":  "No"  },  "context":  {  "from":  "16315558007",  "id":  "gBGGFmkiWVVPAgkgQkwi7IORac0"  },  "from":  "16505551234",  "id":  "ABGGFmkiWVVPAgo-sKD87hgxPHdF",  "timestamp":  "1591210827",  "type":  "button"  }  ]  # If there are any errors, an errors field (array) will be present  "errors":  [  {  ...  }  ]  }

[](https://developers.facebook.com/docs/whatsapp/api/messages/message-templates/interactive-message-templates/#)

Examples
--------

These examples illustrate the process of setting up interactive message templates beginning with the template creation in your Business Manager and sending the message templates with API calls to the `messages` endpoint.

### Trip Reminder

This example shows the creation of an interactive media message template with quick reply buttons.

#### 1\. Create the interactive media message template in your Business Manager.

![](https://scontent.fcgh10-2.fna.fbcdn.net/v/t39.2365-6/69992761_2422053444581036_9156860843323817984_n.png?_nc_cat=103&ccb=1-7&_nc_sid=e280be&_nc_eui2=AeGg0qgrfDBReoiKjCw2FAZ2gg1RcLwhnn-CDVFwvCGef81nhAj-DlivY-Xilmaqp8RzwMr33CFEpYPQoI2gc6ob&_nc_ohc=ilc25jzBCGMQ7kNvwGFVQa9&_nc_oc=AdmlKsTPGJ_yMj0KKiaQCImWWFLA6Bn-RBTKT6wqQy9TrMCgkdfjlFUxS9lkaU12LNLfwfrRvyEcAUgkFgayo9p9&_nc_zt=14&_nc_ht=scontent.fcgh10-2.fna&_nc_gid=gCYmDPcbr_p3aoon5mKMnQ&oh=00_AfYG9K2qXmUJrVu3M-UFNvq1JgomBGrWvgPPdwdX73zTzg&oe=68ED1333)

#### 2\. The `messages` API call adds in the parameter information.

POST /v1/messages {  "to":  "*your-test-recipient-wa-id*",  "recipient_type":  "individual",  "type":  "template",  "template":  {  "namespace":  "88b39973_f0d5_54e1_29cf_e80f1e3da4f2",  "name":  "upcoming_trip_reminder",  "language":  {  "code":  "en",  "policy":  "deterministic"  },  "components":  [  {  "type":  "header",  "parameters":  [  {  "type":  "text",  "text":  "12/26"  }  ]  },  {  "type":  "body",  "parameters":  [  {  "type":  "text",  "text":  "*Ski Trip*"  },  {  "type":  "date_time",  "date_time"  :  {  "fallback_value":  "29th July 2019, 8:00am",  "day_of_month":  "29",  "year":  "2019",  "month":  "7",  "hour":  "8",  "minute":  "00"  }  },  {  "type":  "text",  "text":  "*Squaw Valley Ski Resort, Tahoe*"  }  ]  },  {  "type":  "button",  "sub_type":  "quick_reply",  "index":  0,  "parameters":  [  {  "type":  "payload",  "payload":  "Yes-Button-Payload"  }  ]  },  {  "type":  "button",  "sub_type":  "quick_reply",  "index":  1,  "parameters":  [  {  "type":  "payload",  "payload":  "No-Button-Payload"  }  ]  }  ]  }  }

#### 3\. Your customer receives their trip reminder message with quick reply buttons.

![](https://scontent.fcgh10-1.fna.fbcdn.net/v/t39.2365-6/70313288_3542556432436756_2429364280076795904_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=e280be&_nc_eui2=AeFZ7IJnHahtXpuBUovXlRdx841A3d08Ag_zjUDd3TwCD8jqBN7cdFzxWWrwat5b3na3KxcuetBinTIRpJwrnoRN&_nc_ohc=cE5ntJ90LtIQ7kNvwH1CrEG&_nc_oc=AdlDCgaRa7Uh2_DBE1Qxf6Uh6-SNFuB-1lsFGRo7tuq_SMNx99xEq9Ea6CfhKHdzC0GU9ozwV7TSfazzMeVIgygi&_nc_zt=14&_nc_ht=scontent.fcgh10-1.fna&_nc_gid=gCYmDPcbr_p3aoon5mKMnQ&oh=00_AfaAi-JLkYl5qUgMz7efgEs_ZQWM-gGGOcxv9onKleheAA&oe=68ED3BAF)

### Product Shipment

This example show the creation of an interactive media message template with URL and phone number buttons.

#### 1\. Create the interactive media message template in your Business Manager:

![](https://scontent.fcgh10-1.fna.fbcdn.net/v/t39.8562-6/252732350_432139204978673_6191776179934970667_n.png?_nc_cat=104&ccb=1-7&_nc_sid=f537c7&_nc_eui2=AeFXQBivoLh9hXQ3Zhy5nD1_CYXL82XNdm0JhcvzZc12bRHB5GjE_0HySqZ8N9sHPUoDfCaB2yfuXzqDiQUQN-0o&_nc_ohc=evLZqYgkULUQ7kNvwHnn1sY&_nc_oc=AdnEgOPLRtFh6B96G40eTPB07Zap1AElPM_8GMqTDcci_sgiF4xm5lE4XAoiO1Tk85VbWlCkcZWkW4Fpeuv6IUI0&_nc_zt=14&_nc_ht=scontent.fcgh10-1.fna&_nc_gid=gCYmDPcbr_p3aoon5mKMnQ&oh=00_Afb0T2iBpkZheUyA1Y2yAGELHBlUs5ktgo4y0YN9mIpYWg&oe=68D8CF8A)

#### 2\. The `messages` API call adds in the parameter information.

POST /v1/messages {  "to":  "*your-test-recipient-wa-id*",  "recipient_type":  "individual",  "type":  "template",  "template":  {  "namespace":  "88b39973_f0d5_54e1_29cf_e80f1e3da4f2",  "name":  "oculus_shipment_update",  "language":  {  "code":  "en",  "policy":  "deterministic"  },  "components":  [  {  "type":  "header",  "parameters":  [{  "type":  "image",  "image":  {  "link":  "*link-to-your-image*"  }  }]  },  {  "type":  "body",  "parameters":  [  {  "type":  "text",  "text":  "Anand"  },  {  "type":  "text",  "text":  "Quest"  },  {  "type":  "text",  "text":  "113-0921387"  },  {  "type":  "date_time",  "date_time"  :  {  "fallback_value":  "23rd Nov 2019",  "day_of_month":  "20",  "year":  "2019",  "month":  "9"  }  }  ]  },  {  "type":  "button",  "index":  "0",  "sub_type":  "url",  "parameters":  [  {  "type":  "text",  "text":  "1Z999AA10123456784"  }  ]  }  ]  }  }

#### 3\. Your customer receives their product shipment message with URL and phone call buttons:

![](https://scontent.fcgh10-2.fna.fbcdn.net/v/t39.2365-6/70110077_2418689288410121_928570447631482880_n.png?_nc_cat=105&ccb=1-7&_nc_sid=e280be&_nc_eui2=AeFZ0bQIRWGSrOHd24ZMQc23wbPvQlc52oHBs-9CVznagY35Hur_mwSd2EgbZDuGMXcMfWJlAiUkx0zGymOayfj4&_nc_ohc=LXJy0tK16_8Q7kNvwHsesEF&_nc_oc=AdmjzbtfthZf35YkPFB-TgpP0WKfSVnYQeQczeVhyNqpkZ3H-OPoWQB9kvNBSvhLcuO6xJ4GvshoX6rP2TRmxwU5&_nc_zt=14&_nc_ht=scontent.fcgh10-2.fna&_nc_gid=gCYmDPcbr_p3aoon5mKMnQ&oh=00_AfYkkvmPyJPpLT5cbl_gq3jkBhRKDBeWbQvGXZTmT-joog&oe=68ED2C5E)