# Firebase Authentication setup

Cartova now uses Firebase Authentication for account registration, sign-in, sign-out, and password resets. User passwords are no longer stored in Cartova local storage.

1. Create or open a Firebase project.
2. In **Authentication → Sign-in method**, enable **Email/Password**.
3. Add the web app's authorized domains under **Authentication → Settings → Authorized domains**. Include `localhost` for local development and `cartova.trytestme.online` for the deployed app.
4. Copy the Firebase web app configuration into a local `.env` file using `.env.example` as the template.
5. Add the same `VITE_FIREBASE_*` values to the deployment environment, then rebuild and redeploy.

The Firebase web configuration values are client-side identifiers. Do not put service-account JSON or Admin SDK credentials in this frontend repository.

