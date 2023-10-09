# Rules

This is a board game where each player can try itself in trading or pirating (or both), while sailing on the ship of 17 century. Minimal player count - 2. (It is possible to play alone - 1 person, but this is not interesting, because only trading will be possible.) Maximal player count is almost infinite, but software is not tested on large amount of players. And each player will waite his turn too long. If number of player will be more than number of ports, there is hight risk that game starts with endless pirating. Recommended player count - 5. In section "Game modes" described know how to detect winner.

## Game start

Each player receive Schooner, 2 cannons, 50$ and spawns at random port.

Players ordered randomly. Order important to detect next player that has to throw 2 dices. Random player starts.

## Player actions every turn

Every turn player throw 2 dices. Then he can perform actions. Following actions are possible and can be performed in any order: move, trade of fight. Depending on numbers shown on dices and location of ship, it is possible, that no actions are allowed. If player can not make any actions he automatically pass turn to next player. Even if player can make actions, but do not want to, he can anytime pass turn to next player.

### Moving ship

One dice stands for wind direction, another for wind power. Bigger number on power dice corresponds to stronger wind power.

| Number on direction dice | Meaning     |
| ------------------------ | ----------- |
| 1                        | No wind     |
| 2                        | North wind  |
| 3                        | West wind   |
| 4                        | South wind  |
| 5                        | East wind   |
| 6                        | Fickle wind |

If direction dice shows you "No wind", no matter on wind power you can not move ship.

If direction dice shows numbers from 2 to 5 player can:

+ Travel in direction of wind with number of cells equal to 2*wind_power
+ Travel in direction perpendicular to wind with number of cells equal to wind_power
+ Travel in direction opposite to wind with ratio*wind_power. Each ship has different ratio of movement against the wind. See table in section "Differences between ships".

If direction dice shows you "Fickle wind", then you can move at any direction with number of cells equal to wind_power. You will not have "2x bonuses", but you also will not have penalties by moving against the wind.

Example: You have north wind, power 4. You can move to North to 8 cells. To East and West 4 cells. Against the wind: 4 cells for Frigate, 2 for Galleon and Schooner can not move.

Example for power 3, moving against the wind: 3 cells for Frigate, 1 for Galleon and Schooner can not move.

You can mix moves in different directions, but you can not move diagonally. Imagine wind_power as a points. Travel in direction of wind cost 0.5 point, travel against wind as Galleon cost 2 points, other possible moves cost 1 point.

Example: North wind power=6 moving with Galleon, to circumnavigate the peninsula. 1 cell West (cost 1 point). 2 cell North (cost 1 point). 2 cells East (cost 2 points). 1 cell South (cost 2 points). 0 points left

```python
"""
L<<^
LVL^
LLG>

Land: L
Galleon: G
Movements: <>^V
"""
```

You can move, do action (e.g. fight), move again, do action (e.g. trade at port), and move again and ... (others combinations)

Example: Fickle wind wind power=6 moving with Frigate. 1 cell North (cost 1 point), fight, 1 cell North (cost 1 point), trade, 2 cells South (cost 2 points). And 2 points left to continue movements.

### Trading with ports

First time when you trade with new port, port will show you its prices. You do no know port's price list, before your first visit.

Tip: because players spawn at the port, during first turn after trowing a dice, you can immediately trade before moving your ship.

To simplify game, purchase price at ports is same as selling price. You can not load more goods than your ship's max goods capacity. Cannons can be mounted on ship, but also can be stored as a goods. Other players do not know numbers of goods/cannons you purchased and goods/cannons you sold. Other players are only informed if you purchase a new ship.

At ports you can purchase better ship, but you can not downgrade you ship.

Here are statistics for product prices:

|          | min | average | max |
| -------- | --- | ------- | --- |
| lumber   | 10  | 15      | 20  |
| sugar    | 21  | 30      | 39  |
| tobacco  | 45  | 61      | 78  |
| rum      | 95  | 124     | 153 |
| textile | 201 | 251     | 302 |
| spice   | 425 | 510     | 595 |
| cannon  | 95  | 100     | 105 |

