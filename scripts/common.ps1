Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

function Get-QaValue {
    param(
        [Parameter(Mandatory = $true)]$Item,
        [Parameter(Mandatory = $true)][string[]]$Keys
    )

    foreach ($key in $Keys) {
        if ($Item.PSObject.Properties.Name -contains $key) {
            $value = $Item.$key
            if ($null -ne $value -and "$value" -ne '') {
                return $value
            }
        }
    }

    return $null
}

function ConvertTo-FlatText {
    param(
        [Parameter(Mandatory = $false)]$Value,
        [string]$Separator = '; '
    )

    if ($null -eq $Value) {
        return ''
    }

    if ($Value -is [string]) {
        return $Value.Trim()
    }

    if ($Value -is [System.Collections.IEnumerable] -and -not ($Value -is [hashtable]) -and -not ($Value -is [pscustomobject])) {
        $parts = @()
        foreach ($item in $Value) {
            $text = ConvertTo-FlatText -Value $item -Separator $Separator
            if ($text) {
                $parts += $text
            }
        }
        return ($parts -join $Separator).Trim()
    }

    return ("$Value").Trim()
}

function ConvertTo-ModulePath {
    param([Parameter(Mandatory = $false)]$Value)

    if ($null -eq $Value) {
        return @()
    }

    if ($Value -is [System.Collections.IEnumerable] -and -not ($Value -is [string])) {
        $parts = @()
        foreach ($item in $Value) {
            $text = ConvertTo-FlatText -Value $item
            if ($text) {
                $parts += $text
            }
        }
        return $parts
    }

    $text = ConvertTo-FlatText -Value $Value
    if (-not $text) {
        return @()
    }

    $splitters = @('>', '/', '\', '|', '::', '->')
    foreach ($splitter in $splitters) {
        if ($text.Contains($splitter)) {
            return ($text.Split($splitter) | ForEach-Object { $_.Trim() } | Where-Object { $_ })
        }
    }

    return @($text)
}

function ConvertTo-StepList {
    param([Parameter(Mandatory = $false)]$Case)

    $stepsValue = Get-QaValue -Item $Case -Keys @('steps', 'step_list', '步骤', '测试步骤')
    $expectedValue = Get-QaValue -Item $Case -Keys @('expected_results', 'expected', '预期结果', 'expected_result')

    $steps = @()

    if ($stepsValue -is [System.Collections.IEnumerable] -and -not ($stepsValue -is [string])) {
        foreach ($step in $stepsValue) {
            if ($step -is [string]) {
                $steps += [pscustomobject]@{
                    Action   = $step.Trim()
                    Expected = ''
                }
                continue
            }

            $action = Get-QaValue -Item $step -Keys @('action', '操作', 'step', '步骤')
            $expected = Get-QaValue -Item $step -Keys @('expected', '预期', 'expected_result', '预期结果')
            if (-not $action -and -not $expected) {
                continue
            }

            $steps += [pscustomobject]@{
                Action   = ConvertTo-FlatText -Value $action
                Expected = ConvertTo-FlatText -Value $expected
            }
        }
    }
    elseif ($stepsValue) {
        $actionLines = (ConvertTo-FlatText -Value $stepsValue -Separator "`n") -split "(`r`n|`n)"
        $expectedLines = @()
        if ($expectedValue) {
            $expectedLines = ((ConvertTo-FlatText -Value $expectedValue -Separator "`n") -split "(`r`n|`n)") | Where-Object { $_.Trim() }
        }

        $index = 0
        foreach ($line in $actionLines) {
            $trimmed = $line.Trim()
            if (-not $trimmed) {
                continue
            }

            $expected = ''
            if ($index -lt $expectedLines.Count) {
                $expected = $expectedLines[$index].Trim()
            }

            $steps += [pscustomobject]@{
                Action   = $trimmed
                Expected = $expected
            }
            $index++
        }
    }

    if ($steps.Count -eq 0 -and $expectedValue) {
        $steps += [pscustomobject]@{
            Action   = ''
            Expected = ConvertTo-FlatText -Value $expectedValue -Separator "`n"
        }
    }

    return $steps
}

function Remove-LeadingOrdinal {
    param([AllowNull()][string]$Text)

    if ($null -eq $Text) {
        return ''
    }

    return ([string]$Text) -replace '^\s*\d+[.)、．]\s*', ''
}

function ConvertTo-NumberedLines {
    param([Parameter(Mandatory = $true)][array]$Values)

    $cleaned = @()
    foreach ($value in $Values) {
        $text = (Remove-LeadingOrdinal -Text (ConvertTo-FlatText -Value $value)).Trim()
        if ($text) {
            $cleaned += $text
        }
    }

    $lines = @()
    for ($i = 0; $i -lt $cleaned.Count; $i++) {
        $lines += ('{0}. {1}' -f ($i + 1), $cleaned[$i])
    }
    return $lines -join "`n"
}

function ConvertTo-NormalizedCases {
    param([Parameter(Mandatory = $true)][string]$JsonPath)

    $raw = Get-Content -Path $JsonPath -Raw -Encoding UTF8
    $parsed = if ($PSVersionTable.PSVersion.Major -ge 6) {
        $raw | ConvertFrom-Json -Depth 100
    }
    else {
        $raw | ConvertFrom-Json
    }

    if ($parsed -isnot [System.Collections.IEnumerable] -or $parsed -is [string]) {
        throw "Input JSON must be an array of cases."
    }

    $index = 1
    $normalized = @()

    foreach ($case in $parsed) {
        $modulePath = ConvertTo-ModulePath -Value (Get-QaValue -Item $case -Keys @('module_path', 'module', 'modules', '模块', '模块路径'))
        $moduleLabel = if ($modulePath.Count -gt 0) { $modulePath -join ' / ' } else { '' }

        $steps = ConvertTo-StepList -Case $case
        $stepText = ConvertTo-NumberedLines -Values ($steps | Where-Object { $_.Action } | ForEach-Object { $_.Action })
        $expectedText = ConvertTo-NumberedLines -Values ($steps | Where-Object { $_.Expected } | ForEach-Object { $_.Expected })

        $caseId = ConvertTo-FlatText -Value (Get-QaValue -Item $case -Keys @('case_id', 'id', '用例ID', 'Case ID'))
        if (-not $caseId) {
            $caseId = ('TC-{0:D4}' -f $index)
        }

        $feature = ConvertTo-FlatText -Value (Get-QaValue -Item $case -Keys @('feature', 'operation', '功能', '操作'))
        $title = ConvertTo-FlatText -Value (Get-QaValue -Item $case -Keys @('title', '用例标题', '标题'))
        $requirementId = ConvertTo-FlatText -Value (Get-QaValue -Item $case -Keys @('requirement_id', 'req_id', '关联需求', '需求ID'))
        $priority = (ConvertTo-FlatText -Value (Get-QaValue -Item $case -Keys @('priority', '优先级'))).ToUpper()
        $testType = ConvertTo-FlatText -Value (Get-QaValue -Item $case -Keys @('test_type', '类型', '测试类型'))
        $actor = ConvertTo-FlatText -Value (Get-QaValue -Item $case -Keys @('actor', 'role', '角色', '执行角色'))
        $state = ConvertTo-FlatText -Value (Get-QaValue -Item $case -Keys @('state', '状态', '前置状态'))
        $testData = ConvertTo-FlatText -Value (Get-QaValue -Item $case -Keys @('test_data', '测试数据', 'data'))
        $designMethod = ConvertTo-FlatText -Value (Get-QaValue -Item $case -Keys @('design_method', 'method', '设计方法'))
        $tags = ConvertTo-FlatText -Value (Get-QaValue -Item $case -Keys @('tags', 'tag', '标签'))
        $notes = ConvertTo-FlatText -Value (Get-QaValue -Item $case -Keys @('notes', 'remark', '备注', '说明'))
        $preconditions = ConvertTo-FlatText -Value (Get-QaValue -Item $case -Keys @('preconditions', 'precondition', '前置条件'))

        $normalized += [pscustomobject]@{
            CaseId         = $caseId
            ModulePath     = $modulePath
            Module         = $moduleLabel
            Feature        = $feature
            RequirementId  = $requirementId
            Title          = $title
            Preconditions  = $preconditions
            Steps          = $steps
            StepsText      = $stepText
            ExpectedText   = $expectedText
            Priority       = $priority
            TestType       = $testType
            Actor          = $actor
            State          = $state
            TestData       = $testData
            DesignMethod   = $designMethod
            Tags           = $tags
            Notes          = $notes
        }

        $index++
    }

    return $normalized
}

function Get-QaSummary {
    param([Parameter(Mandatory = $true)][array]$Cases)

    $p0Cases = @($Cases | Where-Object { $_.Priority -eq 'P0' })
    $p1Cases = @($Cases | Where-Object { $_.Priority -eq 'P1' })
    $p2Cases = @($Cases | Where-Object { $_.Priority -eq 'P2' })
    $p3Cases = @($Cases | Where-Object { $_.Priority -eq 'P3' })
    $requirements = @($Cases | Where-Object { $_.RequirementId } | Group-Object RequirementId)
    $modules = @($Cases | Where-Object { $_.Module } | Group-Object Module)

    $priorityCounts = @{
        P0 = $p0Cases.Count
        P1 = $p1Cases.Count
        P2 = $p2Cases.Count
        P3 = $p3Cases.Count
    }

    return [pscustomobject]@{
        TotalCases       = $Cases.Count
        RequirementCount = $requirements.Count
        ModuleCount      = $modules.Count
        PriorityCounts   = $priorityCounts
        Modules          = $modules
        Requirements     = $requirements
    }
}

function Escape-XmlText {
    param([AllowNull()][string]$Text)

    if ($null -eq $Text) {
        return ''
    }

    return [System.Security.SecurityElement]::Escape($Text)
}

function New-ZipFromEntries {
    param(
        [Parameter(Mandatory = $true)][string]$OutputPath,
        [Parameter(Mandatory = $true)][hashtable]$Entries
    )

    $parent = Split-Path -Parent $OutputPath
    if ($parent) {
        New-Item -ItemType Directory -Force -Path $parent | Out-Null
    }

    if (Test-Path $OutputPath) {
        Remove-Item -LiteralPath $OutputPath -Force
    }

    $zip = [System.IO.Compression.ZipFile]::Open($OutputPath, [System.IO.Compression.ZipArchiveMode]::Create)
    try {
        foreach ($entryPath in $Entries.Keys) {
            $entry = $zip.CreateEntry($entryPath)
            $stream = $entry.Open()
            try {
                $writer = New-Object System.IO.StreamWriter($stream, [System.Text.UTF8Encoding]::new($false))
                try {
                    $writer.Write($Entries[$entryPath])
                }
                finally {
                    $writer.Dispose()
                }
            }
            finally {
                $stream.Dispose()
            }
        }
    }
    finally {
        $zip.Dispose()
    }
}

function Get-ExcelColumnName {
    param([Parameter(Mandatory = $true)][int]$Index)

    $name = ''
    $n = $Index
    while ($n -gt 0) {
        $n--
        $name = [char](65 + ($n % 26)) + $name
        $n = [math]::Floor($n / 26)
    }
    return $name
}
