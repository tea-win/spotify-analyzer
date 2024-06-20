A simple web application that allows users to search for artists and check all their albums and tracks' information, including BPM (beats per minute). Users can also create a 5x5 grid of their favorite albums. The app is built using React and utilizes the Spotify API for fetching music data.
## Demo Link
![Demo gif](https://github.com/tea-win/spotify-explorer/blob/main/public/demo.gif)
## Features

- **Search Artists:** Search for artists and view their albums and tracks.
- **Track Information:** Get detailed information about tracks, including BPM.
- **Favorite Albums Grid:** Create a 5x5 grid of your favorite albums.

## Installation

To get started, follow these steps:

1. **Clone the repository:**

```bash
   git clone https://github.com/tea-win/spotify-explorer.git
   cd music-explorer
```

2. Install dependencies:

```bash
   npm install html-to-image
```

3. Set up Spotify API credentials:
   For this to work, you will need a Client ID and a Client Secret:

- Create an application on the [Spotify Developer Dashboard](https://developer.spotify.com/documentation/web-api/tutorials/getting-started#request-an-access-token).

- After you obtain your Client ID and Client Secret, paste them into `config.js`.

4. Run the app:

```bash
npm start
```
