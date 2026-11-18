# Storyboard: Merge and rebase on the same fork

**Purpose.** See how merge and rebase join the same two diverged branches and why the two histories differ.

**Why a video.** Each command moves pointers and creates commits in a fixed order, and the result of each step depends on the step before.

**Length.** 49.0 s, 5 scenes.

## 1. Commits, branches and HEAD (0.0–10.0 s)

**On screen.** Numbered steps appear one at a time: Commit: a snapshot plus a parent link → Branch: a pointer to one commit → HEAD: the branch you are on → New commit: your branch moves forward.

**Narration and caption.** Each commit stores a snapshot and a link to its parent. A branch is a movable pointer, and HEAD names your current branch.

**Sources.** chacon-2014-pro-git

## 2. One history forks into two (10.0–19.0 s)

**On screen.** Two columns, "feature" and "main", fill in pairs; verdict: C2 is the common ancestor of both tips..

**Narration and caption.** Now the history forks into two lines. Feature adds C3, main adds C4, and both commits have the parent C2.

**Sources.** chacon-2014-pro-git

## 3. git merge feature, on main (19.0–29.0 s)

**On screen.** Numbered steps appear one at a time: Find the common ancestor C2 → Three-way merge of C4 and C3 → Record merge commit C5 with two parents → main moves to C5, feature stays at C3.

**Narration and caption.** On main, git merge feature combines C4, C3 and their common ancestor C2. Git records C5, a merge commit with two parents.

**Sources.** chacon-2014-pro-git

## 4. git rebase main, on feature (29.0–39.0 s)

**On screen.** Numbered steps appear one at a time: Save the change that C3 made → Reset feature to C4, the tip of main → Apply the change as new commit C3' → History is one straight line.

**Narration and caption.** On feature, git rebase main replays the change of C3 on top of C4 as a new commit, C3'. History becomes a straight line.

**Sources.** chacon-2014-pro-git

## 5. Same files, different history (39.0–49.0 s)

**On screen.** Two columns, "Merge" and "Rebase", fill in pairs; verdict: Do not rebase commits that exist outside your repository..

**Narration and caption.** Both commands give the same final files, but rebase rewrites commits. Never rebase commits that exist outside your repository.

**Sources.** chacon-2014-pro-git
