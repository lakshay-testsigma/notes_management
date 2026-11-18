---
title: "Signed commits"
topic: frontend-engineering/learning-system-and-workstation/workstation-and-editor
stage: concept
tags: [frontend-engineering, learning-system-and-workstation, concept, git, signing]
created: 2026-11-18
sources: [chacon-2014-pro-git]
---

# Signed commits

The author name and email on a commit come from `git config`. Anyone can type any name there. A signed commit adds a cryptographic signature made with your private key, so others can check that the commit really comes from you. This note extends the Git pages of the lesson ([[02-lesson-workstation-and-editor|lesson pointer]]): page 03 sets `user.name` and `user.email`, which is the prerequisite idea here.

## Explanation: what it is and why it exists

Pro Git says that Git is "cryptographically secure, but it's not foolproof". When you take work from others on the internet, you may want to check that commits come from a trusted source. Git can sign and verify work with GPG ([Section 7.4](https://git-scm.com/book/en/v2/Git-Tools-Signing-Your-Work)). GPG is a program that makes and checks signatures with a key pair: a private key that you keep and a public key that you share.

## Mechanism: how it works step by step

1. Check for a GPG key with `gpg --list-keys`. If there is none, create one with `gpg --gen-key` ([Section 7.4](https://git-scm.com/book/en/v2/Git-Tools-Signing-Your-Work)).
2. Tell Git which key to use: `git config --global user.signingkey <key-id>`.
3. Sign a commit with `-S`: `git commit -S -m "fix: round cents"`. Git asks GPG to sign the commit with your private key.
4. Anyone can check the signature with `git log --show-signature -1`. Git uses the public key to check it.
5. A maintainer can refuse unsigned work: `git merge --verify-signatures <branch>` stops with an error such as "Commit ab06180 does not have a GPG signature" ([Section 7.4](https://git-scm.com/book/en/v2/Git-Tools-Signing-Your-Work)).

## Use-case: a real scenario and its benefit

An open-source library accepts pull requests from many people. The maintainer wants to merge only commits from trusted keys. With signed commits and `--verify-signatures`, a commit with a forged author name fails the check. The benefit over unsigned authorship: the name on a commit is proof, not only a label.

## Trade-offs: when to choose it, and the alternative

Signing costs setup: a key on every machine, a passphrase, and a key that you must keep safe. Pro Git also warns that if you sign, everyone on the team must understand how to do it, or you will spend time helping people rewrite their commits as signed versions ([Section 7.4](https://git-scm.com/book/en/v2/Git-Tools-Signing-Your-Work)). For a small private project, the alternative is unsigned commits plus a protected main branch that only reviewed pull requests can change.

**Interpretation.** Git hosting services show a badge for signed commits, and newer Git versions can also sign with an SSH key. Pro Git (2014) covers only GPG, so check your Git host's documentation for the current options.

## Failure-modes: what it prevents, where it fails, security limits

- **It prevents** a commit that claims to be from you but was made by someone else, when reviewers check signatures.
- **A leaked private key** lets anyone sign as you. Protect it with a passphrase and replace it if it leaks.
- **A signature proves who, not what.** A signed commit can still contain a bug or a secret. Review still matters.
- **Unsigned history.** Commits made before you started signing stay unsigned. `--verify-signatures` rejects them.

## Practice: a checkable experiment

1. Make a test repository: `git init /tmp/sign-test && cd /tmp/sign-test`.
2. Set your signing key (step 2 above) only for this repository: `git config user.signingkey <key-id>`.
3. Run `git commit --allow-empty -S -m "test: signed"`.
4. Run `git log --show-signature -1`. Expected: a line that says the signature is good, with your key.
5. Run `git commit --allow-empty -m "test: unsigned"` and check again. Expected: no signature lines.
6. Delete the folder with `rm -rf /tmp/sign-test`.

<!-- concept: signed-commits -->

## My insights
