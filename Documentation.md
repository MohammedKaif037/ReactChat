# Interest Messaging and Chat Application

## Overview

This application allows users to send interest messages to other users, accept or reject those interests, and chat with matched users. It uses Django for the backend and React for the frontend.

## Features

1. User Authentication
2. Sending Interest Messages
3. Accepting/Rejecting Interests
4. Real-time Chat

## Backend (Django)

### Models

#### UserProfile

- Extends the default Django User model
- Additional fields:
  - `name`: CharField
  - `interests`: JSONField

#### Interest

- Fields:
  - `sender`: ForeignKey to User
  - `receiver`: ForeignKey to User
  - `status`: CharField (choices: pending, accepted, rejected)
  - `created_at`: DateTimeField

#### ChatSession

- Fields:
  - `participants`: ManyToManyField to User
  - `created_at`: DateTimeField

#### Message

- Fields:
  - `chat_session`: ForeignKey to ChatSession
  - `sender`: ForeignKey to User
  - `content`: TextField
  - `timestamp`: DateTimeField

### API Endpoints

- `/sync-user/`: Synchronize user data
- `/user-interests/`: Get or update user interests
- `/matched-users/`: Get users with matching interests
- `/interests/`: Send an interest
- `/user-profile/<str:uid>/`: Get user profile
- `/interests/<str:pk>/accept/`: Accept an interest
- `/interests/<str:pk>/reject/`: Reject an interest
- `/chat-requests/`: Get chat requests
- `/chat-messages/<int:session_id>/`: Get chat messages for a session

### WebSocket

- Implemented for real-time notifications of new interests

## Frontend (React)

### Components

#### UserList

- Displays matched users based on selected interest
- Allows sending interests to other users
- Shows received interests and chat requests
- Handles accepting/rejecting chat requests

#### ChatInterface

- Displays chat messages for a specific chat session
- Allows sending new messages

### Key Features

1. **WebSocket Connection**: Establishes a WebSocket connection for real-time updates.
2. **Interest Management**: Allows sending, accepting, and rejecting interests.
3. **Chat Functionality**: Implements a chat interface for accepted interests.

## Setup and Installation

1. Set up a Django project and install required dependencies.
2. Set up a React project and install required dependencies.
3. Configure Django models, views, and URLs as per the provided code.
4. Implement React components and integrate with the Django backend.
5. Set up WebSocket connection for real-time updates.

## Usage

1. Users register and log in to the application.
2. Users can browse other users and send interest messages.
3. Recipients can accept or reject received interests.
4. Upon acceptance, a chat session is created, and users can exchange messages.

## Future Improvements

1. Implement user profile customization.
2. Add user blocking functionality.
3. Implement message read receipts.
4. Add file sharing capabilities in chat.
5. Implement user search functionality.

## Security Considerations

1. Ensure proper authentication and authorization for all API endpoints.
2. Implement rate limiting to prevent abuse.
3. Sanitize and validate all user inputs.
4. Use HTTPS for all communications.
5. Implement proper error handling and logging.

## Conclusion

This application provides a platform for users to connect based on shared interests and engage in conversations. It demonstrates the integration of Django and React, along with real-time capabilities using WebSockets.
