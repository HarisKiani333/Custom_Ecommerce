import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

const setupEmailConfiguration = async () => {
  console.log('\n🛍️  Husk Store Email Configuration Setup');
  console.log('==========================================\n');
  
  console.log('This script will help you configure email service for:');
  console.log('✉️  Contact form submissions');
  console.log('📧 Newsletter subscriptions\n');
  
  // Read current .env file
  const envPath = path.join(__dirname, '.env');
  let envContent = '';
  
  try {
    envContent = fs.readFileSync(envPath, 'utf8');
  } catch (error) {
    console.log('❌ Error reading .env file:', error.message);
    process.exit(1);
  }
  
  console.log('📋 Current email configuration:');
  const emailUserMatch = envContent.match(/EMAIL_USER\s*=\s*"([^"]*)"/); 
  const emailPassMatch = envContent.match(/EMAIL_PASS\s*=\s*"([^"]*)"/); 
  
  const currentEmailUser = emailUserMatch ? emailUserMatch[1] : 'Not set';
  const currentEmailPass = emailPassMatch ? emailPassMatch[1] : 'Not set';
  
  console.log(`📧 Email User: ${currentEmailUser}`);
  console.log(`🔐 Email Pass: ${currentEmailPass === 'your_gmail_app_password_here' ? '❌ PLACEHOLDER' : currentEmailPass ? '✅ SET' : '❌ NOT SET'}\n`);
  
  if (currentEmailPass === 'your_gmail_app_password_here') {
    console.log('🚨 EMAIL CONFIGURATION REQUIRED!');
    console.log('Your EMAIL_PASS is still set to the placeholder value.\n');
    
    console.log('📝 To fix this, you need to:');
    console.log('1. Go to https://myaccount.google.com/');
    console.log('2. Enable 2-Factor Authentication');
    console.log('3. Generate an App Password for Mail');
    console.log('4. Copy the 16-character password\n');
    
    const hasAppPassword = await question('❓ Do you have a Gmail App Password ready? (y/n): ');
    
    if (hasAppPassword.toLowerCase() === 'y' || hasAppPassword.toLowerCase() === 'yes') {
      const emailUser = await question(`📧 Email address (current: ${currentEmailUser}): `) || currentEmailUser;
      const appPassword = await question('🔐 Enter your 16-character Gmail App Password: ');
      
      if (!appPassword || appPassword.length < 10) {
        console.log('❌ Invalid app password. Please ensure you enter the complete 16-character password.');
        rl.close();
        return;
      }
      
      // Remove spaces from app password
      const cleanAppPassword = appPassword.replace(/\s/g, '');
      
      // Update .env file
      let updatedEnvContent = envContent;
      updatedEnvContent = updatedEnvContent.replace(
        /EMAIL_USER\s*=\s*"[^"]*"/,
        `EMAIL_USER = "${emailUser}"`
      );
      updatedEnvContent = updatedEnvContent.replace(
        /EMAIL_PASS\s*=\s*"[^"]*"/,
        `EMAIL_PASS = "${cleanAppPassword}"`
      );
      
      try {
        fs.writeFileSync(envPath, updatedEnvContent);
        console.log('\n✅ Email configuration updated successfully!');
        console.log('\n🧪 Testing email configuration...');
        
        // Test the configuration
        const { exec } = await import('child_process');
        exec('node test-email.js', (error, stdout, stderr) => {
          if (error) {
            console.log('❌ Test failed:', error.message);
          } else {
            console.log(stdout);
          }
          
          console.log('\n🚀 Next steps:');
          console.log('1. Restart your server: npm run server');
          console.log('2. Test the contact form on your website');
          console.log('3. Check your email for test messages\n');
          
          rl.close();
        });
      } catch (error) {
        console.log('❌ Error updating .env file:', error.message);
        rl.close();
      }
    } else {
      console.log('\n📖 Please follow these steps to get your Gmail App Password:');
      console.log('\n1. 🌐 Go to: https://myaccount.google.com/');
      console.log('2. 🔒 Click "Security" in the left sidebar');
      console.log('3. 🔐 Enable "2-Step Verification" if not already enabled');
      console.log('4. 📱 Click "App passwords"');
      console.log('5. 📧 Select "Mail" as the app');
      console.log('6. 💻 Select "Other (Custom name)" as device');
      console.log('7. ✏️  Enter "Husk Store Contact Form"');
      console.log('8. 🎯 Click "Generate"');
      console.log('9. 📋 Copy the 16-character password');
      console.log('10. 🔄 Run this script again: node setup-email.js\n');
      
      rl.close();
    }
  } else if (currentEmailPass && currentEmailPass !== 'Not set') {
    console.log('✅ Email configuration appears to be set up!');
    console.log('\n🧪 Testing current configuration...');
    
    const { exec } = await import('child_process');
    exec('node test-email.js', (error, stdout, stderr) => {
      if (error) {
        console.log('❌ Test failed:', error.message);
      } else {
        console.log(stdout);
      }
      rl.close();
    });
  } else {
    console.log('❌ EMAIL_PASS is not configured.');
    console.log('Please run this script again and follow the setup instructions.');
    rl.close();
  }
};

setupEmailConfiguration().catch(console.error);