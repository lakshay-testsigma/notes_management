# How a Raft cluster commits one write

A client sends a write to the leader. The leader appends it to its log and sends it to two followers. When a majority stores the entry, the leader commits it and replies to the client.

**00:00 One write, three servers.** A Raft cluster commits a write in a fixed order. Watch one write travel.

**00:05 The leader appends, then replicates.** The client sends the write to the leader. The leader appends it to its log, then sends AppendEntries to each follower.

**00:14 A majority acknowledges.** Follower 1 stores the entry and replies. The leader and Follower 1 are two of three servers, which is a majority.

**00:23 Commit, apply, reply.** The leader marks the entry committed, applies it to its state machine, and replies to the client. Followers learn the commit on the next message.

**00:32 Why a majority.** When a majority stored the entry, any new leader has it. When only a minority stored it, the entry can be lost. So the leader waits for a majority.

Sources:

- In Search of an Understandable Consensus Algorithm — https://raft.github.io/raft.pdf
