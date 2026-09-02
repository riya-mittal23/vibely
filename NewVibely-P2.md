# VIBELY — PHASE 3B

## Genre Worlds, Five-Level Progression & Difficulty System

You are continuing work on the existing Vibely project.

Phase 3A has established the new room-based architecture:

* No MongoDB
* No accounts
* No persistent stats
* Room-scoped usernames
* In-memory rooms
* Server-generated player IDs
* Team A / Team B
* Host-controlled lobby
* Minimum 4 players
* Existing multiplayer spectrum gameplay preserved

Now implement Vibely's new core progression system.

**Do NOT rebuild the project.**

Inspect the current implementation first and integrate with the existing GameEngine.

---

# PRODUCT LOOP

A Vibely run is now:

```text
LOBBY
 ↓
CHOOSE GENRE
 ↓
LEVEL 1
 ↓
10 VIBES
 ↓
CLEAR LEVEL?
 ↓ YES
LEVEL 2
 ↓
10 VIBES
 ↓
LEVEL 3
 ↓
LEVEL 4
 ↓
LEVEL 5
 ↓
VIBELY MASTER
```

If any level fails:

```text
RUN OVER
```

The team must start a new run from Level 1.

---

# 1. TERMINOLOGY

Use Vibely terminology throughout the UI:

```text
Question → Vibe
Target → Sweet Spot
Guess → Read
Score → Vibe Score
Game Attempt → Run
Level Passed → Level Cleared
Final Completion → Vibe Master
```

The backend may use technically clearer names where necessary, but the player-facing UI should use the Vibely terminology.

---

# 2. GAME STRUCTURE

Default:

```text
5 Levels
10 Vibes per Level
50 Vibes per Run
```

Maximum score per vibe:

```text
100
```

Maximum score per level:

```text
1000
```

Maximum theoretical run score:

```text
5000
```

---

# 3. LEVEL CONFIGURATION

Create a configurable level system.

Do NOT hardcode difficulty throughout GameEngine.

Create something like:

```ts
interface LevelConfig {
  levelNumber: number;

  difficulty:
    | "EASY"
    | "MEDIUM"
    | "HARD"
    | "VERY_HARD"
    | "MASTER";

  passScore: number;

  targetWidth: number;

  timeLimit: number;

  modifiers: ModifierType[];
}
```

Default configuration:

LEVEL 1:

```text
difficulty: EASY
passScore: 500
targetWidth: 20
timeLimit: 30
modifiers: []
```

LEVEL 2:

```text
difficulty: MEDIUM
passScore: 550
targetWidth: 16
timeLimit: 25
modifiers: ["TIGHT_TARGET"]
```

LEVEL 3:

```text
difficulty: HARD
passScore: 600
targetWidth: 13
timeLimit: 20
modifiers: ["THREE_WORD_CLUE"]
```

LEVEL 4:

```text
difficulty: VERY_HARD
passScore: 650
targetWidth: 10
timeLimit: 15
modifiers: ["THREE_WORD_CLUE", "TIME_PRESSURE"]
```

LEVEL 5:

```text
difficulty: MASTER
passScore: 700
targetWidth: 7
timeLimit: 12
modifiers: ["THREE_WORD_CLUE", "TIME_PRESSURE"]
```

Make these values easily configurable.

---

# 4. WHY THE THRESHOLDS WORK

Each level has:

```text
10 × 100 = 1000 maximum
```

Therefore:

```text
Level 1 → 500 / 1000
Level 2 → 550 / 1000
Level 3 → 600 / 1000
Level 4 → 650 / 1000
Level 5 → 700 / 1000
```

Do not allow the frontend to determine whether a level was cleared.

The server calculates:

```ts
levelCleared = teamScore >= levelConfig.passScore
```

---

# 5. LEVEL STATE MACHINE

Implement explicit progression states.

```text
LOCKED
INTRO
ACTIVE
COMPLETED
FAILED
```

At the run level:

