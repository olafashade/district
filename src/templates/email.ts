const emailTemplate = (hasLink: boolean = false) => {
    const linkBlock = hasLink
        ? `
      <p style="font-size:22px; text-align: center; color:#000000">
        <a href="{{LINK}}" target="_blank" style="background: #29335C; font-size:17px; padding:10px; text-decoration: none; width: 150px; margin-bottom:10px; color:#ffffff">
          {{BUTTON}}
        </a>
        <br/><br/> or click <br/><br/> 
        <a href="{{LINK}}" target="_blank" style="color:#000000">{{LINK}}</a>
      </p>
    `
        : '';

    const html = `
        <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Template</title>
      <style>
          body {
              width: 100%;
              margin: 0;
              padding: 20px;
              background-color: #f4f4f4;
              background: #f4f4f4;
              font-family: Arial, sans-serif;
          }
          .container {
              width: 85%;
              margin: 0 auto;
              background-color: #FFFFFF;
              border-radius: 10px;
              overflow: hidden;
          }
          .header {
              padding: 20px;
              background-color: #FFFFFF;
              border-top-left-radius: 10px;
              border-top-right-radius: 10px;
              text-align: left;
          }
          .header img {
              max-width: 150px;
          }
          .body {
              padding: 20px;
          }
          .footer {
              background-color: #EEEEEE;
              padding: 20px;
              text-align: left;
          }
          .footer a {
              color: #f4f4f4;
              text-decoration: none;
              margin-right: 15px;
          }
          .footer p {
              margin: 10px 0;
              text-align: justify;
          }
          .social {
              padding: 10px 0;
              text-align: center;
          }
          .social img {
              max-width: 24px;
              margin-right: 10px;
          }
          .disclaimer {
              font-size: 12px;
              color: #888888;
              padding: 10px 0;
          }
          .disclaimer p {  
              text-align: center;
          }
      </style>
  </head>
  <body style="background: #f4f4f4; padding:20px;">
      <div class="container" style="margin-top: 20px; margin-bottom: 20px; padding: 10px">
          <!-- Header Section -->

          <div class="header" style="min-height: 100px; border-radius:5px; width: 95%; background: #f4f4f4; margin: 10px auto; display: flex; align-items: center; padding-left: 20px;">
             <img src="" alt="Logo" style="height: auto; width:100px">
          </div>
  
          <!-- Email Body Section -->
          <div class="body" style="min-height: 400px">
              <p> <h2 style="color: #333333; font-size:22px">{{GREETING}}</h2> </p>
              <p style="font-size:22px; color:#000000">{{INTRO}}<br></p>
              <p style="font-size: 20px; color:#000000; margin-top: 20px"><br>{{MESSAGE}}<br></p>
              ${linkBlock}
          </div>
  
          <!-- Footer Section -->
          <div class="footer">
          <p style="text-align:center; color: #000000">
             
          </p>
              <p>Thattruck product descritpion</p>
              <!-- Social Media Links -->
              <div class="social">
                 <a href="https://web.facebook.com/"><img src="/facebook.svg" alt="Facebook"></a>
                 <a href="https://www.linkedin.com/company"><img src="/linkedin.svg" alt="LinkedIn"></a>
              </div>
  
              <!-- Disclaimer -->
              <div class="disclaimer">
                  <p><a href="" style="color: #000000">Unsubscribe</a> from emails </p>
              </div>
          </div>
      </div>
  </body>
  </html>`;
    return html;
};
export default emailTemplate;
