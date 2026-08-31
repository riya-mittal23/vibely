import type { GameRoomState, ClientGameState, ClientRoundState } from '../types/index.js';

export function serializeGameStateForPlayer(state: GameRoomState, playerId: string): ClientGameState {
  let clientRound: ClientRoundState | null = null;
  
  if (state.currentRound) {
    const r = state.currentRound;
    clientRound = {
      number: r.number,
      spectrumId: r.spectrumId,
      leftLabel: r.leftLabel,
      rightLabel: r.rightLabel,
      clue: r.clue,
      clueGiverId: r.clueGiverId,
      guessingTeamId: r.guessingTeamId,
      guessControllerId: r.guessControllerId,
      guessPosition: r.guessPosition,
      guessLocked: r.guessLocked,
      status: r.status,
      startedAt: r.startedAt,
      deadlineAt: r.deadlineAt,
      roundScore: r.roundScore
    };

    // SECURITY: Only include target position if the round is revealed, 
    // OR if the player is the clue giver.
    if (r.status === 'REVEAL' || r.status === 'RESULT' || r.clueGiverId === playerId) {
      clientRound.targetPosition = r.targetPosition;
      clientRound.targetWidth = r.targetWidth;
    }
  }

  return {
    id: state.id,
    code: state.code,
    hostPlayerId: state.hostPlayerId,
    status: state.status,
    settings: state.settings,
    players: state.players,
    teams: state.teams,
    currentRound: clientRound,
    roundNumber: state.roundNumber,
    roundHistory: state.roundHistory
  };
}
