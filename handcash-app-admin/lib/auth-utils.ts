import * as secp256k1 from "@noble/secp256k1"
import { SignJWT, jwtVerify } from "jose"
import { getAuthAppSecret } from "./business-client"

export function generateAuthenticationKeyPair() {
  const privateKey = secp256k1.utils.randomSecretKey()
  const publicKey = secp256k1.getPublicKey(privateKey, true)
  return {
    privateKey: Buffer.from(privateKey).toString("hex"),
    publicKey: Buffer.from(publicKey).toString("hex"),
  }
}

export async function createAuthJWT(authToken: string): Promise<string> {
  const secret = new TextEncoder().encode(getAuthAppSecret())

  const jwt = await new SignJWT({ authToken })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret)

  return jwt
}

export async function verifyAuthJWT(jwt: string): Promise<string> {
  const secret = new TextEncoder().encode(getAuthAppSecret())

  const { payload } = await jwtVerify(jwt, secret)

  if (!payload.authToken || typeof payload.authToken !== "string") {
    throw new Error("Invalid JWT payload")
  }

  return payload.authToken
}
