# VidVault
A youtube video downloader utility app made for mobile.

## Setup and Running
Clone the repository
```
git clone http://github.com/davynoe/vid-vault
cd vid-vault
npm i
```

This app depends on [vid-vault-server](https://github.com/davynoe/vid-vault-server), so make sure to clone it somewhere and run it's server in the background.
Make sure your server is running from now on.

Create your `.env` file and write it like this:
```
EXPO_PUBLIC_SERVER_URL=http://0.0.0.0:0000
```
Replace zeros with your servers ip and port

Run the app
```
# For android
npx expo run:android

# For ios
npx expo run:ios
```

I did not test the app on iOS, so it may not work as expected
