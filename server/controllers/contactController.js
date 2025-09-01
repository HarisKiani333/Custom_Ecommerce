import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter for sending emails
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Submit contact form
export const submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Check if email configuration is properly set
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Email configuration missing: EMAIL_USER or EMAIL_PASS not set');
      return res.status(503).json({
        success: false,
        message: 'Email service is currently unavailable. Please try again later or contact us directly.',
        error: 'EMAIL_CONFIG_MISSING'
      });
    }

    if (process.env.EMAIL_PASS === 'your_gmail_app_password_here') {
      console.error('Email configuration incomplete: EMAIL_PASS is still placeholder');
      return res.status(503).json({
        success: false,
        message: 'Email service is currently being configured. Please try again later or contact us directly.',
        error: 'EMAIL_CONFIG_INCOMPLETE'
      });
    }

    const transporter = createTransporter();

    // Email to admin (Hariskiani333@gmail.com)
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: 'Hariskiani333@gmail.com',
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #16a34a; margin: 0; font-size: 28px;">🛍️ Husk Store</h1>
              <div style="width: 50px; height: 3px; background: linear-gradient(to right, #16a34a, #059669); margin: 10px auto;"></div>
            </div>
            
            <h2 style="color: #374151; margin-bottom: 20px;">New Contact Form Submission</h2>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 0 0 10px 0; color: #374151;"><strong>Name:</strong> ${name}</p>
              <p style="margin: 0 0 10px 0; color: #374151;"><strong>Email:</strong> ${email}</p>
              ${phone ? `<p style="margin: 0 0 10px 0; color: #374151;"><strong>Phone:</strong> ${phone}</p>` : ''}
            </div>
            
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #16a34a;">
              <h3 style="color: #374151; margin: 0 0 15px 0;">Message:</h3>
              <p style="color: #6b7280; line-height: 1.6; margin: 0;">${message}</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 14px; margin: 0;">This message was sent from the Husk Store contact form.</p>
            </div>
          </div>
        </div>
      `
    };

    // Confirmation email to user
    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Thank you for contacting Husk Store!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #16a34a; margin: 0; font-size: 28px;">🛍️ Husk Store</h1>
              <div style="width: 50px; height: 3px; background: linear-gradient(to right, #16a34a, #059669); margin: 10px auto;"></div>
            </div>
            
            <h2 style="color: #374151; margin-bottom: 20px;">Thank you for reaching out! 👋</h2>
            
            <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
              Hi ${name},
            </p>
            
            <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
              We've received your message and appreciate you taking the time to contact us. Our team will review your inquiry and get back to you as soon as possible.
            </p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
              <h3 style="color: #374151; margin: 0 0 15px 0;">Your Message Summary:</h3>
              ${phone ? `<p style="margin: 0 0 10px 0; color: #374151;"><strong>Phone:</strong> ${phone}</p>` : ''}
              <p style="margin: 0; color: #6b7280; font-style: italic;">"${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"</p>
            </div>
            
            <div style="text-align: center; margin-bottom: 25px;">
              <a href="http://localhost:5173" style="display: inline-block; background: linear-gradient(135deg, #16a34a, #059669); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; transition: transform 0.2s;">Continue Shopping</a>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 14px; margin: 0;">Best regards,<br>The Husk Store Team</p>
            </div>
          </div>
        </div>
      `
    };

    // Send both emails
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(userMailOptions);

    res.status(200).json({
      success: true,
      message: 'Message sent successfully! We\'ll get back to you soon.'
    });

  } catch (error) {
    console.error('Error sending contact form email:', error);
    
    // Provide more specific error messages based on error type
    if (error.code === 'EAUTH') {
      return res.status(503).json({
        success: false,
        message: 'Email authentication failed. Please contact us directly or try again later.',
        error: 'EMAIL_AUTH_FAILED'
      });
    }
    
    if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      return res.status(503).json({
        success: false,
        message: 'Unable to connect to email service. Please try again later.',
        error: 'EMAIL_CONNECTION_FAILED'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later or contact us directly.',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Newsletter subscription
export const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Check if email configuration is properly set
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Email configuration missing: EMAIL_USER or EMAIL_PASS not set');
      return res.status(503).json({
        success: false,
        message: 'Newsletter service is currently unavailable. Please try again later.',
        error: 'EMAIL_CONFIG_MISSING'
      });
    }

    if (process.env.EMAIL_PASS === 'your_gmail_app_password_here') {
      console.error('Email configuration incomplete: EMAIL_PASS is still placeholder');
      return res.status(503).json({
        success: false,
        message: 'Newsletter service is currently being configured. Please try again later.',
        error: 'EMAIL_CONFIG_INCOMPLETE'
      });
    }

    const transporter = createTransporter();

    // Email to admin (Hariskiani333@gmail.com)
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: 'Hariskiani333@gmail.com',
      subject: 'New Newsletter Subscription - Husk Store',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #16a34a; margin: 0; font-size: 28px;">🛍️ Husk Store</h1>
              <div style="width: 50px; height: 3px; background: linear-gradient(to right, #16a34a, #059669); margin: 10px auto;"></div>
            </div>
            
            <h2 style="color: #374151; margin-bottom: 20px;">New Newsletter Subscription! 📧</h2>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 0; color: #374151;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 14px;">Subscribed on: ${new Date().toLocaleDateString()}</p>
            </div>
            
            <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
              A new user has subscribed to your newsletter. You can now send them updates about new products, offers, and store news.
            </p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 14px; margin: 0;">This notification was sent from the Husk Store newsletter system.</p>
            </div>
          </div>
        </div>
      `
    };

    // Welcome email to subscriber
    const welcomeMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to Husk Store Newsletter! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #16a34a; margin: 0; font-size: 28px;">🛍️ Husk Store</h1>
              <div style="width: 50px; height: 3px; background: linear-gradient(to right, #16a34a, #059669); margin: 10px auto;"></div>
            </div>
            
            <h2 style="color: #374151; margin-bottom: 20px;">Welcome to our Newsletter! 🎉</h2>
            
            <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
              Thank you for subscribing to the Husk Store newsletter! You're now part of our community and will be the first to know about:
            </p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
              <ul style="color: #374151; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">🆕 New product launches</li>
                <li style="margin-bottom: 8px;">💰 Exclusive deals and discounts</li>
                <li style="margin-bottom: 8px;">🎁 Special offers for subscribers</li>
                <li style="margin-bottom: 8px;">📰 Store updates and news</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-bottom: 25px;">
              <a href="http://localhost:5173" style="display: inline-block; background: linear-gradient(135deg, #16a34a, #059669); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin-right: 10px;">Start Shopping</a>
              <a href="http://localhost:5173/products" style="display: inline-block; background: transparent; color: #16a34a; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; border: 2px solid #16a34a;">Browse Products</a>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 14px; margin: 0;">Happy shopping!<br>The Husk Store Team</p>
            </div>
          </div>
        </div>
      `
    };

    // Send both emails
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(welcomeMailOptions);

    res.status(200).json({
      success: true,
      message: 'Successfully subscribed to newsletter!'
    });

  } catch (error) {
    console.error('Error processing newsletter subscription:', error);
    
    // Provide more specific error messages based on error type
    if (error.code === 'EAUTH') {
      return res.status(503).json({
        success: false,
        message: 'Email authentication failed. Newsletter service is temporarily unavailable.',
        error: 'EMAIL_AUTH_FAILED'
      });
    }
    
    if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      return res.status(503).json({
        success: false,
        message: 'Unable to connect to email service. Please try again later.',
        error: 'EMAIL_CONNECTION_FAILED'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe. Please try again later.',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};