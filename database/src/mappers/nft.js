export default function({
  tokenURI,
  tokenId,
  shieldContractAddress,

  receiver,
  sender,

  isMinted,
  isTransferred,
  isReceived,
  isBurned,
  isShielded,
}) {
  return {
    [tokenURI ? 'token_uri' : undefined]: tokenURI,
    [tokenId ? 'token_id' : undefined]: tokenId,
    [shieldContractAddress ? 'shield_contract_address' : undefined]: shieldContractAddress,

    [receiver ? 'receiver' : undefined]: receiver,
    [sender ? 'sender' : undefined]: sender,

    [isMinted ? 'is_minted' : undefined]: isMinted,
    [isTransferred ? 'is_transferred' : undefined]: isTransferred,
    [isReceived ? 'is_received' : undefined]: isReceived,
    [isBurned ? 'is_burned' : undefined]: isBurned,
    [isShielded ? 'is_shielded' : undefined]: isShielded,
  };
}
