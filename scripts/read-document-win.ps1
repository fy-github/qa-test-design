param(
  [Parameter(Mandatory = $true)][string]$InputPath
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$resolved = (Resolve-Path $InputPath).Path
$ext = [System.IO.Path]::GetExtension($resolved).ToLowerInvariant()

if ($ext -notin @('.doc', '.docx', '.pdf', '.rtf', '.html', '.htm')) {
  throw "Unsupported extension for Word COM extraction: $ext"
}

$word = $null
$doc = $null
try {
  $word = New-Object -ComObject Word.Application
  $word.Visible = $false
  $word.DisplayAlerts = 0
  $doc = $word.Documents.Open($resolved, $false, $true)
  $text = $doc.Content.Text
  if ($null -eq $text) { $text = '' }
  $text = $text -replace "`r`n", "`n"
  $text = $text -replace "`r", "`n"
  $text = $text -replace "\u0000", ''
  Write-Output $text.Trim()
}
finally {
  if ($doc -ne $null) { $doc.Close([ref]0) }
  if ($word -ne $null) { $word.Quit() }
}
