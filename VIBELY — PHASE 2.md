# VIBELY — PHASE 2
## Real-Time Online Multiplayer

You are a senior full-stack multiplayer game engineer, real-time systems architect, and game UX designer.

You are continuing development of an existing application called:

# VIBELY

Phase 1 already exists.

DO NOT rebuild Phase 1 from scratch.

DO NOT replace the existing visual identity.

DO NOT replace the existing game engine unnecessarily.

DO NOT convert the project to Next.js.

The existing architecture is:

vibely/

  frontend/

  backend/

The frontend uses:

- React
- Vite
- TypeScript
- Tailwind CSS
- React Router

The backend uses:

- Node.js
- Express
- TypeScript

Phase 2 adds real-time online multiplayer.

---

# 1. PHASE 2 OBJECTIVE

Convert VIBELY from a local/pass-and-play game into a real-time online multiplayer party game.

Players should be able to:

1. Create a room.
2. Receive a room code.
3. Share the room code.
4. Join from another device.
5. See each other in a lobby.
6. Configure the game.
7. Start the game.
8. Receive roles.
9. See the game synchronized in real time.
10. Give clues.
11. Guess on the spectrum.
12. Lock guesses.
13. Reveal the target.
14. See scores.
15. Continue through rounds.
16. Finish the game.
17. Reconnect if temporarily disconnected.

The experience should feel instantaneous.

---

# 2. CRITICAL ARCHITECTURAL PRINCIPLE

THE SERVER IS THE SOURCE OF TRUTH.

The client must NEVER be trusted for:

- target position
- target width
- score
- distance
- round number
- game phase
- role
- team
- host status
- timer
- winner
- game completion

The client sends ACTIONS.

The server validates ACTIONS.

The server changes GAME STATE.

The server sends authorized STATE back to clients.

Architecture:

CLIENT
    ↓
SOCKET EVENT
    ↓
SERVER
    ↓
VALIDATE
    ↓
GAME ENGINE
    ↓
UPDATE STATE
    ↓
SERIALIZE FOR PLAYER
    ↓
SOCKET RESPONSE
    ↓
CLIENT

Never allow:

CLIENT
    ↓
setScore()
setTarget()
setRole()
setRound()
revealTarget()

---

# 3. TECHNOLOGY

Keep:

FRONTEND

React
Vite
TypeScript
Tailwind CSS
React Router

BACKEND

Node.js
Express
TypeScript

Add:

Socket.IO

Redis

Use:

socket.io-client

on the frontend.

Use:

socket.io

on the backend.

Redis should be architected for:

- room state support
- Socket.IO adapter
- future horizontal scaling

Do not make the application unnecessarily dependent on Redis during local development if a development fallback is useful.

---

# 4. PROJECT STRUCTURE

Maintain the two top-level directories:

vibely/

  frontend/

  backend/

Do not introduce a third application folder.

Frontend structure:

frontend/

  src/

    assets/

    components/

      common/

      game/

      home/

      setup/

      lobby/

      multiplayer/

      result/

      layout/

    data/

    hooks/

      useSocket.ts

      useRoom.ts

      useMultiplayerGame.ts

      useConnectionStatus.ts

    pages/

      HomePage.tsx

      SetupPage.tsx

      LobbyPage.tsx

      MultiplayerGamePage.tsx

      HowToPlayPage.tsx

      SettingsPage.tsx

    services/

      api/

      game/

      multiplayer/

    store/

    types/

    utils/

    styles/

    App.tsx

    main.tsx

Backend:

backend/

  src/

    config/

    controllers/

    routes/

    services/

      room/

      player/

      game/

    game/

      GameManager.ts

      GameRoom.ts

      GameEngine.ts

      GameState.ts

      RoundManager.ts

      scoring.ts

      target.ts

    socket/

      index.ts

      roomHandlers.ts

      lobbyHandlers.ts

      gameHandlers.ts

      playerHandlers.ts

    redis/

      redis.ts

    middleware/

    validation/

    types/

    utils/

    app.ts

    server.ts

Do not create giant files.

---

# 5. MULTIPLAYER ARCHITECTURE

Use:

                    VIBELY

                      │
        ┌─────────────┴─────────────┐
        │                           │
    FRONTEND                    BACKEND
        │                           │
 React + Vite                 Node + Express
        │                           │
 Socket.IO Client             Socket.IO Server
        │                           │
        └─────────────┬─────────────┘
                      │
                  WebSocket
                      │
                    Redis
                      │
              Future Game Servers

