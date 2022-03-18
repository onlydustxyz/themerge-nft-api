import express from "express";
const app = express();
const PORT = 8000;
app.get("/", (req, res) => res.send("Ethereum - The Merge NFT by Magic Dust"));
app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
