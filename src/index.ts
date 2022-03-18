import express from "express";
const app = express();
const PORT = 8000;

// Serve static files
app.use("/static", express.static("public"));
// Handle Index
app.get("/", (req, res) => res.send("Ethereum - The Merge NFT by Magic Dust"));
// Handle Generate Proof
app.get("/proof/:address/type/:nftType", handleGenerateProof);
// Start HTTP server
app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});

function handleGenerateProof(req: any, res: any) {
  const address = req.params.address;
  const nftType = req.params.nftType;
  console.log(`generate proof requested for address: ${address} and NFT type: ${nftType}`);
  res.send();
}