The game engine must live on the backend for online games.

---

# 6. LOCAL VS MULTIPLAYER ENGINE

Phase 1 has local game functionality.

Do not destroy it.

Create an abstraction that supports:

LocalGameService

and:

MultiplayerGameService

The UI should consume a common interface.

Conceptually:

GameService

    LocalGameService

    MultiplayerGameService

This allows the same Spectrum component and result components to work in both modes.

---

# 7. ONLINE ENTRY

Modify the home page.

Primary actions:

PLAY SOLO

PLAY WITH FRIENDS

The existing solo experience should remain available.

"PLAY WITH FRIENDS" opens:

CREATE GAME

JOIN GAME

---

# 8. CREATE GAME

Create a dedicated room creation screen.

Screen:

PLAY WITH FRIENDS

YOUR NAME

[ Enter your name ]

GAME SETTINGS

ROUNDS

5
10
15

MODE

TEAM
FREE FOR ALL

VIBE

CASUAL
NORMAL
CHAOTIC

Button:

CREATE GAME

Validate player name:

minimum:
2 characters

maximum:
20 characters

Do not allow blank names.

---

# 9. ROOM CODE

After creating a room:

Display:

YOUR ROOM

K7PM

"Share this code with your friends."

Buttons:

COPY CODE

SHARE

START GAME

Show a visual room-code card.

The room code should be extremely prominent.

Use large typography.

---

# 10. SHARE URL

Generate a shareable URL conceptually:

/room/K7PM

If browser sharing is supported:

navigator.share()

may be used after explicit user interaction.

If unavailable:

display the room code and URL.

Never make the Clipboard or Share API the only way to continue.

---

# 11. JOIN GAME

Create:

JOIN GAME

YOUR NAME

[ Enter your name ]

ROOM CODE

[ K7PM ]

Button:

JOIN GAME

Accept uppercase/lowercase room codes.

Normalize codes on the server.

Do not trust client normalization alone.

---

# 12. ROOM CODE SECURITY

Room codes must be:

- short
- readable
- sufficiently random
- case-insensitive

Avoid confusing characters:

O
0
I
1
S
5

Do not use sequential room codes.

Do not expose internal room IDs as the public room code.

---

# 13. ROOM MODEL

Create a server-side room model.

Conceptually:

type GameRoom = {

  id: string;

  code: string;

  hostPlayerId: string;

  status:
    | "LOBBY"
    | "STARTING"
    | "PLAYING"
    | "ROUND_RESULT"
    | "GAME_OVER";

  settings: {

    rounds: number;

    mode:
      | "TEAM"
      | "FREE_FOR_ALL";

    vibe:
      | "CASUAL"
      | "NORMAL"
      | "CHAOTIC";

  };

  players: Player[];

  teams: Team[];

  currentRound: RoundState | null;

  roundNumber: number;

  createdAt: number;

  lastActivityAt: number;

};

Do not send the complete internal room object to clients.

---

# 14. PLAYER MODEL

Conceptually:

type Player = {

  id: string;

  sessionId: string;

  socketId: string | null;

  name: string;

  avatar: string;

  teamId: string | null;

  connected: boolean;

  isHost: boolean;

  score: number;

  joinedAt: number;

  lastSeenAt: number;

};

The server controls:

id
team
role
host
score

Never accept those as authoritative client values.

---

# 15. PLAYER AVATARS

For Phase 2, do not implement image uploads.

Generate simple avatar identities:

- colored circle
- initials
- abstract icon
- predefined avatar

Store only an avatar identifier.

---

# 16. ROOM SIZE

Initial maximum:

8 players.

Minimum:

2 players.

The architecture should make this configurable.

Example:

MAX_PLAYERS=8

Do not hardcode the value throughout the codebase.

---

# 17. LOBBY

Create a beautiful real-time lobby.

Preserve the VIBELY animated background from Phase 1.

The lobby should feel like part of the same game.

Example:

VIBELY

ROOM
K7PM

3 / 8 PLAYERS

┌────────────────────────────┐

👑 Riya
HOST

👤 Aman

👤 Sarah

└────────────────────────────┘

SETTINGS

10 ROUNDS
TEAM MODE
CASUAL

START GAME

---

# 18. REAL-TIME LOBBY

When a player joins:

All players should immediately see:

"Sarah joined."

The player list updates without refresh.

When a player leaves:

