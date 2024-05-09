import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "scenes/navbar";
import {
  Grid,
  Typography,
  CircularProgress,
  Paper,
  useTheme,
  Box,
} from "@mui/material";
import "./style.css"; // Import external CSS file
import UserImage from "./UserImage";
import FlexBetween from "./FlexBetween";
import PostWidget from "scenes/widgets/PostWidget";

const SearchResultPage = () => {
  const { query } = useParams();
  const [searchResults, setSearchResults] = useState([]);
  const [searchResultsPost, setsearchResultsPost] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPost, setLoadingPost] = useState(true);
  const [error, setError] = useState("");
  const [errorPost, setErrorPost] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDataUser = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/users/search/${query}`
        );
        if (!response.ok) {
          throw new Error("User not found");
        }
        const userData = await response.json();
        setSearchResults(userData);
        setLoading(false);
        setError("");
      } catch (error) {
        console.error("Error fetching search results:", error.message);
        setSearchResults([]);
        setLoading(false);
        setError("User not found");
      }
    };
    const fetchDataPost = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/posts/search/${query}`
        );
        if (!response.ok) {
          throw new Error("Post not found");
        }
        const PostData = await response.json();
        setsearchResultsPost(PostData);
        setLoadingPost(false);
        setErrorPost("");
      } catch (error) {
        console.error("Error fetching search results:", error.message);
        setsearchResultsPost([]);
        setLoadingPost(false);
        setErrorPost("Post not found");
      }
    };

    fetchDataUser();
    fetchDataPost();
  }, [query]);

  const { palette } = useTheme();
  const main = palette.neutral.main;
  const medium = palette.neutral.medium;

  return (
    <div>
      <Navbar />
      <div className="container">
        <Typography variant="h4" gutterBottom>
          Search Results for "{query}"
        </Typography>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Typography variant="body1" color="error">
            {error}
          </Typography>
        ) : (searchResults.length === 0 && searchResultsPost.length ==0) ? (
          <Typography variant="body1">No Data found</Typography>
        ) : (
          <div>
            {searchResults.map((user) => (
              <div
                key={user._id}
                style={{ width: "50%", marginBottom: "20px" }}
              >
                <Paper
                  style={{
                    padding: "20px",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  <FlexBetween>
                    <FlexBetween gap="1rem">
                      <UserImage image={user.picturePath} size="55px" />

                      <Box
                        onClick={() => {
                          navigate(`/profile/${user._id}`);
                          navigate(0);
                        }}
                      >
                        <Typography
                          color={main}
                          variant="h5"
                          fontWeight="500"
                          sx={{
                            "&:hover": {
                              color: palette.primary.light,
                              cursor: "pointer",
                            },
                          }}
                        >
                          {user.firstName}
                        </Typography>
                        <Typography color={medium} fontSize="0.75rem">
                          {user.occupation}
                        </Typography>
                      </Box>
                    </FlexBetween>
                  </FlexBetween>
                </Paper>
              </div>
            ))}
          </div>
        )}
        {loadingPost ? (
          <CircularProgress />
        ) : errorPost ? (
          <Typography variant="body1" color="error">
            {error}
          </Typography>
        ) :
         (
          <div>
              {searchResultsPost.map((post) => (
              <div key={post._id} style={{ width: "50%", marginBottom: "20px" }}>
                <PostWidget
                  postId={post._id}
                  postUserId={post.userId}
                  name={`${post.firstName} ${post.lastName}`}
                  description={post.description}
                  location={post.location}
                  picturePath={post.picturePath}
                  userPicturePath={post.userPicturePath}
                  likes={post.likes}
                  comments={post.comments}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultPage;
