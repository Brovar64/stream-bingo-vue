import { defineStore } from 'pinia'
import * as state from './state'
import * as roomCrud from './roomCrud'
import * as wordManagement from './wordManagement'
import * as playerActions from './playerActions'
import * as adminActions from './adminActions'

export const useRoomStore = defineStore('room', () => {
  // Combine all exports from the individual modules
  return {
    // State
    currentRoom: state.currentRoom,
    userRooms: state.userRooms,
    loading: state.loading,
    
    // Getters
    isRoomLoaded: state.isRoomLoaded,
    isRoomActive: state.isRoomActive,
    isRoomSetup: state.isRoomSetup,
    roomWords: state.roomWords,
    roomPlayers: state.roomPlayers,
    pendingApprovals: state.pendingApprovals,
    playerGrids: state.playerGrids,
    bingoWinners: state.bingoWinners,
    requiredWords: state.requiredWords,
    
    // Room CRUD
    createRoom: roomCrud.createRoom,
    loadRoom: roomCrud.loadRoom,
    loadUserRooms: roomCrud.loadUserRooms,
    deleteRoom: roomCrud.deleteRoom,
    cleanup: roomCrud.cleanup,
    
    // Word Management
    addWord: wordManagement.addWord,
    addMultipleWords: wordManagement.addMultipleWords,
    removeWord: wordManagement.removeWord,
    markWordForAllPlayers: wordManagement.markWordForAllPlayers,
    
    // Player Actions
    joinRoom: playerActions.joinRoom,
    markCell: playerActions.markCell,
    
    // Admin Actions
    startGame: adminActions.startGame,
    resetGame: adminActions.resetGame,
    assignPlayerGrids: adminActions.assignPlayerGrids,
    approvePlayerMark: adminActions.approvePlayerMark,
    rejectPlayerMark: adminActions.rejectPlayerMark,
    resetCalledOutWords: adminActions.resetCalledOutWords
  }
})
