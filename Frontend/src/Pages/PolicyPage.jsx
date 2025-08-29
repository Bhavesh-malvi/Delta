import React from 'react';

const cardStyle = {
  width: '100%',
  margin: '0',
  padding: '40px 20px',
  background: 'rgba(20, 20, 20, 0.98)',
  borderRadius: '0',
  boxShadow: 'none',
  border: 'none',
  color: 'var(--color, #fff)',
  boxSizing: 'border-box',
};

const headingStyle = {
  textAlign: 'center',
  marginBottom: '16px',
  color: 'var(--primary-color)',
  fontWeight: 700,
  letterSpacing: '1px',
};

const subheadingStyle = {
  color: 'var(--primary-color)',
  marginTop: '28px',
  marginBottom: '8px',
  fontWeight: 600,
};

const linkStyle = {
  color: 'var(--primary-color)',
  textDecoration: 'underline',
  wordBreak: 'break-all',
};

const PolicyPage = () => (
  <div style={cardStyle}>
    <h1 style={headingStyle}>Privacy Policy</h1>
    <p style={{ textAlign: 'center', color: '#aaa', marginBottom: '32px' }}>
      Effective Date: <b>12 April 2025</b>
    </p>
    <h2 style={subheadingStyle}>Introduction</h2>
    <p>We value your trust. This Privacy Policy outlines how we handle your personal data responsibly. By using our services, you agree to the collection and use of information in accordance with this policy.</p>
    <h2 style={subheadingStyle}>Information We Collect</h2>
    <ul>
      <li>Full Name</li>
      <li>Email Address</li>
      <li>Phone Number</li>
      <li>Any details submitted through contact forms</li>
      <li>IP Address and browser information (via cookies)</li>
    </ul>
    <h2 style={subheadingStyle}>When We Collect</h2>
    <ul>
      <li>When you register on our site</li>
      <li>When you fill out contact or inquiry forms</li>
      <li>When you use our website (via cookies and analytics tools)</li>
    </ul>
    <h2 style={subheadingStyle}>How We Use Your Information</h2>
    <ul>
      <li>Providing and improving our services</li>
      <li>Responding to your queries and support requests</li>
      <li>Sending important updates or notifications</li>
      <li>Issuing certificates or documentation (if applicable)</li>
      <li>Monitoring usage trends via analytics</li>
    </ul>
    <h2 style={subheadingStyle}>Information Sharing</h2>
    <p>We do not sell, rent, or share your personal information with any third parties without your consent, except as required by law or to fulfill essential service operations (e.g., certificate generation, email delivery).</p>
    <h2 style={subheadingStyle}>Cookies and Tracking Technologies</h2>
    <p>We may use cookies and tracking tools like Google Analytics and Google Ads (via gtag.js) to:</p>
    <ul>
      <li>Analyze website traffic</li>
      <li>Improve user experience</li>
      <li>Understand user behavior</li>
    </ul>
    <p>These tools may collect anonymous information using cookies. You can disable cookies in your browser settings if you prefer.</p>
    <h2 style={subheadingStyle}>Your Rights</h2>
    <ul>
      <li>Access the personal data we hold about you</li>
      <li>Request correction of any inaccurate information</li>
      <li>Request deletion of your personal data</li>
    </ul>
    <p>To exercise these rights, please contact us at <a href="mailto:admin@deltawaresolution.com" style={linkStyle}>admin@deltawaresolution.com</a></p>
    <h2 style={subheadingStyle}>Data Security</h2>
    <p>We take data protection seriously. Our systems use:</p>
    <ul>
      <li>Secure SSL encryption</li>
      <li>Protected servers and firewall systems</li>
      <li>Limited access to sensitive data</li>
    </ul>
    <p>While no method is 100% secure, we strive to use the best tools to safeguard your information.</p>
    <h2 style={subheadingStyle}>Contact Us</h2>
    <p>If you have any questions or concerns regarding this Privacy Policy, feel free to contact us at:<br/>
      Email: <a href="mailto:admin@deltawaresolution.com" style={linkStyle}>admin@deltawaresolution.com</a>
    </p>
    <h2 style={subheadingStyle}>Changes to This Policy</h2>
    <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated 'Effective Date.' We recommend checking this page regularly.</p>
  </div>
);

export default PolicyPage; 