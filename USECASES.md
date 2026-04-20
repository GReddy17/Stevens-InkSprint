# Writing Club Contest - How It Works

## Tables We Have

| Table | Fields |
|-------|--------|
| User | id, firebaseUid, email, displayName, role, votingWeight |
| Contest | id, title, prompt, rules, startTime, endTime, status, createdBy, votingType, votingDurationHours, votingGroupMemberIds |
| Submission | id, contestId, authorId, contentUrl, title, description, voteCount, totalScore, placement, certificateUrl, certificateGeneratedAt |
| Vote | id, contestId, submissionId, voterId, points, votedAt |

---

## Scenario 1: Creating a Contest

Alex creates "Horror Story Challenge"

**Backend:** Validates input → Creates contest record → Sets status to UPCOMING

**Database Updates:**
```
Contest {
  id: 1,
  title: "Horror Story Challenge",
  prompt: "Write a scary story under 1000 words",
  rules: "Original work only",
  startTime: 2026-10-01,
  endTime: 2026-10-07,
  status: "UPCOMING",
  createdBy: 1,
  votingType: "EVERYONE",
  votingDurationHours: 48,
  votingGroupMemberIds: []
}
```

---

## Scenario 2: Submitting a Story

Jordan submits "The Basement" to Horror Story Challenge

**Backend:** Checks contest is ACTIVE → Checks Jordan hasn't submitted → Creates submission

**Database Updates:**
```
Submission {
  id: 1,
  contestId: 1,
  authorId: 2,
  contentUrl: "/uploads/basement.pdf",
  title: "The Basement",
  description: "A story about what's underneath",
  voteCount: 0,
  totalScore: 0,
  placement: null,
  certificateUrl: null,
  certificateGeneratedAt: null
}
```

Taylor submits "3AM"

**Database Updates:**
```
Submission {
  id: 2,
  contestId: 1,
  authorId: 3,
  contentUrl: "/uploads/3am.docx",
  title: "3AM",
  description: "Can't sleep",
  voteCount: 0,
  totalScore: 0,
  placement: null,
  certificateUrl: null,
  certificateGeneratedAt: null
}
```

---

## Scenario 3: Voting Opens

October 7 ends, system detects contest ended

**Backend:** Updates contest status → Sets voting start and end time

**Database Updates:**
```
Contest {
  id: 1,
  status: "VOTING",
  votingStartTime: 2026-10-07,
  votingEndTime: 2026-10-09
}
```

---

## Scenario 4: Casting Votes

Jordan votes 8 on Taylor's story

**Backend:** Validates voter → Checks voting open → Checks not voted yet → Creates vote → Updates submission score

**Database Updates:**
```
Vote {
  id: 1,
  contestId: 1,
  submissionId: 2,
  voterId: 2,
  points: 8,
  votedAt: 2026-10-08
}

Submission {
  id: 2,
  voteCount: 0 → 1,
  totalScore: 0 → 8
}
```

Taylor votes 9 on Jordan's story

**Database Updates:**
```
Vote {
  id: 2,
  contestId: 1,
  submissionId: 1,
  voterId: 3,
  points: 9,
  votedAt: 2026-10-08
}

Submission {
  id: 1,
  voteCount: 0 → 1,
  totalScore: 0 → 9
}
```

Alex votes 7 on Jordan's story, 8 on Taylor's

**Database Updates:**
```
Vote { id: 3, contestId: 1, submissionId: 1, voterId: 1, points: 7, votedAt: 2026-10-08 }
Vote { id: 4, contestId: 1, submissionId: 2, voterId: 1, points: 8, votedAt: 2026-10-08 }

Submission {
  id: 1, voteCount: 1 → 2, totalScore: 9 → 16
}
Submission {
  id: 2, voteCount: 1 → 2, totalScore: 8 → 16
}
```

---

## Scenario 5: Voting Ends, Winners Declared

October 9 voting ends, system tallies scores

**Backend:** Updates contest status → Ranks submissions by totalScore → Updates placements → Generates certificates

**Database Updates:**
```
Contest {
  id: 1,
  status: "COMPLETED"
}

Submission {
  id: 1,
  placement: 1,
  certificateUrl: "/certs/horror_1_jordan.pdf",
  certificateGeneratedAt: 2026-10-09
}
Submission {
  id: 2,
  placement: 2,
  certificateUrl: "/certs/horror_2_taylor.pdf",
  certificateGeneratedAt: 2026-10-09
}
```

---

## All Tables with Sample Data

### User
```
{id: 1, firebaseUid: "firebase_abc", email: "alex@school.edu", displayName: "Alex", role: "PARTICIPANT", votingWeight: 1}
{id: 2, firebaseUid: "firebase_def", email: "jordan@school.edu", displayName: "Jordan", role: "PARTICIPANT", votingWeight: 1}
{id: 3, firebaseUid: "firebase_ghi", email: "taylor@school.edu", displayName: "Taylor", role: "PARTICIPANT", votingWeight: 1}
```

### Contest
```
{id: 1, title: "Horror Story Challenge", prompt: "Write a scary story under 1000 words", rules: "Original work only", startTime: 2026-10-01, endTime: 2026-10-07, status: "COMPLETED", createdBy: 1, votingType: "EVERYONE", votingDurationHours: 48, votingGroupMemberIds: []}
```

### Submission
```
{id: 1, contestId: 1, authorId: 2, contentUrl: "/uploads/basement.pdf", title: "The Basement", description: "A story about what's underneath", voteCount: 2, totalScore: 16, placement: 1, certificateUrl: "/certs/horror_1_jordan.pdf", certificateGeneratedAt: 2026-10-09}
{id: 2, contestId: 1, authorId: 3, contentUrl: "/uploads/3am.docx", title: "3AM", description: "Can't sleep", voteCount: 2, totalScore: 16, placement: 2, certificateUrl: "/certs/horror_2_taylor.pdf", certificateGeneratedAt: 2026-10-09}
```

### Vote
```
{id: 1, contestId: 1, submissionId: 2, voterId: 2, points: 8, votedAt: 2026-10-08}
{id: 2, contestId: 1, submissionId: 1, voterId: 3, points: 9, votedAt: 2026-10-08}
{id: 3, contestId: 1, submissionId: 1, voterId: 1, points: 7, votedAt: 2026-10-08}
{id: 4, contestId: 1, submissionId: 2, voterId: 1, points: 8, votedAt: 2026-10-08}
```

---

## How Tables Connect

```
User ──── Contest ──── Submission ──── Vote
   \                  /
    \________________/
     (votes on submissions)
```
