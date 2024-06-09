import React, { useState, useEffect } from "react";
import "./index.css";
import { CLIENT_ID, CLIENT_SECRET } from "./config";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TracksPage from "./TracksPage";
import { Link } from "react-router-dom";

function App() {
  const [searchInput, setSearchInput] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [albums, setAlbums] = useState([]);
  const [savedCovers, setSavedCovers] = useState([]); // State to store saved album covers

  // Function to fetch albums and tracks
  const fetchAlbumsAndTracks = async () => {
    if (!accessToken || !searchInput) return;

    // Fetch albums
    var artistID = await fetch(
      "https://api.spotify.com/v1/search?q=" + searchInput + "&type=artist",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + accessToken,
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        return data.artists.items[0].id;
      });

    var returnedAlbums = await fetch(
      "https://api.spotify.com/v1/artists/" +
        artistID +
        "/albums" +
        "?include_groups=album,single&market=US&limit=50",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + accessToken,
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        const albumsWithInfo = data.items.map((album) => ({
          ...album,
          type: album.album_type === "album" ? "Album" : "Single",
          releaseYear: parseInt(album.release_date.slice(0, 4)),
        }));
        setAlbums(albumsWithInfo);
        return albumsWithInfo;
      });

    // Fetch tracks for each album
    returnedAlbums.forEach(async (album) => {
      const tracks = await fetch(
        `https://api.spotify.com/v1/albums/${album.id}/tracks`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + accessToken,
          },
        }
      )
        .then((response) => response.json())
        .then((data) => {
          return data.items.map((track) => track.name);
        });

      // Update state with tracks for the current album
      setAlbums((prevAlbums) => {
        return prevAlbums.map((prevAlbum) => {
          if (prevAlbum.id === album.id) {
            return { ...prevAlbum, tracks };
          }
          return prevAlbum;
        });
      });
    });
  };

  useEffect(() => {
    var authParameters = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body:
        "grant_type=client_credentials&client_id=" +
        CLIENT_ID +
        "&client_secret=" +
        CLIENT_SECRET,
    };
    fetch("https://accounts.spotify.com/api/token", authParameters)
      .then((result) => result.json())
      .then((data) => setAccessToken(data.access_token));
  }, []);

  useEffect(() => {
    fetchAlbumsAndTracks();
  }, [accessToken, searchInput]);

  const handleSearch = () => {
    fetchAlbumsAndTracks();
  };

  const handleSaveImage = (imageUrl) => {
    setSavedCovers((prevCovers) => [...prevCovers, imageUrl]);
    console.log("Saved Covers:", savedCovers);
  };

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <div>
                <div className="search-container">
                  <input
                    id="searchInput"
                    name="searchInput"
                    placeholder="Search for Artist"
                    type="input"
                    onChange={(event) => setSearchInput(event.target.value)}
                  />
                  <button onClick={handleSearch}>Search</button>
                </div>
                <div className="albums-container">
                  {albums.map((album, i) => (
                    <div key={i} className="album-card">
                      <Link
                        to={`/${album.id}/tracks`} // Pass album id as URL parameter
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <img src={album.images[0].url} alt={album.name} />
                        <div className="album-info">
                          <h3>{album.name}</h3>
                          <p>Release Year: {album.releaseYear}</p>
                          <p>Type: {album.type}</p>
                        </div>
                      </Link>
                      <button onClick={() => handleSaveImage(album.images[0].url)}>
                        Save Cover
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            }
          />
          <Route
            path="/:albumId/tracks"
            element={<TracksPage accessToken={accessToken} />}
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
