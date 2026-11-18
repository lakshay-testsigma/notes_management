# Storyboard: git bisect halves the suspect commits at every test

**Purpose.** See how marking one good and one bad commit lets Git find the first bad commit in about four tests out of sixteen.

**Why a video.** Each test depends on the answer before it: the answer moves the good or bad end, and Git checks out the next middle commit.

**Length.** 54.0 s, 5 scenes.

## 1. A bug hides in 16 commits (0.0–7.0 s)

**On screen.** Title card with "c1 worked, HEAD (c16) is broken".

**Narration and caption.** A bug appeared somewhere in sixteen commits. Git bisect finds the first bad commit by halving the range.

**Sources.** chacon-2014-pro-git

## 2. Mark both ends of the range (7.0–18.0 s)

**On screen.** Numbered steps appear one at a time: git bisect start → git bisect bad   (HEAD, c16) → git bisect good c1 → Git checks out the middle commit.

**Narration and caption.** You start bisect and mark both ends of the range. HEAD, commit sixteen, is bad. Commit one is good. Git then checks out the middle commit.

**Sources.** chacon-2014-pro-git, git-scm-docs

## 3. Each answer halves the suspects (18.0–30.0 s)

**On screen.** A timeline reveals c8: good → c12: bad → c10: good → c11: bad.

**Narration and caption.** Each answer you give halves the suspect range. Commit eight is good, twelve is bad, ten is good, eleven is bad. Four tests are enough.

**Sources.** chacon-2014-pro-git

## 4. Git names the first bad commit (30.0–40.0 s)

**On screen.** Numbered steps appear one at a time: c11 is the first bad commit → git bisect reset → Back on the commit you started on.

**Narration and caption.** After the last answer, Git reports commit eleven as the first bad commit. Then git bisect reset returns you to where you started.

**Sources.** chacon-2014-pro-git, git-scm-docs

## 5. Let a script answer: git bisect run (40.0–54.0 s)

**On screen.** Numbered steps appear one at a time: exit 0: good → exit 1 to 127, not 125: bad → exit 125: skip, cannot test → any other code: abort.

**Narration and caption.** A test script can give the answers with git bisect run. Exit zero means good. One to one hundred twenty seven means bad, except one twenty five, which means skip. Any other code aborts.

**Sources.** git-scm-docs
