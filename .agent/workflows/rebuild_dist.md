---
description: Rebuild the project and update the dist folder after adjustments
---

#!/bin/bash
set -e

- Verify that `dist` folder is created and up to date.

1. Clean previous build (Optional but recommended)
```powershell
if (Test-Path dist) { Remove-Item -Recurse -Force dist }
```

2. Run the build script
```powershell
npm run build
```

3. Verify output
```powershell
Get-ChildItem dist
```
