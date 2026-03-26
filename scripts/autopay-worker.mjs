import process from "node:process";
import { runAutopayWorker } from "./autopay-runner.mjs";

runAutopayWorker()
  .then((result) => {
    console.log(result.message);
    if (result.txHash) {
      console.log(`Transaction: ${result.txHash}`);
    }
  })
  .catch((error) => {
  console.error("Autopay worker failed:", error);
  process.exitCode = 1;
  });
