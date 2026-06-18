when someone turns on subtitles, they're usually making a choice to experience the entire movie through them. whether it's because they're watching in a different language, don't want to miss dialogue, or just prefer having subtitles on, they end up reading hunderds of lines over the next couple of hours.

while watching vaazha ii, i started noticing weird bits of text showing up in the subtitles. things like:
<br>
"heyÃ¢Â€Â¦ what's this?"
<br>
"Jesus ChristÃ¢Â€Â". 
<br>
Ã¢Â€Â™ll hold you close
<br>
not enough to make the movie unwatchable, but enough to pull you out of the moment every time it happens. it's one of those tiny details that most people won't consciously remember, but it quietly chips away at the experience.

i got curious about what was causing it and ended up digging into the subtitle file itself. somewhere along the way, that curiosity turned into a small side project. subtitle files are surprisingly large, which makes manually checking them difficult, so i built a lightweight validator that scans subtitle files, looks for encoding corruption and formatting issues, and points out the lines that need attention.
<br><br>
only thing viewers should be decoding is the plot.
<br>[subtitles fixed, viewer remains immersed]