All players see:

"Sarah left."

The lobby must never require page refresh.

---

# 19. HOST

The creator becomes host.

Only the server determines host status.

Host can:

- change rounds
- change mode
- change vibe
- start game
- optionally remove a player

Non-hosts:

- see settings
- cannot modify settings
- see "Waiting for host..."

---

# 20. HOST TRANSFER

If the host disconnects:

Choose the next connected player.

Make them host.

Notify everyone.

Example:

"Riya left."

"Aman is now host."

Do not terminate the game.

---

# 21. TEAM MODE

Team mode is the primary multiplayer experience.

Create:

TEAM A

TEAM B

Automatically balance players.

Examples:

4 players:

2 / 2

5 players:

3 / 2

6 players:

3 / 3

7 players:

4 / 3

8 players:

4 / 4

Do not allow extreme imbalance.

---

# 22. TEAM SELECTION

If practical, allow players to select/switch teams in the lobby.

The server must validate:

- room state
- player existence
- team capacity
- host/game permissions

Do not allow team changes after the game starts.

---

# 23. FREE-FOR-ALL

Support the basic architecture for:

FREE_FOR_ALL

Every player guesses individually.

However:

TEAM MODE is the priority.

Do not sacrifice team-mode quality just to rush free-for-all.

---

# 24. GAME START

Host presses:

START GAME

Server verifies:

- host is valid
- minimum players met
- room is in lobby
- settings are valid

Then:

LOBBY
 ↓
STARTING
 ↓
ROUND 1

Broadcast:

game:started

Then:

game:roundStarted

---

# 25. ROUND STATE

Create:

type RoundState = {

  number: number;

  spectrumId: string;

  leftLabel: string;

  rightLabel: string;

  targetPosition: number;

  targetWidth: number;

  clue: string | null;

  clueGiverId: string;

  guessingTeamId: string | null;

  guessControllerId: string | null;

  guessPosition: number | null;

  guessLocked: boolean;

  status:
    | "INTRO"
    | "CLUE"
    | "GUESS"
    | "REVEAL"
    | "RESULT";

  startedAt: number;

  deadlineAt: number | null;

};

---

# 26. TARGET GENERATION

Target is generated ONLY on the server.

Use:

randomBetween(10, 90)

Target width:

CASUAL:
20

NORMAL:
14

CHAOTIC:
8

Generate once when the round begins.

Never regenerate during the round.

---

# 27. TARGET PRIVACY

THIS IS THE MOST IMPORTANT SECURITY REQUIREMENT.

The server internally knows:

targetPosition
targetWidth

But:

CLUE GIVER:

can receive target information.

GUESSERS:

must NOT receive target information.

Create:

serializeGameStateForPlayer(playerId)

This function must return different data depending on player role.

Example:

Clue giver receives:

{
  leftLabel,
  rightLabel,
  targetPosition,
  targetWidth,
  clue
}

Guesser receives:

{
  leftLabel,
  rightLabel,
  clue,
  guessPosition
}

NO:

targetPosition

NO:

targetWidth

---

# 28. SECURITY TEST

Create an automated test.

Simulate:

Player A:
clue giver

Player B:
guesser

Verify:

Player A payload contains:

targetPosition

targetWidth

Player B payload does NOT contain:

targetPosition

targetWidth

Then after reveal:

Both receive:

targetPosition

targetWidth

This test is mandatory.

---

# 29. ROLES

Every round has:

CLUE GIVER

GUESSER

In Team Mode:

one team provides clue

opposing team guesses

Rotate the clue giver.

---

# 30. CLUE GIVER ROTATION

Do not randomly choose every round.

Use predictable rotation.

Example:

Round 1:
Riya

Round 2:
Aman

Round 3:
Sarah

Round 4:
John

Ensure everyone gets opportunities.

The server determines rotation.

---

# 31. CLUE PHASE

Clue giver sees:

YOUR TARGET

Spectrum

Target zone

Prompt:

"Give your clue."

Input:

maximum 120 characters.

Button:

LOCK CLUE

The server validates.

---

# 32. CLUE SUBMISSION EVENT

Client:

game:submitClue

Payload:

{
  clue: string
}

Server:

1. identify socket session
2. identify player
3. identify room
4. verify player is clue giver
5. verify current phase
6. validate clue
7. trim whitespace
8. enforce max length
9. store clue
10. broadcast authorized update

Never accept player ID from the client as the source of identity.

---