```text
LEVEL 1
 ↓
CLEARED
 ↓
LEVEL 2 UNLOCKED
 ↓
CLEARED
 ↓
LEVEL 3 UNLOCKED
 ↓
...
```

The frontend must never be able to skip:

```text
LEVEL 1 → LEVEL 3
```

The server controls progression.

---

# 6. RUN STATE

Add a Run model in memory:

```ts
interface GameRun {
  runId: string;

  genreId: string;

  currentLevel: number;

  highestLevelReached: number;

  status:
    | "ACTIVE"
    | "FAILED"
    | "COMPLETED";

  totalScore: number;

  levels: LevelResult[];
}
```

Each level:

```ts
interface LevelResult {
  levelNumber: number;

  score: number;

  requiredScore: number;

  status: "CLEARED" | "FAILED";

  vibesAnswered: number;

  perfectVibes: number;

  stars: number;

  startedAt: number;

  completedAt: number;
}
```

Everything is temporary.

Nothing is stored in MongoDB.

---

# 7. STARS

Calculate level stars:

```text
90%+ of maximum = ⭐⭐⭐

75–89% = ⭐⭐

Pass threshold–74% = ⭐
```

Since max level score is 1000:

```text
900+ → 3 stars
750–899 → 2 stars
500–749 → 1 star
```

For levels where the threshold differs, calculate stars against the 1000-point maximum.

---

# 8. LEVEL INTRO UI

Before every level show:

```text
LEVEL 3

🎓 COLLEGE WORLD

10 VIBES

PASS
600

TARGET
TIGHT

TIME
20 SEC

MODIFIER
THREE WORD CLUE

[ START LEVEL ]
```

Animate the level entrance.

Use Framer Motion.

---

# 9. LEVEL PROGRESSION UI

Show:

```text
COLLEGE WORLD

LEVEL 1 ✓
LEVEL 2 ✓
LEVEL 3 ●
LEVEL 4 🔒
LEVEL 5 🔒
```

Current level should be visually highlighted.

Locked levels should not be interactive.

---

# 10. LEVEL RESULT

After 10 vibes:

```text
LEVEL 2 CLEARED 🎉

642 / 550

⭐⭐

LEVEL 3 UNLOCKED 🔓

Things are getting harder.

TARGET: TIGHTER
TIME: FASTER

[ CONTINUE ]
```

If failed:

```text
SO CLOSE 😮‍💨

LEVEL 3

542 / 600

You needed 58 more points.

RUN COMPLETE

LEVEL 3 REACHED

[ PLAY AGAIN ]
[ BACK TO ROOM ]
```

---

# 11. LEVEL 5 BOSS EXPERIENCE

Level 5 should feel special.

Before Level 5:

```text
🔥 FINAL VIBE 🔥

LEVEL 5

MASTER MODE

🎓 COLLEGE WORLD

10 VIBES

PASS
700

TIGHTEST TARGET

12 SECOND TIMER

THREE WORD CLUE

ARE YOU READY?

[ ENTER FINAL LEVEL ]
```

Use stronger animation and visual emphasis.

Do not make the UI obnoxious.

---

# 12. FINAL GAME COMPLETE

When Level 5 is cleared:

```text
🏆 VIBELY MASTER

🎓 COLLEGE WORLD

LEVEL 5 CLEARED

TOTAL SCORE

4,842

⭐⭐⭐⭐⭐

WHAT A RUN.

[ PLAY AGAIN ]
[ STAY IN ROOM ]
```

Then return players to the room.

---

# 13. DIFFICULTY MODIFIERS

Implement a reusable ModifierManager.

Modifier types:

```ts
type ModifierType =
  | "TIGHT_TARGET"
  | "THREE_WORD_CLUE"
  | "TIME_PRESSURE";
```

---

## TIGHT_TARGET

Reduce target width.

The existing spectrum/reveal system must use the current level's target width.

---

## THREE_WORD_CLUE

The clue giver may submit at most 3 words.

Validate this on the server.

Do not rely only on frontend validation.

If invalid:

```text
CLUE_TOO_LONG
```

---

