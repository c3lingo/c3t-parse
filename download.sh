#!/usr/bin/env bash

if [[ -z $1 ]]
then
	echo -e "Usage:\n$0 <event prefix> [<day number (default 4)>]"
	exit
fi

PAD_DOMAIN=c3translate.pad.foebud.org
EVENT=$1
NUM_DAYS=${2:-4}

echo "Downloading ${NUM_DAYS} from event ${EVENT}"

for i in `seq ${NUM_DAYS}`
do
	URL="https://${PAD_DOMAIN}/ep/pad/export/${EVENT}-day${i}/latest?format=txt"
	FILE="data/rc3-day${i}.txt"
	echo -e "Downloading from ${URL}\nto ${FILE}"
	http --follow ${URL} > ${FILE}
	echo -e 'Done!\n'
done
