const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const fetchMessagesApi = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/messages/${email}`);
    if (!response.ok) {
      throw new Error("Failed to fetch messages");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

export const fetchUserByEmailApi = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/email/${email}`);
    if (!response.ok) {
      throw new Error("Failed to fetch user data");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching user by email:", error);
    throw error;
  }
};

export const fetchConversationApi = async (currentUserEmail, receiverEmail) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/messages/${currentUserEmail}/${receiverEmail}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch conversation");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching conversation:", error);
    throw error;
  }
};

export const sendMessageApi = async (messageData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messageData),
    });
    if (!response.ok) {
      throw new Error("Failed to send message");
    }
    return await response.json();
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

export const deleteMessageApi = async (email) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/messages/supprimer/${email}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      throw new Error("Failed to delete message");
    }
    return await response.json();
  } catch (error) {
    console.error("Error deleting message:", error);
    throw error;
  }
};
