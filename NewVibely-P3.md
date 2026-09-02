# VIBELY — PHASE 3C

## Disconnect Handling, Team Failure, Replay Flow & Final Integration

You are continuing work on the existing Vibely application.

Previous phases implemented:

* temporary room-based multiplayer
* room-scoped usernames
* server-generated player IDs
* team A / team B
* host management
* genre selection
* five-level progression
* 10 vibes per level
* level thresholds
* level gating
* stars
* difficulty modifiers
* genre-specific content
* server-authoritative scoring

Now implement robust player departure behavior and the complete replay lifecycle.

Do NOT rebuild the existing application.

Inspect current code and integrate with the existing architecture.

---

# 1. CORE PLAYER DEPARTURE RULE

The most important rule:

> If a player leaves during a game, continue the game as long as their team still has at least one remaining member.

Example:

```text
TEAM A
Riya
Rahul

TEAM B
Simran
Arjun
```

Riya leaves.

Team A still has:

```text
Rahul
```

Therefore:

```text
GAME CONTINUES
```

Do not end the run.

---

# 2. ROLE REASSIGNMENT

If the departing player currently has an active role:

Example:

```text
Riya = Clue Giver
```

and Riya leaves:

The server must safely reassign the role.

For example:

```text
Rahul
↓
Clue Giver
```

Do not leave the game stuck waiting for a disconnected player.

Role reassignment must happen server-side.

Broadcast updated role state to affected players.

---

# 3. PLAYER DISCONNECT VS PLAYER LEAVE

Distinguish:

```text
TEMPORARY DISCONNECT
```

from:

```text
INTENTIONAL LEAVE
```

### Temporary disconnect

Give the player a grace period.

Suggested:

```text
60 seconds
```

During this time:

```text
Riya
🟡 Reconnecting...
```

Game continues where possible.

### Intentional leave

Immediately remove the player from the active room.

Do not keep them in the team.

---

# 4. RECONNECTING PLAYER

If the player reconnects during the grace period:

Restore:

* playerId
* username
* team
* current room
* current game
* current role if still valid

Do not create a new player.

Do not duplicate the player in the room.

---

# 5. ENTIRE TEAM LEAVES

Example:

```text
TEAM A

Riya ❌
Rahul ❌

TEAM B

Simran
Arjun
```

Team A has zero remaining members.

The current run should stop.

Server changes run state to:

```text
TEAM_LEFT
```

or an equivalent terminal state.

---

# 6. TEAM LEFT UI

Show all remaining players:

```text
⚠️ TEAM A HAS LEFT

All members of Team A
have left the room.

This run has ended.

Would you like to play again
with new teams?

[ YES — PLAY AGAIN ]
[ STAY IN ROOM ]
```

Use a polished modal/full-screen transition.

Animate:

* team disappearance
* warning icon
* transition into replay decision

Do not abruptly redirect users.

---

# 7. REPLAY DECISION

After a run finishes normally OR ends because a team left:

Check remaining connected players.

If:

```text
players >= 4
```

show:

```text
READY FOR ANOTHER RUN?

Current players:
4

[ PLAY AGAIN ]
[ STAY IN ROOM ]
```

If players < 4:

```text
NOT ENOUGH PLAYERS

You need at least 4 players
to start another run.

[ INVITE FRIENDS ]
[ STAY IN ROOM ]
```

---

# 8. ROOM MUST NOT BE DESTROYED AFTER GAME

A completed game returns the room to:

```text
WAITING
```

The room remains available.

Example:

```text
ROOM ABC123

Riya
Rahul
Simran
Arjun

LAST RUN
COLLEGE WORLD
LEVEL 5 CLEARED

[ PLAY AGAIN ]
```

---

# 9. NEW RUN

When players choose PLAY AGAIN:

Reset:

```text
runId
currentLevel
levelScore
teamScore
totalScore
vibeIndex
roles
modifiers
level state
```

Do NOT reset:

```text
roomCode
players
host
usernames
```

The room persists.

---

# 10. NEW TEAMS

When a new run starts:

Create new teams.

Do not automatically assume the previous team assignment must remain.

Default behavior:

```text
SHUFFLE TEAMS
```

Balance the players as evenly as possible.

Example:

Previous:

```text
TEAM A
Riya
Rahul

TEAM B
Simran
Arjun
```

Next run:

```text
TEAM A
Riya
Arjun

TEAM B
Rahul
Simran
```

This prevents players from being locked into the same teams forever.

---

# 11. OPTIONAL TEAM PREVIEW

Before starting a new run:

```text
NEW TEAMS

TEAM A
🩷 Riya
💛 Arjun

TEAM B
💙 Rahul
💜 Simran

[ 🔀 SHUFFLE ]
[ START RUN ]
```

Host controls START RUN.

All players see the team assignments.

The shuffle button should be host-only.

---

# 12. GENRE ON REPLAY

When starting a new run, allow the host to select a genre again.

Example:

Run 1:

```text
COLLEGE WORLD
```

Run 2:

```text
CORPORATE WORLD
```

Run 3:

```text
HOT & SPICY
```

