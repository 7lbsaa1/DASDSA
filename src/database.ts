import { database } from './firebase';

import { ref, set, get, update, push, remove, onValue, off, query, orderByChild, limitToLast } from 'firebase/database';

import { User, Post, Comment, FriendRequest, Notification, Message, Report, Favorite } from '@/types';


export const db = database;


// Users

export const createUser = async (userId: string, userData: Partial<User>) => {

  await set(ref(db, `users/${userId}`), {

    uid: userId,

    ...userData,

    createdAt: new Date().toISOString(),

  });

};


export const getUser = async (userId: string): Promise<User | null> => {

  const snapshot = await get(ref(db, `users/${userId}`));

  return snapshot.val();

};


export const updateUser = async (userId: string, data: Partial<User>) => {

  await update(ref(db, `users/${userId}`), data);

};


export const getAllUsers = async (): Promise<User[]> => {

  const snapshot = await get(ref(db, 'users'));

  if (!snapshot.val()) return [];

  return Object.values(snapshot.val());

};


export const subscribeToUser = (userId: string, callback: (user: User | null) => void) => {

  const userRef = ref(db, `users/${userId}`);

  onValue(userRef, (snapshot) => {

    callback(snapshot.val());

  });

  return () => off(userRef);

};


export const searchUsers = async (searchTerm: string): Promise<User[]> => {

  const users = await getAllUsers();

  const term = searchTerm.toLowerCase();

  return users.filter(user => 

    user.name?.toLowerCase().includes(term) || 

    user.username?.toLowerCase().includes(term)

  );

};


// Posts

export const createPost = async (postData: Omit<Post, 'id'>): Promise<string> => {

  const postsRef = ref(db, 'posts');

  const newPostRef = push(postsRef);

  await set(newPostRef, { id: newPostRef.key, ...postData });

  

  // Update user posts count

  const userRef = ref(db, `users/${postData.userId}/postsCount`);

  const snapshot = await get(userRef);

  const currentCount = snapshot.val() || 0;

  await set(userRef, currentCount + 1);

  

  return newPostRef.key!;

};


export const getPosts = async (limit: number = 20): Promise<Post[]> => {

  const postsRef = query(ref(db, 'posts'), orderByChild('createdAt'), limitToLast(limit));

  const snapshot = await get(postsRef);

  if (!snapshot.val()) return [];

  const posts = Object.values(snapshot.val()) as Post[];

  return posts.reverse();

};


export const getUserPosts = async (userId: string): Promise<Post[]> => {

  const snapshot = await get(ref(db, 'posts'));

  if (!snapshot.val()) return [];

  const posts = Object.values(snapshot.val()) as Post[];

  return posts.filter(post => post.userId === userId).reverse();

};


export const deletePost = async (postId: string, userId: string) => {

  await remove(ref(db, `posts/${postId}`));

  await remove(ref(db, `reactions/${postId}`));

  await remove(ref(db, `comments/${postId}`));

  await remove(ref(db, `favorites/${userId}/${postId}`));

  

  // Update user posts count

  const userRef = ref(db, `users/${userId}/postsCount`);

  const snapshot = await get(userRef);

  const currentCount = snapshot.val() || 0;

  await set(userRef, Math.max(0, currentCount - 1));

};


export const subscribeToPosts = (callback: (posts: Post[]) => void) => {

  const postsRef = query(ref(db, 'posts'), orderByChild('createdAt'), limitToLast(50));

  onValue(postsRef, (snapshot) => {

    if (!snapshot.val()) {

      callback([]);

      return;

    }

    const posts = Object.values(snapshot.val()) as Post[];

    callback(posts.reverse());

  });

  return () => off(postsRef);

};


// Reactions

