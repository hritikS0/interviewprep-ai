export const authLandingTemplate = (): string => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>InterviewAI Authentication</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --background: #0B0F19;
      --surface: #111827;
      --border: #1F2937;
      --text-primary: #F3F4F6;
      --text-secondary: #9CA3AF;
      --error: #EF4444;
      --primary: #2563EB;
      --primary-hover: #1D4ED8;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: var(--background);
      color: var(--text-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      box-sizing: border-box;
    }
    .card {
      width: 100%;
      max-width: 420px;
      padding: 2.5rem;
      background-color: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      text-align: center;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3);
      display: none;
    }
    .icon-container {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
    }
    .icon-container.error {
      background-color: rgba(239, 68, 68, 0.1);
      color: var(--error);
    }
    .icon-container.success {
      background-color: rgba(37, 99, 235, 0.1);
      color: var(--primary);
    }
    h1 {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0 0 0.75rem;
      letter-spacing: -0.025em;
    }
    p {
      color: var(--text-secondary);
      font-size: 0.95rem;
      line-height: 1.5;
      margin: 0 0 2rem;
    }
    .btn {
      display: inline-block;
      width: 100%;
      padding: 0.8rem;
      background-color: var(--primary);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 0.95rem;
      font-weight: 600;
      text-decoration: none;
      transition: background-color 0.2s ease;
      cursor: pointer;
      box-sizing: border-box;
    }
    .btn:hover {
      background-color: var(--primary-hover);
    }
    .loader {
      border: 3px solid rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      border-top: 3px solid var(--primary);
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 1.5rem;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div id="loader-card" class="card" style="display: block;">
    <div class="loader"></div>
    <h1>Processing authentication</h1>
    <p>Please wait while we redirect you back to the application...</p>
  </div>

  <div id="error-card" class="card">
    <div class="icon-container error">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    </div>
    <h1 id="error-title">Verification Failed</h1>
    <p id="error-message">The link is invalid or has expired.</p>
    <a href="http://localhost:5173/login" class="btn">Go back to Login</a>
  </div>

  <div id="default-card" class="card">
    <div class="icon-container success">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
    </div>
    <h1>InterviewAI API</h1>
    <p>The API server is running successfully.</p>
    <a href="http://localhost:5173/login" class="btn">Go to Frontend App</a>
  </div>

  <script>
    const hash = window.location.hash;
    const loaderCard = document.getElementById('loader-card');
    const errorCard = document.getElementById('error-card');
    const defaultCard = document.getElementById('default-card');

    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      
      if (params.has('access_token')) {
        // Successful verification - Redirect to frontend with the tokens
        window.location.href = 'http://localhost:5173/' + hash;
      } else if (params.has('error') || params.has('error_code')) {
        // Error occurred (e.g. otp_expired)
        loaderCard.style.display = 'none';
        
        const errorDesc = params.get('error_description') || 'Authentication failed';
        const friendlyMsg = decodeURIComponent(errorDesc).replace(/\\+/g, ' ');
        
        document.getElementById('error-message').innerText = friendlyMsg;
        errorCard.style.display = 'block';
      } else {
        // Unexpected hash
        loaderCard.style.display = 'none';
        defaultCard.style.display = 'block';
      }
    } else {
      // No hash - show health check page
      loaderCard.style.display = 'none';
      defaultCard.style.display = 'block';
    }
  </script>
</body>
</html>`;
};
