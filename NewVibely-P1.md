# VIBELY — PHASE 3A

## Room-Based Identity, Room Lifecycle & Multiplayer Foundation

You are working on an existing project called **Vibely**.

The project already has:

* React + Vite + TypeScript frontend
* Tailwind CSS
* Framer Motion
* Node.js + Express + TypeScript backend
* Socket.IO multiplayer architecture
* Existing GameEngine
* Existing lobby
* Existing room creation/joining
* Existing team/role logic
* Existing spectrum gameplay
* Existing server-authoritative scoring
* Existing reveal/result flow

**IMPORTANT: Do NOT rebuild the existing application from scratch.**

First inspect the entire existing frontend and backend structure and understand how the current Phase 1 and Phase 2 implementation works.

Preserve working functionality unless it conflicts directly with the requirements below.

---

# PRODUCT DIRECTION

Vibely is now a purely temporary room-based multiplayer game.

We are intentionally NOT implementing:

* MongoDB
* Mongoose
* User accounts
* Login
* Authentication
* Persistent user profiles
* Persistent statistics
* Achievements
* AI
* Ollama
* Payments
* Redis yet

Everything should be temporary and live in backend memory.

The only persistent concept during the lifetime of the application is the active room in backend memory.

The product loop is:

CREATE/JOIN ROOM
→ ENTER USERNAME
→ LOBBY
→ CHOOSE GENRE
→ CREATE TEAMS
→ PLAY LEVELS 1–5
→ GAME COMPLETE / FAILED
→ STAY IN ROOM
→ PLAY AGAIN

---

# 1. REMOVE THE OLD USER PERSISTENCE CONCEPT

If the current implementation contains any planned or partially implemented:

* MongoDB connection
* User model
* User repository
* persistent statistics
* persistent username ownership
* account/profile logic

remove or disable those pieces for this phase.

Do not leave dead MongoDB code that creates confusion.

The application should run without MongoDB.

---

# 2. ROOM-SCOPED PLAYER IDENTITY

A player is identified by a server-generated `playerId`.

Example:

```ts
interface Player {
  playerId: string;
  username: string;
  socketId: string;

  teamId: string | null;

  connected: boolean;

  joinedAt: number;
  lastSeenAt: number;
}
```

Username is ONLY a display name.

Never use username as the primary identity.

Generate a unique server-side player ID using a cryptographically safe random ID.

Example:

```text
p_8f92kd
```

---

# 3. USERNAME RULE

Username uniqueness exists ONLY inside a room.

Example:

ROOM ABC123:

Riya
Rahul
Simran

Another room can also contain:

Riya

Do not globally reserve usernames.

However, within the same room:

```text
Riya
Riya
```

must be rejected.

Username validation:

* trim whitespace
* minimum 2 characters
* maximum 16 characters
* letters, numbers, spaces and underscore allowed
* normalize for comparison
* case-insensitive uniqueness

Therefore:

```text
Riya
riya
RIYA
```

should be considered the same username inside a room.

Return a clear error:

```text
USERNAME_TAKEN
```

The frontend should allow the player to choose another name.

---

# 4. JOIN FLOW

Implement this UX:

HOME

```text
VIBELY

READY TO VIBE?

[ CREATE ROOM ]
[ JOIN ROOM ]
```

When joining/creating:

```text
WHAT'S YOUR VIBE NAME?

┌─────────────────────┐
│ Riya                │
└─────────────────────┘

[ CONTINUE ]
```

The player name should be submitted to the server.

The server validates it.

Do NOT trust frontend validation alone.

---

# 5. ROOM DATA STRUCTURE

Create a clean in-memory RoomManager.

Recommended structure:

```ts
class RoomManager {
  private rooms: Map<string, GameRoom>;
}
```

A GameRoom should contain:

```ts
interface GameRoom {
  roomCode: string;

  hostPlayerId: string;

  status:
    | "WAITING"
    | "STARTING"
    | "PLAYING"
    | "LEVEL_TRANSITION"
    | "GAME_COMPLETE";

  players: Map<string, Player>;

  teams: {
    teamA: Team;
    teamB: Team;
  };

  settings: RoomSettings;

  game: GameEngine | null;

  createdAt: number;
  updatedAt: number;
  lastActivityAt: number;
}
```

Do not persist this to MongoDB.

---

# 6. ROOM SETTINGS

Create:

```ts
interface RoomSettings {
  genreId: string | null;

  totalVibesPerLevel: number;

  totalLevels: number;
}
```

Default values:

```text
totalVibesPerLevel = 10
totalLevels = 5
```

The host may choose the genre.

The host should NOT need to configure dozens of settings.

Keep the experience simple.

---

# 7. ROOM STATES

Implement explicit room states:

```text
WAITING
STARTING
PLAYING
LEVEL_TRANSITION
GAME_COMPLETE
```

Ensure invalid actions are rejected by the server.

For example:

* player cannot submit a clue while room is WAITING
* player cannot join a completed/expired room
* player cannot start a game if minimum players aren't present
* non-host cannot change genre
* player cannot start another game while one is already running

---

# 8. MINIMUM PLAYER REQUIREMENT

For the initial version:

Minimum players:

```text
4
```

because we require two teams.

Example:

```text
4 players

TEAM A
Riya
Rahul

TEAM B
Simran
Arjun
```

If fewer than 4 players are present:

```text
NOT ENOUGH PLAYERS

Vibely needs at least 4 players
to start a game.

[ INVITE FRIENDS ]
```

Keep the room open.

---

# 9. TEAM MANAGEMENT

Create a TeamManager responsible for:

* assigning players
* removing players
* balancing teams
* shuffling teams
* detecting empty teams

Team:

