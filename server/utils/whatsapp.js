import twilio from 'twilio';

export const sendWhatsAppOTP = async (phone, otpCode) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioNumber = process.env.TWILIO_WHATSAPP_NUMBER;

  if (!accountSid || !authToken || !twilioNumber) {
    console.error('Twilio credentials missing. TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER must be set.');
    return false;
  }

  try {
    const client = twilio(accountSid, authToken);
    
    // Format phone number. Twilio requires E.164 format (e.g. +1234567890)
    // and whatsapp: prefix for WhatsApp messages.
    let formattedPhone = phone.replace(/[^\d+]/g, '');
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+' + formattedPhone;
    }

    const message = await client.messages.create({
      body: `Your TodoPro login code is: *${otpCode}*\n\nDo not share this code with anyone.`,
      from: twilioNumber.startsWith('whatsapp:') ? twilioNumber : `whatsapp:${twilioNumber}`,
      to: `whatsapp:${formattedPhone}`
    });

    console.log(`WhatsApp OTP sent successfully via Twilio (SID: ${message.sid}) to ${formattedPhone}`);
    return true;
  } catch (error) {
    console.error('Failed to send WhatsApp OTP via Twilio:', error.message);
    return false;
  }
};
