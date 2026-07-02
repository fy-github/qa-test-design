param(
    [Parameter(Mandatory = $true)][string]$InputJson,
    [Parameter(Mandatory = $true)][string]$OutputDocx,
    [string]$Title = 'QA Test Cases'
)

. "$PSScriptRoot/common.ps1"

$cases = ConvertTo-NormalizedCases -JsonPath $InputJson
$summary = Get-QaSummary -Cases $cases

function New-WordParagraph {
    param(
        [Parameter(Mandatory = $true)][string]$Text,
        [ValidateSet('normal', 'heading1', 'heading2')][string]$Style = 'normal'
    )

    $escaped = Escape-XmlText $Text
    switch ($Style) {
        'heading1' { return "<w:p><w:pPr><w:pStyle w:val=`"Heading1`"/></w:pPr><w:r><w:t xml:space=`"preserve`">$escaped</w:t></w:r></w:p>" }
        'heading2' { return "<w:p><w:pPr><w:pStyle w:val=`"Heading2`"/></w:pPr><w:r><w:t xml:space=`"preserve`">$escaped</w:t></w:r></w:p>" }
        default { return "<w:p><w:r><w:t xml:space=`"preserve`">$escaped</w:t></w:r></w:p>" }
    }
}

function New-WordTable {
    param([Parameter(Mandatory = $true)][array]$Rows)

    $sb = New-Object System.Text.StringBuilder
    [void]$sb.Append('<w:tbl>')
    [void]$sb.Append('<w:tblPr><w:tblBorders><w:top w:val="single" w:sz="4"/><w:left w:val="single" w:sz="4"/><w:bottom w:val="single" w:sz="4"/><w:right w:val="single" w:sz="4"/><w:insideH w:val="single" w:sz="4"/><w:insideV w:val="single" w:sz="4"/></w:tblBorders></w:tblPr>')
    foreach ($row in $Rows) {
        [void]$sb.Append('<w:tr>')
        foreach ($cell in $row) {
            $escaped = Escape-XmlText (ConvertTo-FlatText -Value $cell -Separator "`n")
            [void]$sb.Append("<w:tc><w:p><w:r><w:t xml:space=`"preserve`">$escaped</w:t></w:r></w:p></w:tc>")
        }
        [void]$sb.Append('</w:tr>')
    }
    [void]$sb.Append('</w:tbl>')
    return $sb.ToString()
}

$body = New-Object System.Text.StringBuilder
[void]$body.Append((New-WordParagraph -Text $Title -Style heading1))
[void]$body.Append((New-WordParagraph -Text "总用例数：$($summary.TotalCases)"))
[void]$body.Append((New-WordParagraph -Text "需求数：$($summary.RequirementCount)"))
[void]$body.Append((New-WordParagraph -Text "模块数：$($summary.ModuleCount)"))
[void]$body.Append((New-WordParagraph -Text "优先级分布：P0=$($summary.PriorityCounts.P0), P1=$($summary.PriorityCounts.P1), P2=$($summary.PriorityCounts.P2), P3=$($summary.PriorityCounts.P3)"))

$grouped = $cases | Group-Object Module
foreach ($group in $grouped) {
    $moduleName = if ($group.Name) { $group.Name } else { 'Uncategorized' }
    [void]$body.Append((New-WordParagraph -Text $moduleName -Style heading2))
    $rows = @(@('Case ID', 'Requirement ID', 'Title', 'Preconditions', 'Steps', 'Expected Results', 'Priority', 'Type', 'Tags'))
    foreach ($case in $group.Group) {
        $rows += ,@(
            $case.CaseId,
            $case.RequirementId,
            $case.Title,
            $case.Preconditions,
            $case.StepsText,
            $case.ExpectedText,
            $case.Priority,
            $case.TestType,
            $case.Tags
        )
    }
    [void]$body.Append((New-WordTable -Rows $rows))
}

$documentXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
 xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
 xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
 xmlns:v="urn:schemas-microsoft-com:vml"
 xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing"
 xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
 xmlns:w10="urn:schemas-microsoft-com:office:word"
 xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
 xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
 xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup"
 xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk"
 xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"
 xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"
 mc:Ignorable="w14 wp14">
  <w:body>
    $($body.ToString())
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>
"@

$stylesXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style>
  <w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:rPr><w:b/><w:sz w:val="32"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:rPr><w:b/><w:sz w:val="26"/></w:rPr></w:style>
</w:styles>
"@

$entries = @{
    '[Content_Types].xml' = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>
"@
    '_rels/.rels' = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>
"@
    'word/document.xml' = $documentXml
    'word/styles.xml'   = $stylesXml
}

New-ZipFromEntries -OutputPath $OutputDocx -Entries $entries
Write-Output "Generated DOCX: $OutputDocx"
