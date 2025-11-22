# Android Build Instructions

This project uses Capacitor to wrap the web application into a native Android app.

## Prerequisites

1.  **Node.js**: Ensure you have Node.js installed.
2.  **Android Studio**: Download and install Android Studio.
3.  **Android SDK**: Ensure the Android SDK is installed via Android Studio.

## Steps to Build for Play Store

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Build Web Assets**:
    ```bash
    npm run build
    ```

3.  **Sync with Android Project**:
    ```bash
    npx cap sync
    ```

4.  **Open in Android Studio**:
    ```bash
    npx cap open android
    ```
    Alternatively, launch Android Studio and open the `android` folder in this project manually.

5.  **Generate Signed Bundle (for Play Store)**:
    - In Android Studio, go to **Build > Generate Signed Bundle / APK**.
    - Select **Android App Bundle**.
    - Create a new key store (remember the passwords and keep the file safe!).
    - Fill in the key details.
    - Select `release` build variant.
    - Click **Finish**.

6.  **Locate the File**:
    - Android Studio will notify you when the build is complete. The `.aab` file will be located in `android/app/release/`.
    - Upload this file to the Google Play Console.

## Updating the App

Whenever you make changes to the React/Vite code:
1.  Run `npm run build`
2.  Run `npx cap sync`
3.  Rebuild in Android Studio.