# 33. CLUE VISIBILITY

After submission:

The guessing team sees the clue.

The clue giver continues to see the clue.

Everyone who is allowed to see it receives the clue.

Target remains hidden from guessers.

---

# 34. GUESS CONTROLLER

In Team Mode, designate one player from the guessing team as:

GUESS CONTROLLER

Only this player can move the official team marker.

Other team members see the marker move in real time.

Rotate controller when appropriate.

---

# 35. GUESS INTERACTION

Preserve Phase 1 Spectrum interaction.

Support:

desktop:

- click
- drag
- keyboard arrows

mobile:

- tap
- drag

Client emits:

game:updateGuess

Example:

{
  position: 63
}

Server:

- validates player
- validates role
- validates state
- clamps 0–100
- updates state
- broadcasts authorized guess position

---

# 36. GUESS THROTTLING

Do not emit hundreds of events per second.

Throttle movement updates.

Target:

30–60 updates per second maximum.

Prefer:

requestAnimationFrame

or controlled throttling.

When the player releases the marker:

send final position.

---

# 37. GUESS LOCK

Client:

game:lockGuess

Server validates:

- player is guess controller
- correct game phase
- guess exists
- guess not already locked

Then:

guessLocked = true

After locking:

ignore future movement events.

Broadcast:

game:guessLocked

---

# 38. REVEAL

Once guess is locked:

Server calculates:

distance

score

using existing Phase 1 scoring.

Distance:

Math.abs(targetPosition - guessPosition)

Scoring:

0–3:
100

4–8:
75

9–15:
50

16–25:
25

26+:
0

The server calculates all of this.

The client never submits:

score

distance

---

# 39. REVEAL PAYLOAD

Only after scoring:

Broadcast:

game:revealed

Payload may contain:

targetPosition
targetWidth
guessPosition
distance
score
resultLabel

At this point all players may receive target information.

---

# 40. SCORE

Update:

team score

and optionally:

individual contribution

Example:

TEAM A

325

TEAM B

275

Server owns all scores.

Clients only render them.

---

# 41. RESULT

Preserve Phase 1 visual reveal.

Use:

target animation

guess marker

distance

score animation

result message

Examples:

PERFECT VIBE

SO CLOSE

NOT BAD

YOU FELT IT

WAY OFF 😭

Do not remove the existing animation system.

---

# 42. ROUND TRANSITION

After the result:

Show:

NEXT ROUND

or automatically continue after a short controlled transition.

Server determines when the next round begins.

Do not rely solely on client timers.

---

# 43. SERVER-AUTHORITATIVE TIMER

If a round has a timer:

Server stores:

startedAt

deadlineAt

Clients render:

remainingTime = deadlineAt - serverTime

Do not trust client setTimeout as the source of truth.

When reconnecting:

the remaining time must still be correct.

---

# 44. TIMER SYNCHRONIZATION

Implement a lightweight server clock offset.

Client may estimate:

serverTime - clientTime

Use that for display.

The server remains authoritative.

---

# 45. DISCONNECTION

If a player disconnects:

Do NOT immediately remove them.

Mark:

connected = false

Show:

"Riya disconnected."

Keep their session alive for:

60 seconds

or configurable:

PLAYER_RECONNECT_GRACE_MS

---

# 46. RECONNECTION

If player reconnects within the grace period:

Restore:

- identity
- room
- team
- score
- role
- current round
- connection state

Send a complete authorized state snapshot.

Do not trust old client state.

---

# 47. BROWSER REFRESH

If a player refreshes:

Attempt to reconnect to the same game.

Use a secure temporary session token.

Do not expose internal player IDs as authentication.

---

# 48. SESSION TOKENS

Create a temporary multiplayer session.

Conceptually:

roomCode
+
playerSessionToken

The token identifies the player.

Do not use:

player name

as identity.

Do not trust:

playerId

provided freely by the browser.

---

# 49. ROOM EXPIRATION

If no players remain connected:

start cleanup timer.

After:

30 minutes

delete room state.

Make configurable:

ROOM_EXPIRATION_MS

---

# 50. SOCKET EVENTS

Use strongly typed Socket.IO events.

CLIENT → SERVER:

room:create
room:join
room:leave

lobby:updateSettings
lobby:changeTeam
lobby:startGame
lobby:kickPlayer

player:ready
player:heartbeat

game:submitClue
game:updateGuess
game:lockGuess

game:nextRound

