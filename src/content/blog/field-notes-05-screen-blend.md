---
title: "Field Notes #05 — light on black"
description: "The one compositing trick that makes the whole site possible: screen blend, and why alpha video was never going to work."
author: alex-sheridan
publishedAt: 2026-06-22T10:00:00Z
tags:
  - Engineering
  - Field Notes
heroTint: "from-[#10314f] to-[#3aa0ff]"
---

Every glowing thing on this site — the planet, the flare, the logo itself — is an image of light on pure black, composited with `mix-blend-mode: screen`. Black drops out, light adds. No alpha channels, no codec fights, works in every browser.

## The pipeline

This note walks through the pipeline: rendering plates on black in Blender, keying elements that were never delivered with transparency, and the GLSL flare that replaced a whole folder of PNGs.

Field Notes is our engineering-notebook series — the real decisions, including the wrong turns.
