param(
    [Parameter(Mandatory = $true)][string]$InputJson,
    [Parameter(Mandatory = $true)][string]$OutputXlsx,
    [string]$Title = 'QA Test Cases'
)

. "$PSScriptRoot/common.ps1"

$cases = ConvertTo-NormalizedCases -JsonPath $InputJson
$summary = Get-QaSummary -Cases $cases

$sheets = [ordered]@{}
$sheets['概览'] = @(
    @('项目项', '值'),
    @('标题', $Title),
    @('总用例数', $summary.TotalCases),
    @('需求数', $summary.RequirementCount),
    @('模块数', $summary.ModuleCount),
    @('P0', $summary.PriorityCounts.P0),
    @('P1', $summary.PriorityCounts.P1),
    @('P2', $summary.PriorityCounts.P2),
    @('P3', $summary.PriorityCounts.P3)
)

$caseHeader = @(
    '用例ID', '模块', '功能/操作', '关联需求', '标题',
    '前置条件', '步骤', '预期结果', '优先级', '测试类型',
    '执行角色', '状态', '测试数据', '设计方法', '标签', '备注'
)

$caseRows = @($caseHeader)
foreach ($case in $cases) {
    $caseRows += ,@(
        $case.CaseId,
        $case.Module,
        $case.Feature,
        $case.RequirementId,
        $case.Title,
        $case.Preconditions,
        $case.StepsText,
        $case.ExpectedText,
        $case.Priority,
        $case.TestType,
        $case.Actor,
        $case.State,
        $case.TestData,
        $case.DesignMethod,
        $case.Tags,
        $case.Notes
    )
}
 $sheets['测试用例'] = $caseRows

$traceRows = @(@('需求ID', '用例数', '用例ID列表', '用例标题列表'))
foreach ($reqGroup in $summary.Requirements) {
    $traceRows += ,@(
        $reqGroup.Name,
        $reqGroup.Count,
        (($reqGroup.Group | ForEach-Object { $_.CaseId }) -join '; '),
        (($reqGroup.Group | ForEach-Object { $_.Title }) -join '; ')
    )
}
$sheets['追溯矩阵'] = $traceRows

function New-WorksheetXml {
    param([Parameter(Mandatory = $true)][array]$Rows)

    $rowsList = @($Rows)
    $xml = New-Object System.Text.StringBuilder
    [void]$xml.Append('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>')
    [void]$xml.Append('<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>')
    for ($r = 0; $r -lt $rowsList.Count; $r++) {
        $rowNumber = $r + 1
        [void]$xml.Append("<row r=`"$rowNumber`">")
        $row = @($rowsList[$r])
        for ($c = 0; $c -lt $row.Count; $c++) {
            $cellRef = '{0}{1}' -f (Get-ExcelColumnName ($c + 1)), $rowNumber
            $value = Escape-XmlText (ConvertTo-FlatText -Value $row[$c] -Separator "`n")
            [void]$xml.Append("<c r=`"$cellRef`" t=`"inlineStr`"><is><t xml:space=`"preserve`">$value</t></is></c>")
        }
        [void]$xml.Append('</row>')
    }
    [void]$xml.Append('</sheetData></worksheet>')
    return $xml.ToString()
}

$workbookXml = New-Object System.Text.StringBuilder
[void]$workbookXml.Append('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>')
[void]$workbookXml.Append('<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>')

$workbookRels = New-Object System.Text.StringBuilder
[void]$workbookRels.Append('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>')
[void]$workbookRels.Append('<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">')

$contentTypesOverrides = @('<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>')
$entries = @{}
$sheetIndex = 1
foreach ($sheetEntry in $sheets.GetEnumerator()) {
    $sheetName = $sheetEntry.Key
    [void]$workbookXml.Append("<sheet name=`"$sheetName`" sheetId=`"$sheetIndex`" r:id=`"rId$sheetIndex`"/>")
    [void]$workbookRels.Append("<Relationship Id=`"rId$sheetIndex`" Type=`"http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet`" Target=`"worksheets/sheet$sheetIndex.xml`"/>")
    $contentTypesOverrides += "<Override PartName=`"/xl/worksheets/sheet$sheetIndex.xml`" ContentType=`"application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml`"/>"
    $entries["xl/worksheets/sheet$sheetIndex.xml"] = New-WorksheetXml -Rows $sheetEntry.Value
    $sheetIndex++
}
[void]$workbookXml.Append('</sheets></workbook>')
[void]$workbookRels.Append('</Relationships>')

$entries['[Content_Types].xml'] = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  $($contentTypesOverrides -join "`n  ")
</Types>
"@
$entries['_rels/.rels'] = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>
"@
$entries['xl/workbook.xml'] = $workbookXml.ToString()
$entries['xl/_rels/workbook.xml.rels'] = $workbookRels.ToString()

New-ZipFromEntries -OutputPath $OutputXlsx -Entries $entries
Write-Output "Generated XLSX: $OutputXlsx"