export const setReaction = async (postId: string, userId: string, type: 'like' | 'love' | 'wow' | 'dislike' | null) => {

  if (type) {

    await set(ref(db, `reactions/${postId}/${userId}`), { userId, type });

  } else {

    await remove(ref(db, `reactions/${postId}/${userId}`));

  }

  

  // Update post likes count

  const reactionsSnapshot = await get(ref(db, `reactions/${postId}`));

  const reactions = reactionsSnapshot.val() || {};

  const positiveReactions = Object.values(reactions).filter((r: any) => r.type !== 'dislike').length;

  await update(ref(db, `posts/${postId}`), { likesCount: positiveReactions });

};


export const getReactions = async (postId: string): Promise<Record<string, { userId: string; type: string }>> => {

  const snapshot = await get(ref(db, `reactions/${postId}`));

  return snapshot.val() || {};

};


export const subscribeToReactions = (postId: string, callback: (reactions: Record<string, { userId: string; type: string }>) => void) => {

  const reactionsRef = ref(db, `reactions/${postId}`);

  onValue(reactionsRef, (snapshot) => {

    callback(snapshot.val() || {});

  });

  return () => off(reactionsRef);

};


// Comments

export const addComment = async (postId: string, comment: Omit<Comment, 'id'>): Promise<string> => {

  const commentsRef = ref(db, `comments/${postId}`);

  const newCommentRef = push(commentsRef);

  await set(newCommentRef, { id: newCommentRef.key, ...comment });

  

  // Update post comments count

  const postRef = ref(db, `posts/${postId}/commentsCount`);

  const snapshot = await get(postRef);

  const currentCount = snapshot.val() || 0;

  await set(postRef, currentCount + 1);

  

  return newCommentRef.key!;

};


export const getComments = async (postId: string): Promise<Comment[]> => {

  const snapshot = await get(ref(db, `comments/${postId}`));

  if (!snapshot.val()) return [];

  return Object.values(snapshot.val()).sort((a: any, b: any) => 

    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()

  );

};


export const deleteComment = async (postId: string, commentId: string) => {

  await remove(ref(db, `comments/${postId}/${commentId}`));

  

  // Update post comments count

  const postRef = ref(db, `posts/${postId}/commentsCount`);

  const snapshot = await get(postRef);

  const currentCount = snapshot.val() || 0;

  await set(postRef, Math.max(0, currentCount - 1));

};


export const subscribeToComments = (postId: string, callback: (comments: Comment[]) => void) => {

  const commentsRef = ref(db, `comments/${postId}`);

  onValue(commentsRef, (snapshot) => {

    if (!snapshot.val()) {

      callback([]);

      return;

    }

    const comments = Object.values(snapshot.val()) as Comment[];

    callback(comments.sort((a, b) => 

      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()

    ));

  });

  return () => off(commentsRef);

};


// Friends

export const sendFriendRequest = async (from: string, to: string, fromUser: User) => {

  const requestId = push(ref(db, `friendRequests/${to}`)).key!;

  await set(ref(db, `friendRequests/${to}/${requestId}`), {

    id: requestId,

    from,

    fromName: fromUser.name,

    fromUsername: fromUser.username,

    fromProfileImage: fromUser.profileImage,

    to,

    status: 'pending',

    createdAt: new Date().toISOString(),

  });

};


export const acceptFriendRequest = async (requestId: string, from: string, to: string) => {

  await update(ref(db, `friendRequests/${to}/${requestId}`), { status: 'accepted' });

  

  // Add to both users' friends lists

  await set(ref(db, `friends/${from}/${to}`), { userId: to, status: 'accepted', createdAt: new Date().toISOString() });

  await set(ref(db, `friends/${to}/${from}`), { userId: from, status: 'accepted', createdAt: new Date().toISOString() });

  

  // Update friends count for both users

  for (const userId of [from, to]) {

    const userRef = ref(db, `users/${userId}/friendsCount`);

    const snapshot = await get(userRef);

    const currentCount = snapshot.val() || 0;

    await set(userRef, currentCount + 1);

  }

};


export const rejectFriendRequest = async (requestId: string, userId: string) => {

  await update(ref(db, `friendRequests/${userId}/${requestId}`), { status: 'rejected' });

};