Only one port at the map has some product at minimal price and only one has at maximal price. Prices are not distributed evenly - most prices are close to average.
Sample of spice price distribution: 425, 468, 485, 502, 518, 535, 552, 595.

### Fight with other ships

When your ship close enough to another (see "shooting distance" in "Differences between ships" section) you are able to initiate fight. If your ship is Schooner, you should be on same square as enemy ship, not depending on enemy ship type. If your ship is Frigate you are able to initiate fight, when there is one cell between you and enemy. Only sea type cells allowed between you and enemy, not land type cells.

Fight process:

+ Every ship receive fight points equal to number of cannons it has.
+ Both players throw dice. If both players receive equal numbers, nothing happens, fight turn just ends. If one player has greater number, then hi wins fight turn. Fight points of looser is decreased at the difference between numbers on dices. If after fight turn player has negative fight points, he loose fight.
+ Fight winner automatically collect all enemy $ and cannons. But because there is limited number of cannons, that can be mounted on ship, additional cannons can be only taken as goods. Winner cannot loose cannons his ship equipped with. Because ship has limited goods capacity, if there are too many goods on winner+looser ship, winner should decide what goods to keep, and what goods will sink with looser ship. Even if looser's ship had better class, winner can not receive that ship. Winner always keep his own ship.
+ Fight looser may re-spawn or not. See section "Game modes".
+ When fight ends and loot collected - game continues. If fight initiator wins, he continue his turn - see section "Moving ship". If fight initiator defeated, next player will make his turn, as if fight initiator had ended his turn.

If your ship has stronger class, than enemy ship, you are interested to start fight as far as shooting distance allows you. Enemy ship will spend fight turns, to close up (one cell per turn). Enemy ship will close up no matter if number on dices is equal or not. While enemy ship of weaker class is not close enough, your ship can not loose fight points, but enemy ship can.

Nobody can exit from fight. There will be only 1 winner. There is only 1x1 fight, not 2x1 or 2x2 fights. If you can start fight with multiple ships, you should select single ship.

0 is legal number of cannons to fight. You can even win opponent by ramming, but you will not collect goods, cannons and money then.

Example: You have 0 cannons, opponent have 2. You roll the dice and receive 4, opponent receive 1. Opponent have -1 fight points and loose. You do not collect goods.

You will anyway collect the goods, if you have at least one cannon, no matter of fight points you have at end.

Example: You have 1 cannon, opponent have 1 too. You roll the dice and receive 5, opponent receive 6. You roll the dice and receive 4, opponent receive 1. You have 0 fight points, opponent have -2. You win and collect goods, cannons and money.

Fight points are automatically restored after battle - no need to repair ship at port.

## Differences between ships

|                                    | Schooner    | Galleon        | Frigate                |
| ---------------------------------- | ----------- | -------------- | ---------------------- |
| ratio of movement against the wind | 0           | 0.5            | 1                      |
| max goods capacity                 | 4           | 10             | 20                     |
| max cannons                        | 4           | 12             | 18                     |
| shooting distance                  | same square | 1              | 2                      |
| Price                              | free        | Schooner + 350 | S + 1350  or  G + 1000 |

## Game modes

Modes:

+ Survival: after a player is defeated he **can not** re-spawn. Last surviving ship wins.
+ Infinite: after a player is defeated he **can** re-spawn. (But may decide not to re-spawn, if he do not want to continue to play.) Winner can be detected any time by counting, total cost of ship + minimal cost of goods and cannons.

Re-spawn rules:

+ If there are ports with no ships nearby (no ships in distance less than 6 squares) then player spawns in one of such port. Selected port maximally far from fight place, where player defeated.
+ If all ports have ships nearby, then random one is selected, no matter of port location.
+ Player re-spawn with same resources as if he spawned at the start of the game: Schooner, 2 cannons and 50$

In infinite mode, if last but one player decide not to re-spawn, then last player wins as in survival mode.