The room is not permanently tied to one genre.

Genre belongs to the current run.

---

# 13. REPLAY FLOW

Implement:

```text
GAME COMPLETE
      ↓
RETURN TO ROOM
      ↓
CHECK PLAYERS
      ↓
4+ PLAYERS?
   /       \
 YES       NO
  ↓         ↓
NEW TEAMS   INVITE MORE
  ↓
CHOOSE GENRE
  ↓
START RUN
  ↓
LEVEL 1
```

---

# 14. NORMAL GAME COMPLETION

After Level 5:

Show:

```text
🏆 VIBELY MASTER

CORPORATE WORLD

LEVEL 5 CLEARED

TOTAL SCORE
4,842

⭐⭐⭐⭐⭐

WHAT A RUN.

[ PLAY AGAIN ]
[ STAY IN ROOM ]
```

Then return to room.

---

# 15. NORMAL LEVEL FAILURE

If a team fails a level:

```text
SO CLOSE

LEVEL 3

542 / 600

RUN COMPLETE

HIGHEST LEVEL
3

[ PLAY AGAIN ]
[ STAY IN ROOM ]
```

Do NOT continue to Level 4.

The next run starts at Level 1.

---

# 16. INDIVIDUAL CONTRIBUTION DURING CURRENT RUN

Do not persist statistics.

However, keep temporary current-run contribution data.

Example:

```ts
playerRunStats {
  playerId,
  vibesAnswered,
  totalPoints,
  perfectVibes
}
```

This allows an MVP display.

Example:

```text
RUN MVP 🔥

Riya

1,420 points
8 perfect reads
```

This data disappears when the room/run is reset.

---

# 17. MVP RULE

MVP should be cosmetic.

It must NOT affect:

* team score
* level progression
* role assignment
* winner
* future runs

Use it only for fun.

---

# 18. TEAM SCORE

Level progression is based on combined team score.

Example:

```text
TEAM A
620

TEAM B
580

Required:
600
```

If the game rules determine Team A as the relevant team for that level, use Team A's score.

Do not accidentally combine both teams' scores unless the existing game design explicitly requires it.

Make the level's scoring ownership explicit in the GameEngine.

---

# 19. ROLE ROTATION AFTER PLAYER LEAVES

Role rotation must dynamically use only active team members.

Example:

```text
Team A:

Riya
Rahul
Simran
```

If Riya leaves:

```text
Rahul
Simran
```

Role rotation should be rebuilt using:

```text
Rahul
Simran
```

Do not reference the removed player.

If a player reconnects, add them back to the rotation safely.

---

# 20. CURRENT ROUND INTERRUPTION

If a player leaves during:

```text
CLUE
GUESS
REVEAL
RESULT
```

handle it without crashing.

Examples:

### Clue giver leaves during CLUE

Assign replacement clue giver.

Restart the current vibe if necessary.

Do not leak target information.

### Guess controller leaves during GUESS

Assign another eligible player.

Preserve the current target and game state.

### Guesser leaves

Continue if another valid guesser exists.

### Entire team leaves

Terminate the run.

---

# 21. NEVER LEAK TARGET INFORMATION

This requirement remains critical.

Before reveal:

Guessers must NEVER receive:

```text
targetPosition
targetWidth
hiddenTarget
```

even during:

* disconnect
* reconnect
* role reassignment
* room updates
* replay transitions

Use the existing player-specific game serialization.

---

# 22. ROOM STATUS AFTER GAME

After completion:

```text
GAME_COMPLETE
```

then:

```text
WAITING_FOR_REPLAY
```

or simplify into:

```text
WAITING
```

with a `lastRunResult`.

Do not leave GameEngine in an active state after the run ends.

---

# 23. INVITE FRIENDS EXPERIENCE

When fewer than 4 players remain:

```text
NEED MORE VIBES? 👀

Vibely needs at least
4 players to start.

ROOM CODE

ABC123

[ COPY ROOM CODE ]
[ COPY INVITE ]
```

If your current app has Web Share support, use it where available.

Otherwise provide a simple copy-room-code action.

---

# 24. EMPTY ROOM CLEANUP

If all players leave:

```text
0 players
```

start room cleanup.

After approximately:

```text
5 minutes
```

destroy the room.

Make the timeout configurable.

---

# 25. ERROR HANDLING

Handle:

```text
PLAYER_NOT_FOUND
ROOM_NOT_FOUND
ROOM_ALREADY_PLAYING
INVALID_RECONNECT_TOKEN
INVALID_RUN_STATE
TEAM_EMPTY
NOT_ENOUGH_PLAYERS
NOT_HOST
INVALID_ROLE
```

Never allow invalid socket events to crash the server.

---

# 26. SOCKET EVENTS

Add/update events as necessary.

Potential events:

```text
PLAYER_DISCONNECTED
PLAYER_RECONNECTED
PLAYER_LEFT

TEAM_MEMBER_LEFT
TEAM_EMPTY

ROLE_REASSIGNED

RUN_ENDED
RUN_FAILED
RUN_COMPLETED

REPLAY_AVAILABLE
REPLAY_REQUESTED

TEAMS_SHUFFLED
NEW_RUN_STARTED

NOT_ENOUGH_PLAYERS
```

