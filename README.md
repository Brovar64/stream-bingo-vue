# Stream Bingo (Vue Version)

A Vue.js application for streamers to create and manage interactive bingo games for their viewers. This is a modern Vue.js rewrite of the original Stream Bingo application.

## Features

- **For Streamers (Admin):**
  - Create custom bingo rooms
  - Add custom bingo event words
  - Approve/reject viewer marks
  - Track player progress
  - Monitor bingo winners

- **For Viewers (Players):**
  - Join rooms with a simple code
  - Get unique randomized bingo boards
  - Mark cells when events happen
  - Track approval status
  - Win by getting five in a row!

- **Real-time Updates:**
  - Firebase Firestore integration
  - Live updates across all devices
  - Persistent game state

## Recent Fixes and Improvements

- **Enhanced UI for Admin:**
  - Pending approvals now shown directly on bingo words with player initials
  - Show full bingo word content with proper wrapping
  - Expand player grids directly below player names
  
- **Bug Fixes:**
  - Fixed synchronization between admin and player views for checked/unchecked words
  - Calling or uncalling a word now updates correctly across all players and the admin UI
  - Suppressed common Firebase errors in the console for a cleaner development experience
  - Improved error handling for concurrent updates
  - Fixed proper tracking of winner status when unchecking words

## How the Game Works

### For Streamers:

1. **Create a Room**: Generate a unique room code and set a grid size (3x3, 4x4, or 5x5).
2. **Set Up Words**: Add words or phrases that might happen during your stream.
3. **Start the Game**: Once you have enough words, activate the game so viewers can join.
4. **Manage the Game**:
   - Call out words when they happen during the stream (click on them to toggle their status)
   - Approve or reject viewer marks directly on the bingo words
   - View player grids by clicking on a player's name
   - Monitor which players have achieved bingo

### For Viewers:

1. **Join a Room**: Enter the room code provided by the streamer.
2. **Get a Bingo Card**: Each player gets a unique randomized board.
3. **Play Along**: Mark cells when the events happen during the stream.
4. **Get Approved**: The streamer approves your marks if they're valid.
5. **Win**: Get five in a row (horizontal, vertical, or diagonal) to win!

## Technologies Used

- Vue.js 3 with Composition API
- Pinia for state management
- Vue Router for navigation
- Tailwind CSS for styling
- Firebase (Firestore, Authentication)
- GitHub Pages for deployment

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account (for database)

### Installation

1. Clone this repository:
```bash
git clone https://github.com/Brovar64/stream-bingo-vue.git
cd stream-bingo-vue
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run serve
```

4. Open your browser and visit: `http://localhost:8080`

## Project Structure

```
stream-bingo-vue/
├── public/                 # Static files
├── src/                    # Source files
│   ├── assets/             # Assets (CSS, images)
│   ├── components/         # Vue components
│   ├── firebase/           # Firebase configuration
│   ├── router/             # Vue Router configuration
│   ├── stores/             # Pinia stores
│   ├── views/              # Page components
│   ├── App.vue             # Root component
│   └── main.js             # Application entry point
├── .github/                # GitHub Actions workflows
└── ...                     # Config files
```

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## Comparison to Original Version

The Vue.js version offers several advantages over the original:

- **Component-Based Architecture**: More maintainable and modular code
- **Improved State Management**: Centralized state with Pinia
- **Type Safety**: Better developer experience
- **Performance**: More efficient rendering and updates
- **Modern UI**: Enhanced user interface with Tailwind CSS

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Original Stream Bingo application by Brovar64
- Vue.js team for the incredible framework
- Firebase team for the backend services