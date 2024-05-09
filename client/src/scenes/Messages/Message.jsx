import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import Navbar from "scenes/navbar";
import "./style.css"; // Import the CSS file
import { TextareaAutosize } from "@mui/material";
import FlexBetween from "components/FlexBetween";
import UserImage from "components/UserImage";
import DeleteIcon from '@mui/icons-material/Delete'; // Import the delete icon

const MessagingPage = () => {
  const [messages, setMessages] = useState([]);
  const [selectedReceiver, setSelectedReceiver] = useState("");
  const [conversation, setConversation] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showNewConversationModal, setShowNewConversationModal] =
    useState(false);
  const [newConversationEmail, setNewConversationEmail] = useState("");
  const [sendButtonDisabled, setSendButtonDisabled] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const user = useSelector((state) => state.user);
  const currentUserEmail = user.email;

  const conversationRef = useRef(null); // Ref for conversation ul

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/messages/${currentUserEmail}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      let data = await response.json();

      // Sort messages by creation date (latest first)
      data = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Extract unique receivers from the messages data
      const uniqueReceivers = Array.from(
        new Set(
          data.map((message) =>
            message.sender === currentUserEmail
              ? message.receiver
              : message.sender
          )
        )
      );

      // Fetch user data for each unique receiver
      const existingUsers = [];
      for (const receiverEmail of uniqueReceivers) {
        try {
          const userResponse = await fetch(
            `http://localhost:3001/users/email/${receiverEmail}`
          );
          if (userResponse.ok) {
            const userData = await userResponse.json();
            if (userData.length > 0) {
              existingUsers.push({ email: receiverEmail, userData }); // Include user data along with email
            }
          }
        } catch (error) {
          console.error(
            `Error fetching user data for ${receiverEmail}:`,
            error
          );
        }
      }

      // Set messages state with existing users
      setMessages(existingUsers);

      // Select the receiver based on the most recent message
      if (data.length > 0) {
        const lastMessage = data[0]; // Most recent message
        setSelectedReceiver(
          currentUserEmail === lastMessage.sender
            ? lastMessage.receiver
            : lastMessage.sender
        );
      }
      console.log(existingUsers);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const fetchConversation = async (receiver) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/messages/${currentUserEmail}/${receiver}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch conversation");
      }
      const data = await response.json();
      // Sort messages by timestamp (latest first)
      const sortedConversation = data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setConversation(sortedConversation.reverse()); // Reverse the order
    } catch (error) {
      console.error("Error fetching conversation:", error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    // Fetch last conversation when page loads
    if (!messages) {
      
      setShowNewConversationModal(true); // Show new conversation modal if no receiver is selected
    }
  }, []);

  // Scroll to bottom of conversation when conversation changes
  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [conversation]);

  const handleSelectReceiver = (receiver) => {
    setSelectedReceiver(receiver);
    fetchConversation(receiver);
    setShowNewConversationModal(false)
  };

  const sendMessage = async (e) => {
    e.preventDefault(); // Prevent default form submission

    try {
      const response = await fetch("http://localhost:3001/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: currentUserEmail,
          receiver: selectedReceiver, // Use the selected receiver for the message
          content: newMessage,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to send message");
      }
      fetchMessages();
      setNewMessage("");
      fetchConversation(selectedReceiver);
      setShowNewConversationModal(false);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handlerSelectedReceiver = async (receiverEmail) => {
    try {
      setSendButtonDisabled(true);
      
      setSelectedReceiver(receiverEmail);
      const response = await fetch(
        `http://localhost:3001/users/email/${receiverEmail}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }
      const userData = await response.json();
      if (userData.length > 0) {
        setSendButtonDisabled(false); // Enable the send button
        setErrorMessage(""); // Clear any previous error message
      } else {
        // If the user does not exist, disable the send button and show error message
        setSendButtonDisabled(true);
        setErrorMessage("User does not exist");
      }
    } catch (error) {
      console.error("Error checking user existence:", error);
      // Handle error - disable send button and display error message
      setSendButtonDisabled(true);
      setErrorMessage("Failed to check user existence");
    }
  };

  const handleStartNewConversation = () => {
    setShowNewConversationModal(true);
    setSelectedReceiver(newConversationEmail); // Set selected receiver to the new conversation's email
    setConversation([]); // Clear conversation to hide the messages
  };
  const handleDeleteMessage = async (mail) => {
    try {
      const response = await fetch(`http://localhost:3001/api/messages/supprimer/${mail}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        
      });
      if (!response.ok) {
        throw new Error('Failed to delete message');
      }
      // Refresh conversation after deleting message
      fetchConversation(selectedReceiver);
      fetchMessages()
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };
  
  return (
    <>
      <Navbar />
      <div className="messaging-container">
        <div className="persons-list">
          <h2>Messages</h2>
          <ul className="list-unstyled">
            <button
              className="start-conversation-btn"
              onClick={handleStartNewConversation}
            >
              Start New Conversation
            </button>
            {messages.length === 0 && <li>No conversations</li>}
            {messages.map((user, index) => (
              <li
                key={index}
                className={user.email === selectedReceiver ? "active" : ""}
                onClick={() => handleSelectReceiver(user.email)}
              >
                {user.userData && user.userData.length > 0 ? (
                  <span>
                    <FlexBetween>
                      <FlexBetween gap="1rem">
                        <UserImage
                          image={user.userData[0].picturePath}
                          size="55px"
                        />
                        {`${user.userData[0].firstName} ${user.userData[0].lastName} (${user.email})`}
                    <DeleteIcon onClick={() => handleDeleteMessage(user.email)} />
                      </FlexBetween>
                    </FlexBetween>
                  </span>
                ) : (
                  <span>{user.email}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="conversation">
          <h2>{selectedReceiver}</h2>
          <ul ref={conversationRef}>
            {conversation.length === 0 && <li>No messages</li>}
            {conversation.map((message, index) => (
              <li
                key={index}
                className={
                  message.sender === currentUserEmail
                    ? "sender-message"
                    : "receiver-message"
                }
              >
                {message.content}
              </li>
            ))}
          </ul>
          <div className="input-container">
            {showNewConversationModal && (
              <div className="new-conversation-modal">
                <h2>Start New Conversation</h2>
                <div className="input-container">
                  <input
                    type="text"
                    placeholder="Enter Email"
                    value={selectedReceiver}
                    required
                    onChange={(e) => {handlerSelectedReceiver(e.target.value)}}
                  />
                  {errorMessage && (
                    <p className="error-message">{errorMessage}</p>
                  )}
                </div>
              </div>
            )}
            <TextareaAutosize
              className="message-textarea"
              minRows={2}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button
              className="send-button"
              onClick={sendMessage}
              disabled={sendButtonDisabled}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MessagingPage;
