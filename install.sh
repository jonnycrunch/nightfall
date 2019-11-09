#!/usr/bin/env bash

# Creating specific proofs
proofCreation(){
    arg1=$1
    script='yes | npm run setup -- -i gm17/'
    join=' && '
    cmd=''
    inputs=($(echo "$arg1" | tr ',' '\n'))
    trustedSetups=()

    for d in *; do
    if [ -d "$d" ]; then
        trustedSetups+=($d)
    fi
    done

    for i in "${inputs[@]}"
    do
        cmd+=$script${trustedSetups[`expr $i - 1`]}$join
    done

    cmd+='cd ../';
    eval $cmd
}


# Exit script as soon as a command fails.
set -o errexit

cd zkp-utils && npm ci && \

cd ../zkp && npm ci && \

cd code/gm17/

setups=()

for d in *; do
  if [ -d "$d" ]; then
    setups+=($d)
  fi
done

# Lists of all existing proofs
echo -e $'\n''\033[32mList of completed trusted setups :\033[m'
existingSetups=()

for i in "${setups[@]}"
do
    [[ -f $i/proving.key && -f $i/verification.key ]] && existingSetups+=($i)
done

for i in "${existingSetups[@]}"
do
    echo $i
done
yn=''
while true; do
    if [ $# -ne 0 ]
    then
        yn=$1
    else
        read -p $'\n''Do you want to rerun all trusted setups? (y/n) : ' yn    
    fi
    case $yn in
        [Yy]* ) npm run setup-all && cd ../; break;;
        [Nn]* ) echo -e $'\n''\033[32mList of all trusted setups :\033[m'
                #echo -e '1.ft-mint\n2.nft-mint\n3.ft-transfer\n4.nft-transfer\n5.ft-burn\n6.nft-burn'
                for (( i=0; i<${#setups[@]}; i++ )); 
                do 
                     echo "`expr $i + 1`.${setups[$i]}"
                done
                echo -e $'\n''Type the number of each trusted setup seperated by a comma'
                read -p '(E.g. type "1,2" to run the trusted setups for ft-mint & nft-mint) : ' proofs
                    proofCreation $proofs
                exit;;
        * ) echo "Please answer yes or no.";;
    esac
done




