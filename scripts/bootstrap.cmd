@echo off
REM Free C: space then install deps using D: npm cache
echo === Cleaning npm cache ===
npm cache clean --force
npm config set cache "D:\npm-cache"

echo === Removing partial node_modules ===
if exist "d:\Long\agri-xai-webgis\gis-service\node_modules" rmdir /s /q "d:\Long\agri-xai-webgis\gis-service\node_modules"
if exist "d:\Long\agri-xai-webgis\web-gis-frontend\node_modules" rmdir /s /q "d:\Long\agri-xai-webgis\web-gis-frontend\node_modules"

echo === Installing gis-service ===
cd /d "d:\Long\agri-xai-webgis\gis-service"
call npm install
if errorlevel 1 exit /b 1

echo === Installing web-gis-frontend ===
cd /d "d:\Long\agri-xai-webgis\web-gis-frontend"
call npm install
if errorlevel 1 exit /b 1

echo === Starting PostGIS ===
cd /d "d:\Long\agri-xai-webgis"
docker compose up -d gis-db

echo DONE. Next:
echo   cd gis-service ^&^& npm run start:dev
echo   cd web-gis-frontend ^&^& npm run dev
