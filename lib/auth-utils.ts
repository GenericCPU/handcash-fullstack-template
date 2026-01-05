import * as secp256k1 from "@noble/secp256k1"

export function generateAuthenticationKeyPair() {
  const privateKey = secp256k1.utils.randomPrivateKey()
  const publicKey = secp256k1.getPublicKey(privateKey, true)
  return {
    privateKey: Buffer.from(privateKey).toString("hex"),
    publicKey: Buffer.from(publicKey).toString("hex"),
  }
}