## TIME_PRESSURE

Use the level's time limit.

Server owns the timer.

Do not trust client countdowns for gameplay resolution.

---

# 14. CONTENT ARCHITECTURE

Do NOT put genre content directly into GameEngine.

Create:

```text
backend/src/content/genres/
```

Suggested files:

```text
everyday.ts
college.ts
corporate.ts
hotAndSpicy.ts
relationships.ts
chaos.ts
entertainment.ts
sports.ts
gaming.ts
travel.ts
brain.ts
food.ts
```

---

# 15. GENRE STRUCTURE

Use:

```ts
interface Genre {
  id: string;

  name: string;

  description: string;

  icon: string;

  levels: {
    1: VibeContent[];
    2: VibeContent[];
    3: VibeContent[];
    4: VibeContent[];
    5: VibeContent[];
  };
}
```

Vibe content:

```ts
interface VibeContent {
  id: string;

  leftLabel: string;

  rightLabel: string;

  difficulty: number;
}
```

Example:

```ts
{
  id: "college_001",

  leftLabel: "Boring Lecture",

  rightLabel: "Amazing Lecture",

  difficulty: 1
}
```

---

# 16. INITIAL GENRE LIST

Implement these 12 genres:

### 1. Everyday Life

Icon: 🌎

Broad everyday situations.

### 2. College World

Icon: 🎓

Campus, exams, professors, hostel, parties, student life.

### 3. Corporate World

Icon: 💼

Meetings, deadlines, managers, coworkers, startups, work culture.

### 4. Hot & Spicy

Icon: 🔥

Dating, crushes, flirting, red flags, green flags, awkward dates.

Keep content playful and tasteful rather than explicit.

### 5. Relationships

Icon: ❤️

Couples, friendship, emotions, communication, relationship situations.

### 6. Chaos World

Icon: 😂

Awkward situations, hot takes, weird opinions, funny scenarios.

### 7. Entertainment World

Icon: 🎬

Movies, Bollywood, Hollywood, TV, music, celebrities.

### 8. Sports World

Icon: 🏆

Cricket, football, basketball, tennis and sports culture.

### 9. Gamer World

Icon: 🎮

Games, characters, gaming culture, esports.

### 10. Travel World

Icon: ✈️

Travel, destinations, vacations, airports, hotels, experiences.

### 11. Brain World

Icon: 🧠

Science, space, history, geography, technology and knowledge.

### 12. Food World

Icon: 🍕

Food, drinks, restaurants, cravings and eating habits.

---

# 17. GENRE SELECTION UI

After the host creates the room:

```text
CHOOSE YOUR WORLD

Pick a genre for this run.

┌────────────┐
│ 🎓         │
│ COLLEGE    │
│ WORLD      │
└────────────┘

┌────────────┐
│ 💼         │
│ CORPORATE  │
│ WORLD      │
└────────────┘

┌────────────┐
│ 🔥         │
│ HOT &      │
│ SPICY      │
└────────────┘
```

Use cards.

Hover/tap animations.

Host selects.

All players see the selected genre.

---

# 18. SAME GENRE THROUGH ALL LEVELS

If host selects:

```text
COLLEGE WORLD
```

all five levels remain College World.

Do NOT randomly switch genres.

Difficulty changes through:

* content
* target width
* timer
* modifiers

---

# 19. GENRE × LEVEL DESIGN

Content must become more difficult as levels increase.

Example:

COLLEGE WORLD:

LEVEL 1:

```text
Boring Lecture ←→ Amazing Lecture

Easy Exam ←→ Impossible Exam

Early Class ←→ Perfect Class
```

LEVEL 2:

```text
Good Professor ←→ Legendary Professor

Average Student ←→ Campus Legend
```

LEVEL 3:

```text
Would Skip Class ←→ Would Never Miss

Mildly Embarrassing ←→ Absolutely Humiliating
```

LEVEL 4:

```text
Slightly Awkward ←→ Socially Catastrophic

Bad College Decision ←→ Life-Changing Decision
```

