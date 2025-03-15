import { defineStore } from 'pinia';
import { 
  doc, collection, query, where, addDoc, updateDoc, 
  deleteDoc, arrayUnion, serverTimestamp, Timestamp
} from 'firebase/firestore';
import { useDocument, useCollection } from 'vuefire';
import { db } from '@/firebase';
import { useNotificationStore } from '@/stores/notification';
import { computed, ref } from 'vue';

export const useVueFireRoomStore = defineStore('vuefireRoom', () => {
  // Local state
  const notificationStore = useNotificationStore();
  const currentRoomId = ref(null);
  const loading = ref(false);
  
  // VueFire reactive data
  const roomDocRef = computed(() => 
    currentRoomId.value ? doc(db, 'rooms', currentRoomId.value) : null
  );
  
  // Current room data with real-time updates
  const { data: roomData, promise: roomPromise } = useDocument(roomDocRef);
  
  // Computed properties
  const isRoomActive = computed(() => roomData.value?.status === 'active');
  const roomPlayers = computed(() => roomData.value?.players || []);
  const playerGrids = computed(() => roomData.value?.playerGrids || {});
  const pendingApprovals = computed(() => roomData.value?.pendingApprovals || []);
  const bingoWinners = computed(() => roomData.value?.bingoWinners || []);
  
  /**
   * Load a room by ID (sets the currentRoomId)
   */
  function loadRoom(roomId) {
    if (!roomId) return Promise.reject(new Error('Room ID is required'));
    
    loading.value = true;
    currentRoomId.value = roomId;
    
    return roomPromise.value
      .then(() => {
        loading.value = false;
        return roomData.value;
      })
      .catch(error => {
        loading.value = false;
        notificationStore.showNotification(`Error loading room: ${error.message}`, 'error');
        throw error;
      });
  }
  
  /**
   * Creates a new room with the specified parameters
   */
  async function createRoom(roomCode, gridSize = 3, initialWords = []) {
    loading.value = true;
    
    try {
      if (!roomCode) {
        notificationStore.showNotification('Please enter a room code', 'error');
        return null;
      }
      
      // Make room code uppercase
      roomCode = roomCode.toUpperCase();
      
      // Validate grid size
      if (![3, 4, 5].includes(gridSize)) {
        gridSize = 3; // Default to 3x3 if invalid
      }
      
      // Create new room data
      const roomData = {
        createdAt: serverTimestamp(),
        gridSize: gridSize,
        creatorId: 'test-user', // Replace with actual user ID
        active: true,
        status: 'setup',
        players: [],
        words: initialWords || [],
        pendingApprovals: [],
        calledOutWords: []
      };
      
      // Create the room
      await updateDoc(doc(db, 'rooms', roomCode), roomData);
      
      notificationStore.showNotification(`Created room ${roomCode} with grid size ${gridSize}x${gridSize}`, 'success');
      
      // Set the current room ID to trigger reactive loading
      currentRoomId.value = roomCode;
      
      return roomCode;
    } catch (error) {
      console.error('Error creating room:', error);
      notificationStore.showNotification(`Error creating room: ${error.message}`, 'error');
      return null;
    } finally {
      loading.value = false;
    }
  }
  
  /**
   * Helper to generate a player grid
   */
  function generatePlayerGrid(nickname, roomData) {
    if (!roomData || !roomData.words || roomData.words.length === 0) {
      console.error('Cannot generate grid: no words available');
      return null;
    }
    
    const gridSize = roomData.gridSize || 3;
    const totalCells = gridSize * gridSize;
    
    // Check if we have enough words
    if (roomData.words.length < totalCells) {
      console.error(`Not enough words (${roomData.words.length}) for grid size ${gridSize}x${gridSize}`);
      return null;
    }
    
    // Shuffle words for randomness
    const shuffledWords = [...roomData.words].sort(() => Math.random() - 0.5);
    
    // Generate grid
    const grid = {};
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const index = row * gridSize + col;
        const cellKey = `${row}_${col}`;
        
        grid[cellKey] = {
          word: shuffledWords[index],
          row: row,
          col: col,
          marked: false,
          approved: false
        };
      }
    }
    
    return grid;
  }
  
  /**
   * Join a room as a player
   */
  async function joinRoom(nickname, roomId) {
    loading.value = true;
    console.log(`VueFire: Joining room ${roomId} as ${nickname}`);
    
    try {
      if (!nickname) {
        notificationStore.showNotification('Please enter your nickname', 'error');
        loading.value = false;
        return null;
      }
      
      if (!roomId) {
        notificationStore.showNotification('Please enter a room code', 'error');
        loading.value = false;
        return null;
      }
      
      // Make room ID uppercase
      roomId = roomId.toUpperCase();
      
      // Set current room ID to load the room
      currentRoomId.value = roomId;
      
      // Wait for room data to load
      await roomPromise.value;
      
      if (!roomData.value) {
        notificationStore.showNotification(`Room ${roomId} not found`, 'error');
        loading.value = false;
        return null;
      }
      
      // Check if room is active
      if (!roomData.value.active) {
        notificationStore.showNotification('This room is no longer active', 'error');
        loading.value = false;
        return null;
      }
      
      console.log(`VueFire: Room loaded with status: ${roomData.value.status}`);
      
      // Check if player already exists in the room
      const playerExists = (roomData.value.players || []).some(player => player.nickname === nickname);
      
      if (!playerExists) {
        console.log(`VueFire: Adding new player ${nickname} to room`);
        // Create player data
        const playerData = {
          nickname: nickname,
          joinedAt: Timestamp.now()
        };
        
        // Update room with new player
        await updateDoc(doc(db, 'rooms', roomId), {
          players: arrayUnion(playerData)
        });
        
        notificationStore.showNotification(`Joined room ${roomId} as ${nickname}`, 'success');
      } else {
        console.log(`VueFire: Player ${nickname} already exists in room`);
        notificationStore.showNotification(`Resumed session in room ${roomId} as ${nickname}`, 'success');
      }
      
      // Check if room is active and player grid needs to be created
      if (roomData.value.status === 'active') {
        console.log(`VueFire: Room is active, checking if player has grid`);
        
        // Check if this player already has a grid
        const hasGrid = roomData.value.playerGrids && 
                      roomData.value.playerGrids[nickname] && 
                      Object.keys(roomData.value.playerGrids[nickname]).length > 0;
        
        if (!hasGrid) {
          console.log(`VueFire: Generating new grid for player ${nickname}`);
          
          // Generate a grid for this player
          const playerGrid = generatePlayerGrid(nickname, roomData.value);
          
          if (playerGrid) {
            // Get current player grids or initialize empty object
            const playerGrids = roomData.value.playerGrids || {};
            
            // Add the new player grid
            playerGrids[nickname] = playerGrid;
            
            // Update Firestore
            console.log(`VueFire: Saving player grid to Firestore`);
            await updateDoc(doc(db, 'rooms', roomId), { playerGrids });
            
            console.log(`VueFire: Player grid created successfully`);
          } else {
            console.error(`VueFire: Failed to generate player grid`);
          }
        } else {
          console.log(`VueFire: Player already has a grid`);
        }
      } else {
        console.log(`VueFire: Room is not active, no grid needed yet`);
      }
      
      loading.value = false;
      return { success: true, roomId };
    } catch (error) {
      console.error('Error joining room:', error);
      notificationStore.showNotification(`Error joining room: ${error.message}`, 'error');
      loading.value = false;
      return null;
    }
  }
  
  /**
   * Mark a cell in a player's grid
   */
  async function markCell(playerName, row, col) {
    if (!roomData.value) {
      notificationStore.showNotification('No room selected', 'error');
      return false;
    }
    
    loading.value = true;
    
    try {
      // Check if the game is in active status
      if (roomData.value.status !== 'active') {
        notificationStore.showNotification('Cannot mark cells - game is not active', 'error');
        loading.value = false;
        return false;
      }
      
      // Check if player exists in the room
      const playerExists = (roomData.value.players || []).some(player => player.nickname === playerName);
      if (!playerExists) {
        notificationStore.showNotification('You are not registered in this room', 'error');
        loading.value = false;
        return false;
      }
      
      // Check if player's grid exists
      if (!roomData.value.playerGrids || !roomData.value.playerGrids[playerName]) {
        notificationStore.showNotification('Your bingo grid is not ready yet', 'error');
        loading.value = false;
        return false;
      }
      
      // Get the cell in question
      const cellKey = `${row}_${col}`;
      const grid = roomData.value.playerGrids[playerName];
      
      if (!grid[cellKey]) {
        notificationStore.showNotification('Invalid cell selection', 'error');
        loading.value = false;
        return false;
      }
      
      // If cell is already marked, don't allow changing
      if (grid[cellKey].marked) {
        notificationStore.showNotification('This cell is already marked', 'info');
        loading.value = false;
        return false;
      }
      
      // Create a deep copy of player grids
      const playerGrids = JSON.parse(JSON.stringify(roomData.value.playerGrids));
      
      // Update the cell as marked but pending approval
      playerGrids[playerName][cellKey].marked = true;
      
      // Create approval request
      const approvalData = {
        playerName: playerName,
        row: row,
        col: col,
        word: grid[cellKey].word,
        timestamp: Timestamp.now()
      };
      
      // Update room data
      await updateDoc(doc(db, 'rooms', currentRoomId.value), {
        playerGrids: playerGrids,
        pendingApprovals: arrayUnion(approvalData)
      });
      
      notificationStore.showNotification('Cell marked! Waiting for admin approval.', 'success');
      loading.value = false;
      return true;
    } catch (error) {
      console.error('Error marking cell:', error);
      notificationStore.showNotification(`Error marking cell: ${error.message}`, 'error');
      loading.value = false;
      return false;
    }
  }
  
  // Cleanup function
  function cleanup() {
    currentRoomId.value = null;
  }
  
  return {
    // State
    currentRoomId,
    roomData,
    loading,
    
    // Computed
    isRoomActive,
    roomPlayers,
    playerGrids,
    pendingApprovals,
    bingoWinners,
    
    // Methods
    loadRoom,
    createRoom,
    joinRoom,
    markCell,
    cleanup
  };
});