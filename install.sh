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
echo -e '\033[32mList of all completed trusted setup :\033[m'
setups=()
[[ -f code/gm17/ft-mint/proving.key && -f code/gm17/ft-mint/verification.key ]] && setups+=('ft-mint')
[[ -f code/gm17/nft-mint/proving.key && -f code/gm17/nft-mint/verification.key ]] && setups+=('nft-mint')
[[ -f code/gm17/ft-transfer/proving.key && -f code/gm17/ft-transfer/verification.key ]] && setups+=('ft-transfer')
[[ -f code/gm17/nft-transfer/proving.key && -f code/gm17/nft-transfer/verification.key ]] && setups+=('nft-transfer')
[[ -f code/gm17/ft-burn/proving.key && -f code/gm17/ft-burn/verification.key ]] && setups+=('ft-burn')
[[ -f code/gm17/nft-burn/proving.key && -f code/gm17/nft-burn/verification.key ]] && setups+=('nft-burn')
for i in "${setups[@]}"
do
    echo $i
done
yn=''
while true; do
    if [ $# -ne 0 ]
    then
        yn=$1
    else
        read -p "Do you want to recreate all trusted setup? (y/n) : " yn    
    fi
    case $yn in
        [Yy]* ) npm run setup-all && cd ../; break;;
        [Nn]* ) echo -e '\033[32mList of all trusted steup :\033[m'
                echo -e '1.ft-mint\n2.nft-mint\n3.ft-transfer\n4.nft-transfer\n5.ft-burn\n6.nft-burn'
                echo -e 'Type the number of each trusted setup seperated by comma'
                read -p '(use "1,2" to create trusted setup for ft-mint & nft-mint) : ' proofs
                    proofCreation $proofs
                exit;;
        * ) echo "Please answer yes or no.";;
    esac
done
