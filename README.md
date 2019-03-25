# Baloons

There are 2 folders in this repository: they contain the Baloon project, which I'll explain soon, and the Midterm, which is a little project in F# to do in 3 days.
The specs about the Midterm are in the Word document in the same folder, the LWC is a library we "home-made" during the course.

Now, let's talk about the big project, Baloons.
The name resembles Balloons, which was the original idea, but I didn't really wanna waste time actually making balloons so I simply made arcs and removed a letter just to remind me of what I wanted to do and how lazy I am.

It's a Worms-like game and I've chosen to do this because I really wanted to see if I could come closer to one of my favourite childhood's game.
I've made a simply enough user interface so that it's possible to spawn how many players you want, to edit terrain (manually and automatically fixing if needed), etc.

There is an Info button at the start and there you'll find a little bit of tutorial, but TL;DR is:
  - Team Deathmatch but without teams because as I said I'm lazy (even if it's really easy to implement)
  - 3 Weapons, Bazooka, Sfera and Analog Clock (which is an Easter Egg of the course)
  - The terrain is SIMPLY an array of heights: be sure to understand this to get what happens if you shoot at the base of a really high terrain ;D

ESC to get to the menu, Arrow-Keys let you move, Q and E makes you aim, Spacebar (press it more -> shoot more distant) lets you shoot the selected weapon and +/- lets you change the weapon you're currently using.

Yeah, there are probably bugs, feel free to tell me which one you can find :)
And no, the Analog Clock "not showing" (aka Flickering) is not a bug, I was trying to simulate the flicker problem resolved with many techniques like DoubleBuffering, just press ESC, Settings (Impostazioni) and enable Double Buffer. As I said, it's a course's Easter Egg :)


About the project:

It was my first attempt at Javascript, don't look at the code hoping I wrote it thinking about code reusability or whatever is a good practice, the teacher wouldn't look at the code so as long as I can read it, works fine :^)  
There are no extern libraries used, just Vanilla Javascript. The rest is, of course, HTML and CSS.  
Since there are no extern libraries, the graphics is intentionally simple, but I've tried to show that it's possible to do whatever we want like:  
the first example that comes to my mind is "there is a PNG that it's loaded every explosion just to show that it's possible to change the Baloons to something else, like an actual Worm"  
The positions of the canvas, announcers, etc. are made for the screen of my computer since it's there that I've showed the project to the teacher: don't worry, on my computer it looks fine!

I hope that's all and even if it's not, have fun playing if you wish or whatever pleases you!

Try it live here -> https://gpurgatorio.github.io/Baloons/

Voto Finale: 30L