export const getFriendRequests = async (userId: string): Promise<FriendRequest[]> => {

  const snapshot = await get(ref(db, `friendRequests/${userId}`));

  if (!snapshot.val()) return [];

  return Object.values(snapshot.val()).filter((r: any) => r.status === 'pending');

};


export const getFriends = async (userId: string): Promise<string[]> => {

  const snapshot = await get(ref(db, `friends/${userId}`));

  if (!snapshot.val()) return [];

  return Object.keys(snapshot.val());

};


export const subscribeToFriendRequests = (userId: string, callback: (requests: FriendRequest[]) => void) => {

  const requestsRef = ref(db, `friendRequests/${userId}`);

  onValue(requestsRef, (snapshot) => {

    if (!snapshot.val()) {

      callback([]);

      return;

    }

    const requests = Object.values(snapshot.val()).filter((r: any) => r.status === 'pending') as FriendRequest[];

    callback(requests);

  });

  return () => off(requestsRef);

};


export const subscribeToFriends = (userId: string, callback: (friends: string[]) => void) => {

  const friendsRef = ref(db, `friends/${userId}`);

  onValue(friendsRef, (snapshot) => {

    if (!snapshot.val()) {

      callback([]);

      return;

    }

    callback(Object.keys(snapshot.val()));

  });

  return () => off(friendsRef);

};


// Notifications

export const createNotification = async (userId: string, notification: Omit<Notification, 'id'>) => {

  const notificationsRef = ref(db, `notifications/${userId}`);

  const newNotificationRef = push(notificationsRef);

  await set(newNotificationRef, { id: newNotificationRef.key, ...notification, read: false });

};


export const getNotifications = async (userId: string): Promise<Notification[]> => {

  const notificationsRef = query(ref(db, `notifications/${userId}`), orderByChild('createdAt'), limitToLast(50));

  const snapshot = await get(notificationsRef);

  if (!snapshot.val()) return [];

  return Object.values(snapshot.val()).reverse();

};


export const markNotificationAsRead = async (userId: string, notificationId: string) => {

  await update(ref(db, `notifications/${userId}/${notificationId}`), { read: true });

};


export const subscribeToNotifications = (userId: string, callback: (notifications: Notification[]) => void) => {

  const notificationsRef = query(ref(db, `notifications/${userId}`), orderByChild('createdAt'), limitToLast(50));

  onValue(notificationsRef, (snapshot) => {

    if (!snapshot.val()) {

      callback([]);

      return;

    }

    const notifications = Object.values(snapshot.val()).reverse() as Notification[];

    callback(notifications);

  });

  return () => off(notificationsRef);

};


// Messages

export const sendMessage = async (conversationId: string, message: Omit<Message, 'id'>): Promise<string> => {

  const messagesRef = ref(db, `messages/${conversationId}`);

  const newMessageRef = push(messagesRef);

  await set(newMessageRef, { id: newMessageRef.key, ...message });

  

  // Update conversation

  await update(ref(db, `conversations/${conversationId}`), {

    lastMessage: { ...message, id: newMessageRef.key },

    lastMessageTime: new Date().toISOString(),

  });

  

  return newMessageRef.key!;

};


export const getMessages = async (conversationId: string): Promise<Message[]> => {

  const snapshot = await get(ref(db, `messages/${conversationId}`));

  if (!snapshot.val()) return [];

  return Object.values(snapshot.val()).sort((a: any, b: any) => 

    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()

  );

};


export const subscribeToMessages = (conversationId: string, callback: (messages: Message[]) => void) => {

  const messagesRef = ref(db, `messages/${conversationId}`);

  onValue(messagesRef, (snapshot) => {

    if (!snapshot.val()) {

      callback([]);

      return;

    }

    const messages = Object.values(snapshot.val()).sort((a: any, b: any) => 

      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()

    ) as Message[];

    callback(messages);

  });

  return () => off(messagesRef);

};


