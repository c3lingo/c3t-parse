c3lingo stats pad parser
========================

This is a small script to extract stats from c3lingo's internal shift
assignment pads.

Usage:

## Step 1: Download pads

(Requires `httpie` installed)
```bash
./download.sh <event prefix> [<number of days (default 4)>]
```

E.g. if the pads are named `rc3-day1` through `rc3-day3`, use:
```bash
./download.sh rc3 3
```

## Step 2 (optional): Set "main" halls

If certain halls should have their stats displayed separately because they are
more important, enter them into the `MAIN_CHANNELS` variable in `main.js`

## Step 3: Run script

(Requires `node.js` installed)
```bash
node main.js
```

## Step 4: ???

Fix whatever errors there are. No guarantees, sorry :)

## Step 5: Profit!

Have fun and don't forget to hand the stats in to the infrastructure review!
