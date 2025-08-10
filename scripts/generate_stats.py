#!/usr/bin/env python3
import csv
import json
import sys

# Increase CSV field size limit
maxInt = sys.maxsize
while True:
    try:
        csv.field_size_limit(maxInt)
        break
    except OverflowError:
        maxInt = int(maxInt/10)
from datetime import datetime, timezone
from pathlib import Path

def count_files_by_scope(csv_path):
    """Count files by scope (public/private) in the CSV."""
    try:
        counts = {'public': 0, 'private': 0}
        with open(csv_path, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                scope = row.get('scope', '').lower()
                if scope in counts:
                    counts[scope] += 1
        
        counts['total'] = counts['public'] + counts['private']
        return counts
    except FileNotFoundError:
        return {'total': 0, 'public': 0, 'private': 0}

def format_timestamp():
    """Format current time as 'January 30, 2024 at 14:30 UTC'"""
    now = datetime.now(timezone.utc)
    return now.strftime("%B %d, %Y at %H:%M UTC")

def generate_stats():
    """Generate statistics from CSV files."""
    base_dir = Path(__file__).parent.parent
    discovered_csv = base_dir / 'contracts' / 'autodrive-read' / 'autodrive_records.csv'
    
    file_counts = count_files_by_scope(discovered_csv)
    
    stats = {
        'timestamp': format_timestamp(),
        'files': file_counts
    }
    
    # Write stats to Jekyll _data directory
    data_dir = base_dir / '_data'
    data_dir.mkdir(exist_ok=True)
    
    with open(data_dir / 'autodrive_stats.json', 'w') as f:
        json.dump(stats, f, indent=2)

if __name__ == '__main__':
    generate_stats()
