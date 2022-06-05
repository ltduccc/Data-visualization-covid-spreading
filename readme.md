# A brief visualization for Exponential Growth of Covid Spreading.
## **Motivation**
You heard about many shocking news about the COVID-19 everyday on TV and social media everyday? You feel panic and depressive because of the non-stop increasing number of cases and deaths, and you have no clue about when everything back to normal for you to continue your big journey? Do not be hopeless, our visualization project will analyze the process and give more details clearly, where we are in the progress of COVID-19, and predict when it will stop. Our ultimate goal is to express clearly meaning of the terms "exponential growth" in the COVID-19 context as well as other contagious disease in general

## **What is exponential growth?**
The phrase "exponential growth" is familiar to most people, but the human intuition has a hard time to reconizing what it means sometimes. Unlike the linear growth (each day it increase by a constant), the number in exponential growth is updated by multiply a small $ratio > 1$. The main reason why the exponential growth is dangerous in terms of pandemic situation is that the number of infections in the beginning is pretty small, this naturally causes humans underestimates it, and suddenly suprising people with the huge amount of cases one day. 

Our visualization will dig into visualize this kind of growth to help people recognize the pattern intuitively.
## **Introduction of our project**

Our project has 2 line charts, one is multiple line chart, and the other is single line chart with updating time in order to visualize and compare the total confirmed cases all over 200 countries in the world (from 8/3/2020 to yesterday).

### **Multiple line chart:**

The multiple line chart is used for: 
- Comparing the total confirmed cases of multiple countries all at once
- Showing the overview changes and trends over time

We choose the multiple line chart because it is simple, easy to compare and predict efficiently.

**Interactive**
- Users can choose which country we wish to compare.
- The detail of number cases at particular time is revealed according to the vertical position of mouse.
- Users can click on the name of the country in the legend area to delete the line of the country

<img src = "multiple.png"><img>

About figure above, the top-left corner contains the list of coutries for the user to add for the multiple line chart.

The legend is on the right of screen.

The y-axis indicates the total confirmed cases with linear scale

The x-axis is the timeline.

Each country is assigned by different color.

### **Single line chart**

Unlike the multiple line chart, the single line chart is able to show only one country at once. However, it help us to see the progress in detail, in other words, the users can run the line chart by select the number of days.

**Interactive**
- User can choose any country in the list of countries.
- There are 2 ways to select the number of days: 
    - Enter a number in the box
    - Press or click the up arrow beside the box to increase the number of day.


## **Vietnam**

<img src = "Vietnam time line.png" style width = "800"><img/>

Description for the above figure:
- This is an overall timeline for number of cases in Vietnam
- At the beginning of the pandemic, it took 211 days to reached more than $10^3$ cases
- The number of total cases increase $10$ times to $10^4$ after 296 days.
- After the half of the timeline, the time it need to rise 10 times is shorter such that after 152 days it reached $10^6$ cases and 147 days to reacched $10^7$.
