# CribConnect 🏡

**A Full-Stack Property & Roommate Discovery Platform**

CribConnect is a full-stack web application designed to simplify the process of finding properties and compatible roommates. It combines location-based property discovery, identity verification, real-time communication, community engagement, and AI-powered assistance in one platform.

## ✨ Features

- **Authentication & Security:** JWT-based authentication for secure user access.
- **Identity Verification:** Aadhaar/PAN-based verification functionality to support user trust and credibility.
- **Location-Based Property Search:** Discover properties based on geographic location.
- **Interactive Maps:** Leaflet integration for map-based property discovery, address autocomplete, and route visualization.
- **Roommate Discovery:** Explore roommate options and connect with potential matches.
- **Real-Time Communication:** Chatrooms for communication between users.
- **Community Posts:** Share updates, interact with other users, and build a property-seeking community.
- **AI-Powered Chatbot:** Get assistance with property and roommate discovery through an integrated AI chatbot.

## 🛠️ Tech Stack

The project uses a full-stack JavaScript architecture.

| Category | Technologies |
|---|---|
| Frontend | JavaScript-based web frontend |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Authentication | JSON Web Tokens (JWT) |
| Maps & Geolocation | Leaflet, geolocation APIs |
| Communication | Dedicated chat backend |
| AI Integration | AI-powered chatbot |

*Update this section to reflect the exact libraries, database, and services used in your implementation.*

## 📁 Project Structure

```text
CribConnect/
├── backend/          # Main backend API
├── chat-backend/     # Chat and messaging services
├── frontned/         # Frontend application
├── .gitignore
└── README.md
```

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- MongoDB or access to your configured database
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Manawi16/CribConnect.git
cd CribConnect
```

### 2. Install Dependencies

Install dependencies separately for each application directory.

```bash
cd backend
npm install

cd ../chat-backend
npm install

cd ../frontned
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in each directory that requires environment variables. Refer to the configuration expected by the corresponding application.

For example, your configuration may include:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Add any additional variables required for the chat service, frontend, maps, or AI integration.

**Important:** Replace the example values with your actual configuration. Never commit real credentials, API keys, tokens, or sensitive identity data to GitHub.

### 4. Run the Application

Open separate terminals for the frontend, main backend, and chat backend.

Start each service using the appropriate scripts defined in its `package.json`. For example:

```bash
npm run dev
```

Run that command from the relevant directory only if the corresponding `package.json` defines a `dev` script. Check the scripts before starting the services.

## 🔐 Security & Privacy

- Authentication is handled using JWTs.
- Environment variables are used for sensitive configuration.
- Identity verification and personal information should be handled securely.
- Never expose API credentials or sensitive user information in the repository.

## 🎯 Project Objective

CribConnect aims to make property and roommate discovery more convenient by bringing property listings, location intelligence, user verification, communication, and community interaction into a unified platform.

## 🔮 Future Enhancements

- Advanced property filtering and personalized recommendations.
- Improved roommate compatibility matching.
- Enhanced property verification workflows.
- More sophisticated AI-driven discovery and assistance.
- Additional security and privacy controls.

## 👩‍💻 Author

**Manawi Choudhary**

GitHub: [@Manawi16](https://github.com/Manawi16)

---

*CribConnect: Find your space. Find your people.*
