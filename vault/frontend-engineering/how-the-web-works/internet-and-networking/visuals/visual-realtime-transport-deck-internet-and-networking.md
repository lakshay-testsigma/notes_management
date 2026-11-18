---
title: "Choose a realtime transport for each feature"
topic: frontend-engineering/how-the-web-works/internet-and-networking
stage: visual
tags: [frontend-engineering, how-the-web-works, visual]
created: 2026-11-18
sources: [hpbn-book]
---
# Choose a realtime transport for each feature

**Interactive experiences** · teaches Realtime transports, Polling, long polling and Server-Sent Events, WebSockets

**Why this visual.** Pick polling, long polling, Server-Sent Events or WebSocket for a product feature and justify the choice by data direction and tolerated delay.

**Branching presentation (Mode C)** · level intermediate · modes Deep dive, Practice.

Open it on the lesson site: `/frontend-engineering/how-the-web-works/internet-and-networking/lesson/11-realtime-transports/`. Run `npm run site:dev` first.

## Parts

- Branching deep dives: [[visual-realtime-transport-paths-internet-and-networking|realtime-transport-paths]]
- Static fallback: [[visual-realtime-transport-decision-internet-and-networking|realtime-transport-decision]]

Lesson definition: `projects/frontend-engineering/how-the-web-works/internet-and-networking/experiences/realtime-transport-deck/experience.json` (rebuild with `tutor experience frontend-engineering/how-the-web-works/internet-and-networking build realtime-transport-deck`).

## Checkpoints

- **predict.** 10,000 clients poll every 60 seconds and get no new messages. They switch to every 1 second. What happens to the traffic the server receives? Answer: It rises about 60 times, to over 60 Mbps. Each empty check still costs about 850 bytes of HTTP overhead. Sixty times more requests give about sixty times more traffic, so short intervals are expensive.
- **verify.** A collaborative cursor sends and receives positions many times a second. Why is Server-Sent Events the wrong choice? Answer: The client cannot send data on an SSE connection after the handshake. SSE is server-to-client only. The cursor must also send the user's own position, and WebSocket is the transport that carries messages both ways on one connection.
- **verify.** A dashboard ticker gets many price updates per second, but it may show prices that are up to 30 seconds old. Which transport makes the fewest requests? Answer: Periodic polling every 30 seconds. When some delay is acceptable and updates arrive often, periodic polling collects many updates into one response. Long polling ends after each update, so a high rate means many requests.

Needs first: HTTP/1.1, HTTP/2 and HTTP/3.

## What it shows

Choose a path through the deck and open the deep dives. Pick polling, long polling, Server-Sent Events or WebSocket for a product feature and justify the choice by data direction and tolerated delay.

Text alternative: A branching deck compares periodic polling, long polling, Server-Sent Events and WebSocket by who sends the data and how much delay is acceptable, shows the bandwidth cost of short polling intervals, and opens four deep dives: a notification feed, a stock ticker, a chat and a collaborative cursor.

## Check yourself

10,000 clients poll every 60 seconds and get no new messages. They switch to every 1 second. What happens to the traffic the server receives?

Answer: It rises about 60 times, to over 60 Mbps. Each empty check still costs about 850 bytes of HTTP overhead. Sixty times more requests give about sixty times more traffic, so short intervals are expensive.

## Sources

- High Performance Browser Networking — https://hpbn.co/ (`hpbn-book`)

## Used in

- lesson page `/frontend-engineering/how-the-web-works/internet-and-networking/lesson/11-realtime-transports/` (file `site/src/content/lessons/frontend-engineering/how-the-web-works/internet-and-networking/11-realtime-transports.mdx`)

Back to [[visuals-internet-and-networking|all visuals]].

## My insights
