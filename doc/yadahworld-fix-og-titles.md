# Cursor Prompt — Fix OG & Twitter Meta Titles on yadahworld.com

In the Next.js metadata configuration for the homepage (likely `app/layout.tsx`, `src/app/layout.tsx`, or a dedicated `metadata.ts` file), locate the `openGraph` and `twitter` metadata objects and make the following surgical changes:

## Changes

**1. Update OG title:**

```
From: "Yadah — Top Female Gospel Music Minister in Nigeria"
To:   "Yadah — The Voice of Jesus to Nations"
```

**2. Update Twitter title:**

```
From: "Yadah — Top Female Gospel Music Minister in Nigeria"
To:   "Yadah — The Voice of Jesus to Nations"
```

**3. Update OG description:**

```
From: "Yadah Kukeurim Daniel is one of the top female gospel music ministers in Nigeria. Her music has reached millions across nations with songs like Beyond Me, Never Seen, and Onye Nwere Jesus."

To:   "Gospel music minister and worshipper — The Voice of Jesus to Nations. Songs like Beyond Me, Never Seen, and Onye Nwere Jesus have reached millions across nations."
```

**4. Update Twitter description:**

```
From: "One of the top worship ministers in Nigeria. Gospel music that carries the presence of God."

To:   "Gospel music minister and worshipper — The Voice of Jesus to Nations. Songs like Beyond Me, Never Seen, and Onye Nwere Jesus have reached millions across nations."
```

## Rules

- Do NOT touch the HTML `<title>` tag — it is already correct as "Yadah — The Voice of Jesus to Nations"
- Do NOT change any keywords, og:image, og:url, og:type, og:locale, twitter:card, twitter:creator, or any other meta fields
- Do NOT restructure the metadata object — only update the four string values above
- After editing, confirm which file was changed and show the updated `openGraph` and `twitter` blocks in full
