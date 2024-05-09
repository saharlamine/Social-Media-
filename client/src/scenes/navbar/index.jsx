import { useState, useEffect } from "react";
import {
  Box,
  IconButton,
  InputBase,
  Typography,
  Select,
  MenuItem,
  FormControl,
  Badge,
  Popover, // Import Popover from MUI
  List, // Import List from MUI
  ListItem, // Import ListItem from MUI
  ListItemText, // Import ListItemText from MUI
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Search,
  Message,
  DarkMode,
  LightMode,
  Notifications,
  Help,
  Menu,
  Close,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { setMode, setLogout } from "state";
import { useNavigate } from "react-router-dom";
import FlexBetween from "components/FlexBetween";

const Navbar = () => {
  const [isMobileMenuToggled, setIsMobileMenuToggled] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null); // Anchor element for popover
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");
  const [query, setQuery] = useState("");
  const { palette } = useTheme();

  const theme = useTheme();
  const neutralLight = theme.palette.neutral.light;
  const dark = theme.palette.neutral.dark;
  const background = theme.palette.background.default;
  const primaryLight = theme.palette.primary.light;
  const alt = theme.palette.background.alt;

  const fullName = `${user.firstName} ${user.lastName}`;
  const token = useSelector((state) => state.token);

  const handleSearch = () => {
    navigate(`/search/${query}`);
  };

  const handleMsg = () => {
    navigate(`/messages`);
  };
  const url = "http://localhost:3001";

  const getUser = async (id) => {
    const res = await fetch(`${url}/users/${id}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      throw new Error("Failed to fetch notifications");
    }
    const data1 = await res.json();
    return data1.firstName + " " + data1.lastName;
  };
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${url}/posts/notifications/${user._id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch notifications");
        }
        const data = await response.json();
        // Filter out notifications where userId is not equal to user._id
        const filteredNotifications = data.filter(
          (notification) => notification.userName !== user._id
        );
        // Map over each notification and fetch the user's name asynchronously
        const notificationsWithUserNames = await Promise.all(
          filteredNotifications.map(async (notification) => {
            const user = await getUser(notification.userName);
            return { ...notification, userName: user }; // Include user's name in the notification object
          })
        );

        // Filter out notifications where _id is not equal to userId

        setNotifications(notificationsWithUserNames);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, []);

  // Function to handle opening the popover
  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  // Function to handle closing the popover
const handlePopoverClose = async () => {
  await deleteNotification(); // Wait for the delete operation to complete
  setAnchorEl(null); // Close the popover after deletion
};

const deleteNotification = async () => {
  try {
    const response = await fetch(
      `${url}/posts/notifications/delete/${user._id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!response.ok) {
      throw new Error("Failed to delete notification");
    }
    // Update the notifications state after successful deletion
    setNotifications([]); // Clear notifications array after deletion
  } catch (error) {
    console.error("Error deleting notification:", error);
  }
};


  // Check if popover is open
  const isPopoverOpen = Boolean(anchorEl);

  return (
    <FlexBetween padding="1rem 6%" backgroundColor={alt}>
      <FlexBetween gap="1.75rem">
        <Typography
          fontWeight="bold"
          fontSize="clamp(1rem, 2rem, 2.25rem)"
          color="primary"
          onClick={() => navigate("/home")}
          sx={{
            "&:hover": {
              color: primaryLight,
              cursor: "pointer",
            },
          }}
        >
          Sociopedia
        </Typography>
        {isNonMobileScreens && (
          <FlexBetween
            backgroundColor={neutralLight}
            borderRadius="9px"
            gap="3rem"
            padding="0.1rem 1.5rem"
          >
            <InputBase
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <IconButton onClick={handleSearch}>
              <Search />
            </IconButton>
          </FlexBetween>
        )}
      </FlexBetween>

      {/* DESKTOP NAV */}
      {isNonMobileScreens ? (
        <FlexBetween gap="2rem">
          <IconButton onClick={() => dispatch(setMode())}>
            {theme.palette.mode === "dark" ? (
              <DarkMode sx={{ fontSize: "25px" }} />
            ) : (
              <LightMode sx={{ color: dark, fontSize: "25px" }} />
            )}
          </IconButton>
          <IconButton onClick={handleMsg}>
            <Message sx={{ fontSize: "25px" }} />
          </IconButton>
          {/* Notifications icon with badge */}
          <IconButton
            onClick={handlePopoverOpen} // Open popover on click
          >
            <Badge badgeContent={notifications.length} color="secondary">
              <Notifications sx={{ fontSize: "25px" }} />
            </Badge>
          </IconButton>
          <FormControl variant="standard" value={fullName}>
            <Select
              value={fullName}
              sx={{
                backgroundColor: neutralLight,
                width: "150px",
                borderRadius: "0.25rem",
                p: "0.25rem 1rem",
                "& .MuiSvgIcon-root": {
                  pr: "0.25rem",
                  width: "3rem",
                },
                "& .MuiSelect-select:focus": {
                  backgroundColor: neutralLight,
                },
              }}
              input={<InputBase />}
            >
              <MenuItem value={fullName}>
                <Typography>{fullName}</Typography>
              </MenuItem>
              <MenuItem onClick={() => dispatch(setLogout())}>Log Out</MenuItem>
            </Select>
          </FormControl>
        </FlexBetween>
      ) : (
        <IconButton
          onClick={() => setIsMobileMenuToggled(!isMobileMenuToggled)}
        >
          <Menu />
        </IconButton>
      )}

      {/* MOBILE NAV */}
      {!isNonMobileScreens && isMobileMenuToggled && (
        <Box
          position="fixed"
          right="0"
          bottom="0"
          height="100%"
          zIndex="10"
          maxWidth="500px"
          minWidth="300px"
          backgroundColor={background}
        >
          {/* CLOSE ICON */}
          <Box display="flex" justifyContent="flex-end" p="1rem">
            <IconButton
              onClick={() => setIsMobileMenuToggled(!isMobileMenuToggled)}
            >
              <Close />
            </IconButton>
          </Box>

          {/* MENU ITEMS */}
          <FlexBetween
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            gap="3rem"
          >
            <IconButton
              onClick={() => dispatch(setMode())}
              sx={{ fontSize: "25px" }}
            >
              {theme.palette.mode === "dark" ? (
                <DarkMode sx={{ fontSize: "25px" }} />
              ) : (
                <LightMode sx={{ color: dark, fontSize: "25px" }} />
              )}
            </IconButton>
            <IconButton onClick={handleMsg} sx={{ fontSize: "25px" }}>
              <Message />
            </IconButton>
            <IconButton
              onClick={handlePopoverOpen} // Open popover on click
            >
              <Badge badgeContent={notifications.length} color="secondary">
                <Notifications sx={{ fontSize: "25px" }} />
              </Badge>
            </IconButton>
            <Help sx={{ fontSize: "25px" }} />
            <FormControl variant="standard" value={fullName}>
              <Select
                value={fullName}
                sx={{
                  backgroundColor: neutralLight,
                  width: "150px",
                  borderRadius: "0.25rem",
                  p: "0.25rem 1rem",
                  "& .MuiSvgIcon-root": {
                    pr: "0.25rem",
                    width: "3rem",
                  },
                  "& .MuiSelect-select:focus": {
                    backgroundColor: neutralLight,
                  },
                }}
                input={<InputBase />}
              >
                <MenuItem value={fullName}>
                  <Typography>{fullName}</Typography>
                </MenuItem>
                <MenuItem onClick={() => dispatch(setLogout())}>
                  Log Out
                </MenuItem>
              </Select>
            </FormControl>
          </FlexBetween>
        </Box>
      )}

      {/* Popover for Notifications */}
      <Popover
        open={isPopoverOpen}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Box>
          <List>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <ListItem key={notification.id}>
                  <ListItemText
                    primary={`${notification.userName} ${notification.type} your post`}
                  />
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="No notifications found for this user" />
              </ListItem>
            )}
          </List>
        </Box>
      </Popover>
    </FlexBetween>
  );
};

export default Navbar;
