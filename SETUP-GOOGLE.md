# Google sign-in setup (free, one time, about 10 minutes)
Each viewer's history and favorites are saved in a hidden app folder in their OWN Google Drive. Your servers store nothing.

1. Go to https://console.cloud.google.com and create a project named AnimeNeek.
2. APIs & Services > Library > search "Google Drive API" > Enable.
3. APIs & Services > OAuth consent screen (Google Auth Platform): choose External, fill in the app name and your email.
   Add the scope ".../auth/drive.appdata" (plus openid, email, profile).
   Set the publishing status to "In production". In "Testing" mode only listed test users can sign in and they get signed out every 7 days.
4. Credentials > Create credentials > OAuth client ID > Application type: Desktop app. Copy the Client ID and Client secret.
5. Open src/google-config.js and paste them between the quotes. (For desktop apps Google does not treat this secret as private.)
6. Restart the app. "Continue with Google" now works.
