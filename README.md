# nona

3D nonogram puzzle generator (WIP).

#How to play

3D nonograms are logic puzzles in which cells in a grid must be colored or broken according to the numbers on the end of each line of cells. The number on the end of a row is a clue is a count of how many cubes in each row are solid and should be colored. The remaining cubes in that row are empty and should be broken. Clues that are not inscribed in a circle or square indicate that the solid cubes occur as one unbroken group somewhere within the row. Circle clues indicate that the solid cubes occur in exactly two unbroken groups, separated by at least one empty cell. Square clues indicate that the solid cubes are separated into three or more unbroken groups, each separated by at least one empty cell. Rows without clues contain an unknown number of solid cubes, which must be deduced using other rows. 

#Controls

By default, left click is used to color cubes and right click is used to break cubes. The controls can be swapped using button below the puzzle. 

The red and green handles below the puzzle can be used to view different sections within the puzzle. Double-clicking on a handle resets the view. 

#Puzzle generation

N: Generated puzzles are N x N x N large. 

density: Fraction of puzzle cubes which are solid. 

clue removal: Proportion of clues for which removal is attempted. 