SERVER → CLIENT:

room:created
room:joined
room:updated

player:joined
player:left
player:reconnected
player:disconnected
player:hostChanged

lobby:updated
lobby:started

game:state
game:roundStarted
game:clueSubmitted
game:guessUpdated
game:guessLocked
game:revealed
game:roundResult
game:gameOver

connection:status

error

---

# 51. SOCKET TYPE SAFETY

Create shared event types where practical.

Avoid:

any

for socket payloads.

Create interfaces for:

ClientToServerEvents

ServerToClientEvents

InterServerEvents

SocketData

Use TypeScript generics with Socket.IO.

---

# 52. ERROR SYSTEM

Use structured errors.

Example:

{
  code: "ROOM_FULL",
  message: "This room is already full."
}

Possible errors:

ROOM_NOT_FOUND

ROOM_FULL

INVALID_ROOM_CODE

INVALID_NAME

GAME_STARTED

NOT_HOST

NOT_CLUE_GIVER

NOT_GUESS_CONTROLLER

INVALID_STATE

INVALID_CLUE

INVALID_GUESS

ALREADY_LOCKED

NOT_AUTHORIZED

PLAYER_NOT_FOUND

---

# 53. CLIENT ERROR UX

Never display:

"Socket error 400"

Instead:

"That room no longer exists."

"Only the host can start the game."

"Someone already locked the guess."

"Your connection was interrupted."

Errors should feel like part of the product.

---

# 54. CONNECTION STATUS

Create a small connection indicator.

CONNECTED

RECONNECTING

OFFLINE

CONNECTED

Keep it subtle.

Do not interrupt the game unnecessarily.

---

# 55. LOBBY ANIMATIONS

Preserve VIBELY's animated background.

Add:

player join animation

player leave animation

team movement animation

room code entrance animation

start-game transition

Do not make animations distracting.

---

# 56. MULTIPLAYER GAME SCREEN

Desktop:

┌──────────────────────────────────────────────────┐

VIBELY                 ROUND 03 / 10

TEAM A 320                    TEAM B 275

                HOW CHAOTIC?

      CHILL ───────────────────── CHAOTIC

                     ●

                  YOUR CLUE

             "Skydiving"

               [ LOCK IT ]

└──────────────────────────────────────────────────┘

Keep the spectrum dominant.

---

# 57. PLAYER PANEL

Desktop may show:

TEAM A
320

Riya
Aman
Sarah

VS

TEAM B
275

John
Alex
Sam

Show role badges:

CLUE GIVER

GUESS CONTROLLER

Keep the player panel compact.

---

# 58. MOBILE GAME SCREEN

On mobile:

Header:

VIBELY
ROUND 03
SCORE 320

Then:

Spectrum

Clue

Controls

Player/team information should collapse into a compact expandable area if necessary.

Do NOT allow the player list to consume the main screen.

The spectrum remains the primary interaction.

---

# 59. MOBILE LOBBY

Mobile lobby should prioritize:

room code

players

start button

settings

Example:

VIBELY

K7PM

3 / 8 PLAYERS

Riya
Aman
Sarah

10 ROUNDS
TEAM MODE

[ START GAME ]

---

# 60. PASS-AND-PLAY

Keep Phase 1 Pass & Play.

Online multiplayer should be a separate mode.

Do not remove the local mode.

Game modes:

SOLO

PASS & PLAY

ONLINE

---

# 61. ONLINE MODE ENTRY

Home:

PLAY WITH FRIENDS

Then:

CREATE GAME

JOIN GAME

Do not bury online mode in settings.

---

# 62. BACKEND ROOM MANAGER

Create:

GameManager

Responsibilities:

createRoom()
getRoom()
deleteRoom()
joinRoom()
leaveRoom()
findRoomByCode()

Do not put all room logic in Socket.IO handlers.

---

# 63. GAME ROOM

Create:

GameRoom

Responsibilities:

- players
- teams
- current state
- roles
- rounds
- score
- transitions

---

# 64. GAME ENGINE

Create server-side:

GameEngine

Responsibilities:

startGame()
startRound()
selectSpectrum()
generateTarget()
assignRoles()
submitClue()
updateGuess()
lockGuess()
revealRound()
calculateScore()
advanceRound()
finishGame()

The Socket handlers should call these methods.

They should not contain the actual game rules.

---

# 65. STATE MACHINE

Enforce legal transitions.

Example:

LOBBY
→ STARTING

