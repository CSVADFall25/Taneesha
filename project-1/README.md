# ChromaBeat
**by Taneesha Panda**

## Overview
My inspiration for ChromaBeat came from a combination of audio-visual works: Golan Levin's YellowTail, Eric Rosenbaum's Singing Fingers, and many audio visualizers I've seen online. There's a lot of spectral audio visualizers for dubstep/EDM on Youtube and I find them really mesmerizing. They make the invisible parts of sounds visually tangible. I wanted to bring that same sense of energy into an interactive form, where users don’t just watch sound move but draw with it. This tool turns sound into an expressive medium, allowing the brush to change with different parts of the sound spectrum while giving users control over color and gesture. The result is a creative space where music directly shapes the artwork being made.

## Function
This program uses the Fast Fourier Transform (FFT) algorithm from the p5.js sound library to analyze the audio in real time The signal is broken down into its component frequencies, allowing the program to extract the different levels of bass, mid, and treble ranges. These values were mapped to brush size using map(). As a result, lower bass frequencies produce large, heavy strokes, while higher treble frequencies create smaller, quicker brush movements. This direct relationship between sound and motion allows the drawing to pulse and evolve with the music, making every artwork unique to the audio file that’s playing.

## Process
I began by coding a really simple drawing tool that lets you draw on the canvas with a mouse, like a standard digital sketchpad. Then I had to separately make the file input button, referencing AI and online code to help me in the process. I used the fft.analyze() and getEnergy() functions to map the frequency levels to the brush tool. Initially, the brush pulsed, but the drawing was static. From here, I introduced a pulse animation and toggle between the three frequency bands using keyPressed(). Finally, I introduced a color picker to give the user creative control over the visuals. I also made sure the canvas didn’t refresh continuously, so drawings could accumulate and leave trails on the page.

## Reflection
This project encouraged me to think about the relationship between rhythm, motion, and expression — how music can shape creative gestures. In the future I want to make the brush strokes smoother and add more UI elements for user feedback. I’m also interested in exploring tactile inputs, perhaps by using sensors so users can draw sound through touch. Ultimately, I want to make this experience more immersive, blending sound, touch, and motion into a single experience.
