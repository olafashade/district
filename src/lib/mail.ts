import axios from "axios";

interface IEmailPayload {
  FROM: string;
  EMAIL: string;
  SUBJECT: string;
  REPLY_TO: string;
}


export const sendMail = async (
  template: string,
  parameters: any
) => {
  try {
    const payload = {
      from: {
        address: "no-reply@cipago.com",
        name: "No-Reply",
      },
      to: [
        {
          email_address: {
            address: parameters.EMAIL,
          },
        },
      ],
      subject: parameters.SUBJECT,
      htmlbody: template,
    };

    const response = await axios.post(
      "https://api.zeptomail.com/v1.1/email",
      payload,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Zoho-enczapikey " + process.env.MAIL_PASSWORD,
        },
      }
    );

    if (
      !response.data ||
      !response.data.message ||
      response.data.message !== "OK"
    ) {
      throw new Error("Failed to send email");
    }
    return response.data;
  } catch (error: unknown) {
    console.log(error);
    /*throw new Error(
      error instanceof Error ? error.message : "Failed to send email"
    );*/
  }
};

export const replaceTemplate = (
  template: string,
  parameters: { [key: string]: string }
) => {
  return template.replace(/{{\s*(\w+)\s*}}/g, (match, p1) => {
    return parameters[p1] || "";
  });
};
