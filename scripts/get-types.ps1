# get-types.ps1
$url = "https://api.supabase.com/v1/projects/lnkxfyfkwnfvxvaxnbah/types/typescript"
$output = "..\src\lib\database.types.ts"

Write-Host "Downloading types from Supabase API..." -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri $url -Method Get
    $response.Content | Out-File -FilePath $output -Encoding UTF8
    Write-Host "Types saved to $output" -ForegroundColor Green
} catch {
    Write-Host "Error: " -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}
