import fs from "fs";
import path from "path";

const DIR = new URL("./dist", import.meta.url).pathname;

function replaceInFile(file) {
  const content = fs.readFileSync(file, "utf8");
  const replaced = content.replace(/require\("@shared\/(.*?)"\)/g, (_, match) => {
    return `require("../../shared/dist/${match}")`;
  });
  fs.writeFileSync(file, replaced);
}

// Recursively process dist files
function walk(dir) {
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (file.endsWith(".js")) replaceInFile(full);
  }
}

walk(DIR);
