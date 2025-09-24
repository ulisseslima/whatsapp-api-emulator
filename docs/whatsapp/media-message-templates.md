https://developers.facebook.com/docs/whatsapp/api/messages/message-templates/media-message-templates

Sending Media Message Templates
===============================

Media message templates expand the content you can send recipients beyond the standard message template type to include media and headers using a [`components`](https://developers.facebook.com/docs/whatsapp/api/messages#components-object) object. The `components` object allows you to indicate the `type` of message and the message's [`parameters`](https://developers.facebook.com/docs/whatsapp/api/messages#parameters-object).

| ![](https://scontent.fcgh10-1.fna.fbcdn.net/v/t39.8562-6/209854430_959027884931338_1012831529328773737_n.png?_nc_cat=102&ccb=1-7&_nc_sid=f537c7&_nc_eui2=AeHIPzGpWGa3AWl3gd0U737oIRJ4eG0wq4EhEnh4bTCrgSdolEd1gyIYenJlfRz6HNk7MQ3mBA-8TRPMYX_fd2zn&_nc_ohc=9WzGLuGp8vsQ7kNvwFqTTn0&_nc_oc=AdmPbk0mbWI0L9XavFFT8adATTpex9_8FsxFEjkW2Bdapg6mu2iCfPbLPC3o0yeI9UzaRasRvo8LnU_a1ArjzwdK&_nc_zt=14&_nc_ht=scontent.fcgh10-1.fna&_nc_gid=UCO6oY-JQlyhHY01eqx0oA&oh=00_Afa-lwcdy3ZDDyzcQcDeTW10j_HPRh2T_1qOuJH_BaLyzw&oe=68D8C485) | ![](https://scontent.fcgh10-2.fna.fbcdn.net/v/t39.8562-6/207199434_988368091926276_8069423785945816495_n.png?_nc_cat=109&ccb=1-7&_nc_sid=f537c7&_nc_eui2=AeEH6duT24gRPBO8dqPu8gIWMHdDqD-bC24wd0OoP5sLblbxGIb7BLEqHGldTQlKLq9NylIYyqatLHaWmSNYbVn5&_nc_ohc=El5l0ZGuCCYQ7kNvwFzHYrC&_nc_oc=Adm08l8d-nwOZ83ZhwvfphUVmy3CPUl_WQlNbf3BUHWX0ZdefZlXdLVlYav3uugmTLejX_Ms3FHJr5YY_p1g313b&_nc_zt=14&_nc_ht=scontent.fcgh10-2.fna&_nc_gid=UCO6oY-JQlyhHY01eqx0oA&oh=00_AfZqd_hREoK9kyypnzzEufBjVsOqJPymotYfaNckGWNtAw&oe=68D8D3C4) | ![](https://scontent.fcgh10-1.fna.fbcdn.net/v/t39.8562-6/205290769_495206708206355_7988779314430292956_n.png?_nc_cat=111&ccb=1-7&_nc_sid=f537c7&_nc_eui2=AeFSG89rSAMdhSDZe9JbYAfWl-x09LyqIu6X7HT0vKoi7nMu1GJCFwUF68MT2YcUuY07LGNYmPoBbUqDjxzlLso7&_nc_ohc=JNYRMBc1foAQ7kNvwFP0gdG&_nc_oc=AdlZn57VFb0I1-OahY-jedlT0qp9OHVAPWN1Chkv1pQvv3_1sP3RXKBCeryq91lKnUgtK8apxEKVrnLjujhMA5mN&_nc_zt=14&_nc_ht=scontent.fcgh10-1.fna&_nc_gid=UCO6oY-JQlyhHY01eqx0oA&oh=00_AfYUUJRsM9lo9400pNtiO5CRP3VVXUo6wgK4kNDb614iEA&oe=68D8D2BF) |

[](https://developers.facebook.com/docs/whatsapp/api/messages/message-templates/media-message-templates#)

Step 1: Make `POST` Request to [`/messages`](https://developers.facebook.com/docs/whatsapp/api/messages)
--------------------------------------------------------------------------------------------------------

POST /v1/messages {  "to":  "*recipient_wa_id*",  "type":  "template",  "template":  {  "namespace":  "*your-namespace*",  "language":  {  "policy":  "deterministic",  "code":  "*your-language-and-locale-code*"  },  "name":  "*your-template-name*",  "components":  [  {  "type"  :  "header",  "parameters":  [  # The following parameters code example includes several different possible header types,  # not all are required for a media message template API call.  {  "type":  "text",  "text":  "replacement_text"  }  # OR  {  "type":  "document",  "document":  {  "id":  "*your-media-id*",  # filename is an optional parameter  "filename":  "*your-document-filename*"  }  }  # OR  {  "type":  "document",  "document":  {  "link":  "*the-provider-name/protocol*://*the-url*",  # provider and filename are optional parameters  "provider":  {  "name"  :  "*provider-name*"  },  "filename":  "*your-document-filename*"  }  }  # OR  {  "type":  "video",  "video":  {  "id":  "*your-media-id*"  }  }  # OR  {  "type":  "video",  "video":  {  "link":  "*the-provider-name/protocol*://*the-url*"  # provider is an optional parameter  "provider":  {  "name"  :  "*provider-name*"  }  }  }  # OR  {  "type":  "image",  "image":  {  "link":  "http(s)://*the-url*",  # provider is an optional parameter  "provider":  {  "name"  :  "*provider-name*"  },  }  }  ]  # end header  },  {  "type"  :  "body",  "parameters":  [  {  "type":  "text",  "text":  "replacement_text"  },  {  "type":  "currency",  "currency"  :  {  "fallback_value":  "$100.99",  "code":  "USD",  "amount_1000":  100990  }  },  {  "type":  "date_time",  "date_time"  :  {  "fallback_value":  "February 25, 1977",  "day_of_week":  5,  "day_of_month":  25,  "year":  1977,  "month":  2,  "hour":  15,  "minute":  33,  #OR  "timestamp":  1485470276  }  },  {  ...  # Any additional template parameters  }  ]  # end body  },  ]  }  }

### Parameters

-   [Parameters common to all message requests](https://developers.facebook.com/docs/whatsapp/api/messages#parameters)
-   [Parameters for message templates](https://developers.facebook.com/docs/whatsapp/api/messages#message-templates)

### Media Format Recommendation

-   Images taller than 1.91:1 aspect ratio are cropped vertically. To communicate the crux in such images, plan to present the most important information at the center of the image.

[](https://developers.facebook.com/docs/whatsapp/api/messages/message-templates/media-message-templates#)

Step 2: Check the API Response
------------------------------

A successful response includes a `messages` object with an `id`.

{  "messages":  [{  "id":  "gBEGkYiEB1VXAglK1ZEqA1YKPrU"  }]  }

An unsuccessful response contains an error object with an error string, error code and other information.

If a template is sent to an account that is incapable of receiving the template, the `1026 (ReceiverIncapable)` error will be sent in the error object to the configured Webhook server.

See [Error and Status Codes](https://developers.facebook.com/docs/whatsapp/api/errors) for more information on errors.

[](https://developers.facebook.com/docs/whatsapp/api/messages/message-templates/media-message-templates#)

Examples
--------

These examples demonstrate the process of setting up media message templates beginning with the template creation in your Business Manager and sending the message templates with API calls to the `messages` endpoint.

These examples are for illustrative purposes only and cannot be used. You must create your own samples and have them approved in order to test the media message template functionality.

### Movie ticket example

This example show the creation of a media message template with a QR code image.

#### 1\. Create the media message template in your Business Manager.

![](https://scontent.fcgh10-2.fna.fbcdn.net/v/t39.2365-6/77773705_547937049364225_6258536858087587840_n.png?_nc_cat=109&ccb=1-7&_nc_sid=e280be&_nc_eui2=AeEey86k3yQtL5f-wXmiLJAKkDxcr_BVTF-QPFyv8FVMX84bMb0Ln7s4Gwn513pb9S_ZmK5dMvVxyqRYtLjokCt7&_nc_ohc=eMt74TUnnA0Q7kNvwHcdfPL&_nc_oc=AdmSbVEEaQhDMyfOLrdFFxQj3cxqLco_VtcnMsZU5pW0pHwUEkzE3an-iY-CPZuRN-uNa9LCVUwYkevXP7x__0AH&_nc_zt=14&_nc_ht=scontent.fcgh10-2.fna&_nc_gid=UCO6oY-JQlyhHY01eqx0oA&oh=00_AfbqW8Prao9BMrr5iB41qHADp95zf_f3sgOozntEPWyC1Q&oe=68ED250B)

Business Manager message template creation

#### 2\. The `messages` API call adds in the parameter information.

POST /v1/messages {  "to":  "*your-test-recipient-wa-id*",  "recipient_type":  "individual",  "type":  "template",  "template":  {  "namespace":  "88b39973_f0d5_54e1_29cf_e80f1e3da4f2",  "name":  "movie_ticket_update",  "language":  {  "code":  "en",  "policy":  "deterministic"  },  "components":  [  {  "type":  "header",  "parameters":  [  {  "type":  "image",  "image":  {  "id":  "*your-image-id*"  }  }  ]  },  {  "type":  "body",  "parameters":  [  {  "type":  "text",  "text":  "Star Rangers"  },  {  "type":  "date_time",  "date_time"  :  {  "fallback_value":  "May 1st, 2019 8:45pm",  "day_of_month":  20,  "year":  2019,  "month":  9,  "hour":  20,  "minute":  45  }  },  {  "type":  "text",  "text":  "Carnival, Sangam"  },  {  "type":  "text",  "text":  "Silver"  },  {  "type":  "text",  "text":  "F6, F7, F8"  }  ]  }  ]  }  }

#### 3\. Your customer receives their movie ticket message.

![](https://scontent.fcgh10-1.fna.fbcdn.net/v/t39.2365-6/70129256_415817289048977_6233957271353688064_n.png?_nc_cat=107&ccb=1-7&_nc_sid=e280be&_nc_eui2=AeGlOSNv9rBS50nvTeC2BHqy2t7OjdOxjMXa3s6N07GMxfE-vpOZragmLSR8-WFwGkkTvaJS_ko4glL_uQOy8FFA&_nc_ohc=GkdR-GHIZMEQ7kNvwHhZ0ls&_nc_oc=Adl8BnYdEdTNB3s_nqIFtkcFtfnNb5qJ1-z9jFb-nH3ExD3ngX8ixGO4fxzQnoBoIQA-VVBcdDDZC62cEHzf3DgX&_nc_zt=14&_nc_ht=scontent.fcgh10-1.fna&_nc_gid=UCO6oY-JQlyhHY01eqx0oA&oh=00_AfY7SjKU3iG8bhExT_cIVh8wTC1An8hVh133Gv12-cYVHA&oe=68ED1DAA)

Movie Ticket Message

### Flight ticket example

This example show the creation of a media message template with a PDF document.

#### 1\. Create the media message template in your Business Manager.

![](https://scontent.fcgh10-2.fna.fbcdn.net/v/t39.2365-6/77782367_798102473959182_7671110249796861952_n.png?_nc_cat=105&ccb=1-7&_nc_sid=e280be&_nc_eui2=AeEj1ase8et5w7B0M34qwgW85UdIyDWn-L7lR0jINaf4vll1YxNHG090p23OICmEBUhZ_od2D7GB0pPK9pqI4_Wl&_nc_ohc=6krXEeDPoPkQ7kNvwGk1enu&_nc_oc=AdlqcyQg47hJcnhFxwWJC1n0hRxlCXDzHRlxuolCSB61UnPI8v5jYmkD_4HKjuUUpgLX8OoYeIpWV68VI4obdTf0&_nc_zt=14&_nc_ht=scontent.fcgh10-2.fna&_nc_gid=UCO6oY-JQlyhHY01eqx0oA&oh=00_AfarBstH-aWp8CTEalyW5H0kmnFWCaosVCupJB9lAkqaCA&oe=68ED2553)

Business Manager message template creation

#### 2\. The `messages` API call adds in the parameter information.

POST /v1/messages {  "to":  "*your-test-recipient-wa-id*",  "recipient_type":  "individual",  "type":  "template",  "template":  {  "namespace":  "88b39973_f0d5_54e1_29cf_e80f1e3da4f2",  "name":  "flight_confirmation",  "language":  {  "code":  "en",  "policy":  "deterministic"  },  "components":  [  {  "type":  "header",  "parameters":  [  {  "type":  "document",  "document":  {  "filename":  "MRRATH-CGK-KUL.pdf",  "link":  "*link-to-your-document*"  }  }  ]  },  {  "type":  "body",  "parameters":  [  {  "type":  "text",  "text":  "CGK (Jakarta)"  },  {  "type":  "text",  "text":  "KUL (Kuala Lumpur)"  },  {  "type":  "date_time",  "date_time"  :  {  "fallback_value":  "20th April 2019, 12:20pm",  "day_of_month":  20,  "year":  2019,  "month":  9,  "hour":  12,  "minute":  10  }  }  ]  }  ]  }  }

#### 3\. Your customer receives their boarding pass in a PDF document.

![](https://scontent.fcgh10-1.fna.fbcdn.net/v/t39.2365-6/70137244_1157828557742271_5964907703749836800_n.png?_nc_cat=111&ccb=1-7&_nc_sid=e280be&_nc_eui2=AeGWLTlGBVp1LyRmqJ655fCkWsv9IdnbvMxay_0h2du8zETFEzVjGP4na-W_RUsSdHGkIzIwDpxPV5_czXyQWQ_t&_nc_ohc=g1DV-FifwF4Q7kNvwEof3tY&_nc_oc=Adk-lYZimAheE0YpfXIqc3Zsb-vD2wtprM6x7SmqH6kgR2n1WuSzHhUxhpOAd2jIytxo4SiZ-jt8NB3YIs385xIc&_nc_zt=14&_nc_ht=scontent.fcgh10-1.fna&_nc_gid=UCO6oY-JQlyhHY01eqx0oA&oh=00_AfbFH1Zh1cjvM0004HXzwQHZxgVHPNDTLCXirS6GzPuiOw&oe=68ED3CC4)