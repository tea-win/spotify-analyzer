// TracksPage.js
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./index.css"; // Import CSS file for styles

function TracksPage({ accessToken }) {
  const [tracks, setTracks] = useState([]);
  const [filteredTracks, setFilteredTracks] = useState([]);
  const [loading, setLoading] = useState(true); // State variable to track loading
  const [filterKey, setFilterKey] = useState(""); // State variable for key filter
  const [minTempo, setMinTempo] = useState(""); // State variable for min tempo filter
  const [maxTempo, setMaxTempo] = useState(""); // State variable for max tempo filter
  const { albumId } = useParams(); // Retrieve album ID from URL parameters

  useEffect(() => {
    const fetchTracks = async () => {
      if (!albumId || !accessToken) return;

      // Fetch tracks for the specified album
      const response = await fetch(
        `https://api.spotify.com/v1/albums/${albumId}/tracks`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + accessToken,
          },
        }
      );
      const data = await response.json();
      const tracksWithDetails = await Promise.all(
        data.items.map(async (track) => {
          // Fetch additional track details (key & bpm)
          const analysisResponse = await fetch(
            `https://api.spotify.com/v1/audio-analysis/${track.id}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + accessToken,
              },
            }
          );
          const analysisData = await analysisResponse.json();
          const key = analysisData.track.key;
          const bpm = analysisData.track.tempo;
          const valence = analysisData.track.valence;

          // Return track details with key and bpm
          return { ...track, key, bpm };
        })
      );
      setTracks(tracksWithDetails);
      setLoading(false); // Set loading to false after fetching tracks
    };

    fetchTracks();
  }, [accessToken, albumId]);

  useEffect(() => {
    // Apply filters when key or tempo changes
    applyFilters();
  }, [filterKey, minTempo, maxTempo, tracks]);

  const applyFilters = () => {
    let filteredTracks = tracks.filter((track) => {
      // Filter by key if filterKey is set
      if (filterKey !== "" && track.key !== parseInt(filterKey)) {
        return false;
      }
      // Filter by tempo range if minTempo and maxTempo are both set
      if (minTempo !== "" && maxTempo !== "") {
        const tempo = Math.round(track.bpm); // Round the tempo to the nearest integer
        if (tempo < parseInt(minTempo) || tempo > parseInt(maxTempo)) {
          return false;
        }
      } else if (minTempo !== "") {
        // Filter by minimum tempo if only minTempo is set
        const tempo = Math.round(track.bpm);
        if (tempo < parseInt(minTempo)) {
          return false;
        }
      } else if (maxTempo !== "") {
        // Filter by maximum tempo if only maxTempo is set
        const tempo = Math.round(track.bpm);
        if (tempo > parseInt(maxTempo)) {
          return false;
        }
      }
      return true;
    });
    setFilteredTracks(filteredTracks);
  };

  // Render loading message if tracks are still being fetched
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <div>Loading tracks...</div>
      </div>
    );
  }

  return (
    <div className="tracks-page">
      <h2 className="page-title">Tracks</h2>
      <div className="filter-container">
        <label htmlFor="keyFilter">Filter by Key:</label>
        <select
          id="keyFilter"
          value={filterKey}
          onChange={(e) => setFilterKey(e.target.value)}
        >
          <option value="">Any</option>
          {[...Array(12).keys()].map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
        <label htmlFor="minTempo">Min Tempo:</label>
        <input
          type="number"
          id="minTempo"
          value={minTempo}
          onChange={(e) => setMinTempo(e.target.value)}
          placeholder="Min Tempo"
        />
        <label htmlFor="maxTempo">Max Tempo:</label>
        <input
          type="number"
          id="maxTempo"
          value={maxTempo}
          onChange={(e) => setMaxTempo(e.target.value)}
          placeholder="Max Tempo"
        />
      </div>
      <div className="tracks-container">
        {filteredTracks.map((track, index) => (
          <div key={index} className="track-card">
            <h3 className="track-title">{track.name}</h3>
            <p className="artist-name">Artist: {track.artists[0].name}</p>
            <p>
              Key: {track.key}, BPM: {Math.round(track.bpm)}, valence:
              {track.valence}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TracksPage;
