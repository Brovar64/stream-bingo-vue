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
  async function createRoom(roomCode, gridSize = 5, initialWords = []) {
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
        gridSize = 5; // Default to 5x5 if invalid
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
   * Join a room as a player
   */
  async function joinRoom(nickname, roomId) {
    loading.value = true;
    
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
      
      // Check if player already exists in the room
      const playerExists = (roomData.value.players || []).some(player => player.nickname === nickname);
      
      if (!playerExists) {
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
        notificationStore.showNotification(`Resumed session in room ${roomId} as ${nickname}`, 'success');
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
