---
title: "SSH keys for Git hosting"
topic: frontend-engineering/learning-system-and-workstation/workstation-and-editor
stage: concept
concept: ssh-keys-for-git
tags: [frontend-engineering, learning-system-and-workstation, concept, git, ssh]
created: 2026-11-18
sources: [chacon-2014-pro-git]
---

# SSH keys for Git hosting

You type `git push` and the Git host must decide who you are. An SSH key answers that question without a password. Many Git servers authenticate users with SSH public keys ([Pro Git, Section 4.3](https://git-scm.com/book/en/v2/Git-on-the-Server-Generating-Your-SSH-Public-Key)).

This note extends the lesson page `01-terminal-and-shell` of this topic. Open that page for the interactive terminal practice; this note keeps the details. It builds on [[SSH key pair]] and on the prerequisite idea of environment paths: `~/.ssh` means the `.ssh` folder in your home directory.

## Explanation: what it is and why it exists

An [[SSH key pair]] is two files that belong together. The private key is a file that stays on your machine. The public key is the matching file with the `.pub` extension; you give it to the server ([Section 4.3](https://git-scm.com/book/en/v2/Git-on-the-Server-Generating-Your-SSH-Public-Key)).

SSH (Secure Shell) is a network protocol that Git can use to talk to a remote repository. The book calls it "an authenticated network protocol", and all data transfer over it "is encrypted and authenticated" ([Section 4.1](https://git-scm.com/book/en/v2/Git-on-the-Server-The-Protocols)).

The key exists so that you do not type a secret on every push. You set it up once per machine, and the host then knows your machine.

**Analogy.** The public key is like a lock that you mount on the server's door. The private key is the only key that opens it. The analogy breaks in one place: you can mount copies of the same lock on many servers, and showing the lock to anyone is safe.

## Mechanism: how it works, step by step

These steps follow Section 4.3 of Pro Git.

1. Check for an existing key. Run `cd ~/.ssh` and `ls`. Look for a key file and a matching `.pub` file. Pro Git (2014) shows names such as `id_rsa` or `id_dsa`; the name depends on the key type.
2. If no pair exists, run `ssh-keygen -o`. The `ssh-keygen` program comes with the SSH package on Linux and macOS, and with Git for Windows.
3. The program asks where to save the key and shows a default path. Pro Git (2014) shows `~/.ssh/id_rsa`. Your OpenSSH version can use a different key type and file name, so note the path it prints.
4. The program asks twice for a passphrase. A passphrase is a password that protects the private key file itself. You can leave it empty.
5. The program writes two files, the private key and the same name with `.pub` (for example `id_rsa` and `id_rsa.pub`), and prints a key fingerprint. A fingerprint is a short checksum that identifies the key.
6. Copy the content of the `.pub` file to the server. The book's example sends it to the server administrator; a Git hosting service has a settings page for the same step.
7. Use an SSH remote URL. Git accepts `ssh://[user@]server/project.git` or the shorter form `[user@]server:project.git` ([Section 4.1](https://git-scm.com/book/en/v2/Git-on-the-Server-The-Protocols)).

The public key file is one line of text. It starts with the key type (`ssh-rsa` in the book), then a long encoded value, then a comment such as `schacon@mylaptop.local`.

**Interpretation.** At push time the server checks that your machine holds the private key that matches a stored public key. The private key itself never leaves your machine. The book pages I read state the setup steps, not the cryptographic exchange, so treat this sentence as a summary, not a quote.

## Use case: daily pushes from your workstation

You set up a new laptop for frontend work. You clone ten repositories from your Git host and push several times a day. With an SSH key, you generate one pair, upload the `.pub` file once, and then every `git push` and `git pull` works with no password prompt. If you set a passphrase, `ssh-agent` (a background program that holds the unlocked key) stops the repeated prompts too ([Section 4.3](https://git-scm.com/book/en/v2/Git-on-the-Server-Generating-Your-SSH-Public-Key)).

The alternative is HTTPS. The book describes HTTPS authentication with a username and password. It says "providing your credentials is sometimes more complicated than using keys over SSH", and it names credential caching tools such as Keychain on macOS and Credential Manager on Windows ([Section 4.1](https://git-scm.com/book/en/v2/Git-on-the-Server-The-Protocols)).

**So.** The benefit of SSH over HTTPS is that the secret is a file on your disk, set up once, and not a credential that you enter or cache per host. You pay a one-time setup step to get password-free daily work.

**Note.** Many Git hosts today accept a personal access token, not your account password, over HTTPS. The 2014 pages of Pro Git do not cover tokens, so check your host's current documentation for the HTTPS details.

## Trade-offs: when to choose SSH or HTTPS

Choose SSH when you push often from your own machine. The book lists its pros: SSH is easy to set up, its transfer is encrypted and authenticated, and it compresses data before transfer ([Section 4.1](https://git-scm.com/book/en/v2/Git-on-the-Server-The-Protocols)).

Choose HTTPS when you only clone, or when you cannot set up keys. The book gives three reasons:

- SSH has no anonymous access. Every user needs SSH access, even to read.
- HTTPS needs no local key and no upload step, which the book calls "a major advantage in usability" for less experienced users.
- Corporate firewalls often allow HTTPS ports, so HTTPS works on networks that block other traffic.

On GitHub, the HTTPS URL that you open in the browser is also the clone and push URL ([Section 4.1](https://git-scm.com/book/en/v2/Git-on-the-Server-The-Protocols)). With SSH you need a second, `git@`-style URL.

**Interpretation.** For a developer who works on a personal laptop every day, SSH is usually the better default. For a shared or locked-down machine, HTTPS with a credential helper is the safer choice.

## Failure modes and security limits

- **The private key leaks.** Anyone who copies the private file can push as you. Never share the file without `.pub`, and never commit it to a repository. The `.pub` file is safe to share.
- **No passphrase.** An empty passphrase means that the file alone is enough. The book allows an empty passphrase for convenience. If you set one, the book says to add `-o`, which saves the key "in a format that is more resistant to brute-force password cracking than is the default format" ([Section 4.3](https://git-scm.com/book/en/v2/Git-on-the-Server-Generating-Your-SSH-Public-Key)).
- **Overwriting an old key.** `ssh-keygen` offers the default path. If a key already exists there, you can replace it and lose access to servers that trust the old key. Step 1 (check `~/.ssh` first) prevents this.
- **Wrong remote URL.** A repository cloned over HTTPS keeps using HTTPS. The SSH key does nothing until the remote URL uses the SSH form. Run `git remote -v` to see which form you have.
- **Blocked network.** On networks that allow only HTTPS ports, SSH can fail even when the key is correct ([Section 4.1](https://git-scm.com/book/en/v2/Git-on-the-Server-The-Protocols)).
- **Outdated key type.** The book shows RSA and DSA file names. It dates from 2014, so check your Git host's current advice on key types before you generate a key.

## Practice: a checkable experiment

This experiment makes a throwaway key, so it does not touch your real one.

1. Run `ls ~/.ssh`. Expected: either "No such file or directory", or a list of files. Write down any `id_*` pair that you find.
2. Run `ssh-keygen -o`. At the "Enter file" prompt, type a test path such as `/tmp/test_key`. Enter a passphrase twice.
3. Expected: the program prints "Your identification has been saved" and "Your public key has been saved", then a fingerprint.
4. Run `ls /tmp/test_key*`. Expected: two files, `test_key` and `test_key.pub`.
5. Run `cat /tmp/test_key.pub`. Expected: one line that starts with the key type and ends with a comment like `you@your-machine`.
6. In any local repository, run `git remote -v`. Expected: a URL that starts with `https://` (HTTPS) or one in the `user@server:path` form (SSH).
7. Delete the test files with `rm /tmp/test_key /tmp/test_key.pub`.

Check yourself: which of the two files may you paste into a web form, and why does the other one stay on the machine?

Sources: [[chacon-2014-pro-git-workstation-and-editor|Pro Git digest]], Pro Git Sections 4.1 and 4.3.

<!-- concept: ssh-keys-for-git -->

## My insights
