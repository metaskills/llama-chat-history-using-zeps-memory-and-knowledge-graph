const args = process.argv.slice(2);
const experiment = args[0];

if (!experiment || isNaN(Number(experiment))) {
  console.error("Please provide a valid integer as the first argument.");
  process.exit(1);
}

const filePath = `./zep${experiment}.js`;

import(filePath);
