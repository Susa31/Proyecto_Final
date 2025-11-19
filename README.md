Zentro:

A social media application inspired by Twitter, built with React Native. Zentro enables users to share thoughts, images, and videos, follow other users, and engage with content through a clean and intuitive interface.

Overview:

Zentro is a mobile-first social platform that replicates core Twitter functionality with a modern tech stack. The application provides real-time updates, media sharing capabilities, and user interaction features.

Tech Stack:

Frontend: React Native CLI
Backend & Database: Firebase
Media Storage: Cloudinary
HTTP Client: Axios
Platforms: iOS and Android

Project Structure:

src/
├── Assets/                 # Static resources
│   └── zentrologo.png     # Application logo
├── Components/            # Reusable UI components
│   ├── PostCard.js        # Individual post display component
│   └── ZHeader.js         # Custom header component
├── config/                # Configuration files
│   ├── firebase.js        # Firebase initialization
│   ├── firebaseService.js # Firebase API methods
│   └── imageService.js    # Media handling with Cloudinary
├── Screens/               # Application screens
│   ├── Feed.js            # Main content feed
│   ├── Login.js           # User authentication
│   ├── Register.js        # User registration
│   ├── PublishPost.js     # Create new posts
│   ├── ViewPost.js        # Individual post view
│   ├── ViewProfile.js     # User profile display
│   ├── Search.js          # User and content discovery
│   ├── PostList.js        # Posts collection view
│   ├── FollowersList.js   # User followers
│   ├── FollowingList.js   # Users being followed
│   └── RepostsList.js     # Reposted content
└── Styles/                # Application styling
    └── Styles.js          # Centralized style definitions
App.js #Uses Stack Navigation


Key Features
User authentication and registration

Post creation with text, images, and videos
Real-time feed updates
User profiles with follower/following management
User search
Repost functionality

Installation & Setup:

Clone the repository:
git clone https://github.com/Susa31/Proyecto_Final
Install dependencies:
npm install
Configure environment variables for Firebase and Cloudinary in the respective config files.

Run the application:

npx react-native run-android
#or
npx react-native run-ios

Configuration:

The application requires proper configuration of Firebase and Cloudinary services. Update the configuration files in the config/ directory with your project credentials:

firebase.js: Firebase project configuration
imageService.js: Cloudinary API settings

Development:

Built with React Native CLI, Zentro follows component-based architecture principles. The codebase is organized into modular components and services for maintainability and scalability.

The application leverages Firebase for real-time data synchronization and user management, while Cloudinary handles media storage and optimization through Axios-based API calls.