# How text flows through a shell pipeline

A seven-line web server log goes through cat access.log | grep 404 | sort | uniq -c | sort -rn. grep keeps the five 404 lines, sort puts equal lines together, uniq -c counts each group, and sort -rn puts the largest count first: three errors for /old and two for /logo.png. Then two commands show that Bash processes redirections from left to right, so 2>&1 before or after > out.txt sends the error message to a different place.

**00:00 Count the 404 errors in a log.** We count the 404 errors in a small web server log. Seven lines go in at the left.

**00:07 The pipe connects two commands.** The pipe symbol connects the output of one command to the input of the next. Here, grep reads what cat writes.

**00:17 Each stage changes the text.** Watch the number of lines change at each stage of the pipeline. Cat sends seven lines, grep keeps five, sort groups them, uniq counts two groups, and the last sort puts the largest count first.

**00:31 The answer: which pages fail most.** The final output shows the count for each page. Slash old fails three times, and slash logo dot png fails twice.

**00:39 Redirection order decides where errors go.** Bash processes redirections from left to right, so their order matters. On the left, ls sends both streams to out.txt. On the right, the error stays on the terminal.

Sources:

- Bash Reference Manual — https://www.gnu.org/software/bash/manual/bash.html
