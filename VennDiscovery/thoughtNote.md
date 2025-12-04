sometimes picking a movie isn’t about the title, it’s about the mood. i tap through posters, skim genres like footnotes, and somehow still end up scrolling instead of watching. so what if that genre tag became the star of the show?

imagine a venn diagram with one circle for what it is, another for what i’m feeling. crime + cozy. sci-fi + slow burn. animation + heartbreak. mix two, get a suggestion born from the overlap.

maybe this goes further, swap circles for actors, themes, vibes as lens. maybe people share mixes. maybe mixes become pages (convergence). i’m just poking at the idea.

and for the implementation nerds: the venn discovery runs on simple geometry. we track each genre chip’s vertical distance from center (dy), then solve for its horizontal stretch using the circle equation x² + y² = r². the visual radius is larger than the math radius, creating a hyper-curve that keeps elements from clipping while still feeling satisfyingly circular.