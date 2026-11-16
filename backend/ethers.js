const { ethers } = require("ethers");

async function main() {
  // Replace with your wallet's private key or load it from your environment variables
  const PRIVATE_KEY = process.env.PRIVATE_KEY || "YOUR_PRIVATE_KEY_HERE";
  const wallet = new ethers.Wallet(PRIVATE_KEY);

  console.log("Signing with address:", wallet.address);

  const domain = {
    name: "NONCE MCP Sign In",
    version: "1",
    chainId: 56,
  };

  const types = {
    SignIn: [
      { name: "wallet", type: "address" },
      { name: "audience", type: "string" },
      { name: "challenge", type: "string" },
      { name: "expiresAt", type: "uint48" },
      { name: "statement", type: "string" },
    ],
  };

  const value = {
    wallet: "0xFC501963Ba0b1fDB22C634b43F21DD99AC29B308",
    audience: "mcp.nonceprotocol.xyz",
    challenge: "eyJraW5kIjoiYWNjZXNzIjoiYWMzY2Q5ODM4MzcxNjFhZTlkY2Y5NGU5NjZiOWE1YzgzYTU3NjEyNzBjN2IyMWMxNmExNzhmZTkxNWMzZWFlMDAifQ.33cadd2f01d03951dd16c92b6e639f78d1b4fccc9a4e5b876b2fd2d410daf565",
    expiresAt: 1793179346,
    statement: "Sign in only. This signature does not approve tokens or authorize any payment.",
  };

  const signature = await wallet.signTypedData(domain, types, value);
  const sig = ethers.Signature.from(signature);

  console.log("\n=== SIGNATURE RESULT ===");
  console.log("signature:", signature);
  console.log("signatureRecovery:", sig.v - 27); // 0 or 1 recovery ID format
}

main().catch(console.error);