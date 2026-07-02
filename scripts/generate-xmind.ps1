param(
    [Parameter(Mandatory = $true)][string]$InputJson,
    [Parameter(Mandatory = $true)][string]$OutputXmind,
    [string]$Title = 'QA Test Cases'
)

. "$PSScriptRoot/common.ps1"

$cases = ConvertTo-NormalizedCases -JsonPath $InputJson
$script:TopicCounter = 0

function New-TopicId {
    $script:TopicCounter++
    return ('topic{0}' -f $script:TopicCounter)
}

function New-XmindTopicXml {
    param(
        [Parameter(Mandatory = $true)][string]$Title,
        [string]$ChildrenXml = ''
    )

    $id = New-TopicId
    $titleEscaped = Escape-XmlText $Title
    if ($ChildrenXml) {
        return "<topic id=`"$id`"><title>$titleEscaped</title><children><topics type=`"attached`">$ChildrenXml</topics></children></topic>"
    }
    return "<topic id=`"$id`"><title>$titleEscaped</title></topic>"
}

function Convert-CaseToXmindXml {
    param([Parameter(Mandatory = $true)]$Case)

    $children = @()
    if ($Case.RequirementId) { $children += (New-XmindTopicXml -Title ("req: {0}" -f $Case.RequirementId)) }
    if ($Case.Priority) { $children += (New-XmindTopicXml -Title ("priority: {0}" -f $Case.Priority)) }
    if ($Case.TestType) { $children += (New-XmindTopicXml -Title ("type: {0}" -f $Case.TestType)) }
    if ($Case.Preconditions) { $children += (New-XmindTopicXml -Title ("pc: {0}" -f $Case.Preconditions)) }
    if ($Case.Tags) { $children += (New-XmindTopicXml -Title ("tag: {0}" -f $Case.Tags)) }
    foreach ($step in $Case.Steps) {
        $grandChildren = @()
        if ($step.Expected) { $grandChildren += (New-XmindTopicXml -Title $step.Expected) }
        $children += (New-XmindTopicXml -Title $step.Action -ChildrenXml ($grandChildren -join ''))
    }
    if ($Case.Notes) { $children += (New-XmindTopicXml -Title ("note: {0}" -f $Case.Notes)) }

    $caseTitle = if ($Case.Priority) { "tc-$($Case.Priority.ToLower()): $($Case.Title)" } else { "tc: $($Case.Title)" }
    return New-XmindTopicXml -Title $caseTitle -ChildrenXml ($children -join '')
}

function Convert-ModulesToXmindXml {
    param(
        [Parameter(Mandatory = $true)][array]$Cases,
        [Parameter(Mandatory = $false)][int]$Level = 0
    )

    if ($Cases.Count -eq 0) { return '' }

    $uncategorized = $Cases | Where-Object { $_.ModulePath.Count -le $Level }
    $categorized = $Cases | Where-Object { $_.ModulePath.Count -gt $Level } | Group-Object { $_.ModulePath[$Level] }

    $xmlParts = @()
    foreach ($group in $categorized) {
        $childXml = Convert-ModulesToXmindXml -Cases $group.Group -Level ($Level + 1)
        $directCases = $group.Group | Where-Object { $_.ModulePath.Count -eq ($Level + 1) }
        foreach ($case in $directCases) {
            $childXml += (Convert-CaseToXmindXml -Case $case)
        }
        $xmlParts += (New-XmindTopicXml -Title $group.Name -ChildrenXml $childXml)
    }

    foreach ($case in $uncategorized) {
        $xmlParts += (Convert-CaseToXmindXml -Case $case)
    }

    return ($xmlParts -join '')
}

$rootChildren = Convert-ModulesToXmindXml -Cases $cases -Level 0
$rootTopic = New-XmindTopicXml -Title $Title -ChildrenXml $rootChildren

$contentXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xmap-content version="2.0" xmlns="urn:xmind:xmap:xmlns:content:2.0">
  <sheet id="sheet1">
    <title>Sheet 1</title>
    $rootTopic
  </sheet>
</xmap-content>
"@

$manifestXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<manifest xmlns="urn:xmind:xmap:xmlns:manifest:1.0">
  <file-entry full-path="content.xml" media-type="text/xml"/>
  <file-entry full-path="META-INF/" media-type=""/>
</manifest>
"@

$entries = @{
    'content.xml' = $contentXml
    'META-INF/manifest.xml' = $manifestXml
}

New-ZipFromEntries -OutputPath $OutputXmind -Entries $entries
Write-Output "Generated XMIND: $OutputXmind"