```ts
interface Team {
  teamId: "A" | "B";

  playerIds: string[];

  score: number;
}
```

At game start:

* require at least 4 players
* divide players as evenly as possible
* assign Team A and Team B
* no team should be empty

For MVP, automatically balance teams.

Also expose a future-friendly method:

```ts
shuffleTeams()
```

so we can later add a Shuffle Teams button.

---

# 10. HOST MANAGEMENT

If the host leaves the room while the room is still active:

Automatically assign a new host from the remaining connected players.

Do not destroy the room merely because the host left.

Broadcast:

```text
HOST_CHANGED
```

The new host receives host permissions.

---

# 11. ROOM REJOIN / RECONNECTION

Do not immediately remove a player because their socket disconnects.

When a socket disconnects:

```text
connected = false
```

Keep the player temporarily.

Use a configurable grace period:

```text
60 seconds
```

During this period:

```text
Riya
🟡 Reconnecting...
```

If the player reconnects successfully:

```text
connected = true
```

and restore their existing player identity and team.

Do not create a duplicate player.

---

# 12. IMPORTANT RECONNECTION DESIGN

Do NOT identify a reconnecting player only by username.

The reconnect mechanism should use a temporary room/player session identifier.

For example:

```text
roomCode
playerId
reconnectToken
```

The reconnect token should be generated securely.

The frontend should retain it for the current room session.

It only needs to survive a temporary socket disconnect.

It does NOT create a permanent account.

---

# 13. SOCKET EVENTS

Review the current Socket.IO event architecture.

Normalize it if necessary.

Recommended events:

Client → Server:

```text
ROOM_CREATE
ROOM_JOIN
ROOM_LEAVE

PLAYER_SET_USERNAME

HOST_SET_GENRE
HOST_START_GAME

PLAYER_RECONNECT
```

Server → Client:

```text
ROOM_CREATED
ROOM_JOINED
ROOM_UPDATED

USERNAME_TAKEN
ROOM_NOT_FOUND
ROOM_FULL
INVALID_ROOM_STATE

PLAYER_JOINED
PLAYER_LEFT
PLAYER_RECONNECTED
PLAYER_DISCONNECTED

HOST_CHANGED

TEAMS_UPDATED

GAME_STARTING
GAME_STARTED
GAME_ENDED
```

Do not duplicate events that already exist. Reuse existing naming conventions where appropriate.

---

# 14. ROOM CLEANUP

Because there is no database:

Implement room cleanup.

If a room has:

```text
0 players
```

for a configurable period, destroy it.

Suggested:

```text
5 minutes
```

Also clean up abandoned game engines.

Do not allow memory leaks.

---

# 15. ROOM UI

Create a polished lobby.

Example:

```text
VIBELY

ROOM
ABC123

[ COPY CODE ]

PLAYERS

🩷 Riya
💙 Rahul
💜 Simran
💛 Arjun

TEAMS

TEAM A
Riya
Rahul

TEAM B
Simran
Arjun

GENRE

[ Choose a genre ]

              [ START GAME ]
```

Only the host should see genre controls and START GAME.

Non-host players should see:

```text
Waiting for Riya to start...
```

---

# 16. DO NOT CHANGE EXISTING GAMEPLAY YET

This phase is about the room foundation.

Preserve the existing:

* spectrum
* target generation
* clue phase
* guess phase
* reveal
* scoring
* role rotation

We will integrate progression and genres in the next phase.

---

# 17. TESTING

Add tests for:

1. Create room.
2. Join room.
3. Duplicate username in same room.
4. Same username in different rooms.
5. Username case-insensitive collision.
6. Username validation.
7. Player leaving.
8. Player reconnecting.
9. Host leaving.
10. Host reassignment.
11. Empty room cleanup.
12. Less than 4 players cannot start.
13. Exactly 4 players can start.
14. Non-host cannot change genre.
15. Non-host cannot start game.
16. Player cannot join invalid room.
17. Player cannot perform gameplay actions in WAITING state.

---

# 18. IMPORTANT ARCHITECTURAL RULE

Use this hierarchy:

```text
Socket.IO
    ↓
RoomManager
    ↓
GameRoom
    ↓
TeamManager
    ↓
GameEngine
```

Do not put all logic inside socket handlers.

Socket handlers should validate/request operations.

Business logic should live in RoomManager/GameRoom/GameEngine services.

---

# 19. UI/UX QUALITY

Maintain Vibely's existing design:

* premium dark background
* glassmorphism
* neon cyan/pink/purple accents
* Framer Motion
* smooth transitions
* mobile responsive
* desktop responsive
* no unnecessary scrollbars
* modern typography
* polished empty/loading/error states

Use animation when:

* player joins
* player leaves
* host changes
* teams update
* room starts

Do not over-animate the UI.

---

# 20. FINAL ACCEPTANCE CRITERIA

After implementation, I should be able to:

1. Open Vibely.
2. Create a room.
3. Enter `Riya`.
4. Share the room code.
5. Another player joins.
6. A second player cannot use `Riya` in the same room.
7. Another room can have a player named `Riya`.
8. At least 2 players are required.
9. Players are automatically divided into two teams.
10. Host can select a genre.
11. Host starts the game.
12. Existing gameplay still works.
13. A disconnected player gets a reconnect grace period.
14. A reconnecting player returns to the same team.
15. If host leaves, another player becomes host.
16. Room remains alive after game completion.
17. Players can eventually start another run in the same room.

Before making changes, inspect the existing architecture and reuse existing code wherever possible.

At the end, provide:

* files created
* files modified
* files removed
* architecture changes
* Socket.IO events added/changed
* tests added
* any remaining technical debt

Do not implement MongoDB, AI, Ollama, authentication, persistent stats, or achievements in this phase.
