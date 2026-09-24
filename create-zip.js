const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Build zip bundle using node archiver or python zipfile
try {
  execSync('python3 -c "import zipfile, os; z = zipfile.ZipFile(\'/app/applet/freetube-latest.zip\', \'w\', zipfile.ZIP_DEFLATED); [z.write(os.path.join(root, file), os.path.relpath(os.path.join(root, file), \'/app/applet\')) for root, dirs, files in os.walk(\'/app/applet\') if not any(x in root for x in [\'node_modules\', \'.git\']) for file in files if file not in [\'freetube-latest.zip\', \'freetube-latest.tar.gz\']]; z.close()"', { stdio: 'inherit' });
  console.log('Zip created successfully:', fs.statSync('/app/applet/freetube-latest.zip').size);
} catch (e) {
  console.error('Failed to create zip with python:', e);
}
