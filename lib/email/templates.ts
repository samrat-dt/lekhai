export function getBaseStyles() {
  return `
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background: #ffffff;
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 1px solid #eee;
      margin-bottom: 20px;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      color: #1a1a1a;
    }
    .content {
      padding: 20px 0;
    }
    .button {
      display: inline-block;
      padding: 12px 32px;
      background-color: #000;
      color: #fff;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #eee;
      margin-top: 20px;
      font-size: 12px;
      color: #999;
    }
    .code-block {
      background-color: #f5f5f5;
      padding: 12px;
      border-radius: 4px;
      font-family: monospace;
      margin: 10px 0;
    }
  `;
}

export function invitationEmailTemplate(
  teamName: string,
  inviterName: string,
  signUpUrl: string
) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>${getBaseStyles()}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Join ${escapeHtml(teamName)}</h1>
          </div>

          <div class="content">
            <p>You've been invited to join <strong>${escapeHtml(teamName)}</strong> on Lekhai by ${escapeHtml(inviterName)}.</p>

            <p>Lekhai is a platform for generating legal documents with AI assistance. Click the button below to accept the invitation and get started.</p>

            <div style="text-align: center;">
              <a href="${escapeHtml(signUpUrl)}" class="button">Accept Invitation</a>
            </div>

            <p style="color: #999; font-size: 12px;">
              Or copy and paste this URL in your browser:<br>
              <code class="code-block">${escapeHtml(signUpUrl)}</code>
            </p>

            <p>If you didn't expect this invitation, you can ignore this email.</p>
          </div>

          <div class="footer">
            <p>© ${new Date().getFullYear()} Lekhai. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function passwordResetEmailTemplate(resetUrl: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>${getBaseStyles()}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reset Your Password</h1>
          </div>

          <div class="content">
            <p>We received a request to reset your password. Click the button below to set a new password.</p>

            <div style="text-align: center;">
              <a href="${escapeHtml(resetUrl)}" class="button">Reset Password</a>
            </div>

            <p style="color: #999; font-size: 12px;">
              Or copy and paste this URL in your browser:<br>
              <code class="code-block">${escapeHtml(resetUrl)}</code>
            </p>

            <p><strong>This link will expire in 24 hours.</strong></p>

            <p>If you didn't request a password reset, you can ignore this email. Your account remains secure.</p>
          </div>

          <div class="footer">
            <p>© ${new Date().getFullYear()} Lekhai. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function documentReadyEmailTemplate(
  documentType: string,
  downloadUrl: string
) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>${getBaseStyles()}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Document is Ready</h1>
          </div>

          <div class="content">
            <p>Your <strong>${escapeHtml(documentType)}</strong> has been generated successfully and is ready to download.</p>

            <div style="text-align: center;">
              <a href="${escapeHtml(downloadUrl)}" class="button">Download Document</a>
            </div>

            <p style="color: #999; font-size: 12px;">
              Or copy and paste this URL in your browser:<br>
              <code class="code-block">${escapeHtml(downloadUrl)}</code>
            </p>

            <p>You can also view and manage all your documents in your Lekhai dashboard.</p>
          </div>

          <div class="footer">
            <p>© ${new Date().getFullYear()} Lekhai. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}
