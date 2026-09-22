export interface User {

  uid: string;

  name: string;

  username: string;

  email: string;

  profileImage: string;

  coverImage: string;

  bio: string;

  verified: boolean;

  blocked: boolean;

  isAdmin: boolean;

  createdAt: string;

  postsCount?: number;

  friendsCount?: number;

}


export interface Post {

  id: string;

  userId: string;

  userName: string;

  userUsername: string;

  userProfileImage: string;

  userVerified: boolean;

  caption: string;

  imageBase64: string;

  createdAt: string;

  likesCount: number;

  commentsCount: number;

  sharesCount: number;

}


export interface Reaction {

  userId: string;

  type: 'like' | 'love' | 'wow' | 'dislike';

}


export interface Comment {

  id: string;

  userId: string;

  userName: string;

  userUsername: string;

  userProfileImage: string;

  userVerified: boolean;

  text: string;

  createdAt: string;

}


export interface Friend {

  userId: string;

  status: 'pending' | 'accepted' | 'rejected';

  createdAt: string;

}


export interface FriendRequest {

  id: string;

  from: string;

  fromName: string;

  fromUsername: string;

  fromProfileImage: string;

  to: string;

  status: 'pending' | 'accepted' | 'rejected';

  createdAt: string;

}


export interface Notification {

  id: string;

  type: 'like' | 'love' | 'comment' | 'friend_request' | 'friend_accepted' | 'share' | 'message';

  fromUserId: string;

  fromUserName: string;

  fromUserProfileImage: string;

  fromUserVerified: boolean;

  postId?: string;

  message?: string;

  read: boolean;

  createdAt: string;

}


export interface Message {

  id: string;

  senderId: string;

  senderName: string;

  senderProfileImage: string;

  type: 'text' | 'image' | 'post';

  text?: string;

  imageBase64?: string;

  postId?: string;

  postPreview?: Post;

  createdAt: string;

}


export interface Conversation {

  id: string;

  participants: string[];

  lastMessage?: Message;

  lastMessageTime: string;

  unreadCount: number;

}


export interface Favorite {

  postId: string;

  savedAt: string;

}


export interface Report {

  id: string;

  reporterId: string;

  reporterName: string;

  reporterProfileImage: string;

  reportedUserId: string;

  reportedUserName: string;

  reportedUserProfileImage: string;

  postId?: string;

  reason: string;

  details?: string;

  status: 'pending' | 'resolved' | 'dismissed';

  createdAt: string;

}


export interface Toast {

  id: string;

  message: string;

  type: 'success' | 'error' | 'info' | 'warning';

}
