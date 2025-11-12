# Step-Party
**by Taneesha Panda**

## Overview
Step-Party displays my health data through an interactive, videogame-inspired interface. Using my daily step count as the central dataset, I used p5 to implement playful interaction and dynamic audio. A monkey avatar represents my activity levels—its speed and behavior are mapped to the number of steps I took on a given day. The timeline slider allows users to explore different time periods, and the drop-down menu filters my data into three significant phases. The overall design aims to merge data visualization, interactivity, and personal narrative.

## Data Processing
I downloaded my raw Apple health data and parsed it to isolate two columns: date and steps, removing unnecessary attributes. The dates were then divided into three filtered ranges corresponding to key personal milestones: April 2019 – August 2022, September 2022 – August 2024, September 2024 – November 2025. The first range corresponds to when I was in high school. The second range marks when I moved to Isla Vista for my undergraduate studies. The third range is my most recent year of step data. Each range can be selected from a dropdown menu to view trends during those specific times. Minimum and maximum step values were computed to normalize movement speed across all data, ensuring consistent sprite behavior.


## Functionality
The interface includes several interactive components:

* Sprite Control: The monkey moves using the arrow keys. Its speed scales with daily step counts, representing my physical activity.

* Timeline Slider: Scrolls through days chronologically within the selected date range, updating the sprite’s motion.

* Audio Feedback: Three background songs—slow, medium, and fast—correspond to low, moderate, and high step counts.

* UI Elements: filter menu allows users to change date ranges, mute button toggles sound, and info button displays usage instructions. 

## Reflection
This project allowed me explore the intersection of data, interaction, and web narrative. Converting my step data into an interactive scene made me think about how raw information can become experiential and emotional when tied to motion, sound, and play. 

While the current website focuses on basic movement, I’d like to expand it into a more complete game environment— adding landmarks or objectives that make the data exploration feel like a journey. I would also incorporate more of my own health variables like sleep quality, heart rate, or mood to influence the environment, creating a more nuanced connection between data and lived experience.
