import * as secp256k1 from "@noble/secp256k1"

export function generateAuthenticationKeyPair() {
  // Generate 32 random bytes for the private key
  const privateKeyBytes = new Uint8Array(32)
  crypto.getRandomValues(privateKeyBytes)

  const publicKey = secp256k1.getPublicKey(privateKeyBytes, true)
  return {
    privateKey: Buffer.from(privateKeyBytes).toString("hex"),
    publicKey: Buffer.from(publicKey).toString("hex"),
  }
}
