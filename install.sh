#!/usr/bin/env bash

# Getting prrof names based on the user inputs
declare selectedProof
proofName(){
    while :
    do
        case $1 in
            1 ) 
                selectedProof='ft-mint';
                break;;
            2 ) 
                selectedProof='nft-mint';
                break;;
            3 ) 
                selectedProof='ft-transfer';
                break;;
            4 ) 
                selectedProof='nft-transfer';
                break;;  
            5 ) 
                selectedProof='ft-burn';
                break;;  
            6 ) 
                selectedProof='nft-burn'
                break;;                                      
            * ) 
                echo 'Please type a valid proof number.'
                exit;;
        esac
    done
} 

# Creating specific proofs
proofCreation(){
    arg1=$1
    script='yes | npm run setup -- -i gm17/'
    join=' && '
    cmd=''
    inputs=($(echo "$arg1" | tr ',' '\n'))
    for u in "${inputs[@]}"
    do
        proofName $u
        cmd+=$script$selectedProof$join
    done
    cmd+='cd ../';
    eval $cmd
}

# Exit script as soon as a command fails.
set -o errexit

cd zkp-utils && npm ci && \
cd ../zkp && npm ci && \

# Lists of all existing proofs
echo -e '\033[32mList of all existing proofs :\033[m'
cd code/gm17/ && ls -1 -d */ && cd ../../
while true; do
    read -p "Do you want to recreate all proofs? (y/n) : " yn
    case $yn in
        [Yy]* ) npm run setup-all && cd ../; break;;
        [Nn]* ) read -p "Would you like to recreate any specific proof? (y/n) : " decision
                if [ "$decision" = "y" ] || [ "$decision" = "Y"  ]; then
                    echo -e '\033[32mList of all proofs :\033[m'
                    echo -e '1.ft-mint\n2.nft-mint\n3.ft-transfer\n4.nft-transfer\n5.ft-burn\n6.nft-burn'
                    echo -e 'Type the number of each proof as comma-separated'
                    read -p '(use "1,2" to create proofs for ft-mint & nft-mint) : ' proofs
                    proofCreation $proofs
                fi
                exit;;
        * ) echo "Please answer yes or no.";;
    esac
done