LEVEL 5:

```text
Forgettable Memory ←→ Legendary Memory

Normal Student ←→ Campus Myth

Bad Idea ←→ What Was I Thinking?
```

Create meaningful content for all 12 genres.

Do not simply duplicate Level 1 content across levels.

---

# 20. GENRE-SPECIFIC MODIFIERS

Create a future-friendly architecture:

```ts
GenreModifier
```

Implement a few initial examples.

COLLEGE WORLD:

```text
CAMPUS BAN

Cannot use:
college
class
professor
```

CORPORATE WORLD:

```text
CORPORATE BAN

Cannot use:
meeting
boss
office
```

MOVIES:

```text
ACTOR BAN

Cannot mention actor names.
```

FRUITS/FOOD:

```text
COLOR BAN

Cannot mention a color.
```

These should be optional modifier definitions and not tightly coupled to GameEngine.

Do not implement dozens of these yet.

Build the architecture so more can be added easily.

---

# 21. CONTENT RANDOMIZATION

Each level should have enough content to prevent immediate repetition.

When starting a level:

* select content from the correct genre
* select from the correct difficulty level
* avoid repeating the same vibe during the current run
* randomize order

The server chooses the content.

The client receives only the information appropriate to its role.

Preserve the existing target privacy rules.

---

# 22. SCORING

Preserve the existing scoring rules unless the current implementation differs.

Expected scoring:

```text
distance 0–3   → 100
distance 4–8   → 75
distance 9–15  → 50
distance 16–25 → 25
distance 26+   → 0
```

The server calculates score.

Do not trust client-submitted score.

---

# 23. ROLE ROTATION

Preserve the current role system:

* Clue Giver
* Guess Controller
* Guesser

Ensure roles rotate correctly between rounds and teams.

Integrate level progression without breaking existing role rotation.

---

# 24. SERVER EVENTS

Add only the necessary progression events.

Examples:

```text
LEVEL_STARTED
VIBE_STARTED
VIBE_RESULT

LEVEL_COMPLETED
LEVEL_FAILED
LEVEL_UNLOCKED

RUN_COMPLETED
RUN_FAILED
```

Payloads must be role-safe.

Never leak:

* target position
* target width
* hidden target
* future vibe
* answer metadata

to players who should not receive them.

---

# 25. FRONTEND STATE

Create clean progression state.

Example:

```ts
interface ProgressionState {
  currentLevel: number;

  highestLevelReached: number;

  levelStatus:
    | "LOCKED"
    | "INTRO"
    | "ACTIVE"
    | "COMPLETED"
    | "FAILED";

  levelScore: number;

  requiredScore: number;

  totalRunScore: number;

  stars: number;
}
```

Keep this synchronized from server state.

---

# 26. ACCEPTANCE CRITERIA

I should be able to:

1. Create a room.
2. Choose College World.
3. Start Level 1.
4. Play exactly 10 vibes.
5. Receive a Level 1 score.
6. Clear Level 1 if score >= 500.
7. See Level 2 unlock.
8. Play Level 2.
9. Experience tighter targets.
10. Reach Level 3.
11. Experience three-word clues.
12. Reach Level 4.
13. Experience time pressure.
14. Reach Level 5.
15. Experience Master Mode.
16. Complete the run.
17. Return to the room.
18. Start another run.
19. Choose a different genre for the next run.
20. Never be able to skip levels.

---

# 27. CODE QUALITY

Keep the architecture modular.

Recommended:

```text
game/
  GameEngine.ts
  LevelManager.ts
  RoundManager.ts
  ScoreManager.ts
  RoleManager.ts
  ModifierManager.ts

content/
  GenreManager.ts
  genres/
```

Do not put all progression logic inside React components.

Do not put genre data inside socket handlers.

Do not put level configuration inside UI components.

At the end provide:

* files created
* files modified
* files removed
* new types
* new socket events
* progression architecture
* genre architecture
* tests
* known limitations

Do not implement MongoDB, AI, authentication, persistent statistics or accounts.