STARTING
→ CLUE

CLUE
→ GUESS

GUESS
→ REVEAL

REVEAL
→ RESULT

RESULT
→ CLUE

RESULT
→ GAME_OVER

Do not allow:

LOBBY → REVEAL

GUESS → CLUE

GAME_OVER → GUESS

unless explicitly starting a new game.

---

# 66. REDIS

Prepare Redis integration.

Use Redis for:

Socket.IO adapter

and future:

shared room state

For local development, allow:

in-memory GameManager

if Redis is not configured.

For production architecture:

multiple Node servers

↓

Redis adapter

↓

shared real-time communication

---

# 67. REDIS ENVIRONMENT

Backend:

REDIS_URL

If missing in development:

use in-memory fallback.

In production:

require Redis or clearly fail startup.

---

# 68. MONGODB

Do not make MongoDB a dependency for active gameplay in Phase 2.

Do not write every state update to MongoDB.

Future MongoDB will store:

completed games

statistics

accounts

custom spectrums

AI-generated content

---

# 69. REST API

Preserve:

GET /api/health

Add only necessary room endpoints.

Do not duplicate Socket.IO state synchronization through REST.

Potential endpoints:

GET /api/rooms/:code

Use REST primarily for:

initialization

health

non-real-time metadata

Real-time game state should use Socket.IO.

---

# 70. CORS

Configure:

CLIENT_URL

Do not use:

*

in production.

---

# 71. RATE LIMITING

Protect:

room creation

room joining

socket events

from abuse.

At minimum:

limit room creation attempts per connection/IP where practical

limit join attempts

limit clue submission

limit guess update frequency

---

# 72. INPUT VALIDATION

Validate every external payload.

Use a schema validation library if appropriate, such as Zod.

Validate:

player name

room code

settings

clue

guess position

team

actions

Do not rely only on TypeScript.

TypeScript does not validate runtime input.

---

# 73. PLAYER NAME SAFETY

Normalize names.

Maximum:

20 characters.

Do not allow raw HTML.

Do not render user input with:

dangerouslySetInnerHTML

---

# 74. CLUE SAFETY

Maximum:

120 characters.

Trim whitespace.

Do not render raw HTML.

For Phase 2:

basic text validation only.

AI moderation will be introduced later.

---

# 75. ANTI-CHEAT

Implement basic protections.

The client cannot:

set target

set score

set team

set role

set round

reveal target

end round

end game

change another player's state

Every state-changing action must be validated server-side.

---

# 76. TARGET LEAK TESTING

Inspect actual Socket.IO payloads.

Before reveal:

Guesser payload must NOT contain target.

Not even under another field.

Avoid accidental leakage such as:

targetPosition
hiddenTarget
answer
secret
solution

Do not send the complete server state to the client and simply hide the UI.

The secret must never be transmitted.

---

# 77. REFRESH/RECONNECT TEST

Test:

Player joins.

Game starts.

Player refreshes browser.

Player reconnects.

Player returns to:

same room

same team

same score

same role

same round

same authorized information.

---

# 78. HOST TRANSFER TEST

Test:

Host disconnects.

Next connected player becomes host.

Everyone receives updated host.

New host can change settings/start game where appropriate.

---

# 79. ROOM FULL TEST

Test:

Room has 8 players.

9th player attempts to join.

Return:

ROOM_FULL

Do not add them.

---

# 80. MINIMUM PLAYER TEST

Host tries to start with only one player.

Prevent start.

Show:

"At least 2 players are needed."

---

# 81. SIMULTANEOUS ACTION TEST

Test two players attempting to lock the guess simultaneously.

The server must accept only the first valid lock.

The second request receives:

ALREADY_LOCKED

Do not allow race-condition double scoring.

---

# 82. DOUBLE SUBMISSION TEST

Player submits clue twice.

Server accepts only the first valid submission.

Same for:

guess lock

next round

game start

Do not process duplicate actions.

---

# 83. NETWORK FAILURE TEST

Test temporary network loss.

Player should see:

RECONNECTING...

Then:

CONNECTED

without losing game state.

---

# 84. SPECTRUM CONTENT

Continue using Phase 1 spectrum content.

Do not introduce AI yet.

Select random unused spectrum per game.

Do not repeat the same spectrum until necessary.

---

# 85. RANDOMNESS

Use server-side randomness for:

target

spectrum selection

role rotation

team assignment where applicable

Do not rely on Math.random() in the browser for authoritative game decisions.

