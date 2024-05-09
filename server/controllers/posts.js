import Notification from "../models/Notification.js";
import Post from "../models/Post.js";
import User from "../models/User.js";

/* CREATE */
export const createPost = async (req, res) => {
  try {
    const { userId, description, picturePath } = req.body;
    const user = await User.findById(userId);
    const newPost = new Post({
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      location: user.location,
      description,
      userPicturePath: user.picturePath,
      picturePath,
      likes: {},
      comments: [],
    });
    await newPost.save();

    const post = await Post.find();
    res.status(201).json(post);
  } catch (err) {
    res.status(409).json({ message: err.message });
  }
};

/* READ */
export const getFeedPosts = async (req, res) => {
  try {
    const post = await Post.find();
    res.status(200).json(post);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const post = await Post.find({ userId });
    res.status(200).json(post);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
export const getPostById = async (req, res) => {
  try {
    // Extract the post ID from the request parameters
    const { id } = req.params;

    // Find the post by its ID in the database
    const post = await Post.findById(id);

    // Check if the post exists
    if (!post) {
      // If the post is not found, return a 404 error response
      return res.status(404).json({ message: "Post not found" });
    }

    // If the post is found, send it as a response
    res.status(200).json(post);
  } catch (error) {
    // If an error occurs, send a 500 error response with the error message
    res.status(500).json({ message: error.message });
  }
};
export const getPostByKey = async (req, res) => {
  try {
    const { key } = req.params;
    const posts = await Post.find({
      description: { $regex: key, $options: "i" },
    }); 
    if (!posts || posts.length === 0) {
      // Check if no posts were found
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
/* UPDATE */
export const getNotif = async (req, res) => {
  try {
    const {userId} = req.params;
    const notifications = await Notification.find({userId});
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const post = await Post.findById(id);
    const isLiked = post.likes.get(userId);

    if (isLiked) {
      post.likes.delete(userId);
    } else {
      post.likes.set(userId, true);
      const notification = new Notification({
        userId: post.userId,
        postId: id,
        userName:userId,
        type: "like",
      });
      await notification.save();
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { likes: post.likes },
      { new: true }
    );
    // Create notification

    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
export const DeleteNotif = async (req, res) => {
  try {
    const {userId} = req.params;
    const notifications = await Notification.find({ userId: userId });
        if (notifications.length === 0) {
            return res.status(404).json({ message: 'No notifications found for the user' });
        }

        // Delete all notifications
        await Notification.deleteMany({ userId: userId });
        res.status(200).json({ message: 'All notifications deleted successfully' });
    } catch (error) {
        console.error('Error deleting notifications:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, username, text } = req.body;

    const post = await Post.findById(id);

    const newComment = {
      userId,
      username,
      text,
    };

    post.comments.push(newComment);
    await post.save();
    // Create notification
    const notification = new Notification({
      userId: post.userId,
      postId: id,
      userName:userId,
      type: "comment",
    });
    await notification.save();
    res.status(200).json(post);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
