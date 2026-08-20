import subprocess
import shutil
import os

cwd = r'C:\Users\mknig\Downloads\knighttrader-coinbase-site'
git = shutil.which('git')

# Detect current branch
branch = subprocess.run([git, 'rev-parse', '--abbrev-ref', 'HEAD'], cwd=cwd, capture_output=True, text=True, check=True).stdout.strip() or 'master'

# Stage changes
subprocess.run([git, 'add', '.'], cwd=cwd, check=True)

# Create tree object
tree = subprocess.run([git, 'write-tree'], cwd=cwd, capture_output=True, text=True, check=True).stdout.strip()

# Get parent commit
parent = subprocess.run([git, 'rev-parse', 'HEAD'], cwd=cwd, capture_output=True, text=True, check=True).stdout.strip()

# Create commit without using 'git commit'
commit_hash = subprocess.run(
    [git, 'commit-tree', tree, '-p', parent, '-m', 'Update landing page download buttons for Windows and Mac'],
    cwd=cwd,
    capture_output=True,
    text=True,
    check=True
).stdout.strip()

# Update branch reference
subprocess.run([git, 'update-ref', f'refs/heads/{branch}', commit_hash], cwd=cwd, check=True)

print(f'Created commit: {commit_hash} on {branch}')

# Push to remote
result = subprocess.run([git, 'push', 'origin', branch], cwd=cwd, capture_output=True, text=True)
print(result.stdout)
if result.returncode != 0:
    print(result.stderr)
    exit(1)