---

# 86. GAME HISTORY

Keep current game history in server memory/Redis.

Example:

roundHistory:

[
  {
    roundNumber,
    spectrumId,
    clue,
    targetPosition,
    guessPosition,
    distance,
    score
  }
]

Do not persist permanently yet.

---

# 87. FINAL SCOREBOARD

At game completion show:

WINNER

TEAM A

TOTAL SCORE

BEST ROUND

PERFECT HITS

ROUND HISTORY

Example:

TEAM A
684

TEAM B
612

TEAM A WINS

Use the existing Phase 1 visual language.

---

# 88. GAME END

Server determines game completion.

When:

roundNumber === totalRounds

transition:

GAME_OVER

Broadcast:

game:gameOver

Every client receives the final authorized scoreboard.

---

# 89. PLAY AGAIN

After game over:

PLAY AGAIN

should create a new game session or return to lobby cleanly.

Do not accidentally retain:

old target

old clue

old score

old locked guess

old round state

---

# 90. LEAVE GAME

Provide:

LEAVE GAME

Ask for confirmation during an active game.

Example:

"Leave this game?"

"Your team may lose a player."

Buttons:

STAY

LEAVE

The server removes/disconnects the player appropriately.

---

# 91. VISUAL CONSISTENCY

DO NOT redesign VIBELY.

Preserve:

- animated background
- gradients
- typography
- spectrum
- cards
- button style
- micro-interactions
- page transitions
- mobile layout
- score animation

Multiplayer should feel like a natural extension of Phase 1.

---

# 92. NEW MULTIPLAYER VISUAL ELEMENTS

Add:

room code card

player cards

team indicators

role badges

connection status

live player joins

live player leaves

turn indicators

"waiting for..." states

These should use the existing VIBELY visual language.

---

# 93. ANIMATED PLAYER STATES

When player joins:

fade/slide into lobby.

When player leaves:

fade out.

When host changes:

subtle badge animation.

When team changes:

smooth transition.

When game starts:

lobby transitions into game.

---

# 94. ROLE TRANSITION

At round start:

Display:

ROUND 04

YOUR TEAM'S TURN

or:

YOUR TEAM IS GUESSING

If player is clue giver:

"YOU'RE THE CLUE GIVER"

If player is guess controller:

"YOU'RE CONTROLLING THE GUESS"

If spectator/team member:

"DISCUSS WITH YOUR TEAM"

Make roles immediately understandable.

---

# 95. MOBILE ROLE UX

On mobile, role information should be near the top.

Example:

YOUR ROLE

CLUE GIVER

or:

YOUR ROLE

GUESS CONTROLLER

Do not make users search for their role.

---

# 96. ACCESSIBILITY

Preserve Phase 1 accessibility.

Add:

live lobby updates

aria-live for role changes

accessible room-code labels

keyboard support

focus states

reduced motion

screen-reader-friendly game status

Do not rely solely on color for teams.

---

# 97. SOUND

Preserve Phase 1 SoundService.

Add optional multiplayer sounds:

player joined

player left

your turn

clue submitted

guess locked

reveal

game won

Sound remains optional.

Never autoplay audio without user interaction.

---

# 98. PERFORMANCE

Do not re-render the entire application on every pointer update.

Keep spectrum interaction isolated.

Throttle network updates.

Use CSS transforms.

Do not broadcast unnecessary full-state payloads.

Prefer:

small incremental events

plus:

full state snapshot for recovery.

---

# 99. STATE SNAPSHOT

Implement:

game:state

It should contain everything the specific player is authorized to know.

This allows recovery after:

reconnect

missed event

refresh

temporary network failure

Do not send hidden target information to unauthorized clients.

---

# 100. SOCKET ROOM JOINING

Each game room should map to a Socket.IO room.

Conceptually:

socket.join(`game:${roomId}`)

Use internal room ID, not public room code, for the Socket.IO room identifier.

---

# 101. SOCKET CLEANUP

When a player leaves:

socket.leave()

Clean listeners and timers.

When a room is deleted:

clear:

timeouts

intervals

subscriptions

Redis state

memory references

Avoid memory leaks.

---

# 102. TIMER CLEANUP

Every game timer must be tracked.

When:

round ends

game ends

room expires

clear relevant timer.

Never leave background timers running after a room is destroyed.

---

# 103. LOGGING

Backend logs should include:

room ID

event

player/session

timestamp

result

