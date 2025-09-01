import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const testEmailConfiguration = async () => {
  console.log('🔍 Testing email configuration...');
  console.log('📧 Email User:', process.env.EMAIL_USER);
  console.log('🔐 Email Pass:', process.env.EMAIL_PASS ? '***configured***' : '❌ NOT SET');
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('❌ Email configuration incomplete!');
    console.log('Please set EMAIL_USER and EMAIL_PASS in your .env file');
    return;
  }
  
  if (process.env.EMAIL_PASS === 'your_gmail_app_password_here') {
    console.log('❌ EMAIL_PASS is still set to placeholder value!');
    console.log('Please follow the setup guide in EMAIL_SETUP_GUIDE.md');
    return;
  }
  
  try {
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    
    console.log('🔄 Verifying SMTP connection...');
    
    await transporter.verify();
    console.log('✅ Email server is ready to send messages!');
    
    // Send a test email
    console.log('📤 Sending test email...');
    
    const testMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to self for testing
      subject: '✅ Husk Store Email Test - Configuration Successful',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #16a34a;">🎉 Email Configuration Test Successful!</h2>
          <p>This is a test email to confirm that your Husk Store email service is working correctly.</p>
          <p><strong>Configuration Details:</strong></p>
          <ul>
            <li>Email Service: Gmail</li>
            <li>From Address: ${process.env.EMAIL_USER}</li>
            <li>Test Time: ${new Date().toLocaleString()}</li>
          </ul>
          <p style="color: #059669;">✅ Your contact form should now work properly!</p>
        </div>
      `
    };
    
    await transporter.sendMail(testMailOptions);
    console.log('✅ Test email sent successfully!');
    console.log('📬 Check your inbox:', process.env.EMAIL_USER);
    console.log('🚀 Your contact form is now ready to use!');
    
  } catch (error) {
    console.log('❌ Email configuration test failed!');
    console.log('Error details:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔐 Authentication Error:');
      console.log('- Check if EMAIL_USER is correct');
      console.log('- Verify EMAIL_PASS is a valid Gmail App Password');
      console.log('- Ensure 2-Factor Authentication is enabled on Gmail');
    } else if (error.code === 'ECONNECTION') {
      console.log('\n🌐 Connection Error:');
      console.log('- Check your internet connection');
      console.log('- Verify firewall settings');
      console.log('- Try again in a few minutes');
    } else {
      console.log('\n❓ Unknown Error:');
      console.log('- Check EMAIL_SETUP_GUIDE.md for troubleshooting');
      console.log('- Consider using alternative email service');
    }
  }
};

testEmailConfiguration();