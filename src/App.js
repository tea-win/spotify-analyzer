import React, { useState, useEffect } from "react";
import "./index.css";
import { CLIENT_ID, CLIENT_SECRET } from "./config";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import TracksPage from "./TracksPage";
import ImageGrid from "./ImageGrid";

const App = () => {
  const [searchInput, setSearchInput] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [albums, setAlbums] = useState([]);
  const [savedCovers, setSavedCovers] = useState([]); // State to store saved album covers
  const [savedAlbumIds, setSavedAlbumIds] = useState([]); // State to store IDs of saved albums

  // Debounce function
  const debounce = (func, delay) => {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  // Function to fetch albums and tracks
  const fetchAlbumsAndTracks = async () => {
    if (!accessToken || !searchInput) return;

    // Fetch artist ID
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${searchInput}&type=artist`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const data = await response.json();
    const artistID = data.artists.items[0].id;

    // Fetch albums
    const albumsResponse = await fetch(
      `https://api.spotify.com/v1/artists/${artistID}/albums?include_groups=album,single&market=US&limit=50`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    const albumsData = await albumsResponse.json();
    const albumsWithInfo = albumsData.items.map((album) => ({
      ...album,
      type: album.album_type === "album" ? "Album" : "Single",
      releaseYear: parseInt(album.release_date.slice(0, 4)),
    }));
    setAlbums(albumsWithInfo);

    // Fetch tracks for each album
    const updatedAlbums = [];
    for (const album of albumsWithInfo) {
      const tracksResponse = await fetch(
        `https://api.spotify.com/v1/albums/${album.id}/tracks`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const tracksData = await tracksResponse.json();
      const tracks = tracksData.items.map((track) => track.name);
      updatedAlbums.push({ ...album, tracks });
    }
    setAlbums(updatedAlbums);
  };

  useEffect(() => {
    const fetchAccessToken = async () => {
      const authParameters = {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `grant_type=client_credentials&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`,
      };
      const response = await fetch(
        "https://accounts.spotify.com/api/token",
        authParameters
      );
      const data = await response.json();
      setAccessToken(data.access_token);
    };
    fetchAccessToken();
  }, []);

  const handleSearch = (event) => {
    if (
      event.type === "click" ||
      (event.type === "keydown" && event.key === "Enter")
    ) {
      fetchAlbumsAndTracks();
    }
  };

  const handleSaveImage = async (albumId, imageUrl) => {
    setSavedCovers((prevCovers) => [...prevCovers, imageUrl]);
    setSavedAlbumIds((prevIds) => [...prevIds, albumId]);
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
                    onKeyDown={handleSearch}
                  />
                  <button onClick={handleSearch}>Search</button>
                  <Link to="/create-grid" className="grid-link">
                    <button>Create Grid</button>
                  </Link>
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
                      <button
                        onClick={() =>
                          handleSaveImage(album.id, album.images[0].url)
                        }
                        disabled={savedAlbumIds.includes(album.id)}
                      >
                        {savedAlbumIds.includes(album.id)
                          ? "Saved"
                          : "Save Cover"}
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
          <Route
            path="/create-grid"
            element={<ImageGrid savedCovers={savedCovers} />}
          />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