Do not log:

secret target information in production logs

unless explicitly in secure debug mode.

Avoid logging sensitive session tokens.

---

# 104. DEVELOPMENT DEBUGGING

Provide optional debug mode.

Example:

DEBUG_GAME=true

When enabled during development:

server may log:

target

state transitions

role assignment

Do NOT enable this by default.

---

# 105. TESTING

Create automated tests for:

RoomManager

GameEngine

Scoring

Target generation

Role rotation

Team balancing

State transitions

Socket handlers

Authorization

Target privacy

Reconnect

Host transfer

Room cleanup

---

# 106. GAME ENGINE TESTS

Test:

create room

join room

start game

start round

submit clue

update guess

lock guess

reveal

score

next round

game over

reset

---

# 107. SECURITY TESTS

Mandatory:

guesser cannot receive target

guesser cannot reveal target

guesser cannot change score

guesser cannot change role

non-host cannot start game

non-host cannot change settings

non-controller cannot move official guess

player cannot join full room

player cannot modify another player's team

---

# 108. RACE CONDITION TESTS

Test:

two lock requests simultaneously

two next-round requests simultaneously

host and non-host start simultaneously

player leaves while round starts

player disconnects during reveal

Only one authoritative transition should occur.

---

# 109. MOBILE TESTING

Test:

320px

375px

390px

430px

No horizontal scrolling.

Test:

joining room

lobby

team display

role display

spectrum interaction

guess locking

reveal

score

game over

---

# 110. DESKTOP TESTING

Test:

1024px

1440px

1920px

Ensure:

spectrum remains dominant

player panel remains secondary

room code is readable

lobby doesn't become excessively wide

---

# 111. PRODUCTION PREPARATION

Add:

.env.example

Frontend:

VITE_API_URL

VITE_SOCKET_URL

Backend:

PORT

CLIENT_URL

REDIS_URL

NODE_ENV

Do not commit secrets.

---

# 112. BACKEND HEALTH

Keep:

GET /api/health

Response:

{
  "status": "ok",
  "service": "vibely-backend"
}

Optionally include:

redis:
"connected"

but do not expose sensitive infrastructure information.

---

# 113. DO NOT IMPLEMENT YET

Do NOT implement:

AI

Ollama

AI-generated spectrums

AI clue suggestions

AI moderation

MongoDB persistence

User accounts

Authentication system

Payments

Subscriptions

Public matchmaking

Leaderboards

Friend lists

Voice chat

Video chat

In-game text chat

Notifications

Those belong to future phases.

---

# 114. PHASE 2 DEFINITION OF DONE

A complete online game must support this exact journey:

PLAYER 1

Open VIBELY

↓

PLAY WITH FRIENDS

↓

CREATE GAME

↓

Enter name

↓

Select settings

↓

Room created

↓

Receive:

K7PM

↓

PLAYER 2

Open VIBELY

↓

PLAY WITH FRIENDS

↓

JOIN GAME

↓

Enter:

K7PM

↓

PLAYER 3

Joins

↓

All players see lobby update instantly

↓

Host starts game

↓

Teams assigned

↓

Round 1 starts

↓

Clue giver sees hidden target

↓

Other players do NOT receive target

↓

Clue giver submits clue

↓

Guessing team receives clue

↓

Guess controller moves marker

↓

Everyone sees marker movement

↓

Controller locks guess

↓

Server calculates score

↓

Target revealed

↓

Everyone sees result

↓

Scores update

↓

Next round

↓

Roles rotate

↓

Game continues

↓

Final round

↓

Server calculates final scores

↓

Winner displayed

---

# 115. FINAL QUALITY BAR

Do not treat multiplayer as merely:

"Add Socket.IO."

The goal is to create an actual social game experience.

The result should feel:

FAST

SMOOTH

SOCIAL

RESPONSIVE

POLISHED

RELIABLE

The player should never wonder:

"Did my action work?"

Every important action needs immediate visual feedback.

The game should remain beautiful even when:

- someone joins
- someone leaves
- someone reconnects
- the host changes
- the network temporarily fails
- a round ends
- a new round begins

Most importantly:

THE SERVER MUST BE AUTHORITATIVE.

THE TARGET MUST REMAIN SECRET.

THE CLIENT MUST NEVER RECEIVE INFORMATION IT IS NOT ALLOWED TO KNOW.

Preserve the VIBELY visual identity from Phase 1 while adding a seamless online multiplayer experience.