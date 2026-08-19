[CmdletBinding()]
param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$Arguments
)
$ErrorActionPreference = 'Stop'
$script = Join-Path $PSScriptRoot 'install.py'
if (Get-Command py -ErrorAction SilentlyContinue) {
  & py -3 $script @Arguments
} elseif (Get-Command python -ErrorAction SilentlyContinue) {
  & python $script @Arguments
} else {
  throw '未找到 Python 3。请安装 Python 3 后重试。'
}
exit $LASTEXITCODE
