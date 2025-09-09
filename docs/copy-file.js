const fs = require('fs');
const path = require('path');

/**
 * Script pour copier le fichier deployed-addresses.json 
 * vers le dossier public du frontend
 */
function copyAddressesToPublic() {
  const sourceFile = path.join(__dirname, 'deployed-addresses.json');
  const targetDir = path.join(__dirname, 'frontend', 'public');
  const targetFile = path.join(targetDir, 'deployed-addresses.json');

  // Vérifier que le fichier source existe
  if (!fs.existsSync(sourceFile)) {
    console.error('❌ Fichier deployed-addresses.json non trouvé!');
    console.log('Exécutez d\'abord le script de déploiement');
    process.exit(1);
  }

  // Créer le dossier public s'il n'existe pas
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Copier le fichier
  try {
    fs.copyFileSync(sourceFile, targetFile);
    console.log('✅ Fichier deployed-addresses.json copié vers frontend/public/');
    
    // Afficher le contenu pour vérification
    const addresses = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
    console.log('📄 Contenu:');
    console.log(JSON.stringify(addresses, null, 2));
  } catch (error) {
    console.error('❌ Erreur lors de la copie:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  copyAddressesToPublic();
}

module.exports = { copyAddressesToPublic };