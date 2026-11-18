# Storyboard: How text flows through a shell pipeline

**Purpose.** See how each command in a pipeline reads the output of the command before it, and why the order of redirections decides where errors go.

**Why a video.** Each stage of the pipeline changes the text, and the next stage depends on that change, so motion shows the data flow better than one static picture.

**Length.** 53.8 s, 5 scenes.

## 1. Count the 404 errors in a log (0.0–7.0 s)

**On screen.** Title card with "cat access.log | grep 404 | sort | uniq -c | sort -rn".

**Narration and caption.** We count the 404 errors in a small web server log. Seven lines go in at the left.

**Sources.** gnu-bash-manual

## 2. The pipe connects two commands (7.0–17.0 s)

**On screen.** The expression cat access.log | grep 404 with "cat access.log", "|", "grep 404" highlighted in turn and explained.

**Narration and caption.** The pipe symbol connects the output of one command to the input of the next. Here, grep reads what cat writes.

**Sources.** gnu-bash-manual

## 3. Each stage changes the text (17.0–31.0 s)

**On screen.** Nodes cat, grep 404, sort, uniq -c, sort -rn. A packet moves cat→grep, grep→sort, sort→uniq, uniq→sortn; each node lights up when the packet arrives.

**Narration and caption.** Watch the number of lines change at each stage of the pipeline. Cat sends seven lines, grep keeps five, sort groups them, uniq counts two groups, and the last sort puts the largest count first.

**Sources.** gnu-bash-manual

## 4. The answer: which pages fail most (31.0–39.8 s)

**On screen.** Bars grow for 404 /old 3 errors, 404 /logo.png 2 errors.

**Narration and caption.** The final output shows the count for each page. Slash old fails three times, and slash logo dot png fails twice.

**Sources.** gnu-bash-manual

## 5. Redirection order decides where errors go (39.8–53.8 s)

**On screen.** Two columns, "ls > out.txt 2>&1" and "ls 2>&1 > out.txt", fill in pairs; verdict: Redirections run left to right..

**Narration and caption.** Bash processes redirections from left to right, so their order matters. On the left, ls sends both streams to out.txt. On the right, the error stays on the terminal.

**Sources.** gnu-bash-manual
