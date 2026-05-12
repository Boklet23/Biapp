# BiVokter - Google Cloud Service Account Setup
# KJØ R DETTE etter at du har kjørt: gcloud auth login
# =====================================================

$ErrorActionPreference = "Continue"

$PROJECT_ID = "biapp-play-2026"
$SA_NAME    = "biapp-play-submit"
$SA_EMAIL   = "$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com"
$KEY_FILE   = "$PSScriptRoot\..\google-play-service-account.json"

Write-Host "`n=== STEG 1: Sjekker/oppretter Google Cloud-prosjekt ===" -ForegroundColor Cyan

$existing = gcloud projects list --filter="projectId=$PROJECT_ID" --format="value(projectId)" 2>&1
if ($existing -eq $PROJECT_ID) {
    Write-Host "Prosjekt $PROJECT_ID finnes allerede." -ForegroundColor Green
} else {
    Write-Host "Oppretter prosjekt $PROJECT_ID..."
    gcloud projects create $PROJECT_ID --name="BiApp Play Store"
}

gcloud config set project $PROJECT_ID

Write-Host "`n=== STEG 2: Aktiverer Android Publisher API ===" -ForegroundColor Cyan
gcloud services enable androidpublisher.googleapis.com
Write-Host "API aktivert." -ForegroundColor Green

Write-Host "`n=== STEG 3: Oppretter service account ===" -ForegroundColor Cyan
$saExists = gcloud iam service-accounts list --filter="email:$SA_EMAIL" --format="value(email)" 2>$null
if ($saExists -and $saExists.Trim() -eq $SA_EMAIL) {
    Write-Host "Service account $SA_EMAIL finnes allerede." -ForegroundColor Green
} else {
    gcloud iam service-accounts create $SA_NAME --display-name="BiApp Play Submit"
    Write-Host "Service account opprettet." -ForegroundColor Green
}

Write-Host "`n=== STEG 4: Laster ned JSON-nøkkel ===" -ForegroundColor Cyan
if (Test-Path $KEY_FILE) {
    Write-Host "Nøkkelfil finnes allerede: $KEY_FILE" -ForegroundColor Yellow
} else {
    gcloud iam service-accounts keys create $KEY_FILE --iam-account=$SA_EMAIL
    Write-Host "Nøkkel lagret til: $KEY_FILE" -ForegroundColor Green
}

Write-Host "`n============================================================" -ForegroundColor Yellow
Write-Host "  FERDIG! Service account opprettet og nøkkel lastet ned." -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "NESTE STEG (manuelt - Google krever UI):" -ForegroundColor Red
Write-Host ""
Write-Host "1. Gå til: https://play.google.com/console" -ForegroundColor White
Write-Host "2. Setup -> API access" -ForegroundColor White
Write-Host "3. Koble til Google Cloud-prosjekt: $PROJECT_ID" -ForegroundColor White
Write-Host "4. Finn service account: $SA_EMAIL" -ForegroundColor White
Write-Host "5. Gi rollen: Release Manager" -ForegroundColor White
Write-Host "6. Klikk Apply" -ForegroundColor White
Write-Host ""
Write-Host "Etter Play Console-kobling, kjør:" -ForegroundColor Cyan
Write-Host "  node scripts/create-play-subscriptions.js" -ForegroundColor White
Write-Host "  fastlane supply --track internal --aab /tmp/biapp-production.aab --package_name no.biapp.app --json_key google-play-service-account.json --skip_upload_metadata true --skip_upload_images true --skip_upload_screenshots true" -ForegroundColor White
