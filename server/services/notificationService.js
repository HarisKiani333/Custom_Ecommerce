import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter for sending emails
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail', // You can change this to other email services
    auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASS, // Your email password or app password
    },
  });
};

// Send rating reminder email
export const sendRatingReminderEmail = async (userEmail, userName, orderId, orderItems) => {
  try {
    const transporter = createTransporter();
    
    // Create product list for email
    const productList = orderItems.map(item => 
      `• ${item.product.name} (Qty: ${item.quantity})`
    ).join('\n');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: '⭐ Rate Your Recent Purchase - Your Feedback Matters!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #16a34a; margin: 0; font-size: 28px;">🛍️ Husk Store</h1>
              <div style="width: 50px; height: 3px; background: linear-gradient(to right, #16a34a, #059669); margin: 10px auto;"></div>
            </div>
            
            <h2 style="color: #374151; margin-bottom: 20px;">Hi ${userName}! 👋</h2>
            
            <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
              We hope you're enjoying your recent purchase! Your order has been delivered, and we'd love to hear about your experience.
            </p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
              <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 18px;">📦 Your Order Items:</h3>
              <div style="color: #6b7280; font-size: 14px; line-height: 1.8;">
                ${productList.replace(/\n/g, '<br>')}
              </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #374151; font-size: 18px; margin-bottom: 20px; font-weight: 600;">
                ⭐ How was your experience?
              </p>
              <p style="color: #6b7280; font-size: 14px; margin-bottom: 25px;">
                Your feedback helps us improve and helps other customers make informed decisions.
              </p>
              
              <a href="${process.env.FRONTEND_URL}/my-orders" 
                 style="display: inline-block; background: linear-gradient(to right, #16a34a, #059669); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(22, 163, 74, 0.3);">
                🌟 Rate Your Order
              </a>
            </div>
            
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 25px 0;">
              <p style="color: #92400e; font-size: 14px; margin: 0; font-weight: 500;">
                💡 <strong>Quick Tip:</strong> Rating takes less than 2 minutes and helps us serve you better!
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                Thank you for choosing Husk Store! 🙏<br>
                If you have any questions, feel free to contact our support team.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Rating reminder email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending rating reminder email:', error);
    return { success: false, error: error.message };
  }
};

// Send SMS notification (placeholder - requires SMS service like Twilio)
export const sendRatingSMS = async (phoneNumber, userName, orderId) => {
  try {
    // This is a placeholder for SMS functionality
    // You would need to integrate with services like Twilio, AWS SNS, etc.
    console.log(`SMS reminder would be sent to ${phoneNumber} for order ${orderId}`);
    
    // Example SMS message:
    const message = `Hi ${userName}! Your order has been delivered. Please rate your experience at ${process.env.FRONTEND_URL}/my-orders. Thank you! - Husk Store`;
    
    // TODO: Implement actual SMS sending logic here
    // const result = await twilioClient.messages.create({
    //   body: message,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: phoneNumber
    // });
    
    return { success: true, message: 'SMS functionality not implemented yet' };
  } catch (error) {
    console.error('Error sending SMS:', error);
    return { success: false, error: error.message };
  }
};

// Schedule notification after order delivery
export const scheduleRatingReminder = async (order, user) => {
  try {
    // Send email notification immediately when order is delivered
    if (user.email) {
      await sendRatingReminderEmail(
        user.email,
        user.name,
        order._id,
        order.items
      );
    }
    
    // Optional: Send SMS if phone number is available
    // if (user.phone) {
    //   await sendRatingSMS(user.phone, user.name, order._id);
    // }
    
    return { success: true, message: 'Rating reminder scheduled successfully' };
  } catch (error) {
    console.error('Error scheduling rating reminder:', error);
    return { success: false, error: error.message };
  }
};