Do not create duplicate events if equivalent existing events already exist.

---

# 27. FRONTEND UX

Create polished states for:

### Player reconnecting

```text
Riya is reconnecting...
```

### Player left

```text
Riya left the room
```

### Team left

```text
TEAM A HAS LEFT
```

### Not enough players

```text
NEED MORE PLAYERS
```

### New teams

```text
NEW TEAMS
```

### New run

```text
GET READY
NEW RUN STARTING
```

Use Framer Motion for transitions.

---

# 28. FULL END-TO-END TEST SCENARIOS

Test these scenarios thoroughly.

### Scenario 1 — Normal completion

4 players
→ Level 1
→ Level 2
→ Level 3
→ Level 4
→ Level 5
→ Game complete
→ Room remains
→ Play again

### Scenario 2 — Level failure

4 players
→ Level 1
→ Level 2
→ Level 3
→ fail
→ Run ends
→ Room remains
→ Play again from Level 1

### Scenario 3 — One player disconnects

4 players
→ Riya disconnects
→ Team A still has Rahul
→ Game continues

### Scenario 4 — Player reconnects

Riya disconnects
→ reconnects within 60 seconds
→ same player
→ same username
→ same team
→ game continues

### Scenario 5 — One entire team leaves

Team A players leave
→ Team A becomes empty
→ current run ends
→ Team A warning shown
→ remaining players asked to play again

### Scenario 6 — Not enough players

4 players
→ 2 players leave
→ only 2 remain
→ cannot start another run
→ invite more players shown

### Scenario 7 — Host leaves

Host leaves
→ new host assigned
→ room continues

### Scenario 8 — Host leaves during game

Host leaves
→ game continues if their team still has a member
→ new host assigned

### Scenario 9 — Same username in different rooms

Room A:
Riya

Room B:
Riya

Both work.

### Scenario 10 — Duplicate username same room

Room A:
Riya

Another player attempts:
riya

Reject.

---

# 29. PERFORMANCE

Because all room/game state is in memory:

Do NOT:

* write every vibe to disk
* write every mouse movement
* write spectrum position continuously
* create unnecessary intervals
* create memory leaks with timers

Clean up:

* timers
* sockets
* room references
* game engines
* disconnected player timers

when no longer needed.

---

# 30. FINAL ARCHITECTURE

The final architecture should conceptually look like:

```text
                    SOCKET.IO
                        │
                        ▼
                  RoomManager
                        │
              ┌─────────┴─────────┐
              ▼                   ▼
          GameRoom            TeamManager
              │
              ▼
           GameRun
              │
        ┌─────┴─────┐
        ▼           ▼
   LevelManager   GameEngine
        │
        ▼
   ModifierManager
        │
        ▼
   GenreManager
        │
        ▼
      Content
```

Everything is temporary.

No MongoDB.

No user database.

No AI.

No authentication.

No persistent statistics.

---

# 31. FINAL PRODUCT LOOP

The finished product should feel like:

```text
VIBELY
  ↓
CREATE ROOM
  ↓
ENTER NAME
  ↓
INVITE FRIENDS
  ↓
4+ PLAYERS
  ↓
CHOOSE GENRE
  ↓
NEW TEAMS
  ↓
LEVEL 1
  ↓
10 VIBES
  ↓
LEVEL 2
  ↓
10 VIBES
  ↓
LEVEL 3
  ↓
THREE WORD CLUE
  ↓
LEVEL 4
  ↓
TIME PRESSURE
  ↓
LEVEL 5
  ↓
MASTER MODE
  ↓
🏆 VIBELY MASTER
  ↓
ROOM
  ↓
PLAY AGAIN
  ↓
NEW TEAMS
  ↓
NEW GENRE
  ↓
NEW RUN
```

---

# 32. FINAL ACCEPTANCE CRITERIA

The implementation is complete only when:

* room identity is temporary
* usernames are unique only within a room
* no MongoDB is required
* no stats are persisted
* no accounts are required
* 4 players are required to start
* two teams are created
* host selects genre
* all five levels remain within that genre
* each level contains 10 vibes
* levels have increasing difficulty
* level thresholds are server-controlled
* failed levels end the run
* Level 5 completion creates a Vibe Master result
* room remains after game completion
* replay is possible
* new teams are created for replay
* genre can change between runs
* disconnects have a grace period
* reconnecting players restore their state
* a team can continue if at least one member remains
* an empty team ends the current run
* remaining players receive a clear team-left message
* fewer than 4 remaining players cannot start another run
* invite-more-players UI appears
* host reassignment works
* role reassignment works
* target privacy remains intact
* no stale timers or game engines remain
* mobile and desktop UX is polished
* all major edge cases are tested

Before finalizing, inspect the entire codebase for regressions caused by these changes.

At the end, provide a concise implementation report containing:

1. Architecture changes
2. Files created
3. Files modified
4. Files removed
5. Socket events
6. State-machine changes
7. Tests performed
8. Bugs discovered and fixed
9. Remaining limitations
