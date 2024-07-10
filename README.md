 

# Chat Application Setup Guide

This repository contains the code for a real-time chat application built using Django for the backend and React/Angular for the frontend. The application allows users to send interest messages to other users, and if the interest is accepted, both users can chat with each other.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- You have installed the latest version of Node.js and npm.
- You have Python installed on your machine.
- You have Django installed on your machine.
- You have  frontend framework React installed on your machine.

## Installation

Follow these steps to set up the project:

1. Navigate to the `frontend` directory and install the necessary dependencies:

   ```
   cd frontend
   npm install
   ```

2. Start the frontend server:

   ```
   npm start
   ```

   This command runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser. The page will reload if you make edits.

3. Navigate to the `backend` directory and install the necessary dependencies:

   ```
   cd ../backend
    ```

4. Apply migrations and start the backend server:

   ```
   python manage.py makemigrations
   python manage.py migrate
   daphne backend.asgi:application
   ```

   This starts the ASGI server, which serves your Django application.

## Usage

After starting both the frontend and backend servers, you can interact with the application through the frontend interface. Follow these steps:

- To send an interest message, select a user and click the "Send Interest" button.
- To accept or reject an interest, click the corresponding button next to the interest message.
- To chat with a user, navigate to the chat interface after accepting an interest.

## Contributing

Contributions are welcome! Please read the CONTRIBUTING.md file for details on how to contribute.

## License

This project uses the MIT License. See the LICENSE file for details.

