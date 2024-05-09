
import Message from '../models/Message.js'
// Controller to send a message
export const sendMessage = async (req, res) => {
  try {
    const { sender, receiver, content } = req.body;
    const message = new Message({ sender, receiver, content });
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller to get messages between two users
export const getAllMessages = async (req, res) => {
  try {  
    const { email } = req.params;
    const messages = await Message.find({  $or: [
      { sender:email },
      { receiver: email },
    ]});
    if (!messages) {
      return res.status(404).json({ message: 'No messages found for this sender' });
    }
    res.status(200).json(messages);
  } catch (error) { 
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Controller to get messages between two users
export const getMessages = async (req, res) => {
  try {
    const { sender, receiver } = req.params;
    const messages = await Message.find({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender },
      ]
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Controller to delete messages between two users based on email
export const deleteMessages = async (req, res) => {
  try {
    const { email } = req.params;
    // Find messages where the provided email matches sender or receiver
    const messagesToDelete = await Message.deleteMany({ $or: [{ sender: email }, { receiver: email }] });
    res.status(200).json({ message: 'Messages deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};