export const createConversation = async (user1: string, user2: string): Promise<string> => {

  const conversationId = [user1, user2].sort().join('_');

  const exists = await get(ref(db, `conversations/${conversationId}`));

  if (!exists.val()) {

    await set(ref(db, `conversations/${conversationId}`), {

      id: conversationId,

      participants: [user1, user2],

      lastMessageTime: new Date().toISOString(),

      unreadCount: 0,

    });

  }

  return conversationId;

};


export const getConversations = async (userId: string): Promise<any[]> => {

  const snapshot = await get(ref(db, 'conversations'));

  if (!snapshot.val()) return [];

  const conversations = Object.values(snapshot.val()) as any[];

  return conversations

    .filter(c => c.participants.includes(userId))

    .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());

};


export const subscribeToConversations = (userId: string, callback: (conversations: any[]) => void) => {

  onValue(ref(db, 'conversations'), (snapshot) => {

    if (!snapshot.val()) {

      callback([]);

      return;

    }

    const conversations = Object.values(snapshot.val()) as any[];

    callback(

      conversations

        .filter(c => c.participants.includes(userId))

        .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime())

    );

  });

  return () => off(ref(db, 'conversations'));

};


// Favorites

export const addToFavorites = async (userId: string, postId: string) => {

  await set(ref(db, `favorites/${userId}/${postId}`), { postId, savedAt: new Date().toISOString() });

};


export const removeFromFavorites = async (userId: string, postId: string) => {

  await remove(ref(db, `favorites/${userId}/${postId}`));

};


export const getFavorites = async (userId: string): Promise<Favorite[]> => {

  const snapshot = await get(ref(db, `favorites/${userId}`));

  if (!snapshot.val()) return [];

  return Object.values(snapshot.val());

};


export const isFavorite = async (userId: string, postId: string): Promise<boolean> => {

  const snapshot = await get(ref(db, `favorites/${userId}/${postId}`));

  return !!snapshot.val();

};


export const subscribeToFavorites = (userId: string, callback: (postIds: string[]) => void) => {

  onValue(ref(db, `favorites/${userId}`), (snapshot) => {

    if (!snapshot.val()) {

      callback([]);

      return;

    }

    callback(Object.keys(snapshot.val()));

  });

  return () => off(ref(db, `favorites/${userId}`));

};


// Reports

export const createReport = async (report: Omit<Report, 'id'>): Promise<string> => {

  const reportsRef = ref(db, 'reports');

  const newReportRef = push(reportsRef);

  await set(newReportRef, { id: newReportRef.key, ...report, status: 'pending' });

  return newReportRef.key!;

};


export const getReports = async (): Promise<Report[]> => {

  const snapshot = await get(ref(db, 'reports'));

  if (!snapshot.val()) return [];

  return Object.values(snapshot.val()).sort((a: any, b: any) => 

    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()

  );

};


export const updateReportStatus = async (reportId: string, status: 'pending' | 'resolved' | 'dismissed') => {

  await update(ref(db, `reports/${reportId}`), { status });

};


export const subscribeToReports = (callback: (reports: Report[]) => void) => {

  onValue(ref(db, 'reports'), (snapshot) => {

    if (!snapshot.val()) {

      callback([]);

      return;

    }

    const reports = Object.values(snapshot.val()).sort((a: any, b: any) => 

      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()

    ) as Report[];

    callback(reports);

  });

  return () => off(ref(db, 'reports'));

};


// Block

export const blockUser = async (userId: string) => {

  await update(ref(db, `users/${userId}`), { blocked: true });

};


export const unblockUser = async (userId: string) => {

  await update(ref(db, `users/${userId}`), { blocked: false });

};


// Verification

export const verifyUser = async (userId: string) => {

  await update(ref(db, `users/${userId}`), { verified: true });

};


export const unverifyUser = async (userId: string) => {

  await update(ref(db, `users/${userId}`), { verified: false });

};


// Admin

export const setAdmin = async (userId: string, isAdmin: boolean) => {

  await update(ref(db, `users/${userId}`), { isAdmin });

};

