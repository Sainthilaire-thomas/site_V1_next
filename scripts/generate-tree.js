const fs = require("fs");
const path = require("path");

// Configuration
const CONFIG = {
  rootDir: process.cwd(),
  outputDir: path.join(process.cwd(), "docs"),
  outputFile: "project-structure.txt",
  excludeDirs: [
    "node_modules",
    ".next",
    ".git",
    "dist",
    "build",
    ".turbo",
    "coverage",
    ".nyc_output",
    "tmp",
    "temp",
  ],
  excludeFiles: [
    ".DS_Store",
    "Thumbs.db",
    "*.log",
    ".env",
    ".env.local",
    ".env.development.local",
    ".env.test.local",
    ".env.production.local",
  ],
  maxDepth: 6,
};

/**
 * Vérifie si un fichier/dossier doit être exclu
 */
function shouldExclude(name, isDirectory) {
  if (isDirectory) {
    return CONFIG.excludeDirs.includes(name);
  }

  // Vérifier les fichiers exacts
  if (CONFIG.excludeFiles.includes(name)) {
    return true;
  }

  // Vérifier les patterns (*.log, etc.)
  return CONFIG.excludeFiles.some((pattern) => {
    if (pattern.includes("*")) {
      const regex = new RegExp(pattern.replace("*", ".*"));
      return regex.test(name);
    }
    return false;
  });
}

/**
 * Génère l'arborescence récursivement
 */
function generateTree(dirPath, prefix = "", depth = 0) {
  if (depth > CONFIG.maxDepth) {
    return "";
  }

  let result = "";

  try {
    const items = fs
      .readdirSync(dirPath)
      .filter(
        (item) =>
          !shouldExclude(
            item,
            fs.statSync(path.join(dirPath, item)).isDirectory()
          )
      )
      .sort((a, b) => {
        const aPath = path.join(dirPath, a);
        const bPath = path.join(dirPath, b);
        const aIsDir = fs.statSync(aPath).isDirectory();
        const bIsDir = fs.statSync(bPath).isDirectory();

        // Les dossiers en premier
        if (aIsDir && !bIsDir) return -1;
        if (!aIsDir && bIsDir) return 1;

        // Puis par nom alphabétique
        return a.localeCompare(b);
      });

    items.forEach((item, index) => {
      const itemPath = path.join(dirPath, item);
      const isLast = index === items.length - 1;
      const isDirectory = fs.statSync(itemPath).isDirectory();

      // Symboles pour l'arborescence
      const connector = isLast ? "└── " : "├── ";
      const nextPrefix = prefix + (isLast ? "    " : "│   ");

      // Ajouter l'emoji selon le type
      const emoji = isDirectory ? "📁" : getFileEmoji(item);

      result += `${prefix}${connector}${emoji} ${item}\n`;

      // Récursion pour les dossiers
      if (isDirectory) {
        result += generateTree(itemPath, nextPrefix, depth + 1);
      }
    });
  } catch (error) {
    result += `${prefix}└── ❌ [Erreur: ${error.message}]\n`;
  }

  return result;
}

/**
 * Retourne l'emoji approprié selon l'extension du fichier
 */
function getFileEmoji(filename) {
  const ext = path.extname(filename).toLowerCase();
  const name = filename.toLowerCase();

  // Fichiers spéciaux
  if (name === "package.json") return "📦";
  if (name === "readme.md") return "📖";
  if (name === "license") return "📄";
  if (name.includes("dockerfile")) return "🐳";
  if (name.includes(".env")) return "🔐";
  if (name === "tsconfig.json") return "⚙️";
  if (name === "tailwind.config.js") return "🎨";

  // Extensions
  switch (ext) {
    case ".js":
    case ".mjs":
      return "🟨";
    case ".ts":
    case ".tsx":
      return "🔷";
    case ".jsx":
      return "⚛️";
    case ".json":
      return "📋";
    case ".md":
      return "📝";
    case ".css":
    case ".scss":
    case ".sass":
      return "🎨";
    case ".html":
      return "🌐";
    case ".png":
    case ".jpg":
    case ".jpeg":
    case ".gif":
    case ".svg":
      return "🖼️";
    case ".pdf":
      return "📕";
    case ".zip":
    case ".tar":
    case ".gz":
      return "🗜️";
    case ".yml":
    case ".yaml":
      return "⚙️";
    default:
      return "📄";
  }
}

/**
 * Crée le dossier docs s'il n'existe pas
 */
function ensureDocsDir() {
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    console.log("📁 Dossier docs/ créé");
  }
}

/**
 * Génère le header du fichier
 */
function generateHeader() {
  const projectName = path.basename(CONFIG.rootDir);
  const date = new Date().toLocaleString("fr-FR");

  return `
╔══════════════════════════════════════════════════════════════════════════════╗
║                          ARBORESCENCE DU PROJET                             ║
║                                                                              ║
║  Projet: ${projectName.padEnd(63)} ║
║  Généré: ${date.padEnd(62)} ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

🌳 Structure du projet :

`;
}

/**
 * Fonction principale
 */
function main() {
  console.log("🚀 Génération de l'arborescence du projet...");

  try {
    // Créer le dossier docs
    ensureDocsDir();

    // Générer l'arborescence
    console.log("📊 Analyse de la structure...");
    const projectName = path.basename(CONFIG.rootDir);
    let content = generateHeader();
    content += `📁 ${projectName}\n`;
    content += generateTree(CONFIG.rootDir);

    // Ajouter les statistiques
    const lines = content.split("\n");
    const fileCount = lines.filter(
      (line) =>
        line.includes("📄") || line.includes("🟨") || line.includes("🔷")
    ).length;
    const dirCount = lines.filter((line) => line.includes("📁")).length;

    content += `\n\n📈 Statistiques :\n`;
    content += `   • Dossiers : ${dirCount}\n`;
    content += `   • Fichiers : ${fileCount}\n`;
    content += `   • Total : ${fileCount + dirCount} éléments\n`;
    content += `\n💡 Généré automatiquement - Ne pas modifier manuellement\n`;

    // Sauvegarder
    const outputPath = path.join(CONFIG.outputDir, CONFIG.outputFile);
    fs.writeFileSync(outputPath, content, "utf8");

    console.log("✅ Arborescence générée avec succès !");
    console.log(
      `📁 Sauvegardée dans: ${path.relative(CONFIG.rootDir, outputPath)}`
    );
    console.log(`📊 ${fileCount} fichiers et ${dirCount} dossiers analysés`);
  } catch (error) {
    console.error("❌ Erreur lors de la génération:", error.message);
    process.exit(1);
  }
}

// Exécuter le script
main();
