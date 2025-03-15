# Punishment Bingo Mode

This document provides an overview of the Punishment Bingo game mode implementation.

## Overview

Punishment Bingo is a variant of the classic bingo game that adds an interactive punishment element to the game. The key differences are:

1. **Shared Grid**: Unlike classic bingo where each player has their own grid, Punishment Bingo has one shared grid that everyone sees.
2. **Grid Layout**: The grid is 4 columns wide and 3-5 rows high (configurable), divided into two sides:
   - Left side (2 columns): For the room creator
   - Right side (2 columns): For all players
3. **Punishment Element**: Each cell contains both a bingo phrase AND a punishment
4. **Vote System**: Players can vote on whether a punishment was completed correctly

## Implementation Details

The implementation consists of the following components:

### Data Model

The Firestore database structure has been extended with a new collection:

- `punishmentRooms`: Stores punishment room data including grid layout, cells, players, and voting info

Each room document contains:
- `status`: 'setup' or 'active'
- `gridHeight`: Number of rows (3-5)
- `grid`: Object containing cell data
- `calledOutCells`: Array of cell IDs that have been marked
- `completedPunishments`: Array of cell IDs where punishments were completed
- `punishmentVotes`: Object tracking player votes on punishments
- `players`: Array of player data

### New Vue Components

1. **PunishmentRoomView.vue**: Admin view for managing a punishment room
2. **PunishmentPlayerView.vue**: Player view for participating in a punishment game

### Store

The `punishment-room.js` Pinia store manages all the state and operations for punishment rooms, including:
- Room creation and loading
- Grid cell management
- Cell marking and punishment completion status
- Player voting system

### Router Integration

The router has been updated to include routes for the new views:
- `/punishment/:id`: Admin view for managing a punishment room
- `/punishment-play/:id`: Player view for participating in a punishment game

### Dashboard Updates

The dashboard has been updated to:
- Add tabs for selecting between classic and punishment game modes
- Add a creation form for punishment rooms
- Display lists of both classic and punishment rooms
- Allow joining both types of rooms

## Game Flow

1. **Room Creation**: Host creates a punishment room, selecting the grid height
2. **Setup Phase**: Host fills in the grid cells with phrases and punishments
3. **Game Start**: Host starts the game, allowing players to join
4. **Play Phase**:
   - When events happen, host marks the corresponding cell
   - The person on whose side the cell is located must perform the punishment
   - Players vote on whether the punishment was completed correctly
   - Host can approve or reject punishments based on votes

## Technical Notes

- The architecture follows the existing pattern of using Pinia stores for state management
- Firebase Firestore is used for real-time updates across clients
- The implementation is designed to work alongside the classic bingo mode, using separate collections and routes
